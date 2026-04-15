import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * WIZARD DE ONBOARDING - FRAMER (Version 2.1)
 * -------------------------------------------
 * - Fix: Layout de ubicación (3 columnas).
 * - Add: Matrícula y CV (Opcionales).
 * - Fix: Eliminación de bucle JSON PostGIS.
 */

export default function WizardOnboarding(props) {
    const { apiUrl, primaryColor, cardBg, textColor, borderRadius } = props

    const [step, setStep] = useState(1)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [usuarioId, setUsuarioId] = useState(null)
    const [rubros, setRubros] = useState([])
    const [showCustom, setShowCustom] = useState(false)

    const [formData, setFormData] = useState({
        email: "", password: "", nombre: "", apellido: "", telefono: "",
        rubroId: "", rubroPersonalizado: "", descripcion: "",
        pais: "Argentina", provincia: "", ciudad: "", calle: "", numero: "", codigoPostal: "",
        dni: "", razonSocial: "", cuit: "", matricula: "", cvUrlPdf: ""
    })

    useEffect(() => {
        if (step === 3) {
            const fetchRubros = async () => {
                const cleanApiUrl = apiUrl.replace(/\/+$/, "")
                try {
                    const res = await fetch(`${cleanApiUrl}/rubros`)
                    if (res.ok) {
                        const data = await res.json()
                        setRubros(data)
                    }
                } catch (e) {
                    console.error("Error cargando rubros", e)
                }
            }
            fetchRubros()
        }
    }, [step, apiUrl])

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === "rubroId") {
            if (value === "OTRO") {
                setShowCustom(true)
                setFormData({ ...formData, rubroId: null })
            } else {
                setShowCustom(false)
                setFormData({ ...formData, rubroId: value, rubroPersonalizado: "" })
            }
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const submitCuentaBase = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const cleanApiUrl = apiUrl.replace(/\/+$/, "")
        try {
            const response = await fetch(`${cleanApiUrl}/auth/registro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email, password: formData.password,
                    nombre: formData.nombre, apellido: formData.apellido, telefono: formData.telefono,
                }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.mensaje || "Error en el registro")
            setUsuarioId(data.id || data.usuarioId)
            if (role === "CLIENTE") setSuccess(true)
            else setStep(3)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    const submitPerfil = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const cleanApiUrl = apiUrl.replace(/\/+$/, "")
        const endpoint = role === "PROVEEDOR" ? "proveedor" : "empresa"
        
        const payload = {
            rubroId: formData.rubroId || null,
            rubroPersonalizado: showCustom ? formData.rubroPersonalizado : null,
            descripcion: formData.descripcion,
            pais: formData.pais, provincia: formData.provincia, ciudad: formData.ciudad, 
            calle: formData.calle, numero: parseInt(formData.numero), codigoPostal: parseInt(formData.codigoPostal),
            matricula: formData.matricula || null,
            cvUrlPdf: formData.cvUrlPdf || null,
            ...(role === "PROVEEDOR" 
                ? { dni: formData.dni } 
                : { razonSocial: formData.razonSocial, cuit: formData.cuit })
        }

        try {
            const response = await fetch(`${cleanApiUrl}/perfiles/${endpoint}/${usuarioId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.mensaje || "Error al crear perfil")
            }
            setSuccess(true)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    if (success) {
        return (
            <div style={containerStyle}>
                <div style={{ ...cardStyle, backgroundColor: cardBg, textAlign: "center" }}>
                    <h2 style={{ color: primaryColor }}>¡Éxito! 🎉</h2>
                    <p style={{ color: textColor }}>Tu perfil ha sido creado correctamente.</p>
                    <button style={{ ...buttonStyle, backgroundColor: primaryColor }} onClick={() => window.location.reload()}>Finalizar</button>
                </div>
            </div>
        )
    }

    return (
        <div style={containerStyle}>
            <div style={{ ...cardStyle, backgroundColor: cardBg, borderRadius: `${borderRadius}px` }}>
                {step === 1 && (
                    <div style={fadeStyle}>
                        <h3 style={{ color: textColor, textAlign: "center" }}>Selecciona tu Perfil</h3>
                        <button style={{ ...roleButtonStyle, backgroundColor: primaryColor }} onClick={() => { setRole("CLIENTE"); setStep(2) }}>🔍 Buscar Servicios</button>
                        <button style={{ ...roleButtonStyle, backgroundColor: "#3b82f6" }} onClick={() => { setRole("PROVEEDOR"); setStep(2) }}>💼 Soy Profesional</button>
                        <button style={{ ...roleButtonStyle, backgroundColor: "#a855f7" }} onClick={() => { setRole("EMPRESA"); setStep(2) }}>🏢 Somos Empresa</button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={submitCuentaBase} style={fadeStyle}>
                        <h3 style={{ color: textColor }}>Paso 1: Tu Cuenta</h3>
                        <div style={gridRow(2)}>
                            <input name="nombre" placeholder="Nombre" onChange={handleChange} style={inputStyle} required />
                            <input name="apellido" placeholder="Apellido" onChange={handleChange} style={inputStyle} required />
                        </div>
                        <input name="email" type="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
                        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} style={inputStyle} required />
                        <input name="telefono" placeholder="WhatsApp" onChange={handleChange} style={inputStyle} required />
                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor }}>{loading ? "Cargando..." : "Siguiente"}</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={submitPerfil} style={fadeStyle}>
                        <h3 style={{ color: textColor, margin: 0 }}>Paso 2: Perfil Público</h3>
                        
                        <select name="rubroId" onChange={handleChange} style={selectStyle} required={!showCustom}>
                            <option value="">Selecciona tu rubro...</option>
                            {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            <option value="OTRO">+ Otro (Ingresar manual)</option>
                        </select>
                        {showCustom && <input name="rubroPersonalizado" placeholder="¿Cuál es tu especialidad?" onChange={handleChange} style={{...inputStyle, border: `1px solid ${primaryColor}`}} required />}

                        {role === "PROVEEDOR" ? (
                            <input name="dni" placeholder="DNI" onChange={handleChange} style={inputStyle} required />
                        ) : (
                            <>
                                <input name="razonSocial" placeholder="Nombre de la Empresa" onChange={handleChange} style={inputStyle} required />
                                <input name="cuit" placeholder="CUIT" onChange={handleChange} style={inputStyle} required />
                            </>
                        )}

                        {role === "PROVEEDOR" && (
                            <div style={gridRow(2)}>
                                <input name="matricula" placeholder="Matrícula (Op)" onChange={handleChange} style={inputStyle} />
                                <input name="cvUrlPdf" placeholder="Link CV/Portfolio (Op)" onChange={handleChange} style={inputStyle} />
                            </div>
                        )}

                        <textarea name="descripcion" placeholder="Descripción breve..." onChange={handleChange} style={{ ...inputStyle, height: "60px" }} required />
                        
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>Ubicación para el Mapa</div>
                        <div style={gridRow(2)}>
                            <input name="calle" placeholder="Calle" onChange={handleChange} style={inputStyle} required />
                            <input name="numero" placeholder="N°" type="number" onChange={handleChange} style={inputStyle} required />
                        </div>
                        <div style={gridRow(3)}>
                            <input name="ciudad" placeholder="Ciudad" onChange={handleChange} style={inputStyle} required />
                            <input name="provincia" placeholder="Provincia" onChange={handleChange} style={inputStyle} required />
                            <input name="codigoPostal" placeholder="CP" type="number" onChange={handleChange} style={inputStyle} required />
                        </div>

                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor }}>{loading ? "Geolocalizando..." : "Finalizar"}</button>
                    </form>
                )}
            </div>
        </div>
    )
}

