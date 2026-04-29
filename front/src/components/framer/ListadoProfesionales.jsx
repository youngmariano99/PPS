import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { Search, MapPin, X } from "lucide-react"

export default function ListadoProfesionales(props) {
    const { apiUrl, defaultLat, defaultLon, radioKm } = props

    // Estados Core
    const [rubros, setRubros] = useState([{ id: "todos", nombre: "Todos" }])
    const [rubroActivo, setRubroActivo] = useState("todos")
    const [profesionales, setProfesionales] = useState([])
    const [cargando, setCargando] = useState(false)
    const [paginaActual, setPaginaActual] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(0)
    const [todosLosProfesionales, setTodosLosProfesionales] = useState([])
    const [busqueda, setBusqueda] = useState("")

    // Estados Geometría / GPS
    const [usarCercanos, setUsarCercanos] = useState(true)
    const [coordenadas, setCoordenadas] = useState({
        lat: defaultLat,
        lon: defaultLon,
    })
    const [gpsPermitido, setGpsPermitido] = useState(null)

    // Constantes de paginación
    const ITEMS_POR_PAGINA = 8 // 2x4 = 8

    // 0. Motor GPS al montar Componente
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoordenadas({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    })
                    setGpsPermitido(true)
                },
                (err) => {
                    setGpsPermitido(false)
                }
            )
        } else {
            setGpsPermitido(false)
        }
    }, [defaultLat, defaultLon])

    // 1. Fetch de Rubros al montar
    useEffect(() => {
        const fetchRubros = async () => {
            try {
                const res = await fetch(`${apiUrl}/rubros`)
                if (res.ok) {
                    const data = await res.json()
                    const mapeoRubros = data.map((r) => ({
                        id: r.nombre, // Usamos el nombre como ID para que el filtro sea por texto
                        nombre: r.nombre,
                    }))
                    setRubros([
                        { id: "todos", nombre: "Todos" },
                        ...mapeoRubros,
                    ])
                }
            } catch (err) {
                console.error("Error cargando rubros:", err)
            }
        }
        fetchRubros()
    }, [apiUrl])    // 2. Fetch de Profesionales con Paginación Real (Backend-side)
    useEffect(() => {
        const fetchProfesionales = async () => {
            setCargando(true)
            try {
                // Si 'Solo cercanos' está desactivado, enviamos un radio grande (50km es nuestro cap en backend)
                // para que aparezcan todos los profesionales y el ranking premium funcione globalmente.
                const radioFinal = usarCercanos ? radioKm : 50
                
                const base = (apiUrl || "").replace(/\/+$/, "")
                let queryUrl = `${base}/directorio/buscar/lista?lat=${coordenadas.lat}&lon=${coordenadas.lon}&radioKm=${radioFinal}&page=${paginaActual}&size=${ITEMS_POR_PAGINA}`
                
                if (rubroActivo !== "todos") {
                    queryUrl += `&rubro=${encodeURIComponent(rubroActivo)}`
                }
                
                if (busqueda) {
                    queryUrl += `&q=${encodeURIComponent(busqueda)}`
                }

                const res = await fetch(queryUrl)
                if (res.ok) {
                    const data = await res.json()
                    
                    // El backend ahora devuelve un objeto Page (content, totalElements, etc)
                    const content = data.content || []
                    setTodosLosProfesionales(content)
                    setTotalPaginas(data.totalPages || 0)
                }
            } catch (err) {
                console.error("Error cargando directorio:", err)
            } finally {
                setCargando(false)
            }
        }

        fetchProfesionales()
    }, [apiUrl, coordenadas, radioKm, rubroActivo, paginaActual, usarCercanos, busqueda])

    // 3. Ya no usamos relleno de placeholders para una UX más limpia
    useEffect(() => {
        setProfesionales(todosLosProfesionales)
    }, [todosLosProfesionales])

    // Handlers
    const handleRubroClick = (rubroId) => {
        setRubroActivo(rubroId)
        setPaginaActual(0)
    }

    const handleToggleCercanos = () => {
        setUsarCercanos(!usarCercanos)
        setPaginaActual(0)
    }

    const handlePaginaAnterior = () => {
        if (paginaActual > 0) {
            setPaginaActual(paginaActual - 1)
        }
    }

    const handlePaginaSiguiente = () => {
        if (paginaActual < totalPaginas - 1) {
            setPaginaActual(paginaActual + 1)
        }
    }

    // Funciones Auxiliares UI
    const obtenerIniciales = (nombre = "NA") => {
        const partes = nombre.split(" ")
        if (partes.length >= 2) {
            return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
        }
        return nombre.substring(0, 2).toUpperCase()
    }

    const getAvatarColor = (id) => {
        const colores = [
            "#E0E7FF", "#FCE7F3", "#D1FAE5", "#FEF3C7",
            "#E0F2FE", "#F3E8FF", "#FFE4E6", "#CCFBF1"
        ]
        let hash = 0
        const str = String(id)
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colores[Math.abs(hash) % colores.length]
    }

    // --- SUB-COMPONENTES MODULARES (Mejoran la legibilidad y mantenimiento) ---

    const ProfessionalCard = ({ prof }) => {
        if (prof.esPlaceholder) {
            return (
                <div style={{
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: "12px",
                    height: "200px",
                    border: "1px dashed #E2E8F0"
                }} />
            )
        }

        // Soporte para ambos formatos de casing por si Jackson lo altera
        const distVal = prof.distanciaMetros ?? prof.distancia_metros;
        const distText = (distVal !== null && distVal !== undefined)
            ? (distVal < 1000 ? `${distVal}m` : `${(distVal/1000).toFixed(1)}km`)
            : null;

        // Soporte para ambos formatos de casing para la foto
        const fotoUrl = prof.fotoPerfilUrl || prof.foto_perfil_url;

        return (
            <motion.div
                whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0, 0, 0, 0.1)" }}
                style={{
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    border: prof.destacado ? "2px solid #6366F1" : "1px solid #F1F5F9",
                    transition: "all 0.2s ease",
                    height: "100%",
                    boxSizing: "border-box"
                }}
            >
                {/* Badge Premium Compacto */}
                {prof.destacado && (
                    <div style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "9px",
                        fontWeight: "800",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        boxShadow: "0 4px 6px -1px rgba(99, 102, 241, 0.4)"
                    }}>
                        Premium
                    </div>
                )}

                {/* Header Compacto */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: fotoUrl ? "transparent" : getAvatarColor(prof.id),
                        backgroundImage: fotoUrl ? `url("${fotoUrl}")` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#1E293B",
                        flexShrink: 0,
                        border: fotoUrl ? "1px solid #E2E8F0" : "none"
                    }}>
                        {!fotoUrl && obtenerIniciales(prof.nombrePublico)}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <h3 style={{ 
                            margin: 0, 
                            fontSize: "15px", 
                            fontWeight: "700", 
                            color: "#1E293B",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}>
                            {prof.nombrePublico}
                        </h3>
                        <span style={{ fontSize: "12px", color: "#6366F1", fontWeight: "600" }}>
                            {prof.rubro}
                        </span>
                    </div>
                </div>

                {/* Descripción Corta */}
                <p style={{ 
                    margin: "0 0 16px 0", 
                    fontSize: "13px", 
                    color: "#64748B", 
                    lineHeight: "1.4",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    flex: 1
                }}>
                    {prof.descripcion || "Profesional verificado."}
                </p>

                {/* Footer Compacto */}
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    paddingTop: "12px",
                    borderTop: "1px solid #F1F5F9"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                            <span style={{ color: "#F59E0B", fontSize: "14px" }}>★</span>
                            <span style={{ fontWeight: "700", color: "#1E293B", fontSize: "12px" }}>
                                {prof.promedioEstrellas > 0 ? prof.promedioEstrellas.toFixed(1) : "—"}
                            </span>
                        </div>
                        {distText && (
                            <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "500" }}>
                                • {distText}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => {
                            if (props.providerProfileUrl) {
                                window.location.href = `${props.providerProfileUrl}?id=${prof.id}`;
                            } else {
                                console.warn("providerProfileUrl no está definida en las propiedades");
                            }
                        }}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#6366F1",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: "pointer",
                            padding: "4px",
                        }}
                    >
                        Perfil →
                    </button>
                </div>
            </motion.div>
        )
    }

    const Pagination = () => {
        if (totalPaginas <= 1) return null;
        
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                gap: "16px", 
                marginTop: "40px",
                padding: "20px 0",
                fontFamily: "'Inter', sans-serif"
            }}>
                {/* Botón Anterior */}
                <button 
                    onClick={handlePaginaAnterior}
                    disabled={paginaActual === 0}
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        background: paginaActual === 0 ? "#F8FAFC" : "white",
                        color: paginaActual === 0 ? "#CBD5E1" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: paginaActual === 0 ? "not-allowed" : "pointer",
                        fontSize: "18px",
                        fontWeight: "bold",
                        transition: "all 0.2s"
                    }}
                >
                    ‹
                </button>

                {/* Control Central: Input / Total */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748B", fontSize: "14px", fontWeight: "600" }}>
                    <input 
                        type="number"
                        min="1"
                        max={totalPaginas}
                        value={paginaActual + 1}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= totalPaginas) {
                                setPaginaActual(val - 1);
                            }
                        }}
                        style={{
                            width: "45px",
                            height: "36px",
                            textAlign: "center",
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            background: "white",
                            color: "#1E293B",
                            fontWeight: "700",
                            fontSize: "14px",
                            outline: "none"
                        }}
                    />
                    <span>/</span>
                    <span style={{ color: "#94A3B8" }}>{totalPaginas}</span>
                </div>

                {/* Botón Siguiente */}
                <button 
                    onClick={handlePaginaSiguiente}
                    disabled={paginaActual === totalPaginas - 1}
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        background: paginaActual === totalPaginas - 1 ? "#F8FAFC" : "white",
                        color: paginaActual === totalPaginas - 1 ? "#CBD5E1" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: paginaActual === totalPaginas - 1 ? "not-allowed" : "pointer",
                        fontSize: "18px",
                        fontWeight: "bold",
                        transition: "all 0.2s"
                    }}
                >
                    ›
                </button>
            </div>
        )
    }

    // --- RENDER PRINCIPAL ---

    const containerStyle = {
        width: "100%",
        minHeight: "100vh",
        background: "transparent",
        fontFamily: "'Inter', sans-serif",
        color: "#1E293B",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        paddingBottom: "100px"
    }

    return (
        <div style={containerStyle}>
            {/* Filtros e Intro */}
            <div style={{ padding: "40px 24px 0 24px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", gap: "24px", flexWrap: "wrap" }}>
                    
                    {/* Buscador Profesional */}
                    <div style={{ 
                        flex: 1, 
                        minWidth: "300px",
                        display: "flex", 
                        alignItems: "center", 
                        background: "white", 
                        borderRadius: "16px", 
                        padding: "4px 8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        border: "1px solid #F1F5F9"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "0 12px", borderRight: "1px solid #F1F5F9" }}>
                            <Search size={18} color="#94A3B8" style={{ marginRight: "12px" }} />
                            <input 
                                type="text"
                                placeholder="Nombre o rubro..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value)
                                    setPaginaActual(0)
                                }}
                                style={{ 
                                    width: "100%", 
                                    border: "none", 
                                    outline: "none", 
                                    fontSize: "14px", 
                                    fontWeight: "500",
                                    color: "#1E293B",
                                    padding: "10px 0"
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", flex: 0.8, padding: "0 12px" }}>
                            <MapPin size={18} color="#94A3B8" style={{ marginRight: "12px" }} />
                            <input 
                                type="text"
                                placeholder="Pringles, Buenos Aires..."
                                onChange={(e) => {
                                    // Podemos usar el mismo busqueda state o uno separado para localidad
                                    // Por ahora, el backend busca q en ciudad también.
                                    setBusqueda(e.target.value)
                                    setPaginaActual(0)
                                }}
                                style={{ 
                                    width: "100%", 
                                    border: "none", 
                                    outline: "none", 
                                    fontSize: "14px", 
                                    fontWeight: "500",
                                    color: "#1E293B",
                                    padding: "10px 0"
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* Toggle Cercanos Minimalista */}
                    <div 
                        onClick={handleToggleCercanos}
                        style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            cursor: "pointer",
                            padding: "8px 12px",
                            borderRadius: "10px",
                            background: usarCercanos ? "#EEF2FF" : "transparent",
                            transition: "all 0.2s"
                        }}
                    >
                        <div style={{
                            width: "32px",
                            height: "18px",
                            background: usarCercanos ? "#6366F1" : "#CBD5E1",
                            borderRadius: "20px",
                            position: "relative",
                            transition: "all 0.2s"
                        }}>
                            <div style={{
                                width: "14px",
                                height: "14px",
                                background: "white",
                                borderRadius: "50%",
                                position: "absolute",
                                top: "2px",
                                left: usarCercanos ? "16px" : "2px",
                                transition: "all 0.2s"
                            }} />
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: usarCercanos ? "#4F46E5" : "#64748B" }}>
                            Solo cercanos
                        </span>
                    </div>
                </div>

                {/* Rubros Pills */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
                    {rubros.map((rubro) => (
                        <button
                            key={rubro.id}
                            onClick={() => handleRubroClick(rubro.id)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "10px",
                                border: "none",
                                background: rubroActivo === rubro.id ? "#1E293B" : "white",
                                color: rubroActivo === rubro.id ? "white" : "#64748B",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                        >
                            {rubro.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de Profesionales */}
            <div style={{ 
                flex: 1,
                padding: "0 16px",
                maxWidth: "1400px",
                margin: "0 auto",
                width: "100%",
                boxSizing: "border-box"
            }}>
                <AnimatePresence mode="wait">
                    {cargando ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}
                        >
                            Cargando profesionales...
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="grid"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                gap: "20px",
                                width: "100%"
                            }}
                        >
                            {profesionales.map((prof) => (
                                <ProfessionalCard key={prof.id} prof={prof} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <Pagination />
            </div>

            {/* Empty State */}
            {!cargando && profesionales.every(p => p.esPlaceholder) && (
                <div style={{ textAlign: "center", padding: "100px 32px", color: "#94A3B8" }}>
                    <p style={{ fontSize: "16px", fontWeight: "600" }}>No se encontraron profesionales</p>
                    <p style={{ fontSize: "14px" }}>Intentá ajustando el radio de búsqueda o cambiando de rubro.</p>
                </div>
            )}
        </div>
    )
}

addPropertyControls(ListadoProfesionales, {
    apiUrl: {
        type: ControlType.String,
        title: "API Base URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    defaultLat: {
        type: ControlType.Number,
        title: "Latitud Default",
        defaultValue: -34.6037,
    },
    defaultLon: {
        type: ControlType.Number,
        title: "Longitud Default",
        defaultValue: -58.3816,
    },
    radioKm: {
        type: ControlType.Number,
        title: "Radio(Km)",
        defaultValue: 1,
        min: 1,
        max: 100,
    },
    providerProfileUrl: {
        type: ControlType.String,
        title: "URL Perfil Prov",
        defaultValue: "https://overly-mindset-259417.framer.app/perfiles-prov",
    },
})
