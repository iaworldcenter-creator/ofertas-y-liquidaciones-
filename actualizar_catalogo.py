# -*- coding: utf-8 -*-
"""
Herramienta de Automatización de Inventario y Catálogo - Puesto de Revistas & Bazar
Esta herramienta lee 'catalog.csv' e inyecta la base de datos de productos directamente
en los archivos HTML del sitio. También permite importar productos desde un archivo de proveedor.

Uso:
  1. Para sincronizar catalog.csv con los archivos HTML:
     python actualizar_catalogo.py
     
  2. Para importar nuevos productos de un archivo de proveedor externo:
     python actualizar_catalogo.py --importar archivo_proveedor.csv
"""

import os
import sys
import csv
import json
import re

# Archivos de destino a sincronizar en este proyecto
HTML_FILES = ["index.html", "producto.html", "checkout.html"]

def cargar_catalogo_csv(csv_path="catalog.csv"):
    if not os.path.exists(csv_path):
        print(f"Error: No se encontró el archivo '{csv_path}'.")
        return []
    
    productos = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                row["existencias"] = int(row["existencias"]) if row.get("existencias") else 0
            except ValueError:
                row["existencias"] = 0
                
            productos.append(row)
    return productos

def guardar_catalogo_csv(productos, csv_path="catalog.csv"):
    if not productos:
        return
    fieldnames = ["sku", "nombre", "imagen", "precio", "frecuencia", "inventario_tipo", "categoria", "existencias", "descripcion", "precio_original", "modelo_caja", "descuento", "tamano_altavoz", "caracteristicas"]
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for p in productos:
            row = {k: p.get(k, "") for k in fieldnames}
            writer.writerow(row)
    print(f"Base de datos '{csv_path}' guardada con éxito ({len(productos)} productos).")

def sincronizar_htmls(productos):
    if not productos:
        print("No hay productos en el catálogo para sincronizar.")
        return

    productos_ordenados = sorted(productos, key=lambda x: x.get("nombre", "").lower())
    js_array = json.dumps(productos_ordenados, ensure_ascii=False, indent=8)
    js_array_formatted = "const productCatalog = " + js_array + ";"

    pattern = re.compile(r"const productCatalog\s*=\s*\[.*?\]\s*;", re.DOTALL)

    updated_count = 0
    for filename in HTML_FILES:
        if not os.path.exists(filename):
            continue

        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()

        if pattern.search(content):
            new_content = pattern.sub(js_array_formatted, content)
            with open(filename, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"  -> Sincronizado: {filename}")
            updated_count += 1
        else:
            print(f"  x No se pudo localizar la variable 'productCatalog' en: {filename}")

    print(f"Sincronización terminada. {updated_count} archivos actualizados.")

def importar_proveedor(proveedor_csv_path):
    if not os.path.exists(proveedor_csv_path):
        print(f"Error: El archivo de proveedor '{proveedor_csv_path}' no existe.")
        return

    print(f"Iniciando importación desde '{proveedor_csv_path}'...")
    
    catalogo_actual = cargar_catalogo_csv()
    dict_actual = {p["sku"]: p for p in catalogo_actual}

    with open(proveedor_csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        print(f"Columnas detectadas en archivo de proveedor: {headers}")

        mapping = {}
        for h in headers:
            h_lower = h.lower().strip()
            if h_lower in ["sku", "codigo", "id", "código de barras", "sku/código"]:
                mapping["sku"] = h
            elif h_lower in ["nombre", "name", "título", "producto", "artículo"]:
                mapping["nombre"] = h
            elif h_lower in ["precio", "price", "costo", "venta", "p. publico"]:
                mapping["precio"] = h
            elif h_lower in ["desc", "descripcion", "descripción", "detalle"]:
                mapping["descripcion"] = h
            elif h_lower in ["existencias", "stock", "cantidad", "inventario", "existencia"]:
                mapping["existencias"] = h
            elif h_lower in ["categoria", "categoría", "depto", "departamento"]:
                mapping["categoria"] = h
            elif h_lower in ["imagen", "image", "foto", "url_imagen"]:
                mapping["imagen"] = h
            elif h_lower in ["frecuencia", "periodicidad", "entrega"]:
                mapping["frecuencia"] = h
            elif h_lower in ["tipo", "mercado", "inventario_tipo"]:
                mapping["inventario_tipo"] = h

        required_fields = ["sku", "nombre", "precio"]
        missing = [f for f in required_fields if f not in mapping]
        if missing:
            print(f"Error: Faltan las siguientes columnas obligatorias en el archivo de proveedor: {missing}")
            print("Asegúrate de renombrar tus columnas a: 'sku', 'nombre', 'precio' antes de importar.")
            return

        added_count = 0
        updated_count = 0

        for row in reader:
            sku = row[mapping["sku"]].strip()
            if not sku:
                continue

            nombre = row[mapping["nombre"]].strip()
            precio = row[mapping["precio"]].strip().replace("$", "").replace(",", "")
            
            descripcion = row.get(mapping.get("descripcion", ""), "").strip()
            if not descripcion:
                descripcion = f"Producto importado {nombre}."

            existencias = 0
            if "existencias" in mapping:
                try:
                    existencias = int(row[mapping["existencias"]].strip())
                except ValueError:
                    existencias = 0
            
            categoria = row.get(mapping.get("categoria", ""), "revistas").strip().lower()
            imagen = row.get(mapping.get("imagen", ""), "assets/img/mascota_tigre.jpg").strip()
            frecuencia = row.get(mapping.get("frecuencia", ""), "Inmediato").strip()
            inventario_tipo = row.get(mapping.get("inventario_tipo", ""), "Primer Mercado").strip()

            item_nuevo = {
                "sku": sku,
                "nombre": nombre,
                "imagen": imagen,
                "precio": precio,
                "frecuencia": frecuencia,
                "inventario_tipo": inventario_tipo,
                "categoria": categoria,
                "existencias": existencias,
                "descripcion": descripcion
            }

            if sku in dict_actual:
                dict_actual[sku].update({
                    "nombre": nombre,
                    "precio": precio,
                    "existencias": existencias,
                    "descripcion": descripcion,
                    "categoria": categoria
                })
                if row.get(mapping.get("imagen", "")):
                    dict_actual[sku]["imagen"] = imagen
                if row.get(mapping.get("inventario_tipo", "")):
                    dict_actual[sku]["inventario_tipo"] = inventario_tipo
                updated_count += 1
            else:
                dict_actual[sku] = item_nuevo
                added_count += 1

        print(f"Resultados de importación: {added_count} productos agregados, {updated_count} productos actualizados.")
        
        guardar_catalogo_csv(list(dict_actual.values()))
        sincronizar_htmls(list(dict_actual.values()))

if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--importar":
        importar_proveedor(sys.argv[2])
    else:
        print("Iniciando sincronización de catálogo desde 'catalog.csv' a páginas HTML...")
        catalogo = cargar_catalogo_csv()
        sincronizar_htmls(catalogo)
