import React, { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType, motion, AnimatePresence } from "framer"

/**
 * CHAMBA REGISTRATION WIZARD - 1:1 DESIGN FIDELITY
 * ------------------------------------------------
 * Este es el nuevo componente con el branding solicitado.
 * Basado en la lógica de RegirstroFormWizard.jsx para máxima compatibilidad.
 */

export default function RegistroFormWizardChamba(props) {
    const { apiUrl, btnText = "Siguiente" } = props

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [userId, setUserId] = useState(null)
    const [rubros, setRubros] = useState([])
    const [showCustom, setShowCustom] = useState(false)

    const [formData, setFormData] = useState({
        nombre: "", apellido: "", email: "", password: "", confirmPassword: "", telefono: "", tipo: "",
        rubroId: "", rubroPersonalizado: "", descripcion: "", dniCuit: "",
        matricula: "", fotoPerfilUrl: "", calle: "", numero: "", ciudad: "",
        provincia: "", pais: "Argentina", codigoPostal: "",
        fotosPortafolio: [], urlsVideos: [""],
        especialidades: [], condicionesServicio: []
    })

    // Inyectar Google Fonts y Cloudinary
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)
        
        const script = document.createElement("script")
        script.src = "https://widget.cloudinary.com/v2.0/global/all.js"
        script.type = "text/javascript"
        script.async = true
        document.body.appendChild(script)

        return () => {
            if (document.head.contains(link)) document.head.removeChild(link)
        }
    }, [])

    useEffect(() => {
        const fetchRubros = async () => {
            try {
                const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/rubros`)
                if (res.ok) setRubros(await res.json())
            } catch (e) { console.error("Error rubros", e) }
        }
        fetchRubros()
    }, [apiUrl])

    // --- LOGICA DE CONTRASEÑA ---
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
        if (s === 1 && !formData.tipo) return "Por favor, elegí tu perfil para continuar."
        if (s === 2) {
            if (!formData.nombre || !formData.apellido || !formData.email || !formData.telefono) return "Completá tus datos básicos."
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Ingresá un email válido."
            if (getStrength() < 3) return "La contraseña debe ser más segura."
            if (formData.password !== formData.confirmPassword) return "Las contraseñas no coinciden."
        }
        if (s === 3 && formData.tipo !== "CLIENTE") {
            if (!formData.rubroId && !formData.rubroPersonalizado) return "Elegí tu rubro principal."
            if (!formData.dniCuit) return "El DNI/CUIT es obligatorio."
        }
        if (s === 4 && formData.tipo !== "CLIENTE") {
            // Sin validación obligatoria para reducir fricción
        }
        if (s === 5 && formData.tipo !== "CLIENTE") {
            if (!formData.calle || !formData.numero || !formData.ciudad) return "Completá tu dirección."
        }
        return null
    }

    const handleNext = async () => {
        const err = validateStep(step)
        if (err) { setError(err); return }

        // Validación de Ubicación Inteligente (Paso 5)
        if (step === 5 && formData.tipo !== "CLIENTE") {
            setLoading(true)
            setError(null)
            try {
                const direccionCompleta = `${formData.calle} ${formData.numero}, ${formData.ciudad}, ${formData.provincia}, ${formData.pais}`
                const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/directorio/geocodificar?direccion=${encodeURIComponent(direccionCompleta)}`)
                
                if (!res.ok) {
                    throw new Error("No pudimos encontrar esa dirección en el mapa. Por favor, verificá que los datos sean correctos.")
                }
                
                // Si llegamos acá, la dirección es válida
            } catch (err) {
                setError(err.message)
                setLoading(false)
                return
            } finally {
                setLoading(false)
            }
        }

        if (step === 2 && formData.tipo === "CLIENTE") {
            await submitFinal()
            return
        }

        const totalSteps = formData.tipo === "CLIENTE" ? 2 : 6
        if (step < totalSteps) setStep(prev => prev + 1)
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
            setUserId(data.usuarioId)
            setSuccess(true)
        } catch (err) {
            setError(err.message)
        } finally { setLoading(false) }
    }

    if (success) return <SuccessView nombre={formData.nombre} userId={userId} profileUrl={props.providerProfileUrl} tipo={formData.tipo} />

    return (
        <div style={pageContainer}>
            {/* Header / Logo */}
            <div style={headerLogo}>
                <LogoChamba color="#000000" />
                <span style={headerTagline}>
                    CONECTA. <span style={{ color: "#A01EED" }}>TRABAJO.</span> GENERA <span style={{ color: "#A01EED" }}>OPORTUNIDADES.</span>
                </span>
            </div>

            <div style={mainWrapper}>
                {/* Progress Bar */}
                <div style={progressContainer}>
                    <ProgressBar current={step} total={formData.tipo === "CLIENTE" ? 2 : 6} />
                </div>

                {/* Step Card */}
                <motion.div 
                    key={step}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={cardStyle}
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <Step1 
                                tipo={formData.tipo} 
                                setTipo={(t) => setFormData({...formData, tipo: t})} 
                            />
                        )}
                        {step === 2 && (
                            <Step2 
                                data={formData} 
                                onChange={handleChange} 
                                checks={passChecks}
                            />
                        )}
                        {step === 3 && (
                            <Step3 
                                data={formData} 
                                rubros={rubros} 
                                onChange={handleChange}
                                setShowCustom={setShowCustom}
                                showCustom={showCustom}
                            />
                        )}
                        {step === 4 && (
                            <Step4 
                                data={formData} 
                                setFormData={setFormData}
                            />
                        )}
                        {step === 5 && (
                            <Step5 
                                data={formData} 
                                onChange={handleChange}
                            />
                        )}
                        {step === 6 && (
                            <Step6 
                                data={formData} 
                                setFormData={setFormData}
                            />
                        )}
                    </AnimatePresence>

                    {/* Footer Buttons */}
                    <div style={footerRow}>
                        {error && <div style={errorAlert}>{error}</div>}
                        <div style={btnGroup}>
                            {step > 1 && (
                                <button onClick={() => setStep(s => s - 1)} style={secondaryBtn}>
                                    ← Anterior
                                </button>
                            )}
                            {step === 1 && <button style={secondaryBtn} onClick={() => {}}>Cancelar</button>}
                            
                            <button 
                                onClick={handleNext} 
                                disabled={loading}
                                style={primaryBtn}
                            >
                                {loading ? "Procesando..." : (step === (formData.tipo === "CLIENTE" ? 2 : 6) ? "Finalizar registro ✓" : "Siguiente →")}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Background Decoration */}
                <div style={mateIllustration}>
                    <MateIcon opacity={0.03} />
                </div>
            </div>
        </div>
    )
}

