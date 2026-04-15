import React, { useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * COMPONENTE DE REGISTRO PARA FRAMER
 * ---------------------------------
 * Crea un nuevo usuario en el sistema. 
 */

export default function FormularioRegistro(props) {
    const { apiUrl, btnColor, btnText, textColor, borderRadius } = props
    const [fields, setFields] = useState({ 
        email: "", 
        password: "", 
        nombre: "", 
        apellido: "", 
        telefono: "" 
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
        const fullUrl = `${cleanApiUrl}/auth/registro`
        
        console.log("🚀 Llamando a Registro:", fullUrl)

        try {
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
            })

            const data = await response.json()
            console.log("📦 Respuesta:", data)
            if (!response.ok) throw new Error(data.mensaje || "Error al crear cuenta")

            alert("¡Cuenta creada! Revisa tu email si la confirmación está activa, o inicia sesión directamente.")
            if (props.onRegisterSuccess) props.onRegisterSuccess(data)
            
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={rowStyle}>
                    <input name="nombre" placeholder="Nombre" onChange={handleChange} style={{...inputStyle, borderRadius: `${borderRadius}px`}} required />
                    <input name="apellido" placeholder="Apellido" onChange={handleChange} style={{...inputStyle, borderRadius: `${borderRadius}px`}} required />
                </div>
                <input name="email" type="email" placeholder="Correo Electrónico" onChange={handleChange} style={{...inputStyle, borderRadius: `${borderRadius}px`}} required />
                <input name="password" type="password" placeholder="Contraseña Segura" onChange={handleChange} style={{...inputStyle, borderRadius: `${borderRadius}px`}} required />
                <input name="telefono" placeholder="Teléfono (+54...)" onChange={handleChange} style={{...inputStyle, borderRadius: `${borderRadius}px`}} required />
                
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
                    {loading ? "Creando..." : btnText}
                </button>
            </form>
        </div>
    )
}

addPropertyControls(FormularioRegistro, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    btnText: { type: ControlType.String, title: "Texto", defaultValue: "Crear Cuenta" },
    btnColor: { type: ControlType.Color, title: "Color Fondo", defaultValue: "#22c55e" },
    textColor: { type: ControlType.Color, title: "Color Texto", defaultValue: "#FFFFFF" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 8 }
})

const containerStyle = { width: "100%", height: "100%" }
const formStyle = { display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }
const rowStyle = { display: "flex", gap: "10px" }
const inputStyle = { flex: 1, padding: "12px", border: "1px solid #333", background: "#000", color: "white" }
const buttonStyle = { padding: "14px", border: "none", fontWeight: "bold", cursor: "pointer" }
const errorStyle = { color: "#ff4d4d", fontSize: "12px", textAlign: "center" }
