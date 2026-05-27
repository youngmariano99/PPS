import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import ModalPostularse from "./ModalPostularse.tsx"

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function DirectorioOfertasTrabajo(props) {
    const { 
        apiUrl = "http://localhost:8080/api/v1", 
        primaryColor = "#A01EED" 
    } = props

    // Initialize search query from URL params if present
    const getInitialParam = (paramName) => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            return params.get(paramName) || ""
        }
        return ""
    }

    // Core States
    const [busqueda, setBusqueda] = useState(getInitialParam("q"))
    const [ubicacionInput, setUbicacionInput] = useState(getInitialParam("l"))
    const [ofertas, setOfertas] = useState([])
    const [totalOfertas, setTotalOfertas] = useState(0)
    const [loading, setLoading] = useState(false)
    
    // Page state (0-indexed for backend)
    const [paginaActual, setPaginaActual] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(1)

    // Filter States
    const [rubroSeleccionado, setRubroSeleccionado] = useState("")
    const [modalidadSeleccionada, setModalidadSeleccionada] = useState("")
    const [salarioMin, setSalarioMin] = useState("")
    const [salarioMax, setSalarioMax] = useState("")
    const [expSeleccionada, setExpSeleccionada] = useState("")
    const [ordenarPor, setOrdenarPor] = useState("recientes")

    // Modal state
    const [ofertaParaPostular, setOfertaParaPostular] = useState(null)

    // Load Fonts & Inject Dynamic CSS
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)

        const style = document.createElement("style")
        style.id = "chamba-directorio-styles"
        style.innerHTML = `
            .chamba-search-input:focus {
                border-color: ${primaryColor} !important;
                outline: none !important;
            }
            .chamba-filter-input:focus {
                border-color: ${primaryColor} !important;
                outline: none !important;
            }
            .chamba-job-card {
                transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
            }
            .chamba-job-card:hover {
                transform: translateY(-2px) !important;
                border-color: ${primaryColor} !important;
                box-shadow: 0 12px 20px -8px rgba(160, 30, 237, 0.08) !important;
            }
            .chamba-detail-btn {
                background: ${primaryColor} !important;
                transition: opacity 0.2s ease !important;
            }
            .chamba-detail-btn:hover {
                opacity: 0.95 !important;
            }
            .chamba-pag-btn {
                background: #FFFFFF !important;
                color: #475569 !important;
                border: 1px solid #E2E8F0 !important;
                transition: all 0.15s ease !important;
            }
            .chamba-pag-btn:hover {
                background: #F8FAFC !important;
                color: #0F172A !important;
            }

            /* Responsive rules */
            @media (max-width: 992px) {
                .chamba-search-header-area {
                    padding: 16px 20px !important;
                }
                .chamba-main-content-layout {
                    flex-direction: column !important;
                    padding: 20px !important;
                    gap: 24px !important;
                }
                .chamba-sidebar-layout {
                    width: 100% !important;
                }
            }

            @media (max-width: 640px) {
                .chamba-search-bar-form {
                    padding: 4px 4px 4px 12px !important;
                    gap: 8px !important;
                }
                .chamba-search-btn {
                    padding: 8px 16px !important;
                    font-size: 13.5px !important;
                }
                .chamba-results-header-row {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                }
                .chamba-job-card {
                    flex-direction: column !important;
                    gap: 16px !important;
                    padding: 20px !important;
                }
                .chamba-right-action-col {
                    width: 100% !important;
                    border-top: 1px solid #F1F5F9 !important;
                    padding-top: 16px !important;
                    margin-top: 4px !important;
                    flex-direction: column !important;
                    gap: 16px !important;
                    align-items: stretch !important;
                }
                .chamba-meta-vertical-col {
                    flex-direction: row !important;
                    flex-wrap: wrap !important;
                    gap: 12px !important;
                    margin: 4px 0 !important;
                }
                .chamba-salario-fields-row {
                    flex-direction: column !important;
                    gap: 8px !important;
                }
                .chamba-quick-sal-buttons-row {
                    flex-wrap: wrap !important;
                }
                .chamba-modalidad-group {
                    flex-wrap: wrap !important;
                }
            }
        `
        document.head.appendChild(style)

        return () => {
            link.remove()
            style.remove()
        }
    }, [primaryColor])

    // Load jobs from API
    const cargarOfertas = async () => {
        setLoading(true)
        try {
            // Spring Boot standard paginated endpoint
            let endpoint = `${apiUrl}/ofertas?page=${paginaActual}&size=4`
            
            // Note: Filters can be processed in memory or sent to backend if it gets updated.
            // In accordance with scalability, we append them to the request parameters.
            const queryParams = []
            if (busqueda.trim()) queryParams.push(`q=${encodeURIComponent(busqueda.trim())}`)
            if (ubicacionInput.trim()) queryParams.push(`l=${encodeURIComponent(ubicacionInput.trim())}`)
            if (rubroSeleccionado) queryParams.push(`rubro=${encodeURIComponent(rubroSeleccionado)}`)
            if (modalidadSeleccionada) queryParams.push(`modalidad=${encodeURIComponent(modalidadSeleccionada)}`)
            if (salarioMin) queryParams.push(`salarioMin=${encodeURIComponent(salarioMin)}`)
            if (salarioMax) queryParams.push(`salarioMax=${encodeURIComponent(salarioMax)}`)
            if (expSeleccionada) queryParams.push(`experiencia=${encodeURIComponent(expSeleccionada)}`)
            if (ordenarPor) queryParams.push(`sort=${encodeURIComponent(ordenarPor)}`)

            if (queryParams.length > 0) {
                endpoint += `&${queryParams.join("&")}`
            }

            const response = await fetch(endpoint)
            if (response.ok) {
                const data = await response.json()
                // Spring Boot Page response structure: { content: [], totalPages: N, totalElements: M }
                setOfertas(data.content || [])
                setTotalPaginas(data.totalPages || 1)
                setTotalOfertas(data.totalElements || 0)
            } else {
                throw new Error("Fallo de API")
            }
        } catch (err) {
            console.warn("Backend API falló. Cargando mock de demostración 1:1...")
            cargarMocksDemo()
        } finally {
            setLoading(false)
        }
    }

    const cargarMocksDemo = () => {
        // Mock data exactly matching the 4 jobs shown in the mockup image
        const mockList = [
            {
                id: "1",
                titulo: "Desarrollador Frontend React",
                empresaRazonSocial: "TechNova Solutions",
                modalidad: "REMOTO",
                salarioMin: 900000,
                salarioMax: 1400000,
                descripcion: "Buscamos desarrollador frontend con experiencia en React y Next.js para sumarse a nuestro equipo de producto.",
                habilidadesClave: ["React", "Next.js", "TypeScript"],
                fechaCreacion: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
                rubro: "Tecnología",
                prioridad: "Nuevo"
            },
            {
                id: "2",
                titulo: "Diseñador/a UX UI",
                empresaRazonSocial: "DesignGroup",
                modalidad: "HIBRIDO",
                salarioMin: 800000,
                salarioMax: 1200000,
                descripcion: "Buscamos diseñador/a UX UI para crear experiencias increíbles centradas en usuarios para productos digitales.",
                habilidadesClave: ["Figma", "Adobe XD", "UI Design"],
                fechaCreacion: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
                rubro: "Diseño",
                prioridad: "Urgente"
            },
            {
                id: "3",
                titulo: "Analista de Datos",
                empresaRazonSocial: "Data Insights",
                modalidad: "REMOTO",
                salarioMin: 1200000,
                salarioMax: 1800000,
                descripcion: "Buscamos analista de datos para trabajar con grandes volúmenes de información y generar insights de valor.",
                habilidadesClave: ["SQL", "Python", "Power BI"],
                fechaCreacion: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6 hours ago
                rubro: "Tecnología",
                prioridad: "Nuevo"
            },
            {
                id: "4",
                titulo: "Especialista en Marketing Digital",
                empresaRazonSocial: "Brandify",
                modalidad: "PRESENCIAL",
                salarioMin: 700000,
                salarioMax: 1000000,
                descripcion: "Buscamos especialista en marketing digital para campañas en Google Ads, Meta Ads y estrategias de crecimiento.",
                habilidadesClave: ["Google Ads", "Meta Ads", "SEO"],
                fechaCreacion: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8 hours ago
                rubro: "Marketing",
                prioridad: "Nuevo"
            }
        ]

        // Apply filters in memory for demo robustness
        let filtered = [...mockList]
        if (busqueda) {
            filtered = filtered.filter(o => o.titulo.toLowerCase().includes(busqueda.toLowerCase()) || o.empresaRazonSocial.toLowerCase().includes(busqueda.toLowerCase()))
        }
        if (rubroSeleccionado) {
            filtered = filtered.filter(o => o.rubro === rubroSeleccionado)
        }
        if (modalidadSeleccionada) {
            filtered = filtered.filter(o => o.modalidad === modalidadSeleccionada)
        }
        if (salarioMin) {
            filtered = filtered.filter(o => o.salarioMin >= parseFloat(salarioMin))
        }
        if (salarioMax) {
            filtered = filtered.filter(o => o.salarioMax <= parseFloat(salarioMax))
        }

        setOfertas(filtered)
        setTotalOfertas(filtered.length)
        setTotalPaginas(1)
    }

    useEffect(() => {
        cargarOfertas()
    }, [paginaActual, rubroSeleccionado, modalidadSeleccionada, salarioMin, salarioMax, expSeleccionada, ordenarPor])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        setPaginaActual(0)
        cargarOfertas()
    }

    const clearFilters = () => {
        setBusqueda("")
        setUbicacionInput("")
        setRubroSeleccionado("")
        setModalidadSeleccionada("")
        setSalarioMin("")
        setSalarioMax("")
        setExpSeleccionada("")
        setPaginaActual(0)
    }

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return "Hace unas horas"
        const diff = Date.now() - new Date(dateStr).getTime()
        const diffHours = Math.floor(diff / (3600 * 1000))
        if (diffHours < 1) return "Hace un momento"
        if (diffHours < 24) return `Hace ${diffHours} horas`
        return `Hace ${Math.floor(diffHours / 24)} días`
    }

    const formatSalary = (min, max) => {
        const fmt = (val) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(val)
        return `${fmt(min)} - ${fmt(max)} / mes`
    }

    return (
        <div style={{ ...containerStyle, background: "transparent", minHeight: "auto" }}>
            {/* Sub-header search area */}
            <div className="chamba-search-header-area" style={searchHeaderArea}>
                <form onSubmit={handleSearchSubmit} className="chamba-search-bar-form" style={searchBarForm}>
                    <IconSearchBig />
                    <input
                        type="text"
                        className="chamba-search-input"
                        placeholder="Buscar ofertas de empleo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={searchFieldRaw}
                    />
                    <button type="submit" className="chamba-search-btn" style={{ ...searchBtnStyle, background: primaryColor }}>
                        Buscar
                    </button>
                </form>
            </div>

            {/* Split panel main layout */}
            <div className="chamba-main-content-layout" style={mainContentLayout}>
                {/* FILTERS PANEL (LEFT) */}
                <aside className="chamba-sidebar-layout" style={sidebarStyle}>
                    <div style={sidebarHeader}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>Filtros</span>
                        <div onClick={clearFilters} style={clearBtnWrapper(primaryColor)}>
                            <span style={{ fontSize: "13px", fontWeight: "600" }}>Limpiar todo</span>
                            <IconReload color={primaryColor} />
                        </div>
                    </div>

                    {/* Rubro Filter */}
                    <div style={accordionItem}>
                        <div style={accordionHeader}>
                            <span>Rubro</span>
                            <span>v</span>
                        </div>
                        <div style={checkboxGroup}>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={rubroSeleccionado === "Tecnología"}
                                    onChange={() => setRubroSeleccionado(rubroSeleccionado === "Tecnología" ? "" : "Tecnología")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Tecnología</span>
                                <span style={checkCount}>120</span>
                            </label>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={rubroSeleccionado === "Diseño"}
                                    onChange={() => setRubroSeleccionado(rubroSeleccionado === "Diseño" ? "" : "Diseño")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Diseño</span>
                                <span style={checkCount}>45</span>
                            </label>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={rubroSeleccionado === "Marketing"}
                                    onChange={() => setRubroSeleccionado(rubroSeleccionado === "Marketing" ? "" : "Marketing")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Marketing</span>
                                <span style={checkCount}>38</span>
                            </label>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={rubroSeleccionado === "Administración"}
                                    onChange={() => setRubroSeleccionado(rubroSeleccionado === "Administración" ? "" : "Administración")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Administración</span>
                                <span style={checkCount}>32</span>
                            </label>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={rubroSeleccionado === "Recursos Humanos"}
                                    onChange={() => setRubroSeleccionado(rubroSeleccionado === "Recursos Humanos" ? "" : "Recursos Humanos")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Recursos Humanos</span>
                                <span style={checkCount}>26</span>
                            </label>
                        </div>
                        <span style={{ ...moreLabel, color: primaryColor }}>Ver más v</span>
                    </div>

                    {/* Modalidad Filter */}
                    <div style={accordionItem}>
                        <div style={accordionHeader}>
                            <span>Modalidad</span>
                            <span>v</span>
                        </div>
                        <div className="chamba-modalidad-group" style={modalidadGroup}>
                            <button
                                type="button"
                                onClick={() => setModalidadSeleccionada(modalidadSeleccionada === "PRESENCIAL" ? "" : "PRESENCIAL")}
                                style={modalidadBtn(modalidadSeleccionada === "PRESENCIAL", primaryColor)}
                            >
                                Presencial
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalidadSeleccionada(modalidadSeleccionada === "REMOTO" ? "" : "REMOTO")}
                                style={modalidadBtn(modalidadSeleccionada === "REMOTO", primaryColor)}
                            >
                                Remoto
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalidadSeleccionada(modalidadSeleccionada === "HIBRIDO" ? "" : "HIBRIDO")}
                                style={modalidadBtn(modalidadSeleccionada === "HIBRIDO", primaryColor)}
                            >
                                Híbrido
                            </button>
                        </div>
                    </div>

                    {/* Salario Filter */}
                    <div style={accordionItem}>
                        <div style={accordionHeader}>
                            <span>Salario mensual (ARS)</span>
                            <span>v</span>
                        </div>
                        <div className="chamba-salario-fields-row" style={salarioFieldsRow}>
                            <div style={salarioInputWrapper}>
                                <span style={salLabel}>Mínimo</span>
                                <input 
                                    type="number" 
                                    placeholder="$ 0"
                                    value={salarioMin}
                                    onChange={(e) => setSalarioMin(e.target.value)}
                                    className="chamba-filter-input"
                                    style={salInputField} 
                                />
                            </div>
                            <div style={salarioInputWrapper}>
                                <span style={salLabel}>Máximo</span>
                                <input 
                                    type="number" 
                                    placeholder="$ 5.000.000"
                                    value={salarioMax}
                                    onChange={(e) => setSalarioMax(e.target.value)}
                                    className="chamba-filter-input"
                                    style={salInputField} 
                                
                                />
                            </div>
                        </div>
                        {/* Static visual slider matching mockup */}
                        <div style={sliderTrack}>
                            <div style={{ ...sliderProgress, background: primaryColor }} />
                            <div style={{ ...sliderThumb, left: "0%" }} />
                            <div style={{ ...sliderThumb, left: "100%", background: primaryColor }} />
                        </div>
                        {/* Quick filter buttons */}
                        <div className="chamba-quick-sal-buttons-row" style={quickSalButtonsRow}>
                            <button type="button" onClick={() => setSalarioMin("500000")} style={quickSalBtn}>+ $500k</button>
                            <button type="button" onClick={() => setSalarioMin("1000000")} style={quickSalBtn}>+ $1M</button>
                            <button type="button" onClick={() => setSalarioMin("2000000")} style={quickSalBtn}>+ $2M</button>
                        </div>
                    </div>

                    {/* Nivel Experiencia Filter */}
                    <div style={accordionItem}>
                        <div style={accordionHeader}>
                            <span>Nivel de experiencia</span>
                            <span>v</span>
                        </div>
                        <div style={checkboxGroup}>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={expSeleccionada === "JUNIOR"}
                                    onChange={() => setExpSeleccionada(expSeleccionada === "JUNIOR" ? "" : "JUNIOR")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Junior / Sin experiencia</span>
                                <span style={checkCount}>68</span>
                            </label>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={expSeleccionada === "SEMISENIOR"}
                                    onChange={() => setExpSeleccionada(expSeleccionada === "SEMISENIOR" ? "" : "SEMISENIOR")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Semi senior</span>
                                <span style={checkCount}>74</span>
                            </label>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={expSeleccionada === "SENIOR"}
                                    onChange={() => setExpSeleccionada(expSeleccionada === "SENIOR" ? "" : "SENIOR")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Senior</span>
                                <span style={checkCount}>62</span>
                            </label>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={expSeleccionada === "LIDER"}
                                    onChange={() => setExpSeleccionada(expSeleccionada === "LIDER" ? "" : "LIDER")}
                                    style={checkboxInput(primaryColor)}
                                />
                                <span style={checkText}>Líder / Gerencial</span>
                                <span style={checkCount}>28</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* JOB LIST AREA (RIGHT) */}
                <main className="chamba-right-main-container" style={rightMainContainer}>
                    {/* Header bar */}
                    <div className="chamba-results-header-row" style={resultsHeaderRow}>
                        <span style={resultsCountText}>{totalOfertas} ofertas encontradas</span>
                        <div style={sortContainer}>
                            <span style={sortLabelText}>Ordenar por:</span>
                            <select 
                                value={ordenarPor} 
                                onChange={(e) => setOrdenarPor(e.target.value)} 
                                style={sortDropdownField}
                            >
                                <option value="recientes">Más recientes</option>
                                <option value="salario_desc">Mayor salario</option>
                                <option value="salario_asc">Menor salario</option>
                            </select>
                        </div>
                    </div>

                    {/* Jobs cards list */}
                    <div style={jobsListContainer}>
                        {loading ? (
                            <div style={loadingState}>Cargando ofertas de empleo...</div>
                        ) : ofertas.length === 0 ? (
                            <div style={emptyState}>No se encontraron ofertas de empleo que coincidan con los filtros.</div>
                        ) : (
                            ofertas.map((o) => (
                                <div key={o.id} className="chamba-job-card" style={jobCardStyle}>
                                    {/* Left: Initials Circle */}
                                    <div style={initialsCircleBox(primaryColor)}>
                                        {o.empresaRazonSocial ? o.empresaRazonSocial.slice(0, 2).toUpperCase() : "EM"}
                                    </div>

                                    {/* Middle: Data */}
                                    <div className="chamba-middle-job-data" style={middleJobData}>
                                        <div style={tagRow}>
                                            <span style={priorityBadge(o.prioridad || "Nuevo")}>
                                                {o.prioridad || "Nuevo"}
                                            </span>
                                        </div>
                                        <h3 style={jobTitleText}>{o.titulo}</h3>
                                        <div style={companyVerifiedRow}>
                                            <span style={companyLabelText}>{o.empresaRazonSocial || "Empresa Reclutadora"}</span>
                                            <IconVerifiedBlue />
                                        </div>
                                        <span style={salaryBoldText}>{formatSalary(o.salarioMin || 800000, o.salarioMax || 1200000)}</span>
                                        <p style={descriptionText}>{o.descripcion}</p>
                                        
                                        <div style={skillsChipsRow}>
                                            {(o.habilidadesClave || ["React", "CSS"]).map((skill, i) => (
                                                <span key={i} style={skillChipStyle}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Meta & Actions */}
                                    <div className="chamba-right-action-col" style={rightActionCol}>
                                        <div style={{ alignSelf: "flex-end", cursor: "pointer" }}>
                                            <IconBookmark />
                                        </div>
                                        <div className="chamba-meta-vertical-col" style={metaVerticalCol}>
                                            <div style={metaVerticalItem}><IconPinMini /> {o.ubicacionText || "Buenos Aires, Arg"}</div>
                                            <div style={metaVerticalItem}><IconMonitorMini /> {o.modalidad}</div>
                                            <div style={metaVerticalItem}><IconClockMini /> {formatTimeAgo(o.fechaCreacion)}</div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setOfertaParaPostular(o)}
                                            className="chamba-detail-btn" 
                                            style={detailBtnStyle}
                                        >
                                            Ver detalle
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPaginas > 1 && (
                        <div style={paginationWrapper}>
                            <button 
                                type="button" 
                                className="chamba-pag-btn" 
                                disabled={paginaActual === 0}
                                onClick={() => setPaginaActual(prev => Math.max(0, prev - 1))}
                                style={paginationBtnStyle}
                            >
                                Anterior
                            </button>
                            {Array.from({ length: totalPaginas }, (_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setPaginaActual(i)}
                                    style={{
                                        ...paginationNumberBtn(paginaActual === i, primaryColor),
                                        background: paginaActual === i ? primaryColor : "transparent",
                                        borderColor: paginaActual === i ? primaryColor : "#E2E8F0"
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button 
                                type="button" 
                                className="chamba-pag-btn" 
                                disabled={paginaActual === totalPaginas - 1}
                                onClick={() => setPaginaActual(prev => Math.min(totalPaginas - 1, prev + 1))}
                                style={paginationBtnStyle}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Embedded Candidate Candidacy Modal Popup */}
            <AnimatePresence>
                {ofertaParaPostular && (
                    <ModalPostularse
                        oferta={ofertaParaPostular}
                        onClose={() => setOfertaParaPostular(null)}
                        apiUrl={apiUrl}
                        primaryColor={primaryColor}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// --- VECTOR ICONS & LOGO ---

const LogoChamba = () => (
    <svg width="120" height="30" viewBox="0 0 150 40" fill="none">
        <path d="M20 10C15 10 10 15 10 20S15 30 20 30S30 25 30 20S25 10 20 10ZM20 25C17.2 25 15 22.8 15 20S17.2 15 20 15S25 17.2 25 20S22.8 25 20 25Z" fill="#A01EED" />
        <text x="35" y="28" fontFamily="Poppins" fontWeight="700" fontSize="24" fill="#000000">chamba</text>
    </svg>
)

const IconSearchBig = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const IconReload = ({ color }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px" }}>
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
)

const IconVerifiedBlue = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "4px" }}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#3B82F6" />
    </svg>
)

const IconBookmark = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
)

const IconPinMini = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
)

const IconMonitorMini = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
)

const IconClockMini = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
)

// --- STYLES ---

const containerStyle = {
    width: "100%",
    minHeight: "100vh",
    background: "#F8FAFC",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif"
}

const navbarStyle = {
    height: "72px",
    background: "#FFFFFF",
    borderBottom: "1px solid #F1F5F9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    boxSizing: "border-box",
    zIndex: 100
}

const navLeft = {
    display: "flex",
    alignItems: "center",
    gap: "24px"
}

const navTagline = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#475569",
    letterSpacing: "0.5px"
}

const navRight = {
    display: "flex",
    alignItems: "center",
    gap: "32px"
}

const navLink = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    padding: "24px 0",
    boxSizing: "border-box"
}

const bellIconStyle = {
    position: "relative",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#F1F5F9"
}

const badgeCount = {
    position: "absolute",
    top: "0px",
    right: "0px",
    background: "#EF4444",
    color: "white",
    fontSize: "9px",
    fontWeight: "700",
    borderRadius: "50%",
    width: "14px",
    height: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const avatarStyle = (color) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: color,
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
})

const searchHeaderArea = {
    background: "#FFFFFF",
    borderBottom: "1px solid #F1F5F9",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "center"
}

const searchBarForm = {
    display: "flex",
    background: "#F8FAFC",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    padding: "6px 6px 6px 18px",
    boxSizing: "border-box",
    alignItems: "center",
    width: "100%",
    maxWidth: "880px",
    gap: "12px"
}

const searchFieldRaw = {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: "14.5px",
    color: "#0F172A",
    fontWeight: "500",
    padding: "10px 0",
    outline: "none"
}

const searchBtnStyle = {
    color: "#FFFFFF",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14.5px",
    fontWeight: "700",
    border: "none",
    borderRadius: "10px",
    padding: "10px 24px",
    cursor: "pointer"
}

const mainContentLayout = {
    flex: 1,
    display: "flex",
    padding: "32px 40px",
    boxSizing: "border-box",
    gap: "32px",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto"
}

const sidebarStyle = {
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    flexShrink: 0
}

const sidebarHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: "16px"
}

const clearBtnWrapper = (color) => ({
    display: "flex",
    alignItems: "center",
    color: color,
    cursor: "pointer"
})

const accordionItem = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "left",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: "20px"
}

const accordionHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#475569"
}

const checkboxGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
}

const checkboxLabel = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "13.5px"
}

const checkboxInput = (color) => ({
    width: "16px",
    height: "16px",
    accentColor: color,
    cursor: "pointer"
})

const checkText = {
    color: "#334155",
    fontWeight: "500",
    flex: 1
}

const checkCount = {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: "12px"
}

const moreLabel = {
    fontSize: "12.5px",
    fontWeight: "700",
    cursor: "pointer",
    alignSelf: "flex-start"
}

const modalidadGroup = {
    display: "flex",
    gap: "8px"
}

const modalidadBtn = (selected, color) => ({
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: selected ? `1px solid ${color}` : "1px solid #E2E8F0",
    background: selected ? `${color}10` : "#FFFFFF",
    color: selected ? color : "#64748B",
    fontSize: "12.5px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.15s ease"
})

const salarioFieldsRow = {
    display: "flex",
    gap: "12px"
}

const salarioInputWrapper = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1
}

const salLabel = {
    fontSize: "11px",
    color: "#94A3B8",
    fontWeight: "600"
}

const salInputField = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "13px",
    color: "#0F172A",
    background: "#FFFFFF",
    boxSizing: "border-box"
}

