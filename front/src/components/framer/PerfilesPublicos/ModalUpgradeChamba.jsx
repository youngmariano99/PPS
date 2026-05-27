import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { X, ChevronRight, ChevronLeft, Building, Briefcase, MapPin, CheckCircle } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { useIdentityStore } from "./LOGICA/UseIdentityStore.tsx"

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

    const { showUpgradeModal, setShowUpgradeModal, contextosDisponibles, hydrateFromApi } = useIdentityStore()

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
        rubroId: "",
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

    const [rubros, setRubros] = useState([])
    const [showCustom, setShowCustom] = useState(false)

    useEffect(() => {
        const fetchRubros = async () => {
            if (!apiUrl) return
            try {
                const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/rubros`)
                if (res.ok) setRubros(await res.json())
            } catch (e) { console.error("Error rubros", e) }
        }
        fetchRubros()
    }, [apiUrl])

    useEffect(() => {
        if (showUpgradeModal) {
            const hasProveedor = contextosDisponibles?.some(ctx => ctx.tipo === 'PROVEEDOR')
            const hasEmpresa = contextosDisponibles?.some(ctx => ctx.tipo === 'EMPRESA')
            
            if (hasProveedor && !hasEmpresa) {
                setTipo('EMPRESA')
            } else if (!hasProveedor && hasEmpresa) {
                setTipo('PROVEEDOR')
            } else {
                setTipo(null)
            }
            setStep(1)
            setError(null)
            setShowCustom(false)
            setFormData(prev => ({
                ...prev,
                dni: "",
                matricula: "",
                razonSocial: "",
                cuit: "",
                rubroId: "",
                rubroPersonalizado: "",
                descripcion: "",
                provincia: "",
                ciudad: "",
                calle: "",
                numero: "",
                codigoPostal: ""
            }))
        }
    }, [showUpgradeModal, contextosDisponibles])

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
                rubroId: formData.rubroId || null,
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

    const renderStep1 = () => {
        const hasProveedor = contextosDisponibles?.some(ctx => ctx.tipo === 'PROVEEDOR')
        const hasEmpresa = contextosDisponibles?.some(ctx => ctx.tipo === 'EMPRESA')

        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={s.title}>¿Qué deseas crear?</h2>
                <p style={s.subtitle}>Elige el tipo de página profesional que mejor se adapte a ti.</p>
                
                {!hasProveedor && (
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
                )}

                {!hasEmpresa && (
                    <div 
                        style={{ ...s.cardOption, borderColor: tipo === 'EMPRESA' ? primaryColor : '#e2e8f0', background: tipo === 'EMPRESA' ? `${primaryColor}08` : 'white' }}
                        onClick={() => setTipo('EMPRESA')}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "12px", color: "#64748b" }}><Building size={20} /></div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>Página de Empresa</h4>
                                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Para agencias, PyMEs y corporaciones.</p>
                            </div>
                        </div>
                    </div>
                )}

                <button style={{ ...s.btnPrimary, opacity: tipo ? 1 : 0.5, marginTop: "24px" }} onClick={() => tipo && setStep(2)}>
                    Siguiente <ChevronRight size={18} />
                </button>
            </motion.div>
        )
    }

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

            <div style={{ marginBottom: "16px", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Rubro principal *</label>
                <SearchableSelect 
                    options={rubros} 
                    value={formData.rubroId}
                    onChange={(val) => {
                        if (val === "OTRO") {
                            setShowCustom(true)
                            setFormData(prev => ({ ...prev, rubroId: "", rubroPersonalizado: "" }))
                        } else {
                            setShowCustom(false)
                            const rubroNombre = rubros.find(r => r.id === val)?.nombre || ""
                            setFormData(prev => ({ ...prev, rubroId: val, rubroPersonalizado: rubroNombre }))
                        }
                        setError(null)
                    }}
                    placeholder="Buscá tu rubro..."
                    primaryColor={primaryColor}
                />
            </div>

            {showCustom && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ overflow: "hidden" }}>
                    <input 
                        style={s.input} 
                        placeholder="Escribe tu rubro personalizado *" 
                        name="rubroPersonalizado" 
                        value={formData.rubroPersonalizado} 
                        onChange={handleInputChange} 
                    />
                </motion.div>
            )}

            <textarea style={{ ...s.input, minHeight: "80px", resize: "none" }} placeholder="Breve descripción de los servicios *" name="descripcion" value={formData.descripcion} onChange={handleInputChange} />

            {error && <div style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px", textAlign: "left" }}>{error}</div>}

            <button 
                style={s.btnPrimary} 
                onClick={() => {
                    if (tipo === 'EMPRESA') {
                        if (!formData.razonSocial?.trim() || !formData.cuit?.trim()) {
                            setError("Completa la Razón Social y el CUIT.")
                            return
                        }
                    } else {
                        if (!formData.dni?.trim()) {
                            setError("El DNI es obligatorio.")
                            return
                        }
                    }
                    if (!formData.rubroId && !formData.rubroPersonalizado?.trim()) {
                        setError("Selecciona tu rubro principal.")
                        return
                    }
                    if (!formData.descripcion?.trim()) {
                        setError("La descripción es obligatoria.")
                        return
                    }
                    setError(null)
                    setStep(3)
                }}
            >
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

// --- Searchable Select Component for Modal ---
function SearchableSelect({ options, value, onChange, placeholder, primaryColor }) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef(null)

    const selectedOption = options.find(o => o.id === value)
    const filtered = options.filter(o => 
        o.nombre.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const selectTriggerStyle = {
        width: "100%", 
        padding: "12px 16px", 
        borderRadius: "12px",
        border: "1px solid #e2e8f0", 
        fontSize: "14px", 
        outline: "none",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#FFFFFF",
        boxSizing: "border-box",
        marginBottom: "16px"
    }

    const dropdownListStyle = {
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        background: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.12)",
        zIndex: 100,
        overflow: "hidden",
        border: "1px solid #F1F5F9",
        marginTop: "4px"
    }

    const searchWrapStyle = {
        padding: "10px",
        borderBottom: "1px solid #F1F5F9",
        background: "#F8FAFC",
    }

    const searchInputStyle = {
        width: "100%",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #E2E8F0",
        fontSize: "13px",
        outline: "none",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box"
    }

    const optionsScrollStyle = {
        maxHeight: "180px",
        overflowY: "auto",
    }

    const optionItemStyle = {
        padding: "10px 16px",
        fontSize: "13px",
        color: "#1E293B",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.2s, color 0.2s",
    }

    const noResultsStyle = {
        padding: "12px 16px",
        fontSize: "12.5px",
        color: "#94A3B8",
        textAlign: "center",
    }

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <div 
                style={selectTriggerStyle} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ color: selectedOption ? "#0F172A" : "#94A3B8", fontWeight: selectedOption ? "500" : "400" }}>
                    {selectedOption ? selectedOption.nombre : placeholder}
                </span>
                <div style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "0.2s", color: "#64748B" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={dropdownListStyle}
                    >
                        <div style={searchWrapStyle}>
                            <input 
                                autoFocus
                                style={searchInputStyle}
                                placeholder="Escribe para filtrar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={optionsScrollStyle}>
                            {filtered.length > 0 ? (
                                filtered.map(opt => (
                                    <OptionItem 
                                        key={opt.id}
                                        option={opt}
                                        onClick={() => {
                                            onChange(opt.id)
                                            setIsOpen(false)
                                            setSearch("")
                                        }}
                                        primaryColor={primaryColor}
                                        optionItemStyle={optionItemStyle}
                                    />
                                ))
                            ) : (
                                <div style={noResultsStyle}>No se encontraron rubros</div>
                            )}
                            <OptionItem 
                                option={{ id: "OTRO", nombre: "+ Agregar otro rubro" }}
                                onClick={() => {
                                    onChange("OTRO")
                                    setIsOpen(false)
                                    setSearch("")
                                }}
                                primaryColor={primaryColor}
                                optionItemStyle={{ ...optionItemStyle, color: primaryColor, fontWeight: "700", borderTop: "1px solid #F1F5F9" }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function OptionItem({ option, onClick, primaryColor, optionItemStyle }) {
    const [hover, setHover] = useState(false)
    return (
        <div 
            style={{
                ...optionItemStyle,
                background: hover ? "#F5F3FF" : "transparent",
                color: hover && option.id !== "OTRO" ? primaryColor : (optionItemStyle.color || "#1E293B")
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {option.nombre}
        </div>
    )
}

addPropertyControls(ModalUpgradeChamba, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#7c3aed" }
})
