import React, { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    Map,
    Marker,
    Overlay,
    ZoomControl,
} from "https://esm.sh/pigeon-maps@0.21.3?external=react,react-dom"

export default function BuscadorDirectorioFinal(props) {
    const { apiUrl, primaryColor, alturaMapa, distanciasPredeterminadas } =
        props

    const [perfiles, setPerfiles] = useState([])
    const [perfilesFiltrados, setPerfilesFiltrados] = useState([])
    const [loading, setLoading] = useState(false)
    const [radio, setRadio] = useState(1000) // SIEMPRE en metros internamente
    const [unidad, setUnidad] = useState("m") // "m" o "km" - solo para display
    const [coords, setCoords] = useState({ lat: -34.6037, lon: -58.3816 })
    const [ubicacionObtenida, setUbicacionObtenida] = useState(false)
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null)
    const [modalPosition, setModalPosition] = useState(null)
    const [valorPersonalizado, setValorPersonalizado] = useState("")
    const mapRef = useRef(null)

    // Convertir distancias predeterminadas a metros
    const distanciasMetros = distanciasPredeterminadas.map((d) =>
        d.unidad === "km" ? d.valor * 1000 : d.valor
    )

    useEffect(() => {
        // Inyectar estilos solo en el cliente
        if (typeof document !== "undefined") {
            const styleSheet = document.createElement("style")
            styleSheet.textContent = `
                .horizontal-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    border-color: #cbd5e1;
                }
                
                .action-button:hover, .quick-button:hover, .unit-button:hover {
                    opacity: 0.9;
                }
                
                .custom-input:focus {
                    border-color: #7c3aed;
                    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
                }
                
                * {
                    box-sizing: border-box;
                }
            `
            document.head.appendChild(styleSheet)

            return () => {
                if (styleSheet.parentNode) {
                    styleSheet.parentNode.removeChild(styleSheet)
                }
            }
        }
    }, [])

    useEffect(() => {
        obtenerUbicacion()
    }, [])

    useEffect(() => {
        // Filtrar perfiles por distancia cuando cambia el radio
        if (perfiles.length > 0) {
            filtrarPerfilesPorDistancia()
        }
    }, [radio, perfiles])

    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3 // Radio de la Tierra en metros
        const φ1 = (lat1 * Math.PI) / 180
        const φ2 = (lat2 * Math.PI) / 180
        const Δφ = ((lat2 - lat1) * Math.PI) / 180
        const Δλ = ((lon2 - lon1) * Math.PI) / 180

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // Distancia en metros
    }

    const filtrarPerfilesPorDistancia = () => {
        const filtrados = perfiles.filter((perfil) => {
            const distancia = calcularDistancia(
                coords.lat,
                coords.lon,
                perfil.latitud,
                perfil.longitud
            )
            perfil.distancia = distancia // Guardamos la distancia para mostrarla
            return distancia <= radio // radio siempre está en metros
        })

        // Ordenar por distancia
        filtrados.sort((a, b) => a.distancia - b.distancia)
        setPerfilesFiltrados(filtrados)
    }

    const obtenerUbicacion = () => {
        if (typeof navigator !== "undefined" && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newCoords = {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    }
                    setCoords(newCoords)
                    setUbicacionObtenida(true)
                    buscarServicios(newCoords.lat, newCoords.lon)
                },
                () => buscarServicios(coords.lat, coords.lon)
            )
        } else {
            buscarServicios(coords.lat, coords.lon)
        }
    }

    const buscarServicios = async (lat, lon) => {
        setLoading(true)
        const api = apiUrl.replace(/\/+$/, "")
        try {
            // Buscar con radio máximo para tener todos los datos
            const res = await fetch(
                `${api}/directorio/buscar/mapa?lat=${lat}&lon=${lon}&radioKm=100`
            )
            if (res.ok) {
                const data = await res.json()
                setPerfiles(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleRadioChange = (e) => {
        let val = parseFloat(e.target.value)
        // El valor del slider siempre viene en la unidad seleccionada
        // Convertir a metros si es necesario
        if (unidad === "km") {
            val = val * 1000
        }
        setRadio(val)
        setValorPersonalizado("")
    }

    const handleUnidadChange = (nuevaUnidad) => {
        if (unidad === "m" && nuevaUnidad === "km") {
            // Convertir de metros a km
            setRadio(radio / 1000)
        } else if (unidad === "km" && nuevaUnidad === "m") {
            // Convertir de km a metros
            setRadio(radio * 1000)
        }
        setUnidad(nuevaUnidad)
    }

    const handleDistanciaRapida = (metros) => {
        setRadio(metros) // Ya viene en metros
        setUnidad(metros >= 1000 ? "km" : "m")
        setValorPersonalizado("")
    }

    const handleValorPersonalizado = (e) => {
        const val = e.target.value
        setValorPersonalizado(val)
        if (val && !isNaN(val)) {
            let metros =
                unidad === "km" ? parseFloat(val) * 1000 : parseInt(val)
            if (metros > 0) {
                setRadio(metros)
            }
        }
    }

    const getZoomLevel = () => {
        const radioKm = radio / 1000 // Convertir a km para el zoom
        if (radioKm <= 0.5) return 15
        if (radioKm <= 1) return 14
        if (radioKm <= 5) return 13
        if (radioKm <= 15) return 12
        if (radioKm <= 30) return 11
        return 10
    }

    const formatearDistancia = (metros) => {
        if (metros < 1000) {
            return `${Math.round(metros)} m`
        } else {
            return `${(metros / 1000).toFixed(1)} km`
        }
    }

    const handleMarkerClick = (perfil, event) => {
        setPerfilSeleccionado(perfil)
        // Posicionar el modal cerca del marcador
        setModalPosition({
            x: event.clientX,
            y: event.clientY,
        })
    }

    const handleCerrarModal = () => {
        setPerfilSeleccionado(null)
        setModalPosition(null)
    }

    const getRadioDisplay = () => {
        // Convertir el radio interno (metros) a la unidad de display
        if (unidad === "km") {
            return radio / 1000
        } else {
            return radio
        }
    }

    const getSliderValue = () => {
        // El slider siempre muestra el valor en la unidad actual
        return getRadioDisplay()
    }

    return (
        <div style={mainContainer}>
            {/* HEADER COMPACTO */}
            <div style={compactHeader}>
                <div style={headerLeft}>
                    <h2 style={compactTitle}>📍 Directorio Regional</h2>
                    {ubicacionObtenida && (
                        <span style={compactBadge}>✓ Ubicación actual</span>
                    )}
                </div>

                <div style={headerRight}>
                    <div style={radiusControls}>
                        {/* Distancias rápidas */}
                        <div style={quickDistances}>
                            {distanciasPredeterminadas.map((dist, idx) => {
                                const valorEnMetros =
                                    dist.unidad === "km"
                                        ? dist.valor * 1000
                                        : dist.valor
                                return (
                                    <button
                                        key={idx}
                                        className="quick-button"
                                        style={{
                                            ...quickButton,
                                            backgroundColor:
                                                Math.abs(
                                                    radio - valorEnMetros
                                                ) < 1
                                                    ? primaryColor
                                                    : "#f1f5f9",
                                            color:
                                                Math.abs(
                                                    radio - valorEnMetros
                                                ) < 1
                                                    ? "white"
                                                    : "#64748b",
                                        }}
                                        onClick={() =>
                                            handleDistanciaRapida(valorEnMetros)
                                        }
                                    >
                                        {dist.valor}
                                        {dist.unidad}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Control de radio */}
                        <div style={radiusSliderContainer}>
                            <div style={radiusInfo}>
                                <span style={radiusLabel}>
                                    Radio: {getRadioDisplay()} {unidad}
                                </span>
                                <div style={unitToggle}>
                                    <button
                                        className="unit-button"
                                        style={{
                                            ...unitButton,
                                            backgroundColor:
                                                unidad === "m"
                                                    ? primaryColor
                                                    : "#e2e8f0",
                                            color:
                                                unidad === "m"
                                                    ? "white"
                                                    : "#64748b",
                                        }}
                                        onClick={() => handleUnidadChange("m")}
                                    >
                                        m
                                    </button>
                                    <button
                                        className="unit-button"
                                        style={{
                                            ...unitButton,
                                            backgroundColor:
                                                unidad === "km"
                                                    ? primaryColor
                                                    : "#e2e8f0",
                                            color:
                                                unidad === "km"
                                                    ? "white"
                                                    : "#64748b",
                                        }}
                                        onClick={() => handleUnidadChange("km")}
                                    >
                                        km
                                    </button>
                                </div>
                            </div>

                            <input
                                type="range"
                                min={unidad === "km" ? "0.1" : "50"}
                                max={unidad === "km" ? "100" : "100000"}
                                step={unidad === "km" ? "0.1" : "50"}
                                value={getSliderValue()}
                                onChange={handleRadioChange}
                                style={{
                                    ...compactSlider,
                                    accentColor: primaryColor,
                                }}
                            />

                            {/* Input personalizado */}
                            <div style={customInputContainer}>
                                <input
                                    type="number"
                                    placeholder="Personalizado"
                                    value={valorPersonalizado}
                                    onChange={handleValorPersonalizado}
                                    min={unidad === "km" ? "0.1" : "50"}
                                    max={unidad === "km" ? "100" : "100000"}
                                    step={unidad === "km" ? "0.1" : "50"}
                                    style={customInput}
                                    className="custom-input"
                                />
                                <span style={inputUnit}>{unidad}</span>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            ...resultsCount,
                            backgroundColor: primaryColor,
                        }}
                    >
                        {loading ? "..." : perfilesFiltrados.length}
                    </div>
                </div>
            </div>

            {/* MAPA */}
            <div
                style={{
                    ...mapWrapper,
                    height: alturaMapa,
                    position: "relative",
                }}
            >
                <Map
                    ref={mapRef}
                    height={alturaMapa}
                    center={[coords.lat, coords.lon]}
                    zoom={getZoomLevel()}
                    provider={(x, y, z) =>
                        `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`
                    }
                >
                    <ZoomControl />

                    {/* Marcador de ubicación actual */}
                    <Marker
                        width={35}
                        anchor={[coords.lat, coords.lon]}
                        color="#3b82f6"
                    />

                    {/* Marcadores de perfiles filtrados */}
                    {perfilesFiltrados.map((p) => (
                        <Overlay
                            key={p.id}
                            anchor={[p.latitud, p.longitud]}
                            offset={[14, 28]}
                        >
                            <div
                                onClick={(e) => handleMarkerClick(p, e)}
                                style={{
                                    cursor: "pointer",
                                    transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                    "scale(1.1)")
                                }
                                onMouseLeave={(e) =>
                                (e.currentTarget.style.transform =
                                    "scale(1)")
                                }
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill={primaryColor}
                                    width="28px"
                                    height="28px"
                                    style={{
                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                    }}
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
                            ...mapModal,
                            left: modalPosition.x - 150,
                            top: modalPosition.y - 200,
                        }}
                    >
                        <div style={modalHeader}>
                            <span
                                style={{
                                    ...modalCategory,
                                    backgroundColor: `${primaryColor}15`,
                                    color: primaryColor,
                                }}
                            >
                                {perfilSeleccionado.rubro || "General"}
                            </span>
                            <button
                                onClick={handleCerrarModal}
                                style={modalClose}
                            >
                                ✕
                            </button>
                        </div>

                        <h3 style={modalTitle}>
                            {perfilSeleccionado.nombrePublico}
                        </h3>

                        <p style={modalDescription}>
                            {perfilSeleccionado.descripcion ||
                                "Sin descripción"}
                        </p>

                        <div style={modalInfo}>
                            <span style={modalDistance}>
                                📍{" "}
                                {formatearDistancia(
                                    perfilSeleccionado.distancia
                                )}{" "}
                                • {perfilSeleccionado.ciudad}
                            </span>
                        </div>

                        <button
                            className="action-button"
                            style={{
                                ...modalButton,
                                backgroundColor: primaryColor,
                            }}
                        >
                            Ver perfil completo
                        </button>
                    </div>
                )}
            </div>

            {/* GRID DE TARJETAS */}
            <div style={scrollContainer}>
                <div style={horizontalGrid}>
                    {perfilesFiltrados.length === 0 && !loading ? (
                        <div style={emptyState}>
                            <span>
                                🔍 No hay resultados en{" "}
                                {formatearDistancia(radio)}
                            </span>
                        </div>
                    ) : (
                        perfilesFiltrados.map((p) => (
                            <div
                                key={p.id}
                                style={horizontalCard}
                                className="horizontal-card"
                            >
                                <div style={cardContent}>
                                    <div style={cardHeader}>
                                        <span
                                            style={{
                                                ...categoryTag,
                                                backgroundColor: `${primaryColor}15`,
                                                color: primaryColor,
                                            }}
                                        >
                                            {p.rubro || "General"}
                                        </span>
                                        <span style={distanceBadge}>
                                            {formatearDistancia(p.distancia)}
                                        </span>
                                    </div>

                                    <h3 style={cardTitle}>
                                        {p.nombrePublico || "Sin nombre"}
                                    </h3>

                                    <p style={cardDesc}>
                                        {p.descripcion
                                            ? p.descripcion.substring(0, 40) +
                                            (p.descripcion.length > 40
                                                ? "..."
                                                : "")
                                            : "Sin descripción"}
                                    </p>

                                    <div style={cardFooter}>
                                        <span style={cityTag}>
                                            📍 {p.ciudad || "Sin ubicación"}
                                        </span>
                                        <button
                                            className="action-button"
                                            style={{
                                                ...actionButton,
                                                backgroundColor: primaryColor,
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
            </div>
        </div>
    )
}

// ESTILOS
const mainContainer = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#f8fafc",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

const compactHeader = {
    padding: "12px 16px",
    background: "white",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexShrink: 0,
    gap: "16px",
}

const headerLeft = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
}

const compactTitle = {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
}

const compactBadge = {
    padding: "2px 8px",
    background: "#10b981",
    color: "white",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "600",
}

const headerRight = {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    flex: 1,
    justifyContent: "flex-end",
}

const radiusControls = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
    maxWidth: "400px",
}

const quickDistances = {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
}

const quickButton = {
    padding: "4px 12px",
    borderRadius: "16px",
    border: "none",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
}

const radiusSliderContainer = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
}

const radiusInfo = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}

const radiusLabel = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
}

const unitToggle = {
    display: "flex",
    gap: "4px",
}

const unitButton = {
    padding: "2px 8px",
    borderRadius: "12px",
    border: "none",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
}

const compactSlider = {
    width: "100%",
    height: "4px",
    borderRadius: "2px",
}

const customInputContainer = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
}

const customInput = {
    flex: 1,
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
    outline: "none",
}

const inputUnit = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
}

const resultsCount = {
    padding: "4px 12px",
    color: "white",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
    minWidth: "50px",
    textAlign: "center",
}

const mapWrapper = {
    width: "100%",
    flexShrink: 0,
    position: "relative",
    backgroundColor: "#e2e8f0",
}

const mapModal = {
    position: "absolute",
    width: "280px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    padding: "16px",
    zIndex: 1000,
    pointerEvents: "auto",
}

const modalHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
}

const modalCategory = {
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
}

const modalClose = {
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
}

const modalTitle = {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
}

const modalDescription = {
    margin: "0 0 12px 0",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
}

const modalInfo = {
    marginBottom: "16px",
}

const modalDistance = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
}