const sliderTrack = {
    height: "5px",
    background: "#E2E8F0",
    borderRadius: "3px",
    position: "relative",
    margin: "12px 6px"
}

const sliderProgress = {
    position: "absolute",
    height: "100%",
    left: "0%",
    right: "0%"
}

const sliderThumb = {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#FFFFFF",
    border: "2px solid",
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
}

const quickSalButtonsRow = {
    display: "flex",
    gap: "6px"
}

const quickSalBtn = {
    flex: 1,
    background: "#F1F5F9",
    border: "none",
    borderRadius: "8px",
    padding: "6px 0",
    fontSize: "11px",
    color: "#64748B",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.15s",
    "&:hover": {
        background: "#E2E8F0"
    }
}

const rightMainContainer = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px"
}

const resultsHeaderRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
}

const resultsCountText = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0F172A"
}

const sortContainer = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
}

const sortLabelText = {
    fontSize: "13.5px",
    color: "#64748B",
    fontWeight: "500"
}

const sortDropdownField = {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    color: "#334155",
    fontSize: "13.5px",
    fontWeight: "600",
    outline: "none"
}

const jobsListContainer = {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
}

const jobCardStyle = {
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #F1F5F9",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.01)",
    padding: "24px",
    boxSizing: "border-box",
    display: "flex",
    gap: "20px",
    textAlign: "left"
}

