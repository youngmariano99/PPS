import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
// Importamos Leaflet y React-Leaflet desde la CDN (Compatible con Framer)
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    CircleMarker,
} from "https://esm.sh/react-leaflet@4.2.1?external=react,react-dom"
import L from "https://esm.sh/leaflet@1.9.4"

/**
 * MAPA INTERACTIVO DE SERVICIOS (Sprint 2)
 * --------------------------------------------
 * Renderiza los proveedores cercanos en un mapa de OpenStreetMap usando Leaflet.
 */

// Inyectamos el CSS de Leaflet necesario para que el mapa no se vea roto en Framer
const injectLeafletCSS = () => {
    if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
    }
}

// Configuramos los íconos (Leaflet a veces pierde la ruta de las imágenes por CDN)
const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

export default function MapaDirectorio(props) {
    const { apiUrl, primaryColor, radioPorDefecto } = props

    const [perfiles, setPerfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [radio, setRadio] = useState(radioPorDefecto)
    const [coords, setCoords] = useState(null) // { lat, lon }

    useEffect(() => {
        injectLeafletCSS()

        // Coordenadas por defecto (Centro de Coronel Pringles) para cuando el GPS falla o estamos en Framer
        const fallbackCoords = { lat: -37.9822, lon: -61.3541 }

        const usarFallback = () => {
            setCoords(fallbackCoords)
            buscarServicios(fallbackCoords.lat, fallbackCoords.lon, radio)
        }

        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const newCoords = {
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude,
                        }
                        setCoords(newCoords)
                        buscarServicios(newCoords.lat, newCoords.lon, radio)
                    },
                    (err) => {
                        console.warn(
                            "GPS denegado o bloqueado. Usando fallback.",
                            err
                        )
                        usarFallback()
                    },
                    { timeout: 5000 } // Si tarda más de 5 segs, forzamos el fallback
                )
            } else {
                usarFallback()
            }
        } catch (error) {
            // Atrapa el bloqueo estricto del iframe de Framer
            console.warn(
                "Política de seguridad bloqueó el GPS. Usando fallback."
            )
            usarFallback()
        }
    }, [])

    const buscarServicios = async (lat, lon, r) => {
        setLoading(true)
        setError(null)

        const cleanApiUrl = apiUrl.replace(/\/+$/, "")
        const fullUrl = `${cleanApiUrl}/directorio/buscar?lat=${lat}&lon=${lon}&radioKm=${r}`

        try {
            const response = await fetch(fullUrl)
            const data = await response.json()
            if (!response.ok)
                throw new Error("Error al buscar servicios en el mapa")
            setPerfiles(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRadioChange = (e) => {
        const val = e.target.value
        setRadio(val)
        if (coords) buscarServicios(coords.lat, coords.lon, val)
    }

    if (error) {
        return (
            <div style={centerStyle}>
                <p style={{ color: "red" }}>{error}</p>
            </div>
        )
    }

    if (loading && !coords) {
        return (
            <div style={centerStyle}>
                <p>📍 Buscando tu ubicación para armar el mapa...</p>
            </div>
        )
    }

    return (
        <div style={containerStyle}>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />
            {/* Buscador Superior Flotante */}
            <div style={topBarStyle}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#333" }}>
                        Radio de búsqueda: {radio} km
                    </h3>
                    <span
                        style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: primaryColor,
                        }}
                    >
                        {loading
                            ? "Buscando..."
                            : `${perfiles.length} resultados`}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="100"
                    value={radio}
                    onChange={handleRadioChange}
                    style={{
                        accentColor: primaryColor,
                        width: "100%",
                        marginTop: "10px",
                    }}
                />
            </div>

            {/* MAPA DE LEAFLET */}
            {coords && (
                <div style={mapWrapperStyle}>
                    <MapContainer
                        center={[coords.lat, coords.lon]}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* 1. EL CÍRCULO DINÁMICO (Tu zona de búsqueda) */}
                        {/* Multiplicamos el radio por 1000 porque Leaflet mide en metros */}
                        <Circle
                            center={[coords.lat, coords.lon]}
                            pathOptions={{
                                fillColor: "#3b82f6",
                                color: "#3b82f6",
                                fillOpacity: 0.1,
                                weight: 1,
                            }}
                            radius={radio * 1000}
                        />

                        {/* 2. TU UBICACIÓN EXACTA (Un punto rojo para diferenciarte) */}
                        <CircleMarker
                            center={[coords.lat, coords.lon]}
                            radius={6}
                            pathOptions={{
                                fillColor: "#ef4444",
                                color: "white",
                                weight: 2,
                                fillOpacity: 1,
                            }}
                        >
                            <Popup>Estás aquí</Popup>
                        </CircleMarker>

                        {/* 3. Pines de los Proveedores / Empresas */}
                        {perfiles.map((perfil) => {
                            if (perfil.latitud && perfil.longitud) {
                                return (
                                    <Marker
                                        key={perfil.id}
                                        position={[
                                            perfil.latitud,
                                            perfil.longitud,
                                        ]}
                                        icon={defaultIcon}
                                    >
                                        <Popup>
                                            <div
                                                style={{
                                                    padding: "5px",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <strong
                                                    style={{
                                                        display: "block",
                                                        fontSize: "14px",
                                                        color: primaryColor,
                                                    }}
                                                >
                                                    {perfil.nombrePublico}
                                                </strong>
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#666",
                                                    }}
                                                >
                                                    {perfil.rubro}
                                                </span>
                                                <p
                                                    style={{
                                                        fontSize: "12px",
                                                        margin: "8px 0",
                                                    }}
                                                >
                                                    {perfil.descripcion}
                                                </p>
                                                <button style={btnPopup}>
                                                    Ver Contacto
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            }
                            return null
                        })}
                    </MapContainer>
                </div>
            )}
        </div>
    )
}

addPropertyControls(MapaDirectorio, {
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Principal",
        defaultValue: "#3b82f6",
    },
    radioPorDefecto: {
        type: ControlType.Number,
        title: "Radio (km)",
        defaultValue: 15,
        min: 1,
        max: 200,
    },
})

// Estilos
const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "500px",
    minWidth: "300px",
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#e5e5e5",
}

const mapWrapperStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
}

const topBarStyle = {
    position: "absolute",
    top: "15px",
    left: "15px",
    right: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
}

const centerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
}

// ESTA ES LA LÍNEA QUE FALTABA
const btnPopup = {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "bold",
    marginTop: "10px",
}
