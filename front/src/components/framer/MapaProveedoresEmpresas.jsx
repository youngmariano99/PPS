import React, { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    Map,
    Marker,
    Overlay,
    ZoomControl,
} from "https://esm.sh/pigeon-maps@0.21.3?external=react,react-dom"

// Constantes para mejorar mantenibilidad
const METROS_POR_KM = 1000
const RADIO_MAXIMO_BUSQUEDA = 100 // km para la API
const ZOOM_POR_DISTANCIA = {
    0.5: 15,
    1: 14,
    5: 13,
    15: 12,
    30: 11,
} // Rangos de zoom optimizados

export default function BuscadorDirectorioFinal(props) {
    const { apiUrl, primaryColor, alturaMapa, distanciasPredeterminadas } =
        props

    // Estados principales
    const [perfiles, setPerfiles] = useState([])
    const [perfilesFiltrados, setPerfilesFiltrados] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Estado de geolocalización y coordenadas
    const [coords, setCoords] = useState({ lat: -34.6037, lon: -58.3816 })
    const [ubicacionObtenida, setUbicacionObtenida] = useState(false)
    const [geolocalizacionError, setGeolocalizacionError] = useState(null)

    // Estado de filtros de distancia (siempre en metros internamente)
    const [radio, setRadio] = useState(5000) // 5km por defecto
    const [distanciaSeleccionada, setDistanciaSeleccionada] = useState(null) // Para tracking visual

    // Estado del modal y mapa
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null)
    const [modalPosition, setModalPosition] = useState(null)
    const mapRef = useRef(null)

    // Inicializar con la primera distancia predeterminada
    useEffect(() => {
        if (distanciasPredeterminadas.length > 0) {
            const primeraDistancia = distanciasPredeterminadas[0]
            const valorInicial =
                primeraDistancia.unidad === "km"
                    ? primeraDistancia.valor * METROS_POR_KM
                    : primeraDistancia.valor
            setRadio(valorInicial)
            setDistanciaSeleccionada(0)
        }
    }, [])

    // Memorización de distancias predeterminadas convertidas
    const distanciasMetros = React.useMemo(() => {
        return distanciasPredeterminadas.map((d) =>
            d.unidad === "km" ? d.valor * METROS_POR_KM : d.valor
        )
    }, [distanciasPredeterminadas])

    // Inyección de estilos CSS (optimizada)
    useEffect(() => {
        if (typeof document === "undefined") return

        const styleSheet = document.createElement("style")
        styleSheet.textContent = `
            .directorio-card-horizontal:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                border-color: #cbd5e1;
            }
            
            .directorio-button:hover {
                filter: brightness(0.95);
                transform: translateY(-1px);
            }
            
            .directorio-button:active {
                transform: translateY(0);
            }
            
            .directorio-marker:hover {
                transform: scale(1.2);
                cursor: pointer;
            }
            
            * {
                box-sizing: border-box;
            }
        `
        document.head.appendChild(styleSheet)

        return () => {
            document.head.removeChild(styleSheet)
        }
    }, [])

    // Obtener ubicación al montar el componente
    useEffect(() => {
        obtenerUbicacion()
    }, [])

    // Filtrar perfiles cuando cambia el radio o los perfiles
    useEffect(() => {
        if (perfiles.length > 0) {
            filtrarPerfilesPorDistancia()
        }
    }, [radio, perfiles])

    // Cálculo de distancia usando la fórmula de Haversine (optimizada)
    const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371e3 // Radio de la Tierra en metros
        const φ1 = (lat1 * Math.PI) / 180
        const φ2 = (lat2 * Math.PI) / 180
        const Δφ = ((lat2 - lat1) * Math.PI) / 180
        const Δλ = ((lon2 - lon1) * Math.PI) / 180

        const a =
            Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }, [])

    // Filtrado de perfiles por distancia (optimizado con useCallback)
    const filtrarPerfilesPorDistancia = useCallback(() => {
        const filtrados = perfiles
            .map((perfil) => ({
                ...perfil,
                distancia: calcularDistancia(
                    coords.lat,
                    coords.lon,
                    perfil.latitud,
                    perfil.longitud
                ),
            }))
            .filter((perfil) => perfil.distancia <= radio)
            .sort((a, b) => a.distancia - b.distancia)

        setPerfilesFiltrados(filtrados)
    }, [perfiles, coords, radio, calcularDistancia])

    // Obtención de geolocalización (con mejor manejo de errores)
    const obtenerUbicacion = useCallback(() => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            setGeolocalizacionError("Geolocalización no soportada")
            buscarServicios(coords.lat, coords.lon)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                }
                setCoords(newCoords)
                setUbicacionObtenida(true)
                setGeolocalizacionError(null)
                buscarServicios(newCoords.lat, newCoords.lon)
            },
            (error) => {
                const errorMessages = {
                    1: "Permiso de ubicación denegado",
                    2: "Ubicación no disponible",
                    3: "Tiempo de espera agotado",
                }
                setGeolocalizacionError(
                    errorMessages[error.code] || "Error desconocido"
                )
                setUbicacionObtenida(false)
                buscarServicios(coords.lat, coords.lon)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        )
    }, [coords])

    // Búsqueda de servicios desde la API
    const buscarServicios = useCallback(
        async (lat, lon) => {
            setLoading(true)
            setError(null)

            try {
                const api = apiUrl.replace(/\/+$/, "")
                const url = `${api}/directorio/buscar/mapa?lat=${lat}&lon=${lon}&radioKm=${RADIO_MAXIMO_BUSQUEDA}`

                const res = await fetch(url)

                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`)
                }

                const data = await res.json()

                if (!Array.isArray(data)) {
                    throw new Error("Formato de datos inválido")
                }

                setPerfiles(data)
            } catch (e) {
                console.error("Error al buscar servicios:", e)
                setError("No se pudieron cargar los datos")
                setPerfiles([])
            } finally {
                setLoading(false)
            }
        },
        [apiUrl]
    )

    // Distancia seleccionada
    const handleDistanciaSeleccionada = useCallback((metros, index) => {
        setRadio(metros)
        setDistanciaSeleccionada(index)
    }, [])

    // Zoom del mapa según radio
    const getZoomLevel = useCallback(() => {
        const radioKm = radio / METROS_POR_KM

        for (const [distancia, zoom] of Object.entries(ZOOM_POR_DISTANCIA)) {
            if (radioKm <= parseFloat(distancia)) return zoom
        }
        return 10
    }, [radio])

    // Formateo de distancia para display
    const formatearDistancia = useCallback((metros) => {
        if (metros == null || isNaN(metros)) return "Distancia desconocida"

        return metros < METROS_POR_KM
            ? `${Math.round(metros)} m`
            : `${(metros / METROS_POR_KM).toFixed(1)} km`
    }, [])

    // Manejo del click en marker
    const handleMarkerClick = useCallback((perfil, event) => {
        event.stopPropagation()

        // Calcular posición del modal considerando los límites del mapa
        const mapElement = event.currentTarget.closest(
            '[style*="position: relative"]'
        )
        if (mapElement) {
            const rect = mapElement.getBoundingClientRect()
            const x = Math.min(
                Math.max(event.clientX - rect.left, 150),
                rect.width - 10
            )
            const y = Math.min(
                Math.max(event.clientY - rect.top - 200, 10),
                rect.height - 10
            )

            setModalPosition({ x, y })
        } else {
            setModalPosition({
                x: event.clientX,
                y: event.clientY - 200,
            })
        }

        setPerfilSeleccionado(perfil)
    }, [])

    // Cierre del modal
    const handleCerrarModal = useCallback(() => {
        setPerfilSeleccionado(null)
        setModalPosition(null)
    }, [])

    return (
        <div style={styles.mainContainer}>
            {/* HEADER COMPACTO */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <h2 style={styles.title}>📍 Directorio Regional</h2>
                    {ubicacionObtenida ? (
                        <span style={styles.successBadge}>
                            ✓ Ubicación actual
                        </span>
                    ) : geolocalizacionError ? (
                        <span style={styles.errorBadge}>
                            ⚠ {geolocalizacionError}
                        </span>
                    ) : (
                        <span style={styles.loadingBadge}>○ Ubicando...</span>
                    )}
                </div>

                <div style={styles.headerRight}>
                    {/* Controles de distancia con botones predefinidos */}
                    <div style={styles.distanceControls}>
                        <span style={styles.distanceLabel}>Distancia:</span>
                        <div style={styles.distanceButtons}>
                            {distanciasPredeterminadas.map((dist, idx) => {
                                const valorEnMetros =
                                    dist.unidad === "km"
                                        ? dist.valor * METROS_POR_KM
                                        : dist.valor
                                const isActive = distanciaSeleccionada === idx

                                return (
                                    <button
                                        key={idx}
                                        className="directorio-button"
                                        style={{
                                            ...styles.distanceButton,
                                            backgroundColor: isActive
                                                ? primaryColor
                                                : "#f1f5f9",
                                            color: isActive
                                                ? "white"
                                                : "#64748b",
                                            borderColor: isActive
                                                ? primaryColor
                                                : "#e2e8f0",
                                        }}
                                        onClick={() =>
                                            handleDistanciaSeleccionada(
                                                valorEnMetros,
                                                idx
                                            )
                                        }
                                        title={`Buscar en ${dist.valor}${dist.unidad} a la redonda`}
                                        aria-pressed={isActive}
                                    >
                                        {dist.valor}
                                        {dist.unidad}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Contador de resultados */}
                    <div
                        style={{
                            ...styles.resultsCount,
                            backgroundColor: error ? "#ef4444" : primaryColor,
                        }}
                        title={`${perfilesFiltrados.length} resultados encontrados`}
                    >
                        {loading
                            ? "..."
                            : error
                                ? "!"
                                : perfilesFiltrados.length}
                    </div>
                </div>
            </div>

            {/* MAPA */}
            <div style={{ ...styles.mapWrapper, height: alturaMapa }}>
                <Map
                    ref={mapRef}
                    height={alturaMapa}
                    center={[coords.lat, coords.lon]}
                    zoom={getZoomLevel()}
                    provider={(x, y, z) =>
                        `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`
                    }
                    attribution={
                        <a
                            href="https://www.openstreetmap.org/copyright"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            © OpenStreetMap contributors
                        </a>
                    }
                >
                    <ZoomControl />

                    {/* Marcador de ubicación actual */}
                    {ubicacionObtenida && (
                        <Marker
                            width={40}
                            anchor={[coords.lat, coords.lon]}
                            color="#3b82f6"
                            payload="Ubicación actual"
                        />
                    )}

                    {/* Círculo de radio de búsqueda */}
                    {ubicacionObtenida && (
                        <Overlay
                            anchor={[coords.lat, coords.lon]}
                            offset={[0, 0]}
                        >
                            <div
                                style={{
                                    ...styles.radiusCircle,
                                    width: `${radio * 2}px`,
                                    height: `${radio * 2}px`,
                                    border: `2px solid ${primaryColor}40`,
                                    backgroundColor: `${primaryColor}10`,
                                }}
                            />
                        </Overlay>
                    )}

                    {/* Marcadores de perfiles filtrados */}
                    {perfilesFiltrados.map((p) => (
                        <Overlay
                            key={p.id}
                            anchor={[p.latitud, p.longitud]}
                            offset={[14, 28]}
                        >
                            <div
                                className="directorio-marker"
                                onClick={(e) => handleMarkerClick(p, e)}
                                style={styles.markerContainer}
                                title={`${p.nombrePublico} - ${formatearDistancia(p.distancia)}`}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill={primaryColor}
                                    width="28px"
                                    height="28px"
                                    style={styles.markerSvg}
                                >
                                    <path
                                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                        stroke="white"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                            </div>
                        </Overlay>
                    ))}
                </Map>

                {/* Modal en el mapa */}
                {perfilSeleccionado && modalPosition && (
                    <div
                        style={{
                            ...styles.mapModal,
                            left: modalPosition.x,
                            top: modalPosition.y,
                        }}
                        role="dialog"
                        aria-label={`Información de ${perfilSeleccionado.nombrePublico}`}
                    >
                        <div style={styles.modalHeader}>
                            <span
                                style={{
                                    ...styles.modalCategory,
                                    backgroundColor: `${primaryColor}20`,
                                    color: primaryColor,
                                }}
                            >
                                {perfilSeleccionado.rubro || "General"}
                            </span>
                            <button
                                onClick={handleCerrarModal}
                                style={styles.modalClose}
                                aria-label="Cerrar información"
                            >
                                ✕
                            </button>
                        </div>

                        <h3 style={styles.modalTitle}>
                            {perfilSeleccionado.nombrePublico || "Sin nombre"}
                        </h3>

                        <p style={styles.modalDescription}>
                            {perfilSeleccionado.descripcion ||
                                "Sin descripción disponible"}
                        </p>

                        {perfilSeleccionado.especialidades && perfilSeleccionado.especialidades.length > 0 && (
                            <div style={{ marginBottom: "12px" }}>
                                <div style={{ fontSize: "10px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>
                                    Especialidades
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {perfilSeleccionado.especialidades.map((tag, i) => (
                                        <span key={i} style={{ background: "#F1F5F9", color: "#475569", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={styles.modalInfo}>
                            <span style={styles.modalDistance}>
                                📍{" "}
                                {formatearDistancia(
                                    perfilSeleccionado.distancia
                                )}{" "}
                                •{" "}
                                {perfilSeleccionado.ciudad ||
                                    "Ubicación no especificada"}
                            </span>
                        </div>

                        <button
                            className="directorio-button"
                            style={{
                                ...styles.modalButton,
                                backgroundColor: primaryColor,
                            }}
                        >
                            Ver perfil completo
                        </button>
                    </div>
                )}
            </div>

            {/* GRID DE TARJETAS */}
            <div style={styles.scrollContainer}>
                {error ? (
                    <div style={styles.errorState}>
                        <span style={styles.errorIcon}>⚠️</span>
                        <span style={styles.errorText}>{error}</span>
                        <button
                            className="directorio-button"
                            style={{
                                ...styles.retryButton,
                                backgroundColor: primaryColor,
                            }}
                            onClick={() =>
                                buscarServicios(coords.lat, coords.lon)
                            }
                        >
                            Reintentar
                        </button>
                    </div>
                ) : loading ? (
                    <div style={styles.loadingState}>
                        <span style={styles.loadingText}>
                            Cargando resultados...
                        </span>
                    </div>
                ) : (
                    <div style={styles.horizontalGrid}>
                        {perfilesFiltrados.length === 0 ? (
                            <div style={styles.emptyStateContainer}>
                                <span style={styles.emptyStateIcon}>🔍</span>
                                <span style={styles.emptyStateText}>
                                    No hay resultados en{" "}
                                    {formatearDistancia(radio)}
                                </span>
                                <span style={styles.emptyStateHint}>
                                    Intenta aumentar la distancia de búsqueda
                                </span>
                                <div style={styles.emptyStateButtons}>
                                    {distanciasPredeterminadas
                                        .slice(0, 3)
                                        .map((dist, idx) => {
                                            const valorEnMetros =
                                                dist.unidad === "km"
                                                    ? dist.valor * METROS_POR_KM
                                                    : dist.valor
                                            return (
                                                <button
                                                    key={idx}
                                                    className="directorio-button"
                                                    style={{
                                                        ...styles.emptyStateButton,
                                                        backgroundColor:
                                                            primaryColor,
                                                    }}
                                                    onClick={() =>
                                                        handleDistanciaSeleccionada(
                                                            valorEnMetros,
                                                            idx
                                                        )
                                                    }
                                                >
                                                    {dist.valor}
                                                    {dist.unidad}
                                                </button>
                                            )
                                        })}
                                </div>
                            </div>
                        ) : (
                            perfilesFiltrados.map((p) => (
                                <div
                                    key={p.id}
                                    style={styles.horizontalCard}
                                    className="directorio-card-horizontal"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${p.nombrePublico} - ${formatearDistancia(p.distancia)}`}
                                >
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardHeader}>
                                            <span
                                                style={{
                                                    ...styles.categoryTag,
                                                    backgroundColor: `${primaryColor}20`,
                                                    color: primaryColor,
                                                }}
                                            >
                                                {p.rubro || "General"}
                                            </span>
                                            <span style={styles.distanceBadge}>
                                                {formatearDistancia(
                                                    p.distancia
                                                )}
                                            </span>
                                        </div>

                                        <h3 style={styles.cardTitle}>
                                            {p.nombrePublico || "Sin nombre"}
                                        </h3>

                                        <p style={styles.cardDesc}>
                                            {p.descripcion
                                                ? `${p.descripcion.substring(0, 60)}${p.descripcion.length > 60 ? "..." : ""}`
                                                : "Sin descripción"}
                                        </p>

                                        {p.especialidades && p.especialidades.length > 0 && (
                                            <div style={{ marginBottom: "8px" }}>
                                                <div style={{ fontSize: "9px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", marginBottom: "2px" }}>Especialidades</div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                                    {p.especialidades.slice(0, 2).map((tag, i) => (
                                                        <span key={i} style={{ background: "#F5F3FF", color: "#6366F1", fontSize: "9px", fontWeight: "700", padding: "1px 6px", borderRadius: "3px" }}>{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div style={styles.cardFooter}>
                                            <span style={styles.cityTag}>
                                                📍 {p.ciudad || "Sin ubicación"}
                                            </span>
                                            <button
                                                className="directorio-button"
                                                style={{
                                                    ...styles.actionButton,
                                                    backgroundColor:
                                                        primaryColor,
                                                }}
                                            >
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Estilos mejorados con sistema de diseño consistente
const styles = {
    mainContainer: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
    },

    header: {
        padding: "12px 16px",
        background: "linear-gradient(to bottom, white, #fafbfc)",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        gap: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },

    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
    },

    title: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "700",
        color: "#1e293b",
        whiteSpace: "nowrap",
    },

    successBadge: {
        padding: "3px 10px",
        background: "#10b981",
        color: "white",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: "600",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(16, 185, 129, 0.3)",
    },

    errorBadge: {
        padding: "3px 10px",
        background: "#ef4444",
        color: "white",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: "600",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(239, 68, 68, 0.3)",
    },

    loadingBadge: {
        padding: "3px 10px",
        background: "#f59e0b",
        color: "white",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: "600",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(245, 158, 11, 0.3)",
    },

    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flex: 1,
        justifyContent: "flex-end",
    },

    distanceControls: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    distanceLabel: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#64748b",
        whiteSpace: "nowrap",
    },

    distanceButtons: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
    },

    distanceButton: {
        padding: "6px 14px",
        borderRadius: "20px",
        border: "2px solid",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        backgroundColor: "#f1f5f9",
        color: "#64748b",
        borderColor: "#e2e8f0",
    },

    resultsCount: {
        padding: "6px 14px",
        color: "white",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "700",
        minWidth: "50px",
        textAlign: "center",
        flexShrink: 0,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },

    mapWrapper: {
        width: "100%",
        flexShrink: 0,
        position: "relative",
        backgroundColor: "#e2e8f0",
        borderBottom: "1px solid #cbd5e1",
    },

    radiusCircle: {
        borderRadius: "50%",
        position: "absolute",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
    },

    markerContainer: {
        cursor: "pointer",
        transition: "transform 0.2s",
        display: "inline-block",
    },

    markerSvg: {
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        transition: "transform 0.2s",
    },

    mapModal: {
        position: "absolute",
        width: "280px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        padding: "16px",
        zIndex: 1000,
        pointerEvents: "auto",
        animation: "fadeIn 0.2s",
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },

    modalCategory: {
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: "700",
        textTransform: "uppercase",
    },

    modalClose: {
        width: "24px",
        height: "24px",
        borderRadius: "6px",
        border: "none",
        background: "#f1f5f9",
        color: "#64748b",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s",
    },

    modalTitle: {
        margin: "0 0 8px 0",
        fontSize: "16px",
        fontWeight: "700",
        color: "#1e293b",
    },

    modalDescription: {
        margin: "0 0 12px 0",
        fontSize: "13px",
        color: "#64748b",
        lineHeight: "1.5",
    },

    modalInfo: {
        marginBottom: "16px",
    },

    modalDistance: {
        fontSize: "12px",
        color: "#64748b",
        fontWeight: "500",
    },

    modalButton: {
        width: "100%",
        padding: "8px",
        borderRadius: "8px",
        border: "none",
        color: "white",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },

    scrollContainer: {
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "16px",
        background: "#f8fafc",
    },

    horizontalGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "12px",
    },

    horizontalCard: {
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        cursor: "pointer",
    },

    cardContent: {
        padding: "14px",
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
    },

    categoryTag: {
        padding: "3px 8px",
        borderRadius: "6px",
        fontSize: "10px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.3px",
    },

    distanceBadge: {
        fontSize: "11px",
        color: "#64748b",
        fontWeight: "600",
        background: "#f1f5f9",
        padding: "2px 8px",
        borderRadius: "12px",
    },

    cardTitle: {
        margin: "0 0 6px 0",
        fontSize: "14px",
        fontWeight: "700",
        color: "#1e293b",
        lineHeight: "1.3",
    },

    cardDesc: {
        margin: "0 0 12px 0",
        fontSize: "12px",
        color: "#64748b",
        lineHeight: "1.4",
        minHeight: "34px",
    },

    cardFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    cityTag: {
        fontSize: "11px",
        color: "#64748b",
        fontWeight: "500",
    },

    actionButton: {
        padding: "5px 14px",
        borderRadius: "6px",
        border: "none",
        color: "white",
        fontSize: "11px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "filter 0.2s",
    },

    emptyStateContainer: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },

    emptyStateIcon: {
        fontSize: "48px",
        marginBottom: "8px",
    },

    emptyStateText: {
        color: "#64748b",
        fontSize: "16px",
        fontWeight: "600",
    },

    emptyStateHint: {
        color: "#94a3b8",
        fontSize: "13px",
    },

    emptyStateButtons: {
        display: "flex",
        gap: "8px",
        marginTop: "8px",
    },

    emptyStateButton: {
        padding: "6px 14px",
        borderRadius: "16px",
        border: "none",
        color: "white",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
    },

    errorState: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },

    errorIcon: {
        fontSize: "48px",
    },

    errorText: {
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "500",
    },

    loadingState: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "40px 20px",
    },

    loadingText: {
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "500",
    },

    retryButton: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        color: "white",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
    },
}

// Property Controls mejorados
addPropertyControls(BuscadorDirectorioFinal, {
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Principal",
        defaultValue: "#7c3aed",
    },
    alturaMapa: {
        type: ControlType.Number,
        title: "Altura del Mapa (px)",
        defaultValue: 350,
        min: 200,
        max: 600,
        step: 50,
    },
    distanciasPredeterminadas: {
        type: ControlType.Array,
        title: "Distancias de Búsqueda",
        control: {
            type: ControlType.Object,
            controls: {
                valor: {
                    type: ControlType.Number,
                    title: "Valor",
                    min: 0.1,
                    max: 100,
                },
                unidad: {
                    type: ControlType.Enum,
                    title: "Unidad",
                    options: ["m", "km"],
                    defaultValue: "km",
                },
            },
        },
        defaultValue: [
            { valor: 500, unidad: "m" },
            { valor: 1, unidad: "km" },
            { valor: 5, unidad: "km" },
            { valor: 15, unidad: "km" },
            { valor: 30, unidad: "km" },
        ],
        maxCount: 5,
    },
})
