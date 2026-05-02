import React, { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    Map,
    Marker,
    Overlay,
    ZoomControl,
} from "https://esm.sh/pigeon-maps@0.21.3?external=react,react-dom"

/**
 * MapaProveedoresEmpresasChamba
 * 
 * Un componente de mapa premium para el directorio de Chamba.
 * Sigue la lógica 1:1 de MapaProveedoresEmpresas pero con un rediseño "Propuesta A".
 * 
 * @param {Object} props - Propiedades de Framer
 */
export default function MapaProveedoresEmpresasChamba(props) {
    const { 
        apiUrl = "https://tu-api.com", 
        primaryColor = "#A01EED", 
        alturaMapa = "100%",
        mostrarZoom = true,
        radioInicial = 1000 // 1km por defecto
    } = props

    // --- ESTADOS LÓGICOS (1:1 con el original) ---
    const [perfiles, setPerfiles] = useState([])
    const [perfilesFiltrados, setPerfilesFiltrados] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [coords, setCoords] = useState({ lat: -34.6037, lon: -58.3816 })
    const [ubicacionObtenida, setUbicacionObtenida] = useState(false)
    const [geolocalizacionError, setGeolocalizacionError] = useState(null)

    const [terminoBusqueda, setTerminoBusqueda] = useState("")
    const [radioEfectivo, setRadioEfectivo] = useState(radioInicial)
    const [distanciaSeleccionada, setDistanciaSeleccionada] = useState(radioInicial)
    
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null)
    const [mostrarDropdownDistancia, setMostrarDropdownDistancia] = useState(false)
    
    const mapRef = useRef(null)
    const searchInputRef = useRef(null)

    // --- INYECCIÓN DE ESTILOS Y FUENTES ---
    useEffect(() => {
        if (typeof document === "undefined") return

        // Cargar Poppins e Inter
        const fontLink = document.createElement("link")
        fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Poppins:wght@500;600;700&display=swap"
        fontLink.rel = "stylesheet"
        document.head.appendChild(fontLink)

        const styleSheet = document.createElement("style")
        styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .chamba-map-container {
                font-family: 'Inter', sans-serif;
                color: #000000;
            }

            .chamba-title {
                font-family: 'Poppins', sans-serif;
            }

            .chamba-marker {
                transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;
            }

            .chamba-marker:hover {
                transform: scale(1.1) translateY(-5px);
                z-index: 1000 !important;
            }

            .chamba-marker-pill {
                background: white;
                border: 2px solid ${primaryColor};
                border-radius: 20px;
                padding: 4px 12px;
                color: ${primaryColor};
                font-weight: 600;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(160, 30, 237, 0.15);
                position: relative;
            }

            .chamba-marker-pill::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid ${primaryColor};
            }

            .chamba-input:focus {
                outline: none;
                border-color: ${primaryColor};
            }

            .chamba-dropdown-item {
                padding: 10px 16px;
                cursor: pointer;
                transition: background 0.2s;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chamba-dropdown-item:hover {
                background: #f8fafc;
                color: ${primaryColor};
            }

            .chamba-button-primary {
                background: ${primaryColor};
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px 16px;
                font-weight: 600;
                cursor: pointer;
                transition: filter 0.2s;
            }

            .chamba-button-primary:hover {
                filter: brightness(0.9);
            }

            /* Estilo para el scrollbar del dropdown */
            .chamba-dropdown::-webkit-scrollbar {
                width: 4px;
            }
            .chamba-dropdown::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
            }
        `
        document.head.appendChild(styleSheet)

        return () => {
            document.head.removeChild(styleSheet)
            if (fontLink.parentNode) document.head.removeChild(fontLink)
        }
    }, [primaryColor])

    // --- LÓGICA DE GEOLOCALIZACIÓN Y DATOS (1:1) ---
    const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371e3
        const φ1 = (lat1 * Math.PI) / 180
        const φ2 = (lat2 * Math.PI) / 180
        const Δφ = ((lat2 - lat1) * Math.PI) / 180
        const Δλ = ((lon2 - lon1) * Math.PI) / 180
        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }, [])

    const buscarServicios = useCallback(async (lat, lon) => {
        setLoading(true)
        setError(null)
        try {
            const api = apiUrl.replace(/\/+$/, "")
            // RADIO_MAXIMO_BUSQUEDA = 100km fijo para la API como en el original
            const url = `${api}/directorio/buscar/mapa?lat=${lat}&lon=${lon}&radioKm=100`
            console.log("📍 [Mapa] Fetching puntos en:", url)
            const res = await fetch(url)
            if (!res.ok) throw new Error(`Error ${res.status}`)
            const data = await res.json()
            console.log("🗺️ [Mapa] Puntos recibidos:", data.length, data)
            setPerfiles(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error("Error API:", e)
            setError("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }, [apiUrl])

    const obtenerUbicacion = useCallback(() => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            buscarServicios(coords.lat, coords.lon)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
                setCoords(newCoords)
                setUbicacionObtenida(true)
                buscarServicios(newCoords.lat, newCoords.lon)
            },
            () => {
                setUbicacionObtenida(false)
                buscarServicios(coords.lat, coords.lon)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [coords, buscarServicios])

    useEffect(() => {
        obtenerUbicacion()
    }, [])

    // --- FILTRADO (1:1) ---
    useEffect(() => {
        let filtrados = perfiles.map(p => ({
            ...p,
            distancia: calcularDistancia(coords.lat, coords.lon, p.latitud, p.longitud)
        })).filter(p => p.distancia <= radioEfectivo)

        if (terminoBusqueda.trim()) {
            const t = terminoBusqueda.toLowerCase().trim()
            filtrados = filtrados.filter(p => 
                (p.rubro && p.rubro.toLowerCase().includes(t)) ||
                (p.nombrePublico && p.nombrePublico.toLowerCase().includes(t)) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(t))
            )
        }
        filtrados.sort((a, b) => a.distancia - b.distancia)
        setPerfilesFiltrados(filtrados)
    }, [perfiles, coords, radioEfectivo, terminoBusqueda, calcularDistancia])

    // --- MANEJADORES UI ---
    const handleDistanciaSelect = (valor) => {
        setDistanciaSeleccionada(valor)
        setRadioEfectivo(valor)
        setMostrarDropdownDistancia(false)
    }

    const formatearDistancia = (m) => {
        return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(0)} km`
    }

    const getZoomLevel = () => {
        const km = radioEfectivo / 1000
        if (km <= 0.5) return 15
        if (km <= 1) return 14
        if (km <= 5) return 12
        if (km <= 10) return 11
        return 9
    }

    // --- RENDERIZADO ---
    return (
        <div className="chamba-map-container" style={{ ...styles.mainContainer, height: alturaMapa }}>
            
            {/* HEADER / BARRA DE BÚSQUEDA (Propuesta A) */}
            <div style={styles.headerFloating}>
                <div style={styles.headerRow}>
                    {/* Input Búsqueda */}
                    <div style={styles.searchBox}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input 
                            style={styles.inputSearch}
                            placeholder="Nombre, rubro o descripción..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Input Ubicación (Visual/Mock) */}
                    <div style={styles.locationBox}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <input 
                            style={styles.inputLocation}
                            placeholder="Pringles, Buenos Aires"
                            readOnly
                        />
                        <button style={styles.geoButton} onClick={obtenerUbicacion}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
                                <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                            </svg>
                        </button>
                    </div>

                    {/* Selector Distancia Dropdown */}
                    <div style={{ position: "relative" }}>
                        <button 
                            style={{ 
                                ...styles.distanceButton, 
                                borderColor: mostrarDropdownDistancia ? primaryColor : "#E2E8F0" 
                            }}
                            onClick={() => setMostrarDropdownDistancia(!mostrarDropdownDistancia)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
                                <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
                            </svg>
                            <span>{formatearDistancia(distanciaSeleccionada)}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        {mostrarDropdownDistancia && (
                            <div className="chamba-dropdown" style={styles.dropdown}>
                                {[500, 1000, 5000, 10000].map(val => (
                                    <div 
                                        key={val} 
                                        className="chamba-dropdown-item"
                                        onClick={() => handleDistanciaSelect(val)}
                                    >
                                        {formatearDistancia(val)}
                                        {distanciaSeleccionada === val && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resultados */}
                    <div style={styles.resultsBadge}>
                        <span style={{ color: primaryColor, fontWeight: "600" }}>
                            {perfilesFiltrados.length}
                        </span>
                        <span style={{ color: "#94A3B8", marginLeft: "4px" }}>resultados</span>
                    </div>

                    {/* Botón Filtros */}
                    <button style={styles.filterButton}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                        <span>Filtros</span>
                    </button>
                </div>
            </div>

            {/* MAPA PIGEON */}
            <div style={styles.mapWrapper}>
                <Map
                    ref={mapRef}
                    height={alturaMapa}
                    center={[coords.lat, coords.lon]}
                    zoom={getZoomLevel()}
                    provider={(x, y, z) => `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`}
                    onBoundsChanged={() => perfilSeleccionado && setPerfilSeleccionado(null)}
                >
                    {mostrarZoom && <ZoomControl />}

                    {/* Marcador Usuario (Punto con Radio) */}
                    {ubicacionObtenida && (
                        <Overlay anchor={[coords.lat, coords.lon]} offset={[0, 0]}>
                            <div style={styles.userMarkerWrapper}>
                                <div style={{ ...styles.userPulse, backgroundColor: primaryColor }} />
                                <div style={{ ...styles.userDot, backgroundColor: primaryColor }} />
                                {/* Radio visual */}
                                <div style={{ 
                                    ...styles.visualRadius, 
                                    width: `${radioEfectivo / (40000 / Math.pow(2, getZoomLevel()))}px`, 
                                    height: `${radioEfectivo / (40000 / Math.pow(2, getZoomLevel()))}px`,
                                    borderColor: `${primaryColor}40`,
                                    backgroundColor: `${primaryColor}08`
                                }} />
                            </div>
                        </Overlay>
                    )}

                    {/* Marcadores de Perfiles (Propuesta A) */}
                    {perfilesFiltrados.map(p => (
                        <Overlay key={p.id} anchor={[p.latitud, p.longitud]} offset={[0, 0]}>
                            <div 
                                className="chamba-marker"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPerfilSeleccionado(p)
                                }}
                                style={{ transform: "translate(-50%, -100%)", position: "absolute" }}
                            >
                                <div className="chamba-marker-pill">
                                    {p.rubro || "Servicio"}
                                </div>
                            </div>
                        </Overlay>
                    ))}

                    {/* Tooltip / Mini-Card (Premium Chamba Design) */}
                    {perfilSeleccionado && (
                        <Overlay anchor={[perfilSeleccionado.latitud, perfilSeleccionado.longitud]} offset={[0, 0]}>
                            <div style={styles.cardOverlay}>
                                <div style={styles.card}>
                                    <button style={styles.cardClose} onClick={() => setPerfilSeleccionado(null)}>✕</button>
                                    
                                    <div style={styles.cardHeader}>
                                        <div style={styles.avatarWrapper}>
                                            {perfilSeleccionado.fotoPerfilUrl ? (
                                                <img 
                                                    src={perfilSeleccionado.fotoPerfilUrl} 
                                                    style={styles.avatarImg}
                                                    alt={perfilSeleccionado.nombrePublico}
                                                />
                                            ) : (
                                                <div style={{ ...styles.avatarPlaceholder, backgroundColor: primaryColor + "20", color: primaryColor }}>
                                                    {perfilSeleccionado.nombrePublico?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <div style={styles.cardMainInfo}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <h4 className="chamba-title" style={styles.cardName}>
                                                    {perfilSeleccionado.nombrePublico}
                                                </h4>
                                                {perfilSeleccionado.destacado && (
                                                    <span style={{ ...styles.proBadge, backgroundColor: primaryColor }}>PRO</span>
                                                )}
                                            </div>
                                            <p style={styles.cardCategory}>{perfilSeleccionado.rubro}</p>
                                        </div>
                                    </div>

                                    {/* Especialidades / Tags */}
                                    {perfilSeleccionado.especialidades && perfilSeleccionado.especialidades.length > 0 && (
                                        <div style={styles.tagContainer}>
                                            {perfilSeleccionado.especialidades.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} style={styles.tag}>
                                                    {tag}{idx < 2 && idx < perfilSeleccionado.especialidades.length - 1 ? " •" : ""}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Métricas Reales */}
                                    <div style={styles.cardMetrics}>
                                        <div style={styles.metricItem}>
                                            <span style={styles.starIcon}>⭐</span>
                                            <span style={styles.metricText}>
                                                {perfilSeleccionado.promedioEstrellas > 0 ? perfilSeleccionado.promedioEstrellas.toFixed(1) : "N/A"} 
                                                <span style={{ color: "#94A3B8", fontWeight: "400", marginLeft: "4px" }}>
                                                    ({perfilSeleccionado.cantidadResenas || 0})
                                                </span>
                                            </span>
                                        </div>
                                        <div style={styles.metricDivider} />
                                        <div style={styles.metricItem}>
                                            <span style={styles.metricText}>
                                                📍 {formatearDistancia(Math.round(perfilSeleccionado.distancia))}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.cardActions}>
                                        <button 
                                            style={styles.btnSecondary}
                                            onClick={() => window.open(`https://wa.me/${perfilSeleccionado.telefono?.replace(/\D/g, '')}`, '_blank')}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            Contactar
                                        </button>
                                        <button 
                                            className="chamba-button-primary" 
                                            style={{ ...styles.btnPrimary, backgroundColor: primaryColor }}
                                            onClick={() => window.open(`/perfil/${perfilSeleccionado.id}`, '_blank')}
                                        >
                                            Ver perfil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Overlay>
                    )}
                </Map>

                {/* Footer Info (Radio de búsqueda) */}
                <div style={styles.mapFooter}>
                    <div style={styles.footerInfo}>
                        <div style={{ ...styles.footerDot, backgroundColor: primaryColor }} />
                        <span>Radio de búsqueda: {formatearDistancia(radioEfectivo)}</span>
                    </div>
                </div>
            </div>

            {loading && <div style={styles.loader}>Cargando chambas...</div>}
        </div>
    )
}

// --- ESTILOS ---
const styles = {
    mainContainer: {
        width: "100%",
        position: "relative",
        background: "#F1F5F9",
        overflow: "hidden",
    },
    headerFloating: {
        position: "absolute",
        top: "24px",
        left: "24px",
        right: "24px",
        zIndex: 1000,
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        padding: "10px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.3)",
    },
    searchBox: {
        flex: 2,
        display: "flex",
        alignItems: "center",
        background: "#F8FAFC",
        borderRadius: "12px",
        padding: "0 16px",
        height: "48px",
        gap: "10px",
    },
    inputSearch: {
        background: "transparent",
        border: "none",
        width: "100%",
        fontSize: "14px",
        color: "#1E293B",
        outline: "none",
    },
    locationBox: {
        flex: 1.5,
        display: "flex",
        alignItems: "center",
        background: "#F8FAFC",
        borderRadius: "12px",
        padding: "0 16px",
        height: "48px",
        gap: "10px",
    },
    inputLocation: {
        background: "transparent",
        border: "none",
        width: "100%",
        fontSize: "14px",
        color: "#1E293B",
        outline: "none",
    },
    geoButton: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        padding: "4px",
    },
    distanceButton: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "white",
        border: "2px solid #E2E8F0",
        borderRadius: "12px",
        height: "48px",
        padding: "0 16px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        minWidth: "120px",
    },
    dropdown: {
        position: "absolute",
        top: "56px",
        left: 0,
        width: "180px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        animation: "fadeIn 0.2s ease-out",
    },
    resultsBadge: {
        padding: "0 16px",
        fontSize: "14px",
        borderLeft: "1px solid #E2E8F0",
        height: "24px",
        display: "flex",
        alignItems: "center",
    },
    filterButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "transparent",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        height: "48px",
        padding: "0 20px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
    },
    mapWrapper: {
        width: "100%",
        height: "100%",
        background: "#E2E8F0",
    },
    userMarkerWrapper: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    userDot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        border: "2px solid white",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        zIndex: 2,
    },
    userPulse: {
        position: "absolute",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        opacity: 0.3,
        animation: "pulse 2s infinite",
    },
    visualRadius: {
        position: "absolute",
        borderRadius: "50%",
        border: "1px dashed",
        pointerEvents: "none",
    },
    cardOverlay: {
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        animation: "fadeIn 0.3s ease-out",
    },
    card: {
        width: "300px",
        background: "white",
        borderRadius: "24px",
        padding: "20px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        position: "relative",
        border: "1px solid #F1F5F9",
    },
    cardClose: {
        position: "absolute",
        top: "16px",
        right: "16px",
        background: "#F8FAFC",
        border: "none",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        color: "#94A3B8",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        zIndex: 2,
    },
    cardHeader: {
        display: "flex",
        gap: "16px",
        alignItems: "center",
        marginBottom: "16px",
    },
    avatarWrapper: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "3px solid #F1F5F9",
        flexShrink: 0,
    },
    avatarImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        fontWeight: "700",
        fontFamily: "'Poppins', sans-serif",
    },
    cardMainInfo: {
        flex: 1,
        minWidth: 0,
    },
    cardName: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "700",
        color: "#0F172A",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    proBadge: {
        fontSize: "10px",
        fontWeight: "800",
        color: "white",
        padding: "2px 8px",
        borderRadius: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    cardCategory: {
        margin: "2px 0 0 0",
        fontSize: "14px",
        color: "#A01EED",
        fontWeight: "600",
    },
    tagContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginBottom: "16px",
    },
    tag: {
        fontSize: "13px",
        color: "#64748B",
        fontWeight: "500",
    },
    cardMetrics: {
        display: "flex",
        alignItems: "center",
        background: "#F8FAFC",
        borderRadius: "12px",
        padding: "10px 16px",
        marginBottom: "20px",
    },
    metricItem: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    metricDivider: {
        width: "1px",
        height: "14px",
        background: "#E2E8F0",
        margin: "0 12px",
    },
    starIcon: {
        fontSize: "14px",
    },
    metricText: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#1E293B",
    },
    cardActions: {
        display: "flex",
        gap: "10px",
    },
    btnPrimary: {
        flex: 1.2,
        height: "44px",
        borderRadius: "12px",
        border: "none",
        color: "white",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    btnSecondary: {
        flex: 1,
        height: "44px",
        borderRadius: "12px",
        border: "2px solid #F1F5F9",
        background: "white",
        color: "#0F172A",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "background 0.2s",
    },
    mapFooter: {
        position: "absolute",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
    },
    footerInfo: {
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        padding: "8px 16px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: "600",
        color: "#64748B",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.3)",
    },
    footerDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
    },
    loader: {
        position: "absolute",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        padding: "8px 20px",
        borderRadius: "100px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        fontSize: "13px",
        fontWeight: "600",
        color: "#A01EED",
        zIndex: 1000,
    },
}

// --- FRAMER CONTROLS ---
addPropertyControls(MapaProveedoresEmpresasChamba, {
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Principal",
        defaultValue: "#A01EED",
    },
    alturaMapa: {
        type: ControlType.Number,
        title: "Altura del Mapa (px)",
        defaultValue: 600,
        min: 300,
        max: 1200,
        step: 50,
    },
    radioInicial: {
        type: ControlType.Number,
        title: "Radio Inicial (m)",
        defaultValue: 1000,
        min: 100,
        max: 100000,
    },
    mostrarZoom: {
        type: ControlType.Boolean,
        title: "Mostrar Zoom",
        defaultValue: true,
    },
})