// --- PASOS DEL WIZARD ---

const Step1 = ({ tipo, setTipo }) => (
    <div style={stepInner}>
        <div style={stepHeader}>
            <div style={stepCircle}>1</div>
            <div>
                <h2 style={stepTitle}>Seleccioná tu perfil</h2>
                <p style={stepSubtitle}>Contanos cómo vas a usar Chamba</p>
            </div>
        </div>
        <div style={roleGrid}>
            <RoleCard 
                active={tipo === "PROVEEDOR"} 
                title="Soy Profesional" 
                desc="Ofrezco mis servicios y busco oportunidades laborales."
                icon={<IconProf />}
                onClick={() => setTipo("PROVEEDOR")}
            />
            <RoleCard 
                active={tipo === "EMPRESA"} 
                title="Soy Empresa" 
                desc="Publico ofertas de trabajo y encuentro profesionales."
                icon={<IconEmp />}
                onClick={() => setTipo("EMPRESA")}
            />
            <RoleCard 
                active={tipo === "CLIENTE"} 
                title="Solo Búsqueda" 
                desc="Busco servicios u oportunidades, no ofrezco nada."
                icon={<IconSearch />}
                onClick={() => setTipo("CLIENTE")}
            />
        </div>
    </div>
)

const Step2 = ({ data, onChange, checks }) => (
    <div style={stepInner}>
        <div style={stepHeader}>
            <div style={stepCircle}>2</div>
            <div>
                <h2 style={stepTitle}>Datos personales</h2>
                <p style={stepSubtitle}>Necesitamos conocerte un poco más</p>
            </div>
        </div>
        <div style={formGrid}>
            <div style={rowGrid}>
                <Input label="Nombre" name="nombre" value={data.nombre} onChange={onChange} icon={<IconUser />} placeholder="Tu nombre" />
                <Input label="Apellido" name="apellido" value={data.apellido} onChange={onChange} icon={<IconUser />} placeholder="Tu apellido" />
            </div>
            <div style={rowGrid}>
                <Input label="Email" name="email" type="email" value={data.email} onChange={onChange} icon={<IconMail />} placeholder="tu@email.com" />
                <Input label="WhatsApp" name="telefono" value={data.telefono} onChange={onChange} icon={<IconPhone />} placeholder="+54 9 11..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ position: "relative" }}>
                    <Input label="Contraseña" name="password" type="password" value={data.password} onChange={onChange} icon={<IconLock />} placeholder="••••••••" />
                </div>
                <div style={{ position: "relative" }}>
                    <Input label="Confirmar contraseña" name="confirmPassword" type="password" value={data.confirmPassword} onChange={onChange} icon={<IconLock />} placeholder="••••••••" />
                </div>
            </div>
            <div style={passGuide}>
                <p style={guideTitle}>Tu contraseña debe tener:</p>
                <div style={guideGrid}>
                    <GuideCheck met={checks.min} text="Mínimo 8 caracteres" />
                    <GuideCheck met={checks.upper} text="Al menos 1 mayúscula" />
                    <GuideCheck met={checks.number} text="Al menos 1 número" />
                    <GuideCheck met={checks.special} text="Al menos 1 símbolo" />
                </div>
            </div>
        </div>
    </div>
)

