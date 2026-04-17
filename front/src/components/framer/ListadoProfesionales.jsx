import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

export default function ListadoProfesionales(props) {
    const { apiUrl, defaultLat, defaultLon, radioKm } = props

    // Estados Core
    const [rubros, setRubros] = useState([{ id: "todos", nombre: "Todos" }])
    const [rubroActivo, setRubroActivo] = useState("todos")
    const [profesionales, setProfesionales] = useState([])
    const [cargando, setCargando] = useState(false)
    const [paginaActual, setPaginaActual] = useState(0)
    const [haLlegadoAlFinal, setHaLlegadoAlFinal] = useState(false)

    // Estados Geometría / GPS
    const [usarCercanos, setUsarCercanos] = useState(true)
    const [coordenadas, setCoordenadas] = useState({ lat: defaultLat, lon: defaultLon })
    const [gpsPermitido, setGpsPermitido] = useState(null)

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
                    // Si bloquea / falla, usamos las globales por defecto
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
                    // Si la API devuelve un listado, ensamblamos el array
                    const mapeoRubros = data.map((r) => ({ id: r.id || r.nombre, nombre: r.nombre }))
                    setRubros([{ id: "todos", nombre: "Todos" }, ...mapeoRubros])
                }
            } catch (err) {
                console.error("Error cargando rubros:", err)
            }
        }
        fetchRubros()
    }, [apiUrl])

    // 2. Fetch de Profesionales
    useEffect(() => {
        const fetchProfesionales = async () => {
            setCargando(true)
            try {
                const radioEfectivo = usarCercanos ? radioKm : 99999;
                
                let queryUrl = `${apiUrl}/directorio/buscar/lista?lat=${coordenadas.lat}&lon=${coordenadas.lon}&radioKm=${radioEfectivo}&page=${paginaActual}`
                if (rubroActivo !== "todos") {
                    queryUrl += `&rubro=${encodeURIComponent(rubroActivo)}`
                }

                const res = await fetch(queryUrl)
                if (res.ok) {
                    const data = await res.json()

                    // Aseguramos que data sea un array
                    const nuevosResultados = Array.isArray(data) ? data : (data.content || [])

                    // Si vienen menos de la cantidad solicitada (8), llegamos al final
                    if (nuevosResultados.length < 8) {
                        setHaLlegadoAlFinal(true)
                    } else {
                        setHaLlegadoAlFinal(false)
                    }

                    // Reemplazamos la página entera en lugar de hacer append
                    setProfesionales(nuevosResultados)
                }
            } catch (err) {
                console.error("Error cargando directorio:", err)
            } finally {
                setCargando(false)
            }
        }

        fetchProfesionales()
    }, [apiUrl, coordenadas, radioKm, rubroActivo, paginaActual, usarCercanos])

    // Handlers
    const handleRubroClick = (rubroId) => {
        setRubroActivo(rubroId)
        setPaginaActual(0)
        setHaLlegadoAlFinal(false)
    }

    const handleToggleCercanos = () => {
        setUsarCercanos(!usarCercanos)
        setPaginaActual(0)
        setHaLlegadoAlFinal(false)
    }

    const handleCargarMas = () => {
        setPaginaActual((prev) => prev + 1)
    }

    // Funciones Auxiliares UI
    const obtenerIniciales = (nombre = "NA") => {
        const partes = nombre.split(" ")
        if (partes.length >= 2) {
            return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
        }
        return nombre.substring(0, 2).toUpperCase()
    }

    const getRandomColor = (id) => {
        // Generador de colores pasteles basados en el Hash del ID o Nombre para mantener consistencia
        const coloresPasteles = [
            "#FFD1DC", "#FFDFD3", "#F4C2C2", "#C1E1C1",
            "#AEC6CF", "#B39EB5", "#FFB7B2", "#E2F0CB"
        ]
        let hash = 0
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash)
        }
        const index = Math.abs(hash) % coloresPasteles.length
        return coloresPasteles[index]
    }

    const calcularDistanciaMetros = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371e3; // Radio de la Tierra en metros
        const p1 = lat1 * Math.PI / 180;
        const p2 = lat2 * Math.PI / 180;
        const dp = (lat2 - lat1) * Math.PI / 180;
        const dl = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dp/2) * Math.sin(dp/2) +
                  Math.cos(p1) * Math.cos(p2) *
                  Math.sin(dl/2) * Math.sin(dl/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.floor(R * c);
    }

    // Estilos base en objetos (Framer components adoran flexboxes y estilos en línea limpios)
    const containerStyle = {
        width: "100%",
        maxWidth: "1120px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "20px",
        fontFamily: "'Inter', sans-serif"
    }

    const pillsContainerStyle = {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: "16px"
    }

    const gridStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        justifyContent: "flex-start"
    }

    return (
        <div style={containerStyle}>
            {/* Control GPS / Cercanía */}
            <div style={{ padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "12px", border: "1px solid #E5E7EB", marginBottom: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px", fontWeight: "600", color: "#111827", fontSize: "15px" }}>
                    <input 
                        type="checkbox" 
                        checked={usarCercanos} 
                        onChange={handleToggleCercanos}
                        style={{ width: "20px", height: "20px", accentColor: "#6366F1" }}
                    />
                    📍 Mostrar solo proveedores cercanos a mí ({radioKm}km)
                </label>
                
                {/* Fallback de ubicación */}
                {usarCercanos && gpsPermitido === false && (
                    <p style={{ margin: "8px 0 0 30px", fontSize: "13px", color: "#D97706" }}>
                        ⚠️ No detectamos tu ubicación. Mostrando referencia general.
                    </p>
                )}
            </div>

            {/* Cabecera / Filtros (Pills) */}
            <div style={pillsContainerStyle}>
                {rubros.map((rubro) => {
                    const isActive = rubroActivo === rubro.id
                    return (
                        <motion.button
                            key={rubro.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRubroClick(rubro.id)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "9999px",
                                border: isActive ? "1px solid #111827" : "1px solid #E5E7EB",
                                backgroundColor: isActive ? "#111827" : "#FFFFFF",
                                color: isActive ? "#FFFFFF" : "#6B7280",
                                fontWeight: "500",
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {rubro.nombre}
                        </motion.button>
                    )
                })}
            </div>

            {/* Listado de Tarjetas */}
            <div style={gridStyle}>
                {profesionales.map((prof, index) => (
                    <motion.div
                        key={prof.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                            flex: "1 1 calc(25% - 24px)", // Fuerza 4 columnas, restando el gap
                            minWidth: "240px",            // Evita colapso en móviles
                            maxWidth: "calc(25% - 24px)", // Previene que se estiren de más si sobran espacios
                            backgroundColor: "#FFFFFF",
                            borderRadius: "16px",
                            padding: "20px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            position: "relative"
                        }}
                    >
                        {/* Highlights (Background diferencial si es destacado) */}
                        {prof.destacado && (
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                borderRadius: "16px",
                                border: "2px solid #F59E0B",
                                pointerEvents: "none"
                            }} />
                        )}

                        {/* Status Dot */}
                        <div style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "#10B981" // Verde de status
                        }} />

                        {/* Cabecera Tarjeta */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {/* Avatar */}
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                backgroundColor: getRandomColor(prof.id || prof.nombrePublico),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#111827"
                            }}>
                                {obtenerIniciales(prof.nombrePublico)}
                            </div>

                            {/* Nombres y Profesión */}
                            <div>
                                <h3 style={{ margin: 0, fontSize: "16px", color: "#111827", fontWeight: "700" }}>
                                    {prof.nombrePublico}
                                    {prof.destacado && <span style={{ fontSize: "12px", marginLeft: "6px", backgroundColor: "#FEF3C7", color: "#D97706", padding: "2px 6px", borderRadius: "4px" }}>⭐ Destacado</span>}
                                    {prof.trabajoVerificado && <span style={{ fontSize: "12px", marginLeft: "4px" }}>✅</span>}
                                </h3>
                                <span style={{ fontSize: "14px", color: "#6366F1", fontWeight: "500" }}>
                                    {prof.rubro}
                                </span>
                            </div>
                        </div>

                        {/* Cuerpo (Descripción) */}
                        <p style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#4B5563",
                            lineHeight: "1.5",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                        }}>
                            {prof.descripcion || "Experto sin descripción disponible adicional."}
                        </p>

                        {/* Footer Info (Calificación y Ubicación) */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                            {/* ESTRELLAS Y RESEÑAS */}
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ color: prof.cantidadResenas > 0 ? "#F59E0B" : "#D1D5DB", fontSize: "16px" }}>★</span>
                                <span style={{ fontWeight: "700", color: prof.cantidadResenas > 0 ? "#111827" : "#9CA3AF" }}>
                                    {prof.cantidadResenas > 0 && prof.promedioEstrellas ? prof.promedioEstrellas.toFixed(1) : "0.0"}
                                </span>
                                <span style={{ color: "#9CA3AF" }}>
                                    ({prof.cantidadResenas || 0})
                                </span>
                            </div>
                            {/* UBICACIÓN Y DISTANCIA */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", color: "#6B7280" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {prof.ciudad || "Global"}
                                </div>
                                {usarCercanos && gpsPermitido && prof.latitud && prof.longitud && (
                                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#10B981" }}>
                                        A {calcularDistanciaMetros(coordenadas.lat, coordenadas.lon, prof.latitud, prof.longitud)}m de ti
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Botón Acción */}
                        <motion.button
                            whileHover={{ backgroundColor: "#E5E7EB" }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: "100%",
                                padding: "10px",
                                backgroundColor: "#F3F4F6",
                                border: "none",
                                borderRadius: "8px",
                                color: "#111827",
                                fontWeight: "600",
                                fontSize: "14px",
                                cursor: "pointer",
                                marginTop: "auto"
                            }}
                        >
                            Ver Perfil
                        </motion.button>
                    </motion.div>
                ))}
            </div>

            {/* Loader */}
            {cargando && (
                <div style={{ textAlign: "center", color: "#6B7280", padding: "20px" }}>
                    Cargando proveedores...
                </div>
            )}

            {/* Empty State */}
            {!cargando && profesionales.length === 0 && (
                <div style={{ textAlign: "center", color: "#6B7280", padding: "40px" }}>
                    <p style={{fontSize: "18px", fontWeight: "600", color: "#111827"}}>Aún no hay proveedores por aquí</p>
                    <p>Prueba ampliando el radio de búsqueda o seleccionando otro rubro.</p>
                </div>
            )}

            {/* Paginación Tradicional (Reemplazo) */}
            {!cargando && profesionales.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 20px" }}>
                    <motion.button
                        whileHover={paginaActual > 0 ? { scale: 1.05 } : {}}
                        whileTap={paginaActual > 0 ? { scale: 0.95 } : {}}
                        onClick={() => setPaginaActual(p => p - 1)}
                        disabled={paginaActual === 0}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: paginaActual === 0 ? "#F3F4F6" : "#FFFFFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "9999px",
                            color: paginaActual === 0 ? "#9CA3AF" : "#111827",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: paginaActual === 0 ? "not-allowed" : "pointer"
                        }}
                    >
                        ← Anterior
                    </motion.button>
                    
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#6B7280" }}>
                        Página {paginaActual + 1}
                    </span>

                    <motion.button
                        whileHover={!haLlegadoAlFinal ? { scale: 1.05 } : {}}
                        whileTap={!haLlegadoAlFinal ? { scale: 0.95 } : {}}
                        onClick={() => setPaginaActual(p => p + 1)}
                        disabled={haLlegadoAlFinal}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: haLlegadoAlFinal ? "#F3F4F6" : "#FFFFFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "9999px",
                            color: haLlegadoAlFinal ? "#9CA3AF" : "#111827",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: haLlegadoAlFinal ? "not-allowed" : "pointer"
                        }}
                    >
                        Siguiente →
                    </motion.button>
                </div>
            )}
        </div>
    )
}

// Expone Controles para Framer UI (Panel Derecho)
addPropertyControls(ListadoProfesionales, {
    apiUrl: {
        type: ControlType.String,
        title: "API Base URL",
        defaultValue: "http://localhost:8080/api/v1"
    },
    defaultLat: {
        type: ControlType.Number,
        title: "Latitud Default",
        defaultValue: -34.6037
    },
    defaultLon: {
        type: ControlType.Number,
        title: "Longitud Default",
        defaultValue: -58.3816
    },
    radioKm: {
        type: ControlType.Number,
        title: "Radio(Km)",
        defaultValue: 1
    }
})
