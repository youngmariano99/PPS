import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * BUSCADOR DE SERVICIOS GEOLOCALIZADO (Sprint 2)
 * --------------------------------------------
 * Este componente conecta con el DirectorioService (PostGIS).
 * Branding: Violeta #7c3aed | Neutros #f8fafc
 */

export default function BuscadorMapa(props) {
    const { apiUrl, primaryColor, cardBg, radioPorDefecto } = props
    
    const [perfiles, setPerfiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [radio, setRadio] = useState(radioPorDefecto)
    const [coords, setCoords] = useState({ lat: null, lon: null })

    // Paso 1: Obtener ubicación del usuario al cargar
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
                    setCoords(newCoords)
                    buscarServicios(newCoords.lat, newCoords.lon, radio)
                },
                (err) => {
                    setError("No pudimos acceder a tu ubicación. Activa el GPS.")
                }
            )
        }
    }, [])

    const buscarServicios = async (lat, lon, r) => {
        setLoading(true)
        setError(null)

        // Limpieza de URL para evitar dobles barras
        const cleanApiUrl = apiUrl.replace(/\/+$/, "")
        const fullUrl = `${cleanApiUrl}/directorio/buscar?lat=${lat}&lon=${lon}&radioKm=${r}`
        
        console.log("🚀 Llamando a Buscador:", fullUrl)

        try {
            const response = await fetch(fullUrl)
            const data = await response.json()
            console.log("📦 Respuesta:", data)
            if (!response.ok) throw new Error("Error al buscar servicios")
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
        if (coords.lat) buscarServicios(coords.lat, coords.lon, val)
    }

    return (
        <div style={{...containerStyle, backgroundColor: "#f8fafc"}}>
            {/* Cabecera / Buscador */}
            <div style={headerStyle}>
                <h2 style={titleStyle}>Servicios Cercanos</h2>
                <div style={filterBar}>
                    <label style={labelStyle}>Radio de búsqueda: {radio} km</label>
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={radio} 
                        onChange={handleRadioChange}
                        style={{ accentColor: primaryColor, width: "100%" }}
                    />
                </div>
            </div>

            {/* Listado de Resultados */}
            <div style={listStyle}>
                {loading && <p style={statusStyle}>Buscando talentos cerca de ti...</p>}
                {error && <p style={{...statusStyle, color: "#ef4444"}}>{error}</p>}
                
                {!loading && perfiles.length === 0 && !error && (
                    <p style={statusStyle}>No hay servicios en este radio. Prueba ampliando la zona.</p>
                )}

                {perfiles.map((perfil) => (
                    <div key={perfil.id} style={{...cardStyle, backgroundColor: cardBg}}>
                        <div style={cardHeader}>
                            <span style={{...tagStyle, backgroundColor: `${primaryColor}22`, color: primaryColor}}>
                                {perfil.rubro}
                            </span>
                            <span style={distanceStyle}>{perfil.tipo}</span>
                        </div>
                        <h3 style={nameStyle}>{perfil.nombrePublico}</h3>
                        <p style={descStyle}>{perfil.descripcion}</p>
                        <div style={footerStyle}>
                            <span style={cityStyle}>📍 {perfil.ciudad}</span>
                            <button style={{...btnSmall, backgroundColor: primaryColor}}>Ver Perfil</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Configuración de Controles en Framer
addPropertyControls(BuscadorMapa, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-backend.onrender.com/api/v1" },
    primaryColor: { type: ControlType.Color, title: "Acento", defaultValue: "#7c3aed" },
    cardBg: { type: ControlType.Color, title: "Fondo Card", defaultValue: "#ffffff" },
    radioPorDefecto: { type: ControlType.Number, title: "Radio (km)", defaultValue: 10, min: 1, max: 200 }
})

// Estilos Lineales (Branding Estricto)
const containerStyle = { width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }
const headerStyle = { padding: "20px", borderBottom: "1px solid #e5e7eb", background: "white" }
const titleStyle = { margin: "0 0 15px 0", fontSize: "20px", fontWeight: "800", color: "#000" }
const filterBar = { display: "flex", flexDirection: "column", gap: "8px" }
const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#64748b" }
const listStyle = { flex: 1, overflowY: "auto", padding: "15px", display: "flex", flexDirection: "column", gap: "15px" }
const cardStyle = { padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }
const cardHeader = { display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }
const tagStyle = { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }
const nameStyle = { margin: "0 0 5px 0", fontSize: "16px", fontWeight: "700", color: "#0f172a" }
const descStyle = { margin: "0 0 12px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }
const footerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }
const cityStyle = { fontSize: "12px", color: "#94a3b8" }
const distanceStyle = { fontSize: "11px", fontWeight: "bold", color: "#94a3b8" }
const btnSmall = { padding: "6px 12px", borderRadius: "6px", border: "none", color: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer" }
const statusStyle = { textAlign: "center", color: "#64748b", fontSize: "14px", marginTop: "20px" }
