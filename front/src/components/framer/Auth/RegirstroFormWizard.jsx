import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType, motion, AnimatePresence } from "framer"

/**
 * WIZARD DE ONBOARDING PREMIUM v5.1 (Atomic, Multi-Role & High Contrast)
 * ---------------------------------------------------------------------
 * Corregido contraste, soporte para rol 'Solo Búsqueda' y guía de contraseña.
 */

export default function WizardOnboarding(props) {
    const {
        apiUrl,
        borderRadius,
        primaryColor = "#6366F1",
    } = props

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [rubros, setRubros] = useState([])
    const [showCustom, setShowCustom] = useState(false)

    const [formData, setFormData] = useState({
        nombre: "", apellido: "", email: "", password: "", telefono: "", tipo: "",
        rubroId: "", rubroPersonalizado: "", descripcion: "", dniCuit: "",
        matricula: "", fotoPerfilUrl: "", calle: "", numero: "", ciudad: "",
        provincia: "", codigoPostal: "",
    })

    useEffect(() => {
        const fetchRubros = async () => {
            try {
                const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/rubros`)
                if (res.ok) setRubros(await res.json())
            } catch (e) { console.error("Error rubros", e) }
        }
        fetchRubros()
    }, [apiUrl])

    // --- LÓGICA DE CONTRASEÑA ---
    const passChecks = {
        min: formData.password.length >= 8,
        upper: /[A-Z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[^A-Za-z0-9]/.test(formData.password),
    }

    const getStrength = () => Object.values(passChecks).filter(Boolean).length

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError(null)
    }

    const validateStep = (s) => {
        if (s === 1 && !formData.tipo) return "Por favor, elegí una opción para continuar."
        if (s === 2) {
            if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) return "Completá tus datos básicos."
            if (getStrength() < 3) return "Tu contraseña debe ser más segura para proteger tu cuenta."
        }
        if (s === 3 && formData.tipo !== "CLIENTE") {
            if (!formData.rubroId && !formData.rubroPersonalizado) return "Elegí a qué rubro pertenecés."
            if (!formData.dniCuit) return "El DNI/CUIT es obligatorio para profesionales y empresas."
            if (!formData.descripcion || formData.descripcion.length < 20) return "Contanos un poco más sobre vos."
        }
        if (s === 4 && formData.tipo !== "CLIENTE") {
            if (!formData.calle || !formData.numero || !formData.ciudad) return "Completá tu dirección para aparecer en el mapa."
        }
        return null
    }

    const handleAction = async () => {
        const err = validateStep(step)
        if (err) { setError(err); return }

        // Si es CLIENTE, termina en el paso 2
        if (step === 2 && formData.tipo === "CLIENTE") {
            await submitFinal()
            return
        }

        if (step < 4) setStep(prev => prev + 1)
        else await submitFinal()
    }

    const submitFinal = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/auth/registro-completo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.mensaje || "Error al registrar.")
            
            localStorage.setItem("usuario", JSON.stringify({ id: data.usuarioId, nombre: data.nombre, email: data.email }))
            setSuccess(true)
        } catch (err) {
            setError("No pudimos crear tu cuenta: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={successCard(borderRadius)}>
                <div style={checkIcon}>✓</div>
                <h2 style={titleStyleDark}>¡Todo listo, {formData.nombre}!</h2>
                <p style={subTitleStyleDark}>Ya podés empezar a usar la plataforma.</p>
                <button style={primaryBtn} onClick={() => window.location.reload()}>Empezar ahora</button>
            </motion.div>
        )
    }

    return (
        <div style={wizardWrapper}>
            <div style={glassCard(borderRadius)}>
                <div style={headerWizard}>
                    <span style={stepLabel}>Paso {step} de {formData.tipo === "CLIENTE" ? 2 : 4}</span>
                    <div style={barBg}><motion.div style={barFill} animate={{ width: `${(step / (formData.tipo === "CLIENTE" ? 2 : 4)) * 100}%` }} /></div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={stepBox}>
                            <h2 style={titleStyleDark}>¡Hola! ¿Cómo querés empezar?</h2>
                            <p style={subTitleStyleDark}>Elegí la opción que mejor se adapte a lo que buscás hoy.</p>
                            <div style={roleGrid}>
                                <RoleCard active={formData.tipo === "PROVEEDOR"} icon="🛠️" title="Soy Profesional" desc="Quiero ofrecer mis servicios." onClick={() => setFormData({...formData, tipo: "PROVEEDOR"})} />
                                <RoleCard active={formData.tipo === "EMPRESA"} icon="🏢" title="Soy Empresa" desc="Busco contratar expertos." onClick={() => setFormData({...formData, tipo: "EMPRESA"})} />
                                <RoleCard active={formData.tipo === "CLIENTE"} icon="🔍" title="Solo Búsqueda" desc="Quiero buscar y contratar." onClick={() => setFormData({...formData, tipo: "CLIENTE"})} />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="p2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={stepBox}>
                            <h2 style={titleStyleDark}>Tus datos de acceso</h2>
                            <p style={subTitleStyleDark}>Crea tu cuenta para guardar tus favoritos y contactar profesionales.</p>
                            <div style={rowGrid}>
                                <Input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} />
                                <Input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} />
                            </div>
                            <Input name="email" type="email" placeholder="Email (ej: juan@gmail.com)" value={formData.email} onChange={handleChange} />
                            <Input name="telefono" placeholder="Celular / WhatsApp" value={formData.telefono} onChange={handleChange} />
                            
                            <div style={{ position: "relative" }}>
                                <Input name="password" type="password" placeholder="Crea una contraseña segura" value={formData.password} onChange={handleChange} />
                                <div style={passGuide}>
                                    <GuideItem met={passChecks.min} txt="8+ caracteres" />
                                    <GuideItem met={passChecks.upper} txt="Mayúscula" />
                                    <GuideItem met={passChecks.number} txt="Número" />
                                    <GuideItem met={passChecks.special} txt="Símbolo (!@#)" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="p3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={stepBox}>
                            <h2 style={titleStyleDark}>Identidad Profesional</h2>
                            <p style={subTitleStyleDark}>Contanos a qué te dedicás para que te encuentren.</p>
                            <select name="rubroId" value={formData.rubroId} onChange={(e) => {
                                if(e.target.value === "OTRO") setShowCustom(true)
                                else {setShowCustom(false); setFormData({...formData, rubroId: e.target.value})}
                            }} style={selectStyle}>
                                <option value="">¿Cuál es tu rubro principal?</option>
                                {rubros.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                <option value="OTRO">+ Otro rubro</option>
                            </select>
                            {showCustom && <Input name="rubroPersonalizado" placeholder="¿Cuál es tu profesión?" value={formData.rubroPersonalizado} onChange={handleChange} />}
                            <Input name="dniCuit" placeholder={formData.tipo === "PROVEEDOR" ? "DNI (Sin puntos)" : "CUIT de la empresa"} value={formData.dniCuit} onChange={handleChange} />
                            <textarea name="descripcion" placeholder="Resumí tu experiencia en unas pocas líneas..." value={formData.descripcion} onChange={handleChange} style={textAreaStyle} />
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="p4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={stepBox}>
                            <h2 style={titleStyleDark}>Tu ubicación</h2>
                            <p style={subTitleStyleDark}>Esto nos ayuda a mostrarte a clientes cercanos.</p>
                            <Input name="calle" placeholder="Calle" value={formData.calle} onChange={handleChange} />
                            <div style={rowGrid}>
                                <Input name="numero" type="number" placeholder="Altura" value={formData.numero} onChange={handleChange} />
                                <Input name="codigoPostal" type="number" placeholder="Código Postal" value={formData.codigoPostal} onChange={handleChange} />
                            </div>
                            <div style={rowGrid}>
                                <Input name="ciudad" placeholder="Ciudad" value={formData.ciudad} onChange={handleChange} />
                                <Input name="provincia" placeholder="Provincia" value={formData.provincia} onChange={handleChange} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={wizardFooter}>
                    {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={errorAlert}>{error}</motion.div>}
                    <div style={btnRow}>
                        {step > 1 && <button onClick={() => setStep(s => s - 1)} style={secondaryBtn}>Atrás</button>}
                        <button onClick={handleAction} disabled={loading} style={primaryBtn}>
                            {loading ? "Procesando..." : (step === (formData.tipo === "CLIENTE" ? 2 : 4) ? "Finalizar" : "Continuar")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTES ---
const RoleCard = ({ active, icon, title, desc, onClick }) => (
    <div style={roleCardStyle(active)} onClick={onClick}>
        <span style={roleIcon}>{icon}</span>
        <strong style={roleTitle}>{title}</strong>
        <span style={roleDesc}>{desc}</span>
    </div>
)

const Input = (props) => <input {...props} style={inputStyle} />

const GuideItem = ({ met, txt }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: met ? "#10B981" : "#94A3B8" }}>
        <span style={{ fontSize: "10px" }}>{met ? "●" : "○"}</span>
        <span style={{ fontSize: "11px", fontWeight: "600" }}>{txt}</span>
    </div>
)

// --- ESTILOS ---
const wizardWrapper = { width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", boxSizing: "border-box" }
const glassCard = (br) => ({
    width: "100%", maxWidth: "520px", background: "#FFFFFF", borderRadius: `${br}px`,
    padding: "40px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", boxSizing: "border-box"
})

const headerWizard = { marginBottom: "24px" }
const stepLabel = { fontSize: "11px", fontWeight: "800", color: "#6366F1", textTransform: "uppercase", letterSpacing: "1.5px" }
const barBg = { width: "100%", height: "4px", background: "#F1F5F9", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }
const barFill = { height: "100%", background: "linear-gradient(90deg, #6366F1, #A855F7)" }

const stepBox = { display: "flex", flexDirection: "column", gap: "16px" }
const titleStyleDark = { fontSize: "26px", color: "#0F172A", fontWeight: "800", margin: "0", lineHeight: "1.1" }
const subTitleStyleDark = { fontSize: "15px", color: "#64748B", margin: "0", lineHeight: "1.4" }

const roleGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "10px" }
const roleCardStyle = (active) => ({
    padding: "16px 12px", background: active ? "#F5F3FF" : "#FFFFFF", border: active ? "2px solid #6366F1" : "1px solid #E2E8F0",
    borderRadius: "16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.2s ease"
})
const roleIcon = { fontSize: "28px", marginBottom: "8px" }
const roleTitle = { fontSize: "13px", color: "#1E293B", marginBottom: "4px" }
const roleDesc = { fontSize: "11px", color: "#64748B", lineHeight: "1.3" }

const rowGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }
const inputStyle = { width: "100%", padding: "14px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "#1E293B" }
const selectStyle = { ...inputStyle, appearance: "none" }
const textAreaStyle = { ...inputStyle, minHeight: "80px", resize: "none" }

const passGuide = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginTop: "10px", padding: "12px", background: "#F8FAFC", borderRadius: "10px" }

const wizardFooter = { marginTop: "32px" }
const errorAlert = { padding: "12px", background: "#FEF2F2", color: "#EF4444", borderRadius: "10px", fontSize: "13px", border: "1px solid #FEE2E2", marginBottom: "16px" }
const btnRow = { display: "flex", gap: "12px" }
const primaryBtn = { flex: 1, padding: "16px", background: "#4F46E5", border: "none", borderRadius: "12px", color: "#FFFFFF", fontWeight: "700", cursor: "pointer" }
const secondaryBtn = { padding: "16px 24px", background: "#F1F5F9", border: "none", borderRadius: "12px", color: "#475569", fontWeight: "600", cursor: "pointer" }

const successCard = (br) => ({ ...glassCard(br), alignItems: "center", textAlign: "center" })
const checkIcon = { width: "50px", height: "50px", background: "#10B981", borderRadius: "50%", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "20px" }

addPropertyControls(WizardOnboarding, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 28, min: 0, max: 50 },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#6366F1" },
})