addPropertyControls(WizardOnboarding, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    primaryColor: { type: ControlType.Color, title: "Acento", defaultValue: "#7c3aed" },
    cardBg: { type: ControlType.Color, title: "Fondo", defaultValue: "#ffffff" },
    textColor: { type: ControlType.Color, title: "Texto", defaultValue: "#000000" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 16 },
})

// ESTILOS DINÁMICOS
const gridRow = (cols) => ({ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "10px", width: "100%" })

const containerStyle = { width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", boxSizing: "border-box", overflowY: "auto" }
const cardStyle = { width: "100%", maxWidth: "450px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", boxSizing: "border-box" }
const fadeStyle = { display: "flex", flexDirection: "column", gap: "12px", width: "100%" }
const inputStyle = { padding: "12px", border: "1px solid #ddd", background: "#fff", color: "#000", borderRadius: "8px", fontSize: "13px", width: "100%", boxSizing: "border-box" }
const selectStyle = { ...inputStyle, appearance: "auto" }
const buttonStyle = { padding: "14px", border: "none", fontWeight: "bold", cursor: "pointer", color: "white", borderRadius: "8px", width: "100%" }
const roleButtonStyle = { ...buttonStyle, fontSize: "15px" }
const errorStyle = { color: "#ef4444", fontSize: "12px", textAlign: "center" }