const Step3 = ({ data, rubros, onChange, showCustom, setShowCustom }) => (
    <div style={stepInner}>
        <div style={stepHeader}>
            <div style={stepCircle}>3</div>
            <div>
                <h2 style={stepTitle}>Identidad visual</h2>
                <p style={stepSubtitle}>Contanos sobre tu experiencia</p>
            </div>
        </div>
        <div style={formGrid}>
            <div style={rowGrid}>
                <div style={inputGroup}>
                    <label style={labelStyle}>Rubro</label>
                    <SearchableSelect 
                        options={rubros} 
                        value={data.rubroId}
                        onChange={(val) => {
                            if(val === "OTRO") {
                                setShowCustom(true)
                                onChange({ target: { name: "rubroId", value: "" } })
                            } else {
                                setShowCustom(false)
                                onChange({ target: { name: "rubroId", value: val } })
                            }
                        }}
                        placeholder="Buscá tu rubro..."
                    />
                </div>
                <Input label="DNI" name="dniCuit" value={data.dniCuit} onChange={onChange} icon={<IconId />} placeholder="12.345.678" />
            </div>
            {showCustom && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Input label="¿Cuál es tu rubro?" name="rubroPersonalizado" value={data.rubroPersonalizado} onChange={onChange} placeholder="Ej: Carpintero" />
                </motion.div>
            )}
            <div>
                <label style={labelStyle}>Experiencia</label>
                <textarea 
                    name="descripcion" 
                    value={data.descripcion} 
                    onChange={onChange}
                    placeholder="Contanos sobre tu experiencia, proyectos realizados, años de trabajo, etc."
                    style={textAreaField}
                />
                <div style={charCounter}>{data.descripcion.length}/500</div>
            </div>
        </div>
    </div>
)

