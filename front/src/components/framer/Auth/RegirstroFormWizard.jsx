import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * WIZARD DE ONBOARDING PREMIUM v4.0 (Identidad PPS)
 * -----------------------------------------------
 * Diseño limpio, lenguaje cercano (ARG) y validación de arquitectura.
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
                maxFileSize: 5000000, // 5MB limit
                language: "es",
                text: { 
                    es: { 
                        menu: { select: "Desde tu PC", url: "Link externo" },
                        local: { browse: "Elegir archivo", dd_title_single: "Suelte la foto aquí" }
                    } 
                }
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
                    email: formData.email, 
                    password: formData.password,
                    nombre: formData.nombre, 
                    apellido: formData.apellido, 
                    telefono: formData.telefono,
                }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.mensaje || "Chequeá los datos e intentá de nuevo.")
            
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
            fotoPerfilUrl: fotoPerfil || null,
            logoUrl: role === "EMPRESA" ? fotoPerfil : null,
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
                throw new Error(data.mensaje || "Oops, algo falló al crear tu perfil.")
            }
            setSuccess(true)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    if (success) {
        return (
            <div style={containerStyle}>
                <div style={{ ...cardStyle, backgroundColor: cardBg, textAlign: "center", padding: "40px" }}>
                    <h2 style={{ color: "#10b981", fontSize: "28px" }}>¡Todo listo! 🎉</h2>
                    <p style={{ color: "#334155", margin: "20px 0" }}>Ya sos parte de la comunidad. <br/> Ahora podés empezar a usar PPS.</p>
                    <button style={{ ...buttonStyle, backgroundColor: primaryColor }} onClick={() => window.location.reload()}>Ir a mi Panel</button>
                </div>
            </div>
        )
    }

    return (
        <div style={containerStyle}>
            <div style={{ ...cardStyle, backgroundColor: cardBg, borderRadius: `${borderRadius}px` }}>
                
                {/* HEADLINE */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ color: primaryColor, fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Paso {step} de 3
                    </div>
                    <h2 style={{ color: "#000000", fontSize: "22px", margin: "5px 0" }}>
                        {step === 1 ? "¡Bienvenido a PPS! 👋" : step === 2 ? "Creamos tu acceso" : "Completamos tu perfil"}
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                        {step === 1 ? "¿Cómo vas a usar la plataforma?" : step === 2 ? "Estos datos te servirán para entrar a tu cuenta." : "Contanos qué hacés para que otros te encuentren."}
                    </p>
                </div>

                {step === 1 && (
                    <div style={fadeStyle}>
                        <div style={roleCard(role === "CLIENTE")} onClick={() => { setRole("CLIENTE"); setStep(2) }}>
                            <div style={dot(primaryColor)}></div>
                            <div>
                                <strong style={{ display: "block", color: "#000" }}>Busco Servicios</strong>
                                <small style={{ color: "#64748b" }}>Quiero contratar profesionales de confianza.</small>
                            </div>
                        </div>
                        <div style={roleCard(role === "PROVEEDOR")} onClick={() => { setRole("PROVEEDOR"); setStep(2) }}>
                            <div style={dot("#3b82f6")}></div>
                            <div>
                                <strong style={{ display: "block", color: "#000" }}>Soy Profesional</strong>
                                <small style={{ color: "#64748b" }}>Quiero ofrecer mis servicios y conseguir trabajos.</small>
                            </div>
                        </div>
                        <div style={roleCard(role === "EMPRESA")} onClick={() => { setRole("EMPRESA"); setStep(2) }}>
                            <div style={dot("#a855f7")}></div>
                            <div>
                                <strong style={{ display: "block", color: "#000" }}>Represento una Empresa</strong>
                                <small style={{ color: "#64748b" }}>Buscamos talento o profesionales para proyectos.</small>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={submitCuentaBase} style={fadeStyle}>
                        <div style={gridRow(2)}>
                            <div style={fieldGroup}>
                                <label style={labelStyle}>Nombre</label>
                                <input name="nombre" placeholder="Ej: Juan" onChange={handleChange} style={inputStyle} required />
                            </div>
                            <div style={fieldGroup}>
                                <label style={labelStyle}>Apellido</label>
                                <input name="apellido" placeholder="Ej: Perez" onChange={handleChange} style={inputStyle} required />
                            </div>
                        </div>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Tu mejor Email</label>
                            <input name="email" type="email" placeholder="nombre@ejemplo.com" onChange={handleChange} style={inputStyle} required />
                        </div>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>WhatsApp / Celular</label>
                            <input name="telefono" placeholder="Ej: 11 1234 5678" onChange={handleChange} style={inputStyle} required />
                        </div>
                        <div style={fieldGroup}>
                            <label style={labelStyle}>Elegí una clave segura</label>
                            <input name="password" type="password" placeholder="Mínimo 6 caracteres" onChange={handleChange} style={inputStyle} required />
                        </div>
                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor }}>Confirmar y seguir →</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={submitPerfil} style={fadeStyle}>
                        
                        {/* MULTIMEDIA BOX */}
                        <div style={mediaSelector}>
                           <div style={profileCircle} onClick={() => openCloudinary(false)}>
                                {fotoPerfil ? <img src={fotoPerfil} style={fullImg} /> : <div style={plusIcon}>📸</div>}
                           </div>
                           <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "12px", color: "#334155", margin: "0 0 5px 0" }}>{role === "PROVEEDOR" ? "Foto de Perfil" : "Logo de Empresa"}</p>
                                <button type="button" onClick={() => openCloudinary(true)} style={btnGhost}>+ Agregar trabajos al portfolio ({fotosPortafolio.length})</button>
                           </div>
                        </div>

                        <div style={fieldGroup}>
                            <label style={labelStyle}>¿En qué rubro te especializás?</label>
                            <select name="rubroId" onChange={handleChange} style={selectStyle} required={!showCustom}>
                                <option value="">Seleccioná una opción...</option>
                                {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                <option value="OTRO">+ Agregar otro rubro</option>
                            </select>
                        </div>
                        {showCustom && <input name="rubroPersonalizado" placeholder="¿Cuál es tu especialidad?" onChange={handleChange} style={inputStyle} required />}

                        {role === "PROVEEDOR" ? (
                            <div style={gridRow(2)}>
                                <div style={fieldGroup}><label style={labelStyle}>DNI</label><input name="dni" placeholder="Sin puntos" onChange={handleChange} style={inputStyle} required /></div>
                                <div style={fieldGroup}><label style={labelStyle}>Matrícula (Opcional)</label><input name="matricula" placeholder="Nro de registro" onChange={handleChange} style={inputStyle} /></div>
                            </div>
                        ) : (
                            <div style={gridRow(2)}>
                                <div style={fieldGroup}><label style={labelStyle}>Razón Social</label><input name="razonSocial" placeholder="Nombre Legal" onChange={handleChange} style={inputStyle} required /></div>
                                <div style={fieldGroup}><label style={labelStyle}>CUIT</label><input name="cuit" placeholder="XX-XXXXXXXX-X" onChange={handleChange} style={inputStyle} required /></div>
                            </div>
                        )}

                        <div style={fieldGroup}>
                            <label style={labelStyle}>Breve descripción</label>
                            <textarea name="descripcion" placeholder="Contanos un poco sobre tu trayectoria o servicios..." onChange={handleChange} style={{ ...inputStyle, height: "60px", resize: "none" }} required />
                        </div>

                        <div style={labelStyle}>¿Dónde te encontrás?</div>
                        <div style={gridRow(2)}>
                             <input name="calle" placeholder="Calle" onChange={handleChange} style={inputStyle} required />
                             <input name="numero" placeholder="Número" type="number" onChange={handleChange} style={inputStyle} required />
                        </div>
                        <div style={gridRow(3)}>
                            <input name="ciudad" placeholder="Ciudad" onChange={handleChange} style={inputStyle} required />
                            <input name="provincia" placeholder="Prov." onChange={handleChange} style={inputStyle} required />
                            <input name="codigoPostal" placeholder="CP" type="number" onChange={handleChange} style={inputStyle} required />
                        </div>

                        <div style={{ ...labelStyle, marginTop: "10px" }}>Links de videos (YouTube / Drive)</div>
                        {videoLinks.map((link, i) => (
                            <input key={i} placeholder={`Link Video ${i+1}`} value={link} onChange={(e) => handleVideoChange(i, e.target.value)} style={{ ...inputStyle, marginBottom: "4px" }} />
                        ))}

                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor, marginTop: "10px" }}>
                            {loading ? "Guardando datos..." : "Terminar Registro ✨"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

// ESTILOS PREMIUM (Sistema de Diseño PPS)
const containerStyle = { width: "100%", height: "100%", background: "#f8fafc", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", boxSizing: "border-box", overflowY: "auto" }
const cardStyle = { width: "100%", maxWidth: "480px", padding: "30px", display: "flex", flexDirection: "column", background: "#ffffff", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }
const fadeStyle = { display: "flex", flexDirection: "column", gap: "12px", width: "100%" }
const fieldGroup = { display: "flex", flexDirection: "column", gap: "4px", width: "100%" }
const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#334155", marginLeft: "2px" }
const inputStyle = { padding: "12px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", width: "100%", boxSizing: "border-box", color: "#000", transition: "border 0.2s ease" }
const selectStyle = { ...inputStyle, appearance: "auto" }
const buttonStyle = { padding: "14px", border: "none", fontWeight: "bold", cursor: "pointer", color: "white", borderRadius: "10px", width: "100%", fontSize: "15px", transition: "transform 0.1s ease" }
const errorStyle = { color: "#ef4444", fontSize: "12px", textAlign: "center", background: "#fef2f2", padding: "10px", borderRadius: "8px" }
const gridRow = (cols) => ({ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "10px", width: "100%" })

const roleCard = (active) => ({
    padding: "16px", borderRadius: "12px", border: active ? "20px solid #7c3aed" : "2px solid #f1f5f9",
    background: active ? "#f5f3ff" : "#fff", display: "flex", alignItems: "center", gap: "15px", cursor: "pointer", transition: "all 0.2s ease",
    boxShadow: active ? "0 4px 6px -1px rgba(124, 58, 237, 0.1)" : "none"
})
const dot = (color) => ({ width: "10px", height: "10px", borderRadius: "50%", background: color })
const mediaSelector = { display: "flex", alignItems: "center", gap: "15px", padding: "15px", background: "#f8fafc", borderRadius: "12px", marginBottom: "10px" }
const profileCircle = { width: "70px", height: "70px", borderRadius: "50%", background: "#fff", border: "2px dashed #cbd5e1", cursor: "pointer", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }
const plusIcon = { fontSize: "24px", opacity: 0.5 }
const fullImg = { width: "100%", height: "100%", objectFit: "cover" }
const btnGhost = { background: "#fff", border: "1px solid #e2e8f0", color: "#475569", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }

addPropertyControls(WizardOnboarding, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    cloudinaryCloudName: { type: ControlType.String, title: "Cloud Name", defaultValue: "demo" },
    cloudinaryPreset: { type: ControlType.String, title: "Upload Preset", defaultValue: "unsigned_preset" },
    primaryColor: { type: ControlType.Color, title: "Acento", defaultValue: "#7c3aed" },
    cardBg: { type: ControlType.Color, title: "Fondo Card", defaultValue: "#ffffff" },
    textColor: { type: ControlType.Color, title: "Texto", defaultValue: "#000000" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 20 },
})