const modalButton = {
    width: "100%",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
}

const scrollContainer = {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "16px",
    background: "#f8fafc",
}

const horizontalGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
}

const horizontalCard = {
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
    cursor: "pointer",
}

const cardContent = {
    padding: "14px",
}

const cardHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
}

const categoryTag = {
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
}

const distanceBadge = {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "12px",
}

const cardTitle = {
    margin: "0 0 6px 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: "1.3",
}

const cardDesc = {
    margin: "0 0 12px 0",
    fontSize: "12px",
    color: "#64748b",
    lineHeight: "1.4",
}

const cardFooter = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}

const cityTag = {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "500",
}

const actionButton = {
    padding: "5px 14px",
    borderRadius: "6px",
    border: "none",
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
}

const emptyState = {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b",
    fontSize: "14px",
}

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
        title: "Alto del Mapa",
        defaultValue: 300,
        min: 200,
        max: 500,
    },
    distanciasPredeterminadas: {
        type: ControlType.Array,
        title: "Distancias Rápidas",
        control: {
            type: ControlType.Object,
            controls: {
                valor: { type: ControlType.Number, title: "Valor" },
                unidad: {
                    type: ControlType.Enum,
                    title: "Unidad",
                    options: ["m", "km"],
                    defaultValue: "km",
                },
            },
        },
        defaultValue: [
            { valor: 200, unidad: "m" },
            { valor: 1, unidad: "km" },
            { valor: 5, unidad: "km" },
            { valor: 10, unidad: "km" },
            { valor: 25, unidad: "km" },
        ],
    },
})