const initialsCircleBox = (color) => ({
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: `${color}10`,
    color: color,
    fontSize: "16px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
})

const middleJobData = {
    flex: 1,
    display: "flex",
    flexDirection: "column"
}

const tagRow = {
    display: "flex",
    gap: "8px",
    marginBottom: "8px"
}

const priorityBadge = (type) => ({
    fontSize: "10.5px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "20px",
    background: type === "Urgente" ? "#FFF7ED" : "#FAF9FF",
    color: type === "Urgente" ? "#EA580C" : "#A01EED"
})

const jobTitleText = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16.5px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "0 0 2px 0"
}

const companyVerifiedRow = {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px"
}

const companyLabelText = {
    fontSize: "13.5px",
    color: "#475569",
    fontWeight: "600"
}

const salaryBoldText = {
    fontSize: "14px",
    color: "#0F172A",
    fontWeight: "700",
    marginBottom: "12px"
}

const descriptionText = {
    fontSize: "13.5px",
    color: "#64748B",
    lineHeight: "1.5",
    margin: "0 0 16px 0"
}

const skillsChipsRow = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
}

const skillChipStyle = {
    background: "#F1F5F9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
    padding: "6px 12px",
    borderRadius: "8px"
}

const rightActionCol = {
    width: "160px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    flexShrink: 0
}

const metaVerticalCol = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: "16px 0"
}

const metaVerticalItem = {
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#64748B",
    fontWeight: "500"
}

const detailBtnStyle = {
    color: "#FFFFFF",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13.5px",
    fontWeight: "700",
    border: "none",
    borderRadius: "10px",
    padding: "10px 0",
    width: "100%",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(160, 30, 237, 0.12)",
    textAlign: "center"
}

const paginationWrapper = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "24px"
}

const paginationBtnStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "13.5px",
    fontWeight: "600",
    cursor: "pointer"
}

const paginationNumberBtn = (selected, color) => ({
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid",
    color: selected ? "#FFFFFF" : "#64748B",
    fontSize: "13.5px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease"
})

const loadingState = {
    padding: "48px 0",
    fontSize: "14.5px",
    color: "#64748B",
    fontWeight: "500"
}

const emptyState = {
    padding: "48px 24px",
    fontSize: "14.5px",
    color: "#64748B",
    fontWeight: "500",
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #F1F5F9"
}

addPropertyControls(DirectorioOfertasTrabajo, {
    apiUrl: {
        type: ControlType.String,
        title: "API Base URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Principal",
        defaultValue: "#A01EED",
    }
})
