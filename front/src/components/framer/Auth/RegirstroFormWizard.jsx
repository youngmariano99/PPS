import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * WIZARD DE ONBOARDING - FRAMER (Version 2.0)
 * -------------------------------------------
 * Mejora: Selector de rubros desde el Backend + Rubro Personalizado.
 */

export default function WizardOnboarding(props) {
    const { apiUrl, primaryColor, cardBg, textColor, borderRadius } = props

    // Estados de navegación
    const [step, setStep] = useState(1) // 1: Rol, 2: Cuenta, 3: Perfil
    const [role, setRole] = useState(null) // 'CLIENTE', 'PROVEEDOR', 'EMPRESA'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [usuarioId, setUsuarioId] = useState(null)

    // Estado para Catálogo de Rubros
    const [rubros, setRubros] = useState([])
    const [showCustom, setShowCustom] = useState(false)

    // Estado unificado del formulario
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        telefono: "",
        rubroId: "",
        rubroPersonalizado: "",
        descripcion: "",
        pais: "Argentina",
        provincia: "",
        ciudad: "",
        calle: "",
        numero: "",
        codigoPostal: "",
        dni: "",
        razonSocial: "",
        cuit: "",
    })

    // Cargar rubros al iniciar o cuando cambia el paso al perfil
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

    const handleSelectRole = (selectedRole) => {
        setRole(selectedRole)
        setStep(2)
        setError(null)
    }

    // --- SUBMIT PASO 2: CREAR CUENTA BASE ---
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
            if (!response.ok)
                throw new Error(data.mensaje || "Error al crear la cuenta base")

            setUsuarioId(data.id || data.usuarioId) // Soportamos ambos nombres de campo

            if (role === "CLIENTE") {
                setSuccess(true)
            } else {
                setStep(3)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // --- SUBMIT PASO 3: CREAR PERFIL GEO ---
    const submitPerfil = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const cleanApiUrl = apiUrl.replace(/\/+$/, "")

        const endpoint = role === "PROVEEDOR" ? "proveedor" : "empresa"
        const fullUrl = `${cleanApiUrl}/perfiles/${endpoint}/${usuarioId}`

        // Preparar DTO limpio para Java
        const payload = {
            rubroId: formData.rubroId || null,
            rubroPersonalizado: showCustom ? formData.rubroPersonalizado : null,
            descripcion: formData.descripcion,
            pais: formData.pais,
            provincia: formData.provincia,
            ciudad: formData.ciudad,
            calle: formData.calle,
            numero: parseInt(formData.numero),
            codigoPostal: parseInt(formData.codigoPostal),
            ...(role === "PROVEEDOR"
                ? { dni: formData.dni }
                : { razonSocial: formData.razonSocial, cuit: formData.cuit }),
        }

        try {
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await response.json()
            if (!response.ok)
                throw new Error(data.mensaje || "Error al crear el perfil")

            setSuccess(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // --- RENDERIZADO ---
    if (success) {
        return (
            <div style={containerStyle}>
                <div style={{ ...cardStyle, backgroundColor: cardBg, textAlign: "center" }}>
                    <h2 style={{ color: primaryColor, marginBottom: "10px" }}>¡Registro Exitoso! 🎉</h2>
                    <p style={{ color: textColor }}>
                        {role === "CLIENTE"
                            ? "Tu cuenta ha sido creada. Ya puedes buscar profesionales."
                            : "Tu perfil ha sido creado y geolocalizado con éxito. ¡Ya estás en el mapa!"}
                    </p>
                    <button
                        style={{ ...buttonStyle, backgroundColor: primaryColor, marginTop: "20px" }}
                        onClick={() => window.location.reload()}
                    >
                        Comenzar ahora
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={containerStyle}>
            <div style={{ ...cardStyle, backgroundColor: cardBg, borderRadius: `${borderRadius}px` }}>
                
                {/* PASO 1: SELECCIÓN DE ROL */}
                {step === 1 && (
                    <div style={fadeStyle}>
                        <h3 style={{ color: textColor, textAlign: "center", marginBottom: "20px" }}>¿Cómo quieres unirte?</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button style={{ ...roleButtonStyle, backgroundColor: primaryColor }} onClick={() => handleSelectRole("CLIENTE")}>🔍 Buscar Servicios</button>
                            <button style={{ ...roleButtonStyle, backgroundColor: "#3b82f6" }} onClick={() => handleSelectRole("PROVEEDOR")}>💼 Soy Profesional</button>
                            <button style={{ ...roleButtonStyle, backgroundColor: "#a855f7" }} onClick={() => handleSelectRole("EMPRESA")}>🏢 Somos Empresa</button>
                        </div>
                    </div>
                )}

                {/* PASO 2: DATOS DE CUENTA */}
                {step === 2 && (
                    <form onSubmit={submitCuentaBase} style={fadeStyle}>
                        <div style={headerSteps}>
                            <h3 style={{ color: textColor, margin: 0 }}>Crear Cuenta</h3>
                            <span style={{ fontSize: "12px", color: primaryColor, cursor: "pointer" }} onClick={() => setStep(1)}>Volver</span>
                        </div>
                        <div style={rowStyle}>
                            <input name="nombre" placeholder="Nombre" onChange={handleChange} style={inputStyle} required />
                            <input name="apellido" placeholder="Apellido" onChange={handleChange} style={inputStyle} required />
                        </div>
                        <input name="email" type="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
                        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} style={inputStyle} required />
                        <input name="telefono" placeholder="WhatsApp" onChange={handleChange} style={inputStyle} required />
                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor }}>
                            {loading ? "Procesando..." : "Siguiente"}
                        </button>
                    </form>
                )}

                {/* PASO 3: PERFIL DETALLADO */}
                {step === 3 && (
                    <form onSubmit={submitPerfil} style={fadeStyle}>
                        <div style={headerSteps}>
                            <h3 style={{ color: textColor, margin: 0 }}>Detalles del Perfil</h3>
                        </div>

                        {/* SELECTOR DE RUBROS DINÁMICO */}
                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ fontSize: "11px", color: "#666", marginLeft: "5px" }}>Rubro / Categoría</label>
                            <select 
                                name="rubroId" 
                                onChange={handleChange} 
                                style={{ ...inputStyle, appearance: "auto" }}
                                required={!showCustom}
                            >
                                <option value="">Selecciona un rubro...</option>
                                {rubros.map(r => (
                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                ))}
                                <option value="OTRO">+ Otro (Ingresar manualmente)</option>
                            </select>
                        </div>

                        {showCustom && (
                            <input 
                                name="rubroPersonalizado" 
                                placeholder="¿A qué te dedicas? (Ej: Carpintero Náutico)" 
                                onChange={handleChange} 
                                style={{...inputStyle, border: `1px solid ${primaryColor}`}} 
                                required 
                            />
                        )}

                        {role === "PROVEEDOR" ? (
                            <input name="dni" placeholder="DNI" onChange={handleChange} style={inputStyle} required />
                        ) : (
                            <>
                                <input name="razonSocial" placeholder="Nombre de la Empresa" onChange={handleChange} style={inputStyle} required />
                                <input name="cuit" placeholder="CUIT" onChange={handleChange} style={inputStyle} required />
                            </>
                        )}

                        <textarea name="descripcion" placeholder="Breve biografía..." onChange={handleChange} style={{ ...inputStyle, height: "60px" }} required />
                        
                        <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>Ubicación de Servicio</div>
                        <div style={rowStyle}>
                            <input name="calle" placeholder="Calle" onChange={handleChange} style={inputStyle} required />
                            <input name="numero" placeholder="N°" type="number" onChange={handleChange} style={inputStyle} required />
                        </div>
                        <div style={rowStyle}>
                            <input name="ciudad" placeholder="Ciudad" onChange={handleChange} style={inputStyle} required />
                            <input name="provincia" placeholder="Provincia" onChange={handleChange} style={inputStyle} required />
                        </div>

                        {error && <p style={errorStyle}>{error}</p>}
                        <button type="submit" disabled={loading} style={{ ...buttonStyle, backgroundColor: primaryColor }}>
                            {loading ? "Finalizando..." : "Completar Registro"}
                        </button>
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

const containerStyle = { width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", boxSizing: "border-box" }
const cardStyle = { width: "100%", maxWidth: "450px", padding: "30px", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", fontFamily: "sans-serif" }
const fadeStyle = { display: "flex", flexDirection: "column", gap: "12px" }
const headerSteps = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }
const rowStyle = { display: "flex", gap: "10px" }
const inputStyle = { flex: 1, padding: "12px", border: "1px solid #ddd", background: "#fff", color: "#000", borderRadius: "8px", fontSize: "14px" }
const buttonStyle = { padding: "14px", border: "none", fontWeight: "bold", cursor: "pointer", color: "white", borderRadius: "8px", marginTop: "10px", width: "100%", transition: "opacity 0.2s" }
const roleButtonStyle = { padding: "16px", border: "none", fontWeight: "bold", cursor: "pointer", color: "white", borderRadius: "10px", fontSize: "15px" }
const errorStyle = { color: "#ef4444", fontSize: "13px", textAlign: "center" }
