import React, { useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * COMPONENTE DE CREACIÓN DE PERFIL (PROVEEDOR)
 * -------------------------------------------
 * Este formulario captura los datos profesionales y dirección.
 * El backend se encarga del Geocoding automáticamente via Nominatim.
 */

export default function FormularioPerfilProveedor(props) {
    const { apiUrl, btnColor, btnText, textColor, borderRadius } = props
    
    // El usuarioId debería venir del estado global o una prop tras el login
    const [usuarioId, setUsuarioId] = useState("") 
    
    const [fields, setFields] = useState({
        rubroId: "", // UUID del rubro
        descripcion: "",
        dni: "",
        pais: "Argentina",
        provincia: "",
        ciudad: "",
        calle: "",
        numero: "",
        codigoPostal: ""
    })
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => setFields({ ...fields, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Limpieza de URL para evitar dobles barras
        const cleanApiUrl = apiUrl.replace(/\/+$/, "")
        const fullUrl = `${cleanApiUrl}/perfiles/proveedor/${usuarioId}`
        
        console.log("🚀 Llamando a:", fullUrl)

        try {
            // Nota: El usuarioId en producción debería obtenerse del token JWT
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
            })

            const data = await response.json()
            console.log("📦 Respuesta:", data)
            if (!response.ok) throw new Error(data.mensaje || "Error al crear perfil")

            alert("¡Perfil de Proveedor creado! Ahora apareces en el mapa.")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h3 style={{color: 'white', margin: '0 0 10px 0'}}>Completar Perfil Profesional</h3>
                
                <input name="usuarioId" placeholder="ID de Usuario (Tras Login)" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} style={inputStyle} required />
                
                <div style={rowStyle}>
                    <input name="dni" placeholder="DNI" onChange={handleChange} style={inputStyle} required />
                    <input name="rubroId" placeholder="ID del Rubro (UUID)" onChange={handleChange} style={inputStyle} required />
                </div>
                
                <textarea name="descripcion" placeholder="Cuentanos sobre tu experiencia..." onChange={handleChange} style={{...inputStyle, height: '80px'}} required />
                
                <h4 style={{color: '#888', margin: '10px 0 5px 0'}}>Dirección para el Mapa</h4>
                <div style={rowStyle}>
                    <input name="calle" placeholder="Calle" onChange={handleChange} style={inputStyle} required />
                    <input name="numero" placeholder="Altura" type="number" onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={rowStyle}>
                    <input name="ciudad" placeholder="Ciudad" onChange={handleChange} style={inputStyle} required />
                    <input name="provincia" placeholder="Provincia" onChange={handleChange} style={inputStyle} required />
                </div>
                
                {error && <p style={errorStyle}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{ 
                        ...buttonStyle, 
                        backgroundColor: btnColor, 
                        color: textColor,
                        borderRadius: `${borderRadius}px`
                    }}
                >
                    {loading ? "Geolocalizando..." : btnText}
                </button>
            </form>
        </div>
    )
}

addPropertyControls(FormularioPerfilProveedor, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-backend.onrender.com/api/v1" },
    btnText: { type: ControlType.String, title: "Texto", defaultValue: "Publicar Mi Perfil" },
    btnColor: { type: ControlType.Color, title: "Color", defaultValue: "#3b82f6" },
    textColor: { type: ControlType.Color, title: "Color Texto", defaultValue: "#FFFFFF" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 8 }
})

const containerStyle = { width: "100%", height: "100%", overflowY: "auto" }
const formStyle = { display: "flex", flexDirection: "column", gap: "8px", padding: "15px", background: "#111", borderRadius: '12px' }
const rowStyle = { display: "flex", gap: "8px" }
const inputStyle = { flex: 1, padding: "10px", border: "1px solid #333", background: "#000", color: "white", borderRadius: '6px' }
const buttonStyle = { padding: "14px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: '10px' }
const errorStyle = { color: "#ff4d4d", fontSize: "12px", textAlign: "center" }
