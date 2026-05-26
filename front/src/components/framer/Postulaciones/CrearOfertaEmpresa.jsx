import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { useIdentityStore } from "../../../store/useIdentityStore.js"

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function CrearOfertaEmpresa(props) {
    const { apiUrl = "http://localhost:8080/api/v1", primaryColor = "#A01EED" } = props

    const { contextoActivo, cuentaBase } = useIdentityStore()

    // Form fields
    const [titulo, setTitulo] = useState("")
    const [modalidad, setModalidad] = useState("PRESENCIAL")
    const [descripcion, setDescripcion] = useState("")
    const [salarioMin, setSalarioMin] = useState("")
    const [salarioMax, setSalarioMax] = useState("")
    const [aConvenir, setAConvenir] = useState(false)

    // Skills
    const [habilidades, setHabilidades] = useState([
        "Instalación de Gas",
        "Termofusión",
        "Lectura de Planos",
        "Plomería General",
        "Detección de Fugas"
    ])
    const [nuevaHabilidad, setNuevaHabilidad] = useState("")
    const [mostrarInputHabilidad, setMostrarInputHabilidad] = useState(false)

    // Knockout Questions
    const [preguntas, setPreguntas] = useState([
        { id: "1", pregunta: "¿Disponés de herramientas de termofusión propias?", tipoPregunta: "SI_NO", respuestaEsperadaExcluyente: "SI", excluyente: true },
        { id: "2", pregunta: "¿Tenés matrícula de gasista activa?", tipoPregunta: "SI_NO", respuestaEsperadaExcluyente: "NO", excluyente: true }
    ])

    // UI States
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [activeMenuId, setActiveMenuId] = useState(null)

    // Load Fonts & Inject Dynamic Stylesheet
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)

        const style = document.createElement("style")
        style.id = "chamba-create-offer-styles"
        style.innerHTML = `
            .chamba-input:focus, .chamba-textarea:focus, .chamba-select:focus {
                border-color: ${primaryColor} !important;
                box-shadow: 0 0 0 3px rgba(160, 30, 237, 0.1) !important;
                outline: none !important;
            }
            .chamba-sidebar-item:hover {
                background: rgba(160, 30, 237, 0.03) !important;
                color: ${primaryColor} !important;
            }
            .chamba-dropdown-menu-item:hover {
                background: #FEF2F2 !important;
            }
            .chamba-three-dots:hover {
                background: #F1F5F9 !important;
            }
        `
        document.head.appendChild(style)

        const handleClickOutside = (e) => {
            if (!e.target.closest(".chamba-three-dots-container")) {
                setActiveMenuId(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            link.remove()
            style.remove()
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [primaryColor])

    // Deshabilitar inputs de salario si se marca "A convenir"
    useEffect(() => {
        if (aConvenir) {
            setSalarioMin("")
            setSalarioMax("")
        }
    }, [aConvenir])

    const handleAddHabilidad = (e) => {
        if (e.key === "Enter" || e.type === "click") {
            e.preventDefault()
            const val = nuevaHabilidad.trim()
            if (val && !habilidades.includes(val)) {
                setHabilidades([...habilidades, val])
                setNuevaHabilidad("")
                setMostrarInputHabilidad(false)
            }
        }
    }

    const handleRemoveHabilidad = (tag) => {
        setHabilidades(habilidades.filter(h => h !== tag))
    }

    const handleAddPregunta = () => {
        const newId = (preguntas.length + 1).toString()
        setPreguntas([
            ...preguntas,
            { id: newId, pregunta: "", tipoPregunta: "SI_NO", respuestaEsperadaExcluyente: "SI", excluyente: true }
        ])
    }

    const handleRemovePregunta = (id) => {
        setPreguntas(preguntas.filter(p => p.id !== id))
    }

    const handlePreguntaTextChange = (id, text) => {
        setPreguntas(preguntas.map(p => (p.id === id ? { ...p, pregunta: text } : p)))
    }

    const handlePreguntaToggle = (id) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === id) {
                const nextVal = p.respuestaEsperadaExcluyente === "SI" ? "NO" : "SI"
                return { ...p, respuestaEsperadaExcluyente: nextVal }
            }
            return p
        }))
    }

    const handleExcluyenteToggle = (id) => {
        setPreguntas(preguntas.map(p => {
            if (p.id === id) {
                return { ...p, excluyente: !p.excluyente }
            }
            return p
        }))
    }

    const fetchConAuth = async (endpoint, options = {}) => {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        const { data: { user } } = await supabase.auth.getUser()

        const headers = {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(user && { "X-User-Id": user.id }),
            ...options.headers,
        }

        const response = await fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`)
        }

        return response.json()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (!titulo.trim()) {
            setError("El título del puesto es obligatorio.")
            return
        }
        if (!descripcion.trim()) {
            setError("La descripción de la obra es obligatoria.")
            return
        }

        // Validar preguntas vacías que estén activas
        const preguntasActivas = preguntas.filter(p => p.excluyente)
        const preguntasValidas = preguntasActivas.filter(p => p.pregunta.trim() !== "")
        if (preguntasActivas.length > 0 && preguntasValidas.length !== preguntasActivas.length) {
            setError("Por favor, completá el enunciado de todas las preguntas de filtro activas o desactivalas/eliminalas.")
            return
        }

        // Obtener contexto de identidad de useIdentityStore
        const activeId = contextoActivo?.idPerfil
        const activeType = contextoActivo?.tipo // EMPRESA o PROVEEDOR

        if (!activeId) {
            setError("No tenés un perfil activo seleccionado para publicar la oferta.")
            return
        }

        setLoading(true)
        try {
            const payload = {
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
                modalidad: modalidad,
                salarioMin: aConvenir ? null : (salarioMin ? parseFloat(salarioMin) : null),
                salarioMax: aConvenir ? null : (salarioMax ? parseFloat(salarioMax) : null),
                habilidadesClave: habilidades,
                preguntasFiltro: preguntasValidas.map(p => ({
                    pregunta: p.pregunta.trim(),
                    tipoPregunta: p.tipoPregunta,
                    respuestaEsperadaExcluyente: p.respuestaEsperadaExcluyente
                })),
                empresaId: activeType === "EMPRESA" ? activeId : null,
                proveedorId: activeType === "PROVEEDOR" ? activeId : null
            }

            await fetchConAuth("/ofertas", {
                method: "POST",
                body: JSON.stringify(payload)
            })

            setSuccess(true)
            // Reset formulario
            setTitulo("")
            setDescripcion("")
            setSalarioMin("")
            setSalarioMax("")
            setAConvenir(false)
            setPreguntas([])
        } catch (err) {
            setError(err.message || "Ocurrió un error inesperado al publicar la oferta.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={dashboardWrapper}>
            {/* TOP HEADER */}
            <header style={navbarStyle}>
                <div style={navLeft}>
                    <LogoChamba />
                    <span style={navTagline}>
                        CONECTA. <span style={{ color: primaryColor }}>TRABAJO.</span> GENERA <span style={{ color: primaryColor }}>OPORTUNIDADES.</span>
                    </span>
                </div>
                <div style={navRight}>
                    <span style={navLink}>Explorar</span>
                    <span style={navLink}>Mis ofertas</span>
                    <span style={navLink}>Postulaciones</span>
                    <span style={navLink}>Mensajes</span>
                    <div style={navIconWrapper}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        <span style={badgeCount}>3</span>
                    </div>
                    <div style={avatarStyle(primaryColor)}>
                        {cuentaBase ? (cuentaBase.nombre[0] + cuentaBase.apellido[0]).toUpperCase() : "RC"}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div style={contentLayout}>
                {/* SIDEBAR */}
                <aside style={sidebarStyle}>
                    <div style={sidebarHeader}>
                        <IconBriefcase color={primaryColor} />
                        <span style={{ fontWeight: "700", color: "#0F172A", fontSize: "14px" }}>Panel Reclutador</span>
                    </div>
                    <div style={sidebarMenu}>
                        <div className="chamba-sidebar-item" style={sidebarItem}><IconList /> Mis ofertas</div>
                        <div className="chamba-sidebar-item" style={sidebarItem}><IconUsers /> Postulaciones</div>
                        <div className="chamba-sidebar-item" style={sidebarItem}><IconMail /> Mensajes</div>
                        <div className="chamba-sidebar-item" style={sidebarItem}><IconHeart /> Favoritos</div>
                        <div className="chamba-sidebar-item" style={sidebarItem}><IconBuilding /> Empresa</div>
                        <div className="chamba-sidebar-item" style={{ ...sidebarItem, ...sidebarItemActive }}><IconPlusSquare /> Publicar oferta</div>
                    </div>
                    <div style={sidebarFooter}>
                        <div className="chamba-sidebar-item" style={sidebarItem}><IconGear /> Configuración</div>
                        <div className="chamba-sidebar-item" style={sidebarItem}><IconLogOut /> Cerrar sesión</div>
                    </div>
                </aside>

                {/* FORM PAGE CONTAINER */}
                <main style={mainFormArea}>
                    <div style={cardContainer}>
                        {/* Title block */}
                        <div style={formHeader}>
                            <div style={iconBox}>
                                <IconPublishDocument color={primaryColor} />
                            </div>
                            <div style={{ textAlign: "left" }}>
                                <h1 style={formTitle}>Publicar Oferta de Empleo</h1>
                                <p style={formSubtitle}>Completá los datos de la oferta. Sé claro y detallado para atraer a los mejores profesionales.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} style={formBody}>
                            {/* Row: Title & Modality */}
                            <div style={rowGrid}>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>
                                        Título del Puesto <IconTooltip />
                                    </label>
                                    <input
                                        type="text"
                                        className="chamba-input"
                                        placeholder="Ej: Plomero Gasista Matriculado"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        style={inputField}
                                    />
                                </div>
                                <div style={inputGroup}>
                                    <label style={labelStyle}>
                                        Modalidad <IconTooltip />
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <select
                                            value={modalidad}
                                            className="chamba-select"
                                            onChange={(e) => setModalidad(e.target.value)}
                                            style={selectField}
                                        >
                                            <option value="PRESENCIAL">Presencial</option>
                                            <option value="REMOTO">Remoto</option>
                                            <option value="HIBRIDO">Híbrido</option>
                                        </select>
                                        <div style={selectIconBox}>
                                            <IconHome color={primaryColor} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Textarea: Description */}
                            <div style={inputGroup}>
                                <label style={labelStyle}>
                                    Descripción de la Obra <IconTooltip />
                                </label>
                                <textarea
                                    className="chamba-textarea"
                                    placeholder="Buscamos plomero gasista matriculado para obra residencial..."
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    maxLength={1000}
                                    style={textareaField}
                                />
                                <div style={charCountStyle}>{descripcion.length}/1000</div>
                            </div>

                            {/* Row: Salary */}
                            <div style={inputGroup}>
                                <label style={labelStyle}>
                                    Rango Salarial <IconTooltip />
                                </label>
                                <div style={salaryRowStyle}>
                                    <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                                        <div style={{ flex: 1, position: "relative" }}>
                                            <span style={inputPrefix}>$</span>
                                            <input
                                                type="number"
                                                className="chamba-input"
                                                placeholder="Mínimo"
                                                value={salarioMin}
                                                disabled={aConvenir}
                                                onChange={(e) => setSalarioMin(e.target.value)}
                                                style={{ ...inputField, paddingLeft: "32px" }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, position: "relative" }}>
                                            <span style={inputPrefix}>$</span>
                                            <input
                                                type="number"
                                                className="chamba-input"
                                                placeholder="Máximo"
                                                value={salarioMax}
                                                disabled={aConvenir}
                                                onChange={(e) => setSalarioMax(e.target.value)}
                                                style={{ ...inputField, paddingLeft: "32px" }}
                                            />
                                        </div>
                                    </div>
                                    <label style={checkboxLabelStyle}>
                                        <input
                                            type="checkbox"
                                            checked={aConvenir}
                                            onChange={(e) => setAConvenir(e.target.checked)}
                                            style={checkboxStyle}
                                        />
                                        A convenir
                                    </label>
                                </div>
                            </div>

                            {/* Section: Habilidades */}
                            <div style={inputGroup}>
                                <label style={labelStyle}>
                                    Habilidades Clave <IconTooltip />
                                </label>
                                <div style={chipsContainer}>
                                    {habilidades.map((hab, idx) => (
                                        <span key={idx} style={{ ...chipStyle, background: primaryColor }}>
                                            {hab}
                                            <span onClick={() => handleRemoveHabilidad(hab)} style={removeChipBtn}>×</span>
                                        </span>
                                    ))}

                                    {mostrarInputHabilidad ? (
                                        <div style={inlineInputWrapper}>
                                            <input
                                                type="text"
                                                className="chamba-input"
                                                placeholder="Ej: Albañilería"
                                                value={nuevaHabilidad}
                                                onChange={(e) => setNuevaHabilidad(e.target.value)}
                                                onKeyDown={handleAddHabilidad}
                                                autoFocus
                                                style={inlineInput}
                                            />
                                            <button type="button" onClick={handleAddHabilidad} style={{ ...inlineAddBtn, color: primaryColor }}>Agregar</button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setMostrarInputHabilidad(true)}
                                            style={{ ...addHabilidadBtn, borderColor: primaryColor, color: primaryColor }}
                                        >
                                            + Agregar habilidad
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Section: Preguntas Filtro */}
                            <div style={questionsSectionStyle}>
                                <div style={{ textAlign: "left", marginBottom: "16px" }}>
                                    <h3 style={sectionTitle}>Preguntas de Filtro Excluyentes</h3>
                                    <p style={sectionSubtitle}>Estas preguntas son eliminatorias. Si el candidato no cumple, no seguirá en el proceso.</p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {preguntas.map((preg, idx) => (
                                        <div key={preg.id} style={questionRowStyle}>
                                            <div style={dragHandleIcon}>⠿</div>
                                            <div style={indexCircleStyle}>{idx + 1}</div>
                                            <input
                                                type="text"
                                                className="chamba-input"
                                                placeholder="Escribí una pregunta excluyente..."
                                                value={preg.pregunta}
                                                onChange={(e) => handlePreguntaTextChange(preg.id, e.target.value)}
                                                style={questionInputField}
                                            />
                                            <span 
                                                onClick={() => handlePreguntaToggle(preg.id)}
                                                style={{
                                                    ...expectedLabelStyle,
                                                    color: preg.respuestaEsperadaExcluyente === "SI" ? "#10B981" : "#EF4444",
                                                    cursor: "pointer",
                                                    userSelect: "none"
                                                }}
                                            >
                                                {preg.respuestaEsperadaExcluyente}
                                            </span>
                                            <div
                                                onClick={() => handleExcluyenteToggle(preg.id)}
                                                style={{
                                                    ...toggleTrackStyle,
                                                    background: preg.excluyente ? primaryColor : "#E2E8F0"
                                                }}
                                            >
                                                <div style={{
                                                    ...toggleThumbStyle,
                                                    transform: preg.excluyente ? "translateX(20px)" : "translateX(0px)"
                                                }} />
                                            </div>
                                            <div className="chamba-three-dots-container" style={{ position: "relative" }}>
                                                <button
                                                    type="button"
                                                    className="chamba-three-dots"
                                                    onClick={() => setActiveMenuId(activeMenuId === preg.id ? null : preg.id)}
                                                    style={threeDotsBtnStyle}
                                                >
                                                    ︙
                                                </button>
                                                {activeMenuId === preg.id && (
                                                    <div style={dropdownMenuActionStyle}>
                                                        <div 
                                                            className="chamba-dropdown-menu-item"
                                                            onClick={() => { handleRemovePregunta(preg.id); setActiveMenuId(null); }}
                                                            style={dropdownMenuItemStyle}
                                                        >
                                                            Eliminar pregunta
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddPregunta}
                                    style={{ ...addQuestionBtn, borderColor: primaryColor, color: primaryColor }}
                                >
                                    + Agregar pregunta filtro
                                </button>
                            </div>

                            {/* Alerts */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorAlert}>
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={successAlert}>
                                        ¡Oferta publicada exitosamente! Ya está activa en la bolsa de empleo.
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...submitBtnStyle, background: primaryColor }}
                            >
                                {loading ? "Procesando..." : "Publicar Oferta Laboral ✓"}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    )
}

// --- ICONS & LOGO ---

const LogoChamba = () => (
    <svg width="100" height="26" viewBox="0 0 150 40" fill="none">
        <path d="M20 10C15 10 10 15 10 20S15 30 20 30S30 25 30 20S25 10 20 10ZM20 25C17.2 25 15 22.8 15 20S17.2 15 20 15S25 17.2 25 20S22.8 25 20 25Z" fill="#A01EED"/>
        <text x="35" y="28" fontFamily="Poppins" fontWeight="700" fontSize="24" fill="#000000">chamba</text>
    </svg>
)

const IconTooltip = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" style={{ marginLeft: "4px", verticalAlign: "middle", cursor: "help" }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
)

const IconBriefcase = ({ color }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
)

const IconList = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const IconBuilding = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/></svg>
const IconPlusSquare = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
const IconGear = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IconLogOut = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconPublishDocument = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
)

const IconHome = ({ color }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
)

// --- STYLES ---

const dashboardWrapper = {
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
    boxSizing: "border-box"
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
    cursor: "pointer"
}

const navIconWrapper = {
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

const contentLayout = {
    flex: 1,
    display: "flex",
    boxSizing: "border-box"
}

const sidebarStyle = {
    width: "260px",
    background: "#FFFFFF",
    borderRight: "1px solid #F1F5F9",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    boxSizing: "border-box"
}

const sidebarHeader = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "rgba(160, 30, 237, 0.05)",
    borderRadius: "12px",
    marginBottom: "32px"
}

const sidebarMenu = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1
}

const sidebarItem = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#64748B",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
}

const sidebarItemActive = {
    background: "rgba(160, 30, 237, 0.05)",
    color: "#A01EED",
    borderLeft: "4px solid #A01EED",
    borderRadius: "0 10px 10px 0"
}

const sidebarFooter = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "16px"
}

const mainFormArea = {
    flex: 1,
    padding: "40px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
}

const cardContainer = {
    width: "100%",
    maxWidth: "960px",
    background: "#FFFFFF",
    borderRadius: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
    border: "1px solid #F1F5F9",
    padding: "40px",
    boxSizing: "border-box"
}

const formHeader = {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: "24px",
    marginBottom: "32px"
}

const iconBox = {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(160, 30, 237, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const formTitle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "0 0 6px 0"
}

const formSubtitle = {
    fontSize: "13.5px",
    color: "#64748B",
    margin: 0
}

const formBody = {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
}

const rowGrid = {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "24px"
}

const inputGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "left"
}

const labelStyle = {
    fontSize: "13.5px",
    fontWeight: "700",
    color: "#475569",
    display: "flex",
    alignItems: "center"
}

const inputField = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
    fontSize: "14.5px",
    outline: "none",
    color: "#0F172A",
    boxSizing: "border-box",
    background: "#FFFFFF",
    "&:focus": {
        borderColor: "#A01EED"
    }
}

const selectField = {
    ...inputField,
    appearance: "none",
    paddingLeft: "44px"
}

const selectIconBox = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    pointerEvents: "none"
}

const textareaField = {
    ...inputField,
    minHeight: "120px",
    resize: "none"
}

const charCountStyle = {
    textAlign: "right",
    fontSize: "11px",
    color: "#94A3B8",
    marginTop: "2px"
}

const salaryRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "24px"
}

const inputPrefix = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14.5px",
    color: "#64748B",
    fontWeight: "600"
}

const checkboxLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    userSelect: "none"
}

const checkboxStyle = {
    width: "18px",
    height: "18px",
    accentColor: "#A01EED",
    cursor: "pointer"
}

const chipsContainer = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
    padding: "12px",
    border: "1px dashed #E2E8F0",
    borderRadius: "12px",
    background: "#FAF9FF"
}

const chipStyle = {
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "600",
    padding: "6px 14px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px"
}

const removeChipBtn = {
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px"
}

const inlineInputWrapper = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
}

const inlineInput = {
    ...inputField,
    padding: "6px 12px",
    fontSize: "13px",
    width: "140px"
}

const inlineAddBtn = {
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
}

const addHabilidadBtn = {
    background: "transparent",
    border: "1px dashed",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
}

const questionsSectionStyle = {
    borderTop: "1px solid #F1F5F9",
    paddingTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
}

const sectionTitle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "0 0 4px 0"
}

const sectionSubtitle = {
    fontSize: "12px",
    color: "#94A3B8",
    margin: 0
}

const questionRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 16px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
}

const dragHandleIcon = {
    cursor: "grab",
    color: "#94A3B8",
    fontSize: "16px",
    userSelect: "none"
}

const indexCircleStyle = {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#F1F5F9",
    color: "#64748B",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const questionInputField = {
    ...inputField,
    border: "none",
    padding: "4px 0",
    fontSize: "14px",
    flex: 1
}

const expectedLabelStyle = {
    fontSize: "13px",
    fontWeight: "700",
    marginRight: "8px",
    width: "24px",
    textAlign: "right"
}

const toggleTrackStyle = {
    width: "44px",
    height: "24px",
    borderRadius: "20px",
    position: "relative",
    cursor: "pointer",
    padding: "2px",
    boxSizing: "border-box"
}

const toggleThumbStyle = {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#FFFFFF",
    transition: "transform 0.2s"
}

const addQuestionBtn = {
    background: "transparent",
    border: "1px dashed",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "700",
    alignSelf: "flex-start",
    cursor: "pointer"
}

const errorAlert = {
    padding: "12px 16px",
    background: "#FEF2F2",
    color: "#EF4444",
    border: "1px solid #FEE2E2",
    borderRadius: "10px",
    fontSize: "13px",
    textAlign: "center"
}

const successAlert = {
    padding: "12px 16px",
    background: "#ECFDF5",
    color: "#10B981",
    border: "1px solid #D1FAE5",
    borderRadius: "10px",
    fontSize: "13px",
    textAlign: "center"
}

const submitBtnStyle = {
    padding: "16px",
    borderRadius: "12px",
    color: "#FFFFFF",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    marginTop: "16px"
}

const threeDotsBtnStyle = {
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "700",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s"
}

const dropdownMenuActionStyle = {
    position: "absolute",
    top: "36px",
    right: "0px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    zIndex: 100,
    minWidth: "150px"
}

const dropdownMenuItemStyle = {
    padding: "10px 16px",
    fontSize: "13px",
    color: "#EF4444",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left"
}

addPropertyControls(CrearOfertaEmpresa, {
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
