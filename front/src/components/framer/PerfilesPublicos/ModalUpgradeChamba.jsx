import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { X, ChevronRight, ChevronLeft, Building, Briefcase, MapPin, CheckCircle } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { useIdentityStore } from "./useIdentityStore"

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * MODAL UPGRADE MULTI-IDENTIDAD CHAMBA
 * --------------------------------------------------------
 * Modal superpuesto para crear perfiles de Proveedor o Empresa.
 * Se comunica con el backend y actualiza el useIdentityStore global.
 */
export default function ModalUpgradeChamba(props) {
    const { apiUrl, primaryColor } = props

    const { showUpgradeModal, setShowUpgradeModal, hydrateFromApi } = useIdentityStore()

    const [step, setStep] = useState(1)
    const [tipo, setTipo] = useState(null) // 'PROVEEDOR' o 'EMPRESA'
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [formData, setFormData] = useState({
        // Identidad
        dni: "",
        matricula: "",
        razonSocial: "",
        cuit: "",
        // Rubro y Bio
        rubroPersonalizado: "",
        descripcion: "",
        // Ubicación
        pais: "Argentina",
        provincia: "",
        ciudad: "",
        calle: "",
        numero: "",
        codigoPostal: ""
    })

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: { session } } = await supabase.auth.getSession()

            if (!user || !session) throw new Error("Debes iniciar sesión.")

            const payload = {
                ...formData,
                numero: parseInt(formData.numero) || 0,
                codigoPostal: parseInt(formData.codigoPostal) || 0,
                rubroPersonalizado: formData.rubroPersonalizado || "General"
            }

            const endpoint = tipo === 'EMPRESA' ? '/perfiles/empresa' : '/perfiles/proveedor'

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                    "X-User-Id": user.id
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                // Éxito: recargar estado global y cerrar
                await hydrateFromApi(apiUrl, supabase)
                setShowUpgradeModal(false)
                setStep(1)
                setTipo(null)
            } else {
                const errData = await response.json()
                throw new Error(errData.mensaje || "Error al crear la página.")
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!showUpgradeModal) return null

    // --- ESTILOS INLINE ---
    const s = {
        overlay: {
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)", zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", fontFamily: "Inter, sans-serif"
        },
        modal: {
            background: "white", width: "100%", maxWidth: "500px",
            borderRadius: "24px", padding: "32px", position: "relative",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        },
        title: { fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: "#1e293b", letterSpacing: "-0.5px" },
        subtitle: { fontSize: "14px", color: "#64748b", marginBottom: "24px" },
        input: {
            width: "100%", padding: "12px 16px", borderRadius: "12px",
            border: "1px solid #e2e8f0", fontSize: "14px", marginBottom: "16px", outline: "none"
        },
        btnPrimary: {
            width: "100%", padding: "14px", borderRadius: "12px",
            background: primaryColor, color: "white", border: "none",
            fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
        },
        cardOption: {
            border: "2px solid #e2e8f0", borderRadius: "16px", padding: "20px",
            cursor: "pointer", marginBottom: "16px", transition: "all 0.2s"
        }
    }

    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 style={s.title}>¿Qué deseas crear?</h2>
            <p style={s.subtitle}>Elige el tipo de página profesional que mejor se adapte a ti.</p>
            
            <div 
                style={{ ...s.cardOption, borderColor: tipo === 'PROVEEDOR' ? primaryColor : '#e2e8f0', background: tipo === 'PROVEEDOR' ? `${primaryColor}08` : 'white' }}
                onClick={() => setTipo('PROVEEDOR')}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "12px", color: "#64748b" }}><Briefcase size={20} /></div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>Proveedor Independiente</h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Para profesionales, oficios y freelancers.</p>
                    </div>
                </div>
            </div>

            <div 
                style={{ ...s.cardOption, borderColor: tipo === 'EMPRESA' ? primaryColor : '#e2e8f0', background: tipo === 'EMPRESA' ? `${primaryColor}08` : 'white' }}
                onClick={() => setTipo('EMPRESA')}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "12px", color: "#64748b" }}><Building size={20} /></div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>Página de Empresa</h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Para agencias, PyMEs y corporaciones. (Puedes tener varias)</p>
                    </div>
                </div>
            </div>

            <button style={{ ...s.btnPrimary, opacity: tipo ? 1 : 0.5, marginTop: "24px" }} onClick={() => tipo && setStep(2)}>
                Siguiente <ChevronRight size={18} />
            </button>
        </motion.div>
    )

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button style={{ background: "none", border: "none", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", marginBottom: "16px", padding: 0 }} onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> Volver
            </button>
            <h2 style={s.title}>Datos Principales</h2>
            <p style={s.subtitle}>Completa la información básica de tu {tipo === 'EMPRESA' ? 'empresa' : 'perfil'}.</p>

            {tipo === 'EMPRESA' ? (
                <>
                    <input style={s.input} placeholder="Razón Social o Nombre Público *" name="razonSocial" value={formData.razonSocial} onChange={handleInputChange} />
                    <input style={s.input} placeholder="CUIT *" name="cuit" value={formData.cuit} onChange={handleInputChange} />
                </>
            ) : (
                <>
                    <input style={s.input} placeholder="DNI *" name="dni" value={formData.dni} onChange={handleInputChange} />
                    <input style={s.input} placeholder="Matrícula (Opcional)" name="matricula" value={formData.matricula} onChange={handleInputChange} />
                </>
            )}

            <input style={s.input} placeholder="Rubro principal (Ej: Electricidad) *" name="rubroPersonalizado" value={formData.rubroPersonalizado} onChange={handleInputChange} />
            <textarea style={{ ...s.input, minHeight: "80px", resize: "none" }} placeholder="Breve descripción de los servicios *" name="descripcion" value={formData.descripcion} onChange={handleInputChange} />

            <button style={s.btnPrimary} onClick={() => setStep(3)}>
                Siguiente <ChevronRight size={18} />
            </button>
        </motion.div>
    )

    const renderStep3 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button style={{ background: "none", border: "none", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", marginBottom: "16px", padding: 0 }} onClick={() => setStep(2)}>
                <ChevronLeft size={16} /> Volver
            </button>
            <h2 style={s.title}>Ubicación</h2>
            <p style={s.subtitle}>Necesitamos esto para mostrarte en el mapa de búsquedas geolocalizadas.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input style={s.input} placeholder="Provincia *" name="provincia" value={formData.provincia} onChange={handleInputChange} />
                <input style={s.input} placeholder="Ciudad *" name="ciudad" value={formData.ciudad} onChange={handleInputChange} />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <input style={s.input} placeholder="Calle *" name="calle" value={formData.calle} onChange={handleInputChange} />
                <input style={s.input} placeholder="Número *" name="numero" type="number" value={formData.numero} onChange={handleInputChange} />
            </div>
            
            <input style={s.input} placeholder="Código Postal *" name="codigoPostal" type="number" value={formData.codigoPostal} onChange={handleInputChange} />

            {error && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px" }}>{error}</div>}

            <button style={s.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? "Creando..." : <><CheckCircle size={18} /> Crear {tipo === 'EMPRESA' ? 'Empresa' : 'Perfil'}</>}
            </button>
        </motion.div>
    )

    return (
        <div style={s.overlay}>
            <motion.div style={s.modal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <button 
                    onClick={() => setShowUpgradeModal(false)}
                    style={{ position: "absolute", top: "24px", right: "24px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
                >
                    <X size={16} />
                </button>

                <AnimatePresence mode="wait">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

addPropertyControls(ModalUpgradeChamba, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#7c3aed" }
})
