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
    1: 14,
    5: 13,
    15: 12,
    30: 11,
    50: 10,
    100: 9,
}

export default function BuscadorDirectorioFinal(props) {
    const { apiUrl, primaryColor, alturaMapa } = props

    // Estados principales
    const [perfiles, setPerfiles] = useState([])
    const [perfilesFiltrados, setPerfilesFiltrados] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Estado de geolocalización y coordenadas
    const [coords, setCoords] = useState({ lat: -34.6037, lon: -58.3816 })
    const [ubicacionObtenida, setUbicacionObtenida] = useState(false)
    const [geolocalizacionError, setGeolocalizacionError] = useState(null)

    // Estado de búsqueda
    const [terminoBusqueda, setTerminoBusqueda] = useState("")
    const [distanciaLibre, setDistanciaLibre] = useState(false)
    const [radioPersonalizado, setRadioPersonalizado] = useState(1000) // 1km por defecto
    const [radioEfectivo, setRadioEfectivo] = useState(1000) // Radio que se usa realmente

    // Estado del modal y mapa
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null)
    const [modalPosition, setModalPosition] = useState(null)
    const mapRef = useRef(null)
    const searchInputRef = useRef(null)

    // Inyección de estilos CSS con fuente Inter
    useEffect(() => {
        if (typeof document === "undefined") return

        // Cargar fuente Inter desde Google Fonts
        const fontLink = document.createElement("link")
        fontLink.href =
            "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
        fontLink.rel = "stylesheet"
        document.head.appendChild(fontLink)

        const styleSheet = document.createElement("style")
        styleSheet.textContent = `
            .directorio-marker:hover {
                transform: scale(1.2);
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .directorio-search-input:focus {
                outline: none;
                border-color: ${primaryColor};
                box-shadow: 0 0 0 2px ${primaryColor}20;
            }
            
            .directorio-search-input::placeholder {
                color: #94a3b8;
                font-weight: 300;
            }
            
            .directorio-button {
                transition: all 0.2s ease;
            }
            
            .directorio-button:hover {
                filter: brightness(0.95);
            }
            
            .directorio-button:active {
                transform: scale(0.98);
            }
            
            * {
                box-sizing: border-box;
            }
        `
        document.head.appendChild(styleSheet)

        return () => {
            document.head.removeChild(styleSheet)
            if (fontLink.parentNode) {
                document.head.removeChild(fontLink)
            }
        }
    }, [primaryColor])

    // Obtener ubicación al montar el componente
    useEffect(() => {
        obtenerUbicacion()
    }, [])

    // Actualizar radio efectivo cuando cambia el modo o el radio personalizado
    useEffect(() => {
        if (distanciaLibre) {
            setRadioEfectivo(radioPersonalizado)
        } else {
            setRadioEfectivo(1000) // 1km fijo
        }
    }, [distanciaLibre, radioPersonalizado])

    // Filtrar perfiles cuando cambia el radio efectivo, término de búsqueda o perfiles
    useEffect(() => {
        if (perfiles.length > 0) {
            filtrarPerfiles()
        }
    }, [radioEfectivo, terminoBusqueda, perfiles])

    // Cálculo de distancia usando la fórmula de Haversine
    const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371e3
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

    // Filtrado de perfiles
    const filtrarPerfiles = useCallback(() => {
        let filtrados = perfiles
            .map((perfil) => ({
                ...perfil,
                distancia: calcularDistancia(
                    coords.lat,
                    coords.lon,
                    perfil.latitud,
                    perfil.longitud
                ),
            }))
            .filter((perfil) => perfil.distancia <= radioEfectivo)

        // Aplicar búsqueda por texto si hay término
        if (terminoBusqueda.trim()) {
            const termino = terminoBusqueda.toLowerCase().trim()
            filtrados = filtrados.filter(
                (perfil) =>
                    (perfil.rubro &&
                        perfil.rubro.toLowerCase().includes(termino)) ||
                    (perfil.nombrePublico &&
                        perfil.nombrePublico.toLowerCase().includes(termino)) ||
                    (perfil.descripcion &&
                        perfil.descripcion.toLowerCase().includes(termino))
            )
        }

        // Ordenar por distancia
        filtrados.sort((a, b) => a.distancia - b.distancia)
        setPerfilesFiltrados(filtrados)
    }, [perfiles, coords, radioEfectivo, terminoBusqueda, calcularDistancia])

    // Obtención de geolocalización
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

    // Manejador de búsqueda
    const handleSearchChange = useCallback((e) => {
        setTerminoBusqueda(e.target.value)
    }, [])

    // Toggle modo libre
    const toggleDistanciaLibre = useCallback(() => {
        setDistanciaLibre((prev) => !prev)
    }, [])

    // Cambio de radio personalizado
    const handleRadioChange = useCallback((e) => {
        const valor = parseInt(e.target.value)
        if (!isNaN(valor) && valor >= 100) {
            setRadioPersonalizado(valor)
        }
    }, [])

    // Zoom del mapa según radio
    const getZoomLevel = useCallback(() => {
        const radioKm = radioEfectivo / METROS_POR_KM

        for (const [distancia, zoom] of Object.entries(ZOOM_POR_DISTANCIA)) {
            if (radioKm <= parseFloat(distancia)) return zoom
        }
        return 9
    }, [radioEfectivo])

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
            {/* BARRA DE BÚSQUEDA FLOTANTE */}
            <div style={styles.searchOverlay}>
                <div style={styles.searchContainer}>
                    <div style={styles.searchInputWrapper}>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            style={styles.searchIcon}
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar por rubro, nombre o descripción..."
                            value={terminoBusqueda}
                            onChange={handleSearchChange}
                            style={styles.searchInput}
                            className="directorio-search-input"
                        />
                        {terminoBusqueda && (
                            <button
                                onClick={() => setTerminoBusqueda("")}
                                style={styles.clearButton}
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div style={styles.searchControls}>
                        <button
                            className="directorio-button"
                            onClick={toggleDistanciaLibre}
                            style={{
                                ...styles.modeButton,
                                backgroundColor: distanciaLibre
                                    ? primaryColor
                                    : "#f1f5f9",
                                color: distanciaLibre ? "white" : "#64748b",
                                borderColor: distanciaLibre
                                    ? primaryColor
                                    : "#e2e8f0",
                            }}
                            title={
                                distanciaLibre
                                    ? "Usar distancia personalizada"
                                    : "Radio fijo de 1km"
                            }
                        >
                            {distanciaLibre ? "Libre" : "1 km"}
                        </button>

                        {distanciaLibre && (
                            <div style={styles.customRadioContainer}>
                                <input
                                    type="range"
                                    min="100"
                                    max="100000"
                                    step="100"
                                    value={radioPersonalizado}
                                    onChange={handleRadioChange}
                                    style={{
                                        ...styles.radioSlider,
                                        accentColor: primaryColor,
                                    }}
                                />
                                <span style={styles.radioValue}>
                                    {formatearDistancia(radioPersonalizado)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Resultados encontrados */}
                    <div style={styles.resultsCount}>
                        {loading ? "..." : perfilesFiltrados.length}
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
                            © OpenStreetMap
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
                                    width: `${radioEfectivo * 2}px`,
                                    height: `${radioEfectivo * 2}px`,
                                    border: `2px solid ${primaryColor}30`,
                                    backgroundColor: `${primaryColor}08`,
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

                {/* Estado de carga/error en el mapa */}
                {loading && (
                    <div style={styles.mapOverlay}>
                        <span style={styles.loadingText}>Cargando...</span>
                    </div>
                )}

                {error && (
                    <div style={styles.mapOverlay}>
                        <span style={styles.errorTextSmall}>⚠️ {error}</span>
                        <button
                            className="directorio-button"
                            style={{
                                ...styles.retryButtonSmall,
                                backgroundColor: primaryColor,
                            }}
                            onClick={() =>
                                buscarServicios(coords.lat, coords.lon)
                            }
                        >
                            Reintentar
                        </button>
                    </div>
                )}

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
        </div>
    )
}

// Estilos con fuente Inter y diseño minimalista
const styles = {
    mainContainer: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontWeight: "400",
        overflow: "hidden",
        position: "relative",
    },

    searchOverlay: {
        position: "absolute",
        top: "16px",
        left: "16px",
        right: "16px",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
    },

    searchContainer: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "white",
        borderRadius: "16px",
        padding: "8px 12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
        maxWidth: "600px",
        width: "100%",
        backdropFilter: "blur(10px)",
    },

    searchInputWrapper: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        position: "relative",
    },

    searchIcon: {
        flexShrink: 0,
    },

    searchInput: {
        flex: 1,
        border: "none",
        background: "transparent",
        fontSize: "14px",
        fontWeight: "400",
        color: "#1e293b",
        padding: "6px 0",
        outline: "none",
        minWidth: "150px",
    },

    clearButton: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "14px",
        padding: "4px 8px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    searchControls: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
    },

    modeButton: {
        padding: "6px 12px",
        borderRadius: "20px",
        border: "2px solid",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
        whiteSpace: "nowrap",
        backgroundColor: "#f1f5f9",
        color: "#64748b",
        borderColor: "#e2e8f0",
    },

    customRadioContainer: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },

    radioSlider: {
        width: "80px",
        height: "4px",
        borderRadius: "2px",
        cursor: "pointer",
    },

    radioValue: {
        fontSize: "12px",
        fontWeight: "500",
        color: "#64748b",
        minWidth: "50px",
        textAlign: "right",
    },

    resultsCount: {
        padding: "4px 10px",
        background: "#f1f5f9",
        color: "#64748b",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        minWidth: "30px",
        textAlign: "center",
        flexShrink: 0,
    },

    mapWrapper: {
        width: "100%",
        flex: 1,
        position: "relative",
        backgroundColor: "#e2e8f0",
    },

    mapOverlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: "16px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        zIndex: 1000,
    },

    loadingText: {
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "400",
    },

    errorTextSmall: {
        color: "#64748b",
        fontSize: "13px",
        fontWeight: "400",
    },

    retryButtonSmall: {
        padding: "6px 12px",
        borderRadius: "8px",
        border: "none",
        color: "white",
        fontSize: "12px",
        fontWeight: "500",
        cursor: "pointer",
    },

    radiusCircle: {
        borderRadius: "50%",
        position: "absolute",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
    },

    markerContainer: {
        cursor: "pointer",
        display: "inline-block",
    },

    markerSvg: {
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
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
        fontWeight: "600",
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
    },

    modalTitle: {
        margin: "0 0 8px 0",
        fontSize: "16px",
        fontWeight: "600",
        color: "#1e293b",
    },

    modalDescription: {
        margin: "0 0 12px 0",
        fontSize: "13px",
        color: "#64748b",
        lineHeight: "1.5",
        fontWeight: "400",
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
        fontWeight: "500",
        cursor: "pointer",
    },
}

// Property Controls simplificados
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
        defaultValue: 600,
        min: 300,
        max: 800,
        step: 50,
    },
})