// --- COMPONENTE SELECT CON BUSCADOR ---

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef(null)

    const selectedOption = options.find(o => o.id === value)
    const filtered = options.filter(o => 
        o.nombre.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <div 
                style={selectTrigger} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ color: selectedOption ? "#000000" : "#94A3B8" }}>
                    {selectedOption ? selectedOption.nombre : placeholder}
                </span>
                <div style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "0.2s" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={dropdownList}
                    >
                        <div style={searchWrap}>
                            <input 
                                autoFocus
                                style={searchInput}
                                placeholder="Escribí para filtrar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={optionsScroll}>
                            {filtered.length > 0 ? (
                                filtered.map(opt => (
                                    <div 
                                        key={opt.id} 
                                        style={optionItem}
                                        onClick={() => {
                                            onChange(opt.id)
                                            setIsOpen(false)
                                            setSearch("")
                                        }}
                                    >
                                        {opt.nombre}
                                    </div>
                                ))
                            ) : (
                                <div style={noResults}>No se encontraron rubros</div>
                            )}
                            <div 
                                style={{ ...optionItem, color: "#A01EED", fontWeight: "700", borderTop: "1px solid #F1F5F9" }}
                                onClick={() => {
                                    onChange("OTRO")
                                    setIsOpen(false)
                                    setSearch("")
                                }}
                            >
                                + Agregar otro rubro
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const Step4 = ({ data, setFormData }) => {
    const sugerencias = [
        "Mercado Pago", "Efectivo", "Transferencia", 
        "50% por adelantado", "Pago al finalizar", "A convenir",
        "Presupuesto sin cargo", "Atención 24hs"
    ]

    const toggleSugerencia = (sug) => {
        if (!data.condicionesServicio.includes(sug)) {
            setFormData({...data, condicionesServicio: [...data.condicionesServicio, sug]})
        }
    }

    return (
        <div style={stepInner}>
            <div style={stepHeader}>
                <div style={stepCircle}>4</div>
                <div>
                    <h2 style={stepTitle}>Servicios y etiquetas</h2>
                    <p style={stepSubtitle}>Contanos qué hacés y cómo cobrás</p>
                </div>
            </div>
            <div style={formGrid}>
                <div>
                    <label style={labelStyle}>Especialidades (Ej: Plomería, React, Limpieza)</label>
                    <TagInput 
                        tags={data.especialidades} 
                        setTags={(t) => setFormData({...data, especialidades: t})} 
                        placeholder="Escribí una especialidad y Enter..."
                    />
                </div>
                
                <div style={{ marginTop: "10px" }}>
                    <label style={labelStyle}>Condiciones y formas de pago</label>
                    <TagInput 
                        tags={data.condicionesServicio} 
                        setTags={(t) => setFormData({...data, condicionesServicio: t})} 
                        placeholder="Escribí una condición (Ej: Tarjeta) y Enter..."
                    />
                    
                    <div style={suggestionsBox}>
                        <span style={suggestionsTitle}>Sugerencias rápidas:</span>
                        <div style={suggestionsList}>
                            {sugerencias.map(s => (
                                <motion.div 
                                    key={s} 
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        ...sugPill,
                                        opacity: data.condicionesServicio.includes(s) ? 0.5 : 1,
                                        pointerEvents: data.condicionesServicio.includes(s) ? "none" : "auto"
                                    }}
                                    onClick={() => toggleSugerencia(s)}
                                >
                                    + {s}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Step5 = ({ data, onChange }) => (
    <div style={stepInner}>
        <div style={stepHeader}>
            <div style={stepCircle}>5</div>
            <div>
                <h2 style={stepTitle}>Ubicación</h2>
                <p style={stepSubtitle}>¿Dónde trabajás o querés trabajar?</p>
            </div>
        </div>
        <div style={formGrid}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "12px" }}>
                <Input label="Calle" name="calle" value={data.calle} onChange={onChange} icon={<IconMap />} placeholder="Ing. Huergo" />
                <Input label="Altura" name="numero" value={data.numero} onChange={onChange} icon={<IconId />} placeholder="1234" />
            </div>
            <div style={rowGrid}>
                <Input label="Código Postal" name="codigoPostal" value={data.codigoPostal} onChange={onChange} icon={<IconMap />} placeholder="C1107" />
                <Input label="Ciudad" name="ciudad" value={data.ciudad} onChange={onChange} icon={<IconEmp />} placeholder="Buenos Aires" />
            </div>
            <div style={rowGrid}>
                <Input label="Provincia" name="provincia" value={data.provincia} onChange={onChange} icon={<IconMap />} placeholder="Ej: Buenos Aires" />
                <Input label="País" name="pais" value={data.pais} onChange={onChange} icon={<IconMap />} placeholder="Ej: Argentina" />
            </div>
        </div>
    </div>
)

const Step6 = ({ data, setFormData }) => {
    const handlePhoto = (url) => setFormData({...data, fotoPerfilUrl: url})
    const handlePortafolio = (url) => setFormData(prev => ({...prev, fotosPortafolio: [...prev.fotosPortafolio, url]}))

    return (
        <div style={stepInner}>
            <div style={stepHeader}>
                <div style={stepCircle}>6</div>
                <div>
                    <h2 style={stepTitle}>Multimedia</h2>
                    <p style={stepSubtitle}>Sumá tu foto y mostrá tu trabajo</p>
                </div>
            </div>
            <div style={mediaRow}>
                <div style={uploadCard}>
                    <label style={labelStyle}>Foto de perfil</label>
                    <div style={photoUploadBox} onClick={() => openUploadWidget(handlePhoto, false)}>
                        {data.fotoPerfilUrl ? (
                            <img src={data.fotoPerfilUrl} style={photoPreview} alt="Perfil" />
                        ) : (
                            <div style={uploadPlaceholder}>
                                <IconUser size={40} />
                                <span style={uploadText}>Subir foto</span>
                                <span style={uploadHint}>JPG o PNG</span>
                            </div>
                        )}
                    </div>
                </div>
                <div style={uploadCard}>
                    <label style={labelStyle}>Portafolio</label>
                    <div style={portafolioUploadBox} onClick={() => openUploadWidget(handlePortafolio, true)}>
                        <div style={uploadPlaceholder}>
                            <IconImage size={40} />
                            <span style={uploadText}>Subir trabajos</span>
                            <span style={uploadHint}>Hasta 10 imágenes</span>
                        </div>
                        {data.fotosPortafolio.length > 0 && (
                            <div style={miniGallery}>
                                {data.fotosPortafolio.slice(0, 3).map((url, i) => (
                                    <img key={i} src={url} style={miniImg} alt="Trabajo" />
                                ))}
                                {data.fotosPortafolio.length > 3 && <div style={miniMore}>+{data.fotosPortafolio.length - 3}</div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTES UI ---

const openUploadWidget = (callback, multiple) => {
    if (window.cloudinary) {
        window.cloudinary.openUploadWidget({
            cloudName: "denfvu7zy",
            uploadPreset: "unsigned_preset",
            multiple: multiple,
            sources: ["local", "url", "camera"]
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                callback(result.info.secure_url)
            }
        })
    }
}

const ProgressBar = ({ current, total }) => (
    <div style={barWrapper}>
        {[...Array(total)].map((_, i) => {
            const stepNum = i + 1
            const isCompleted = stepNum < current
            const isActive = stepNum === current
            return (
                <React.Fragment key={i}>
                    <div style={{
                        ...stepDot,
                        background: isCompleted || isActive ? "#A01EED" : "transparent",
                        borderColor: isCompleted || isActive ? "#A01EED" : "#E2E8F0",
                        color: isCompleted || isActive ? "#FFFFFF" : "#94A3B8"
                    }}>
                        {isCompleted ? "✓" : stepNum}
                    </div>
                    {i < total - 1 && (
                        <div style={{
                            ...barLine,
                            background: stepNum < current ? "#A01EED" : "#E2E8F0"
                        }} />
                    )}
                </React.Fragment>
            )
        })}
    </div>
)

const RoleCard = ({ active, title, desc, icon, onClick }) => (
    <div style={{
        ...roleCard,
        borderColor: active ? "#A01EED" : "#E2E8F0",
        background: active ? "rgba(160, 30, 237, 0.05)" : "#FFFFFF"
    }} onClick={onClick}>
        {active && <div style={activeBadge}>✓</div>}
        <div style={{ color: active ? "#A01EED" : "#94A3B8" }}>{icon}</div>
        <strong style={roleName}>{title}</strong>
        <p style={roleDescription}>{desc}</p>
    </div>
)

const Input = ({ label, icon, ...props }) => (
    <div style={inputGroup}>
        <label style={labelStyle}>{label}</label>
        <div style={inputWrap}>
            <div style={inputIconBox}>{icon}</div>
            <input {...props} style={inputField} />
        </div>
    </div>
)

const GuideCheck = ({ met, text }) => (
    <div style={{ ...guideItem, color: met ? "#10B981" : "#94A3B8" }}>
        <div style={{ ...checkCircle, borderColor: met ? "#10B981" : "#94A3B8", background: met ? "#10B981" : "transparent" }}>
            {met && "✓"}
        </div>
        <span>{text}</span>
    </div>
)

const TagInput = ({ tags, setTags, placeholder }) => {
    const [val, setVal] = useState("")
    const add = (e) => {
        if(e.key === "Enter" && val.trim()) {
            e.preventDefault()
            if(!tags.includes(val.trim())) setTags([...tags, val.trim()])
            setVal("")
        }
    }
    return (
        <div style={tagInputContainer}>
            <div style={tagList}>
                {tags.map(t => (
                    <span key={t} style={tagBadge}>
                        {t} <span onClick={() => setTags(tags.filter(x => x !== t))} style={{cursor:"pointer", fontWeight:"bold"}}>×</span>
                    </span>
                ))}
            </div>
            <div style={inputWrap}>
                <div style={inputIconBox}>+</div>
                <input 
                    style={inputField} 
                    placeholder={placeholder} 
                    value={val} 
                    onChange={e => setVal(e.target.value)} 
                    onKeyDown={add} 
                />
            </div>
        </div>
    )
}

const SuccessView = ({ nombre, userId, profileUrl, tipo }) => (
    <div style={successWrapper}>
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={successIcon}
        >
            ✓
        </motion.div>
        <h2 style={{ ...stepTitle, fontSize: "32px", marginBottom: "16px" }}>¡Bienvenido a la comunidad, {nombre}! 🥳</h2>
        <p style={{ ...stepSubtitle, fontSize: "16px", color: "#475569", maxWidth: "500px", marginBottom: "40px" }}>
            {tipo === "CLIENTE" 
                ? "Tu cuenta ha sido creada. Ya podés empezar a buscar los mejores servicios y oportunidades en Chamba."
                : "Tu perfil profesional ya está activo. Es momento de conectar con nuevas oportunidades y mostrar todo lo que sabés hacer."
            }
        </p>
        
        <div style={{ display: "flex", gap: "16px", width: "100%", justifyContent: "center" }}>
            {tipo !== "CLIENTE" && (
                <button 
                    style={primaryBtn} 
                    onClick={() => {
                        const url = profileUrl || "https://overly-mindset-259417.framer.app/perfiles-prov"
                        window.location.href = `${url}?id=${userId}`
                    }}
                >
                    Ver mi perfil profesional
                </button>
            )}
            <button 
                style={tipo === "CLIENTE" ? primaryBtn : secondaryBtn} 
                onClick={() => window.location.href = "/"}
            >
                Ir al inicio
            </button>
        </div>
        <p style={{ marginTop: "40px", fontSize: "13px", color: "#94A3B8" }}>
            CONECTA. TRABAJO. GENERA OPORTUNIDADES.
        </p>
    </div>
)

// --- ICONOS ---
const LogoChamba = ({ color }) => (
    <svg width="120" height="30" viewBox="0 0 150 40" fill="none">
        <path d="M20 10C15 10 10 15 10 20S15 30 20 30S30 25 30 20S25 10 20 10ZM20 25C17.2 25 15 22.8 15 20S17.2 15 20 15S25 17.2 25 20S22.8 25 20 25Z" fill="#A01EED"/>
        <text x="35" y="28" fontFamily="Poppins" fontWeight="700" fontSize="24" fill={color}>chamba</text>
    </svg>
)

const MateIcon = ({ opacity = 1 }) => (
    <svg width="400" height="400" viewBox="0 0 200 200" fill="none" style={{ opacity }}>
        <path d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z" stroke="#A01EED" strokeWidth="2"/>
        <path d="M140 40L110 90" stroke="#A01EED" strokeWidth="4" strokeLinecap="round"/>
    </svg>
)

const IconProf = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconEmp = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/></svg>
const IconSearch = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconUser = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconPhone = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const IconLock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconId = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/></svg>
const IconMap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconImage = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
const IconMail = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>

// --- ESTILOS ---

const pageContainer = { width: "100%", minHeight: "100vh", background: "transparent", padding: "20px", display: "flex", flexDirection: "column", boxSizing: "border-box", position: "relative", overflow: "hidden" }
const headerLogo = { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", width: "100%", padding: "20px 0", zIndex: 10 }
const headerTagline = { fontSize: "12px", fontWeight: "600", color: "#000000", letterSpacing: "0.5px" }
const mainWrapper = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", maxWidth: "1200px", margin: "0 auto", width: "100%", zIndex: 5 }
const progressContainer = { width: "100%", maxWidth: "680px", margin: "20px 0 40px 0" }
const cardStyle = { width: "100%", maxWidth: "720px", background: "#FFFFFF", borderRadius: "24px", padding: "48px", boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column" }

const stepInner = { width: "100%" }
const stepHeader = { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }
const stepCircle = { width: "40px", height: "40px", borderRadius: "50%", background: "#A01EED", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700", fontFamily: "'Poppins', sans-serif" }
const stepTitle = { fontSize: "24px", fontWeight: "700", color: "#000000", margin: "0", fontFamily: "'Poppins', sans-serif" }
const stepSubtitle = { fontSize: "14px", color: "#94A3B8", margin: "4px 0 0 0" }

const roleGrid = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }
const roleCard = { padding: "32px 16px", border: "2px solid #E2E8F0", borderRadius: "16px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.2s", position: "relative" }
const activeBadge = { position: "absolute", top: "12px", right: "12px", width: "20px", height: "20px", borderRadius: "50%", background: "#A01EED", color: "white", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }
const roleName = { fontSize: "15px", fontWeight: "700", margin: "16px 0 8px 0" }
const roleDescription = { fontSize: "12px", color: "#64748B", lineHeight: "1.4" }

const formGrid = { display: "flex", flexDirection: "column", gap: "20px" }
const rowGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }
const inputGroup = { display: "flex", flexDirection: "column", gap: "8px" }
const labelStyle = { fontSize: "14px", fontWeight: "600", color: "#000000" }
const inputWrap = { position: "relative", display: "flex", alignItems: "center" }
const inputIconBox = { position: "absolute", left: "16px", color: "#94A3B8", display: "flex" }
const inputField = { width: "100%", padding: "14px 16px 14px 48px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "15px", color: "#000000", outline: "none", background: "#FFFFFF", boxSizing: "border-box" }
const selectField = { ...inputField, appearance: "none", paddingLeft: "16px" }
const textAreaField = { ...inputField, paddingLeft: "16px", minHeight: "100px", resize: "none" }
const charCounter = { textAlign: "right", fontSize: "11px", color: "#94A3B8", marginTop: "4px" }

const passGuide = { marginTop: "12px", padding: "16px", background: "rgba(160, 30, 237, 0.02)", borderRadius: "12px", border: "1px solid rgba(160, 30, 237, 0.05)" }
const guideTitle = { fontSize: "12px", fontWeight: "600", color: "#64748B", marginBottom: "8px" }
const guideGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }
const guideItem = { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "500" }
const checkCircle = { width: "16px", height: "16px", borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "white" }

const tagInputContainer = { display: "flex", flexDirection: "column", gap: "12px" }
const tagList = { display: "flex", flexWrap: "wrap", gap: "8px" }
const tagBadge = { background: "rgba(160, 30, 237, 0.08)", color: "#A01EED", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }
const checkGrid = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "8px" }
const checkItem = { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#475569", cursor: "pointer" }
const checkboxStyle = { width: "18px", height: "18px", accentColor: "#A01EED" }

const mediaRow = { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }
const uploadCard = { display: "flex", flexDirection: "column", gap: "8px" }
const photoUploadBox = { width: "100%", height: "180px", border: "2px dashed #E2E8F0", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", overflow: "hidden" }
const photoPreview = { width: "100%", height: "100%", objectFit: "cover" }
const portafolioUploadBox = { width: "100%", height: "180px", border: "2px dashed #A01EED", borderRadius: "16px", background: "rgba(160, 30, 237, 0.02)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer" }
const uploadPlaceholder = { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#A01EED" }
const uploadText = { fontSize: "14px", fontWeight: "700" }
const uploadHint = { fontSize: "11px", color: "#94A3B8" }
const miniGallery = { display: "flex", gap: "8px", marginTop: "12px" }
const miniImg = { width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }
const miniMore = { width: "40px", height: "40px", borderRadius: "8px", background: "#A01EED", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }

const barWrapper = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", position: "relative" }
const stepDot = { width: "32px", height: "32px", borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", zIndex: 2 }
const barLine = { flex: 1, height: "2px", margin: "0 -2px" }

const footerRow = { marginTop: "40px", display: "flex", flexDirection: "column", gap: "16px" }
const btnGroup = { display: "flex", justifyContent: "space-between", gap: "12px" }
const primaryBtn = { padding: "14px 32px", background: "#A01EED", color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "transform 0.2s", fontFamily: "'Poppins', sans-serif" }
const secondaryBtn = { padding: "14px 24px", background: "transparent", color: "#94A3B8", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }
const errorAlert = { padding: "12px", background: "#FEF2F2", color: "#EF4444", borderRadius: "12px", fontSize: "13px", textAlign: "center", border: "1px solid #FEE2E2" }

const mateIllustration = { position: "absolute", top: "10%", left: "-100px", pointerEvents: "none", zIndex: 1 }
const successWrapper = { textAlign: "center", padding: "60px 40px", display: "flex", flexDirection: "column", alignItems: "center" }
const successIcon = { width: "80px", height: "80px", background: "#10B981", borderRadius: "50%", color: "white", fontSize: "40px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }

// Estilos del Searchable Select
const selectTrigger = {
    ...inputField,
    paddingLeft: "16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#FFFFFF",
}

const dropdownList = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    width: "100%",
    background: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0px 10px 30px rgba(0,0,0,0.12)",
    zIndex: 100,
    overflow: "hidden",
    border: "1px solid #F1F5F9",
}

const searchWrap = {
    padding: "12px",
    borderBottom: "1px solid #F1F5F9",
    background: "#F8FAFC",
}

const searchInput = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
}

const optionsScroll = {
    maxHeight: "220px",
    overflowY: "auto",
}

const optionItem = {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#1E293B",
    cursor: "pointer",
    transition: "background 0.2s",
    "&:hover": {
        background: "#F5F3FF",
    }
}

const noResults = {
    padding: "16px",
    fontSize: "13px",
    color: "#94A3B8",
    textAlign: "center",
}

// Estilos de Sugerencias
const suggestionsBox = {
    marginTop: "16px",
    padding: "16px",
    background: "#F8FAFC",
    borderRadius: "12px",
    border: "1px solid #F1F5F9",
}

const suggestionsTitle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "block",
    marginBottom: "10px",
}

const suggestionsList = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
}

const sugPill = {
    padding: "6px 12px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
        borderColor: "#A01EED",
        color: "#A01EED",
        background: "rgba(160, 30, 237, 0.02)",
    }
}

// --- FRAMER CONTROLS ---
addPropertyControls(RegistroFormWizardChamba, {
    apiUrl: {
        type: ControlType.String,
        title: "API Base URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    btnText: {
        type: ControlType.String,
        title: "Botón Texto",
        defaultValue: "Siguiente →",
    },
    providerProfileUrl: {
        type: ControlType.String,
        title: "URL Perfil Prov",
        defaultValue: "https://overly-mindset-259417.framer.app/perfiles-prov",
    },
})
