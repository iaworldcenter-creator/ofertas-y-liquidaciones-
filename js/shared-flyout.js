/**
 * shared-flyout.js
 * Controlador Interactivo de Navegación Multinivel Flyout
 * Estructura departamentos y subcategorías para navegación de alta densidad.
 * Marca Oficial: VECTEC / Ecosistema Comercial
 */

(function () {
    const DEPARTMENTS = [
        {
            id: "ensamble",
            name: "Hardware & Ensamble",
            icon: "fa-microchip",
            badge: "Top Ventas",
            subcategories: [
                { title: "Procesadores Intel & AMD", desc: "Core Ultra, 14ª Gen, Ryzen 9000 & 7000", link: "catalogo-02-procesadores.html" },
                { title: "Tarjetas de Video (GPUs)", desc: "RTX Serie 50, RTX 40, Radeon RX", link: "catalogo-03-tarjetas-de-video.html" },
                { title: "Tarjetas Madre (Motherboards)", desc: "LGA1851, LGA1700, AM5, AM4", link: "catalogo-01-tarjetas-madre.html" },
                { title: "Memorias RAM", desc: "DDR5 hasta 7200MHz, DDR4 Gaming & Laptop", link: "catalogo-04-memorias-ram.html" },
                { title: "Fuentes de Poder (PSU)", desc: "Certificadas 80 Plus Bronze, Gold, Platinum", link: "catalogo-06-fuentes-de-poder.html" },
                { title: "Gabinetes Gamer & Torre", desc: "Cristal templado, mesh y flujo de aire alto", link: "catalogo-07-gabinetes.html" },
                { title: "Enfriamiento Líquido y Aire", desc: "Kits AIO 240/360mm y disipadores de torre", link: "catalogo-08-enfriamiento.html" },
                { title: "🛠️ Matriz de Ensamble Dinámico", desc: "Arma tu equipo a la medida con cálculo en vivo", link: "ensamble.html" }
            ]
        },
        {
            id: "almacenamiento",
            name: "Almacenamiento & SSDs",
            icon: "fa-hard-drive",
            badge: "Gen4/Gen5",
            subcategories: [
                { title: "SSDs M.2 NVMe PCIe 4.0/5.0", desc: "Velocidades ultrarrápidas hasta 7400MB/s", link: "catalogo-05-discos-duros.html" },
                { title: "SSDs SATA 2.5\"", desc: "Actualización económica para laptops y PCs", link: "catalogo-05-discos-duros.html" },
                { title: "Discos Duros HDD Internos", desc: "Alta capacidad de 1TB a 18TB para respaldo", link: "catalogo-05-discos-duros.html" },
                { title: "Discos Duros Externos", desc: "Almacenamiento portátil y resistente a caídas", link: "catalogo-05-discos-duros.html" }
            ]
        },
        {
            id: "equipos",
            name: "Laptops & PCs VECTEC",
            icon: "fa-laptop",
            badge: "Garantía 1 Año",
            subcategories: [
                { title: "Equipos Armados VECTEC", desc: "Configuraciones listas para entrega inmediata", link: "catalogo.html" },
                { title: "Laptops Portátiles", desc: "Gaming, arquitectura y productividad empresarial", link: "laptops/index.html" },
                { title: "Computadoras All In One", desc: "Pantalla y CPU integrados para oficina", link: "catalogo.html" },
                { title: "Mini PCs & NUC", desc: "Potencia compacta para espacios reducidos", link: "catalogo.html" }
            ]
        },
        {
            id: "perifericos",
            name: "Monitores & Periféricos",
            icon: "fa-desktop",
            badge: "E-Sports",
            subcategories: [
                { title: "Monitores Gaming 144Hz - 240Hz", desc: "Paneles IPS, OLED y curvos ultra-wide", link: "catalogo-11-monitores-software.html" },
                { title: "Teclados Mecánicos & Ópticos", desc: "Switches red, blue, brown con iluminación RGB", link: "catalogo-09-perifericos.html" },
                { title: "Ratones Gamer de Alta Precisión", desc: "Sensores ópticos hasta 26,000 DPI", link: "catalogo-09-perifericos.html" },
                { title: "Diademas & Audio Profesional", desc: "Sonido envolvente 7.1 y cancelación de ruido", link: "catalogo-09-perifericos.html" }
            ]
        },
        {
            id: "redes",
            name: "Conectividad & Redes",
            icon: "fa-network-wired",
            badge: "Mayorista",
            subcategories: [
                { title: "Switches Ethernet & Administrables", desc: "Gigabit y 10G para empresas y servidores", link: "catalogo-10-conectividad-redes.html" },
                { title: "Routers Wi-Fi 6 / 6E & Mesh", desc: "Cobertura total de alta velocidad sin caídas", link: "catalogo-10-conectividad-redes.html" },
                { title: "Cableado Estructurado Cat6 / Cat6A", desc: "Bobinas, conectores RJ45 y patch cords", link: "catalogo-10-conectividad-redes.html" }
            ]
        },
        {
            id: "outlet",
            name: "🔥 Liquidaciones & Outlet",
            icon: "fa-tags",
            badge: "Hasta 40% OFF",
            subcategories: [
                { title: "Tarjetas de Video en Remate", desc: "Lotes de exhibición y piezas de excedente", link: "../ofertas-y-liquidaciones/index.html" },
                { title: "Procesadores TRAY & OEM", desc: "Mismo rendimiento a precio de fabricante", link: "../ofertas-y-liquidaciones/index.html" },
                { title: "Lotes y Combos de Descuento", desc: "Aprovecha precios de liquidación directa", link: "../ofertas-y-liquidaciones/index.html" }
            ]
        }
    ];

    function createFlyoutNav(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.classList.add("flyout-nav-wrapper");

        // Construir HTML del Menú
        container.innerHTML = `
            <button type="button" class="flyout-trigger-btn" id="flyoutTriggerBtn" aria-expanded="false" aria-label="Abrir catálogo por departamentos">
                <i class="fa-solid fa-bars-staggered text-cyan-400"></i>
                <span>Departamentos VECTEC</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition transform duration-200" id="flyoutChevron"></i>
            </button>

            <div class="flyout-panel" id="flyoutPanel" role="region" aria-label="Menú de departamentos">
                <div class="flyout-primary-list" id="flyoutPrimaryList"></div>
                <div class="flyout-sub-content" id="flyoutSubContent"></div>
            </div>
        `;

        const triggerBtn = document.getElementById("flyoutTriggerBtn");
        const panel = document.getElementById("flyoutPanel");
        const chevron = document.getElementById("flyoutChevron");
        const primaryList = document.getElementById("flyoutPrimaryList");
        const subContent = document.getElementById("flyoutSubContent");

        let activeDeptIndex = 0;

        // Renderizar lista primaria de departamentos
        function renderPrimaryList() {
            primaryList.innerHTML = DEPARTMENTS.map((dept, index) => `
                <button type="button" class="flyout-primary-item ${index === activeDeptIndex ? 'active' : ''}" data-index="${index}">
                    <span class="flex items-center truncate">
                        <i class="fa-solid ${dept.icon} cat-icon"></i>
                        <span class="truncate">${dept.name}</span>
                    </span>
                    ${dept.badge ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 shrink-0 ml-1">${dept.badge}</span>` : '<i class="fa-solid fa-chevron-right text-[10px] text-slate-500 shrink-0"></i>'}
                </button>
            `).join('');

            primaryList.querySelectorAll(".flyout-primary-item").forEach(item => {
                item.addEventListener("mouseenter", () => {
                    const idx = parseInt(item.getAttribute("data-index"));
                    setActiveDepartment(idx);
                });
                item.addEventListener("click", () => {
                    const idx = parseInt(item.getAttribute("data-index"));
                    setActiveDepartment(idx);
                });
            });
        }

        // Renderizar subcategorías del departamento activo
        function renderSubContent(dept) {
            subContent.innerHTML = `
                <div class="flyout-sub-header">
                    <div class="flyout-sub-title">
                        <i class="fa-solid ${dept.icon} text-cyan-400"></i>
                        <span>${dept.name}</span>
                    </div>
                    <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        ${dept.subcategories.length} Secciones
                    </span>
                </div>
                <div class="flyout-sub-grid">
                    ${dept.subcategories.map(sub => `
                        <a href="${sub.link}" class="flyout-sub-card group">
                            <div class="flyout-sub-card-title">${sub.title}</div>
                            <div class="flyout-sub-card-desc">${sub.desc}</div>
                        </a>
                    `).join('')}
                </div>
            `;
        }

        function setActiveDepartment(index) {
            activeDeptIndex = index;
            primaryList.querySelectorAll(".flyout-primary-item").forEach((btn, idx) => {
                btn.classList.toggle("active", idx === index);
            });
            renderSubContent(DEPARTMENTS[index]);
        }

        // Toggle panel
        function togglePanel(open) {
            const shouldOpen = (open !== undefined) ? open : !panel.classList.contains("is-open");
            if (shouldOpen) {
                panel.classList.add("is-open");
                triggerBtn.classList.add("active");
                triggerBtn.setAttribute("aria-expanded", "true");
                chevron.classList.add("rotate-180");
                setActiveDepartment(activeDeptIndex);
            } else {
                panel.classList.remove("is-open");
                triggerBtn.classList.remove("active");
                triggerBtn.setAttribute("aria-expanded", "false");
                chevron.classList.remove("rotate-180");
            }
        }

        triggerBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            togglePanel();
        });

        // Cerrar al hacer clic fuera
        document.addEventListener("click", (e) => {
            if (!container.contains(e.target)) {
                togglePanel(false);
            }
        });

        // Inicializar vistas internas
        renderPrimaryList();
        renderSubContent(DEPARTMENTS[0]);
    }

    window.initFlyoutNav = createFlyoutNav;

    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("vectec-flyout-container")) {
            createFlyoutNav("vectec-flyout-container");
        }
    });
})();
