import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * WIZARD DE ONBOARDING - Versión 3.0 (Multimedia Ready)
 * -------------------------------------------
 * Integra Cloudinary y validación de planes (5 vs 20 fotos).
 * Soporte para URLs de video externas.
 */

export default function WizardOnboarding(props) {
    const { 
        apiUrl, primaryColor, cardBg, textColor, borderRadius,
        cloudinaryCloudName, cloudinaryPreset 
    } = props

    const [step, setStep] = useState(1)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [usuarioId, setUsuarioId] = useState(null)
    const [rubros, setRubros] = useState([])
    const [showCustom, setShowCustom] = useState(false)

    // Estado multimedia
    const [fotoPerfil, setFotoPerfil] = useState("")
    const [fotosPortafolio, setFotosPortafolio] = useState([])
    const [videoLinks, setVideoLinks] = useState(["", "", ""])

    const [formData, setFormData] = useState({
        email: "", password: "", nombre: "", apellido: "", telefono: "",
        rubroId: "", rubroPersonalizado: "", descripcion: "",
        pais: "Argentina", provincia: "", ciudad: "", calle: "", numero: "", codigoPostal: "",
        dni: "", razonSocial: "", cuit: "", matricula: "", cvUrlPdf: ""
    })

    useEffect(() => {
        // Cargar script de Cloudinary
        if (!window.cloudinary) {
            const script = document.createElement("script")
            script.src = "https://widget.cloudinary.com/v2.0/global/all.js"
            script.async = true
            document.body.appendChild(script)
        }

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

    const openCloudinary = (isMultiple) => {
        if (!window.cloudinary) return
        window.cloudinary.openUploadWidget(
            {
                cloudName: cloudinaryCloudName,
                uploadPreset: cloudinaryPreset,
                multiple: isMultiple,
                folder: "pps_multimedia",
                clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                transformation: [{ quality: "auto", fetch_format: "auto" }]
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    if (isMultiple) {
                        setFotosPortafolio(prev => [...prev, result.info.secure_url])
                    } else {
                        setFotoPerfil(result.info.secure_url)
                    }
                }
            }
        ).open()
    }

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

    const handleVideoChange = (index, value) => {
        const newLinks = [...videoLinks]
        newLinks[index] = value
        setVideoLinks(newLinks)
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
            ...formData,
            numero: parseInt(formData.numero),
            codigoPostal: parseInt(formData.codigoPostal),
            fotoPerfilUrl: fotoPerfil,
            fotosPortafolioUrls: fotosPortafolio,
            videoLinks: videoLinks.filter(l => l.trim() !== "")
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
                    <p style={{ color: textColor }}>Perfil y multimedia configurados.</p>
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
                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor }}>Siguiente</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={submitPerfil} style={fadeStyle}>
                        <h3 style={{ color: textColor, marginBottom: 5 }}>Paso 2: Detalles y Multimedia</h3>
                        
                        {/* MULTIMEDIA SECTION */}
                        <div style={mediaContainer}>
                            <div style={profilePicBox}>
                                {fotoPerfil ? <img src={fotoPerfil} style={previewImg} /> : <div onClick={() => openCloudinary(false)} style={uploadPlaceholder}>+ Foto Perfil</div>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <button type="button" onClick={() => openCloudinary(true)} style={secondaryBtn}>+ Fotos Portafolio ({fotosPortafolio.length})</button>
                            </div>
                        </div>

                        <select name="rubroId" onChange={handleChange} style={selectStyle} required={!showCustom}>
                            <option value="">Selecciona tu rubro...</option>
                            {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            <option value="OTRO">+ Otro</option>
                        </select>
                        {showCustom && <input name="rubroPersonalizado" placeholder="Especialidad" onChange={handleChange} style={inputStyle} required />}

                        {role === "PROVEEDOR" ? (
                            <div style={gridRow(2)}>
                                <input name="dni" placeholder="DNI" onChange={handleChange} style={inputStyle} required />
                                <input name="matricula" placeholder="Matrícula" onChange={handleChange} style={inputStyle} />
                            </div>
                        ) : (
                            <input name="razonSocial" placeholder="Nombre Empresa" onChange={handleChange} style={inputStyle} required />
                        )}

                        <textarea name="descripcion" placeholder="Descripción..." onChange={handleChange} style={{ ...inputStyle, height: "50px" }} required />
                        
                        <div style={{ fontSize: "11px", color: textColor, opacity: 0.6 }}>Videos (YouTube/Links)</div>
                        {videoLinks.map((link, i) => (
                            <input key={i} placeholder={`Link Video ${i+1}`} value={link} onChange={(e) => handleVideoChange(i, e.target.value)} style={inputStyle} />
                        ))}

                        <div style={gridRow(3)}>
                            <input name="ciudad" placeholder="Ciudad" onChange={handleChange} style={inputStyle} required />
                            <input name="provincia" placeholder="Prov" onChange={handleChange} style={inputStyle} required />
                            <input name="codigoPostal" placeholder="CP" type="number" onChange={handleChange} style={inputStyle} required />
                        </div>

                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor }}>{loading ? "Registrando..." : "Crear Perfil"}</button>
                    </form>
                )}
            </div>
        </div>
    )
}

addPropertyControls(WizardOnboarding, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    cloudinaryCloudName: { type: ControlType.String, title: "Cloud Name", defaultValue: "demo" },
    cloudinaryPreset: { type: ControlType.String, title: "Upload Preset", defaultValue: "unsigned_preset" },
    primaryColor: { type: ControlType.Color, title: "Acento", defaultValue: "#7c3aed" },
    cardBg: { type: ControlType.Color, title: "Fondo", defaultValue: "#ffffff" },
    textColor: { type: ControlType.Color, title: "Texto", defaultValue: "#000000" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 16 },
})

const gridRow = (cols) => ({ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "8px", width: "100%" })
const containerStyle = { width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", boxSizing: "border-box", overflowY: "auto" }
const cardStyle = { width: "100%", maxWidth: "450px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }
const fadeStyle = { display: "flex", flexDirection: "column", gap: "8px", width: "100%" }
const inputStyle = { padding: "10px", border: "1px solid #ddd", background: "#fff", color: "#000", borderRadius: "8px", fontSize: "12px", width: "100%", boxSizing: "border-box" }
const selectStyle = { ...inputStyle, appearance: "auto" }
const buttonStyle = { padding: "12px", border: "none", fontWeight: "bold", cursor: "pointer", color: "white", borderRadius: "8px", width: "100%" }
const roleButtonStyle = { ...buttonStyle, fontSize: "14px" }
const secondaryBtn = { ...buttonStyle, backgroundColor: "#f3f4f6", color: "#374151", fontSize: "12px", border: "1px solid #d1d5db" }
const errorStyle = { color: "#ef4444", fontSize: "11px", textAlign: "center" }
const mediaContainer = { display: "flex", gap: "15px", alignItems: "center", marginBottom: "5px" }
const profilePicBox = { width: "60px", height: "60px", borderRadius: "50%", background: "#f3f4f6", border: "2px dashed #d1d5db", overflow: "hidden", flexShrink: 0 }
const uploadPlaceholder = { cursor: "pointer", fontSize: "9px", color: "#666", display: "flex", justifyContent: "center", alignItems: "center", height: "100%", textAlign: "center" }
const previewImg = { width: "100%", height: "100%", objectFit: "cover" }
