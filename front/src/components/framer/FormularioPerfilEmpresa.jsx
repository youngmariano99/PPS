import React, { useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * COMPONENTE DE CREACIÓN DE PERFIL (EMPRESA)
 * -------------------------------------------
 * Formulario para empresas que buscan ofrecer servicios o contratar.
 */

export default function FormularioPerfilEmpresa(props) {
    const { apiUrl, btnColor, btnText, textColor, borderRadius } = props
    const [usuarioId, setUsuarioId] = useState("") 
    
    const [fields, setFields] = useState({
        rubroId: "",
        descripcion: "",
        razonSocial: "",
        cuit: "",
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

        try {
            const response = await fetch(`${apiUrl}/perfiles/empresa/${usuarioId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.mensaje || "Error al crear perfil")

            alert("¡Perfil de Empresa creado con éxito!")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <h3 style={{color: 'white', margin: '0 0 10px 0'}}>Registro de Empresa</h3>
                
                <input name="usuarioId" placeholder="ID de Usuario" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} style={inputStyle} required />
                <input name="razonSocial" placeholder="Razón Social" onChange={handleChange} style={inputStyle} required />
                <input name="cuit" placeholder="CUIT (Sin guiones)" onChange={handleChange} style={inputStyle} required />
                <input name="rubroId" placeholder="ID del Rubro Laboral" onChange={handleChange} style={inputStyle} required />
                
                <textarea name="descripcion" placeholder="Descripción de la empresa..." onChange={handleChange} style={{...inputStyle, height: '60px'}} required />
                
                <h4 style={{color: '#888', margin: '10px 0 5px 0'}}>Ubicación Principal</h4>
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
                    {loading ? "Registrando..." : btnText}
                </button>
            </form>
        </div>
    )
}

addPropertyControls(FormularioPerfilEmpresa, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-backend.onrender.com/api/v1" },
    btnText: { type: ControlType.String, title: "Texto", defaultValue: "Dar de Alta Empresa" },
    btnColor: { type: ControlType.Color, title: "Color", defaultValue: "#a855f7" },
    textColor: { type: ControlType.Color, title: "Color Texto", defaultValue: "#FFFFFF" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 8 }
})

const containerStyle = { width: "100%", height: "100%", overflowY: "auto" }
const formStyle = { display: "flex", flexDirection: "column", gap: "8px", padding: "15px", background: "#111", borderRadius: '12px' }
const rowStyle = { display: "flex", gap: "8px" }
const inputStyle = { flex: 1, padding: "10px", border: "1px solid #333", background: "#000", color: "white", borderRadius: '6px' }
const buttonStyle = { padding: "14px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: '10px' }
const errorStyle = { color: "#ff4d4d", fontSize: "12px", textAlign: "center" }
