import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

/**
 * CHAMBA PROFESSIONAL LISTING - REFINED VERSION
 * --------------------------------------------
 * Ajustado 1:1 a las capturas y requerimientos del usuario.
 */

export default function ListadoProfesionalesChamba(props) {
    const { apiUrl, defaultLat, defaultLon, radioKm, providerProfileUrl } = props

    // Estados Core
    const [rubros, setRubros] = useState([{ id: "Todos", nombre: "Todos" }])
    const [rubroActivo, setRubroActivo] = useState("Todos")
    const [profesionales, setProfesionales] = useState([])
    const [cargando, setCargando] = useState(false)
    const [paginaActual, setPaginaActual] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(0)
    const [totalResultados, setTotalResultados] = useState(0)
    const [busqueda, setBusqueda] = useState("")
    const [ubicacionTexto, setUbicacionTexto] = useState("Pringles, Buenos Aires")
    const [ordenarPor, setOrdenarPor] = useState("rating")

    // Estados Geometría / GPS
    const [usarCercanos, setUsarCercanos] = useState(true)
    const [coordenadas, setCoordenadas] = useState({ lat: defaultLat, lon: defaultLon })

    const ITEMS_POR_PAGINA = 8

    // Cargar Fuentes Google
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)
    }, [])

    // Motor GPS
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCoordenadas({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => console.warn("GPS denegado.")
            )
        }
    }, [])

    // Fetch Rubros
    useEffect(() => {
        const fetchRubros = async () => {
            try {
                const res = await fetch(`${apiUrl}/rubros`)
                if (res.ok) {
                    const data = await res.json()
                    setRubros([{ id: "Todos", nombre: "Todos" }, ...data])
                }
            } catch (err) { console.error(err) }
        }
        fetchRubros()
    }, [apiUrl])

    // Fetch Profesionales con Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            const fetchProfesionales = async () => {
                setCargando(true)
                try {
                    const radioFinal = usarCercanos ? radioKm : 50
                    const base = apiUrl.replace(/\/+$/, "")
                    let queryUrl = `${base}/directorio/buscar/lista?lat=${coordenadas.lat}&lon=${coordenadas.lon}&radioKm=${radioFinal}&page=${paginaActual}&size=${ITEMS_POR_PAGINA}`
                    
                    if (rubroActivo !== "Todos") queryUrl += `&rubro=${encodeURIComponent(rubroActivo)}`
                    if (busqueda) queryUrl += `&q=${encodeURIComponent(busqueda)}`

                    const res = await fetch(queryUrl)
                    console.log("🔍 [Listado] Buscando en URL:", queryUrl)
                    if (res.ok) {
                        const data = await res.json()
                        console.log("✅ [Listado] Profesionales recibidos:", data.content?.length || 0, data)
                        let content = data.content || []
                        if (ordenarPor === "rating") content.sort((a, b) => (b.promedioEstrellas || 0) - (a.promedioEstrellas || 0))
                        else if (ordenarPor === "distancia") content.sort((a, b) => (a.distanciaMetros || 0) - (b.distanciaMetros || 0))

                        setProfesionales(content)
                        setTotalPaginas(data.totalPages || 0)
                        setTotalResultados(data.totalElements || 0)
                    }
                } catch (err) { console.error(err) }
                finally { setCargando(false) }
            }
            fetchProfesionales()
        }, 300) // 300ms de espera para precisión

        return () => clearTimeout(handler)
    }, [apiUrl, coordenadas, radioKm, rubroActivo, paginaActual, usarCercanos, busqueda, ordenarPor])

    return (
        <div style={containerStyle}>
            {/* 1. Barra de Búsqueda */}
            <div style={searchSection}>
                <div style={searchBarWrapper}>
                    <div style={searchInputCol}>
                        <IconSearch size={18} />
                        <input 
                            placeholder="Nombre o rubro..." 
                            style={inputRaw} 
                            value={busqueda} 
                            onChange={(e) => {
                                setBusqueda(e.target.value)
                                if (rubroActivo !== "Todos") setRubroActivo("Todos") // Evitamos conflicto de filtros
                                setPaginaActual(0)
                            }} 
                        />
                    </div>
                    <div style={searchLocationCol}>
                        <IconPin size={18} />
                        <input 
                            placeholder="Ciudad (Ej: Pringles)..." 
                            style={inputRaw} 
                            value={ubicacionTexto} 
                            onChange={(e) => setUbicacionTexto(e.target.value)} 
                            onBlur={() => {
                                // Aquí se podría integrar la API de Nominatim para buscar coordenadas de la ciudad
                                console.log("Buscando coordenadas para:", ubicacionTexto)
                            }}
                        />
                        <div style={{ cursor: "pointer" }} onClick={() => setUbicacionTexto("")}>
                            <IconClose size={16} />
                        </div>
                    </div>
                </div>

                <div style={toggleBox} onClick={() => setUsarCercanos(!usarCercanos)}>
                    <div style={{ ...switchTrack, background: usarCercanos ? "#A01EED" : "#E2E8F0" }}>
                        <motion.div animate={{ x: usarCercanos ? 14 : 0 }} style={switchThumb} />
                    </div>
                    <span style={{ ...toggleLabel, color: usarCercanos ? "#A01EED" : "#94A3B8" }}>Solo cercanos</span>
                </div>
            </div>

            {/* 2. Grilla de Rubros (Matriz) */}
            <div style={rubrosGrid}>
                {rubros.map(r => (
                    <button 
                        key={r.id} 
                        style={{ 
                            ...rubroPill, 
                            background: rubroActivo === r.nombre ? "#A01EED" : "#FFFFFF", 
                            color: rubroActivo === r.nombre ? "#FFFFFF" : "#475569",
                            borderColor: rubroActivo === r.nombre ? "#A01EED" : "#F1F5F9"
                        }}
                        onClick={() => { 
                            setRubroActivo(r.nombre); 
                            setBusqueda(""); // Si elige rubro, limpiamos búsqueda de texto para precisión
                            setPaginaActual(0); 
                        }}
                    >
                        <span>{r.nombre}</span>
                    </button>
                ))}
            </div>

            {/* 3. Metadatos y Orden */}
            <div style={resultsHeader}>
                <span style={resultsCount}>{totalResultados} resultados encontrados</span>
                <div style={sortBox}>
                    <span>Ordenar por:</span>
                    <select style={sortSelect} value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
                        <option value="rating">Mejor calificados</option>
                        <option value="distancia">Más cercanos</option>
                    </select>
                </div>
            </div>

            {/* 4. Grid de Profesionales */}
            <div style={gridWrapper}>
                <AnimatePresence mode="wait">
                    {cargando ? (
                        <div style={loadingState}>Cargando...</div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={gridStyle}>
                            {profesionales.map(p => (
                                <ProfessionalCard 
                                    key={p.id} 
                                    prof={p} 
                                    onView={() => {
                                        const target = p.slug ? `p=${p.slug}` : `id=${p.id}`
                                        window.location.href = `${providerProfileUrl}?${target}`
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 5. Paginación Estilo Imagen */}
            {totalPaginas > 1 && (
                <div style={paginationRow}>
                    <button style={pageSquare} onClick={() => setPaginaActual(Math.max(0, paginaActual - 1))}>‹</button>
                    {/* Generación de números con puntos suspensivos si es necesario */}
                    {[...Array(totalPaginas)].map((_, i) => {
                        if (i === 0 || i === totalPaginas - 1 || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
                            return (
                                <button 
                                    key={i} 
                                    style={{ ...pageSquare, background: paginaActual === i ? "#5C26F1" : "white", color: paginaActual === i ? "white" : "#64748B", fontWeight: "700" }}
                                    onClick={() => setPaginaActual(i)}
                                >
                                    {i + 1}
                                </button>
                            )
                        } else if (i === 1 || i === totalPaginas - 2) {
                            return <span key={i} style={{ color: "#94A3B8" }}>...</span>
                        }
                        return null
                    })}
                    <button style={pageSquare} onClick={() => setPaginaActual(Math.min(totalPaginas - 1, paginaActual + 1))}>›</button>
                </div>
            )}

            {/* 6. Footer Informativo Dinámico */}
            <div style={footerBanner}>
                <div style={footerCircle}><IconPin size={12} /></div>
                <span>
                    {usarCercanos 
                        ? <>Mostrando resultados cerca de <span style={{ color: "#5C26F1", fontWeight: "700" }}>Pringles, Buenos Aires</span>.</>
                        : <>Mostrando todos los resultados. Activá <span style={{ color: "#5C26F1", fontWeight: "700" }}>"Solo cercanos"</span> para ver los más próximos a tu ubicación.</>
                    }
                </span>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTE: TARJETA ---

const ProfessionalCard = ({ prof, onView }) => {
    const distVal = prof.distanciaMetros ?? prof.distancia_metros
    const distText = distVal !== undefined ? (distVal < 1000 ? `${distVal}m` : `${(distVal/1000).toFixed(1)}km`) : "—"

    return (
        <motion.div whileHover={{ y: -5 }} style={{ ...cardStyle, border: prof.destacado ? "2px solid #A01EED" : "1px solid #F1F5F9" }}>
            {prof.destacado && (
                <div style={premiumBadge}>PRO</div>
            )}
            <div style={cardHeader}>
                <div style={avatarWrapper}>
                    {prof.fotoPerfilUrl ? (
                        <img src={prof.fotoPerfilUrl} style={avatarImg} alt={prof.nombrePublico} />
                    ) : (
                        <div style={avatarInitial}>{prof.nombrePublico ? prof.nombrePublico[0] : "P"}</div>
                    )}
                </div>
                <div style={infoBox}>
                    <h3 style={profName}>{prof.nombrePublico}</h3>
                    <span style={profRubro}>{prof.rubro}</span>
                    <p style={profBio}>{prof.descripcion || "Profesional calificado y verificado"}</p>
                </div>
            </div>

            <div style={servicesSection}>
                <span style={sectionLabel}>Servicios</span>
                <div style={tagCloud}>
                    {(prof.especialidades || ["General"]).slice(0, 3).map((s, i) => (
                        <span key={i} style={serviceTag}>{s}</span>
                    ))}
                </div>
            </div>

            <div style={footerInfo}>
                <div style={paymentsBox}>
                    <span style={sectionLabel}>Formas de trabajar</span>
                    <div style={tagCloud}>
                        {(prof.condicionesServicio || ["A convenir"]).slice(0, 2).map((c, i) => (
                            <span key={i} style={workTag}>{c}</span>
                        ))}
                    </div>
                </div>
                <div style={statsBox}>
                    <div style={ratingRow}>
                        <IconStar />
                        <span style={ratingNum}>{prof.promedioEstrellas ? prof.promedioEstrellas.toFixed(1) : "0.0"}</span>
                        {prof.cantidadResenas !== undefined && (
                            <span style={ratingCount}>({prof.cantidadResenas})</span>
                        )}
                    </div>
                    <div style={distanceRow}>• {distText}</div>
                </div>
            </div>

            <div style={cardActions}>
                <button 
                    style={{ ...btnContact, opacity: prof.telefono ? 1 : 0.5, cursor: prof.telefono ? "pointer" : "not-allowed" }}
                    onClick={() => {
                        if (prof.telefono) {
                            const msg = encodeURIComponent(`Hola ${prof.nombrePublico}, te contacto desde Chamba por tu servicio de ${prof.rubro}.`)
                            window.open(`https://wa.me/${prof.telefono.replace(/\D/g, "")}?text=${msg}`, "_blank")
                        }
                    }}
                >
                    <IconWhatsApp />
                    Contactar
                </button>
                <button style={btnProfile} onClick={onView}>Ver perfil</button>
            </div>
        </motion.div>
    )
}

// --- ICONOS ---

const IconPin = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconSearch = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconClose = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconWhatsApp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>

// --- ESTILOS ---

const containerStyle = { width: "100%", minHeight: "100vh", background: "transparent", fontFamily: "'Inter', sans-serif", paddingBottom: "100px" }
const searchSection = { maxWidth: "1200px", margin: "0 auto", padding: "32px 20px", display: "flex", alignItems: "center", gap: "20px" }
const searchBarWrapper = { flex: 1, display: "flex", background: "#FFFFFF", borderRadius: "16px", padding: "4px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9" }
const searchInputCol = { flex: 1, display: "flex", alignItems: "center", padding: "0 16px", borderRight: "1px solid #F1F5F9" }
const searchLocationCol = { flex: 1, display: "flex", alignItems: "center", padding: "0 16px" }
const inputRaw = { border: "none", outline: "none", padding: "12px 8px", fontSize: "14px", width: "100%", color: "#1E293B" }

const toggleBox = { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }
const switchTrack = { width: "36px", height: "20px", borderRadius: "20px", padding: "3px", position: "relative" }
const switchThumb = { width: "14px", height: "14px", background: "white", borderRadius: "50%" }
const toggleLabel = { fontSize: "13px", fontWeight: "700" }

const rubrosGrid = { maxWidth: "1200px", margin: "0 auto 40px auto", padding: "0 20px", display: "flex", flexWrap: "wrap", gap: "10px" }
const rubroPill = { padding: "10px 20px", borderRadius: "10px", border: "1px solid", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "0.2s" }

const resultsHeader = { maxWidth: "1200px", margin: "0 auto 24px auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }
const resultsCount = { fontSize: "14px", color: "#94A3B8" }
const sortBox = { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748B" }
const sortSelect = { background: "transparent", border: "none", color: "#1E293B", fontWeight: "700", outline: "none" }

const gridWrapper = { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }
const loadingState = { textAlign: "center", padding: "100px", color: "#94A3B8" }

const cardStyle = { background: "#FFFFFF", borderRadius: "20px", padding: "24px", border: "1px solid #F1F5F9", position: "relative" }
const premiumBadge = { position: "absolute", top: "12px", right: "12px", background: "#A01EED", color: "white", fontSize: "9px", fontWeight: "900", padding: "4px 10px", borderRadius: "6px", letterSpacing: "1px" }
const cardHeader = { display: "flex", gap: "16px", marginBottom: "20px" }
const avatarWrapper = { position: "relative" }
const avatarImg = { width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }
const avatarInitial = { width: "64px", height: "64px", borderRadius: "50%", background: "#F5F3FF", color: "#A01EED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700" }

const infoBox = { flex: 1 }
const profName = { fontSize: "16px", fontWeight: "700", color: "#000000", margin: "0" }
const profRubro = { fontSize: "12px", color: "#A01EED", fontWeight: "600" }
const profBio = { fontSize: "11px", color: "#94A3B8", marginTop: "6px", lineHeight: "1.4" }

const servicesSection = { marginBottom: "20px" }
const sectionLabel = { fontSize: "10px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "block" }
const tagCloud = { display: "flex", flexWrap: "wrap", gap: "6px" }
const serviceTag = { background: "#F5F3FF", color: "#A01EED", fontSize: "10px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px" }
const workTag = { background: "#F1F5F9", color: "#475569", fontSize: "10px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px" }

const footerInfo = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }
const paymentsBox = { flex: 1, display: "flex", flexDirection: "column", gap: "4px" }
const statsBox = { textAlign: "right" }
const ratingRow = { display: "flex", alignItems: "center", gap: "4px" }
const ratingNum = { fontSize: "12px", fontWeight: "700", color: "#000000" }
const ratingCount = { fontSize: "11px", color: "#94A3B8" }
const distanceRow = { fontSize: "11px", color: "#94A3B8", marginTop: "2px" }

const cardActions = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }
const btnContact = { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "12px", border: "1px solid #E2E8F0", background: "white", color: "#475569", fontSize: "12px", fontWeight: "700", cursor: "pointer" }
const btnProfile = { padding: "12px", borderRadius: "12px", border: "none", background: "#5C26F1", color: "white", fontSize: "12px", fontWeight: "700", cursor: "pointer" }

const paginationRow = { display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "40px" }
const pageSquare = { width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #F1F5F9", background: "white", color: "#64748B", fontSize: "14px", cursor: "pointer", transition: "0.2s", display: "flex", alignItems: "center", justifyContent: "center" }

const footerBanner = { maxWidth: "1200px", margin: "60px auto 0 auto", padding: "20px 24px", background: "rgba(92, 38, 241, 0.03)", borderRadius: "16px", color: "#64748B", fontSize: "13px", display: "flex", alignItems: "center", gap: "12px" }
const footerCircle = { width: "24px", height: "24px", borderRadius: "50%", background: "rgba(92, 38, 241, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C26F1" }

// --- CONTROLES FRAMER ---
addPropertyControls(ListadoProfesionalesChamba, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    defaultLat: { type: ControlType.Number, title: "Latitud", defaultValue: -34.6037 },
    defaultLon: { type: ControlType.Number, title: "Longitud", defaultValue: -58.3816 },
    radioKm: { type: ControlType.Number, title: "Radio (Km)", defaultValue: 1 },
    providerProfileUrl: { type: ControlType.String, title: "URL Perfil", defaultValue: "/perfiles-prov" },
})
