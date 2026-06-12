import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

// ---- Minimal TypeScript Props interface ----
interface Props {
  /** Oferta que se muestra en el modal (puede ser undefined para demo) */
  oferta?: any
  /** Callback que cierra el modal */
  onClose: () => void
  /** API base URL, default localhost */
  apiUrl?: string
  /** Color principal usado en estilos */
  primaryColor?: string
}

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function ModalPostularse(props: Props) {
    const {
        oferta,
        onClose = () => {},
        apiUrl = "http://localhost:8080/api/v1",
        primaryColor = "#A01EED"
    } = props

    // Fallback/Demo offer data if none provided
    const targetOferta = oferta || {
        id: "00000000-0000-0000-0000-000000000000",
        titulo: "Desarrollador Frontend React",
        empresaRazonSocial: "TechNova Solutions",
        proveedorNombre: null,
        modalidad: "REMOTO",
        salarioMin: 900000,
        salarioMax: 1400000,
        preguntasFiltro: [
            { id: "1", pregunta: "¿Tenés experiencia comprobable en React (mínimo 2 años)?", tipoPregunta: "SI_NO", respuestaEsperadaExcluyente: "SI" },
            { id: "2", pregunta: "¿Disponés para trabajar en horario de 9 a 18 hs (GMT-3)?", tipoPregunta: "SI_NO", respuestaEsperadaExcluyente: "SI" }
        ]
    }

    const [mensaje, setMensaje] = useState("")
    const [usarCvNativo, setUsarCvNativo] = useState(true)
    const [fileName, setFileName] = useState("")
    const [fileUploading, setFileUploading] = useState(false)
    const [cvUrl, setCvUrl] = useState("")
    const [respuestas, setRespuestas] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef(null)

    // Load Fonts & Dynamic CSS
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)

        const style = document.createElement("style")
        style.id = "chamba-modal-postularse-styles"
        style.innerHTML = `
            .chamba-modal-textarea:focus {
                border-color: ${primaryColor} !important;
                box-shadow: 0 0 0 3px rgba(160, 30, 237, 0.1) !important;
                outline: none !important;
            }
            .chamba-modal-cancel {
                color: #64748B !important;
                transition: color 0.2s ease !important;
            }
            .chamba-modal-cancel:hover {
                color: #0F172A !important;
                text-decoration: underline !important;
            }
            .chamba-modal-submit-btn {
                background: ${primaryColor} !important;
                transition: opacity 0.2s ease, transform 0.1s ease !important;
            }
            .chamba-modal-submit-btn:hover { opacity: 0.95 !important; }
            .chamba-modal-submit-btn:active { transform: scale(0.98) !important; }
            .chamba-upload-box {
                border: 1.5px dashed #E2E8F0;
                background: #FAF9FF;
                transition: border-color 0.2s ease, background 0.2s ease;
            }
            .chamba-upload-box:hover {
                border-color: ${primaryColor};
                background: rgba(160, 30, 237, 0.02);
            }
        `
        document.head.appendChild(style)
        return () => {
            link.remove()
            style.remove()
        }
    }, [primaryColor])

    const handleSelectOption = (preguntaId, option) => {
        setRespuestas(prev => ({
            ...prev,
            [preguntaId]: option
        }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.type !== "application/pdf") {
                setError("Solo se permiten archivos en formato PDF.")
                return
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("El archivo supera el tamaño máximo de 10MB.")
                return
            }
            setFileName(file.name)
            setFileUploading(true)
            setError(null)
            setTimeout(() => {
                const mockDriveUrl = `https://drive.google.com/file/d/chamba-cv-${Math.random().toString(36).substring(2, 15)}/view?usp=sharing`
                setCvUrl(mockDriveUrl)
                setFileUploading(false)
            }, 1000)
        }
    }

    const handleDragOver = (e) => { e.preventDefault() }
    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            if (file.type !== "application/pdf") { setError("Solo se permiten archivos en formato PDF."); return }
            if (file.size > 10 * 1024 * 1024) { setError("El archivo supera el tamaño máximo de 10MB."); return }
            setFileName(file.name)
            setFileUploading(true)
            setError(null)
            setTimeout(() => {
                const mockDriveUrl = `https://drive.google.com/file/d/chamba-cv-${Math.random().toString(36).substring(2, 15)}/view?usp=sharing`
                setCvUrl(mockDriveUrl)
                setFileUploading(false)
            }, 1000)
        }
    }

    const fetchConAuth = async (endpoint, options = {}) => {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        const { data: { user } } = await supabase.auth.getUser()
        const headers = {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(user && { "X-User-Id": user.id }),
            ...options.headers,
        }
        const response = await fetch(`${apiUrl}${endpoint}`, { ...options, headers })
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`)
        }
        return response.json()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        if (!usarCvNativo && !cvUrl) { setError("Por favor, subí tu archivo CV en formato PDF."); return }
        const filterQuestions = targetOferta.preguntasFiltro || []
        for (const q of filterQuestions) {
            if (!respuestas[q.id]) { setError("Por favor, respondé a todas las preguntas de filtro obligatorias."); return }
        }
        setLoading(true)
        try {
            const mappedAnswers = Object.keys(respuestas).map(key => ({ preguntaId: key, respuestaDada: respuestas[key] }))
            const payload = {
                ofertaId: targetOferta.id,
                mensajePresentacion: mensaje.trim() || null,
                cvUrlAdjunto: usarCvNativo ? null : cvUrl,
                respuestas: mappedAnswers
            }
            await fetchConAuth("/postulaciones", { method: "POST", body: JSON.stringify(payload) })
            setSuccess(true)
            setTimeout(() => { onClose() }, 1500)
        } catch (err) {
            setError(err.message || "Ocurrió un error inesperado al enviar la postulación.")
        } finally {
            setLoading(false)
        }
    }

    const formatSalary = (min, max) => {
        if (!min && !max) return "A convenir"
        const fmt = (val) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(val)
        if (min && max) return `${fmt(min)} - ${fmt(max)} / mes`
        if (min) return `Desde ${fmt(min)} / mes`
        if (max) return `Hasta ${fmt(max)} / mes`
        return "A convenir"
    }

    return (
        <div style={backdropStyle}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                style={modalCardStyle}
            >
                {/* Header Section */}
                <div style={headerWrapper}>
                    <div style={iconBox(primaryColor)}>
                        <IconBriefcase color={primaryColor} />
                    </div>
                    <div style={titleArea}>
                        <h2 style={modalTitle}>{targetOferta.titulo}</h2>
                        <div style={companyWrapper}>
                            <span style={companyName}>{targetOferta.empresaRazonSocial || targetOferta.proveedorNombre || "Empresa Reclutadora"}</span>
                            <IconVerified color={primaryColor} />
                        </div>
                        <div style={metadataRow}>
                            <div style={metaItem}> <IconPin /> {targetOferta.ubicacionText || "Buenos Aires, Argentina"}</div>
                            <div style={metaItem}> <IconMonitor /> {targetOferta.modalidad}</div>
                            <div style={salaryItem(primaryColor)}>{formatSalary(targetOferta.salarioMin, targetOferta.salarioMax)}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>
                {/* Form Body */}
                <form onSubmit={handleSubmit} style={formScrollableBody}>
                    {/* Mensaje de presentación */}
                    <div style={inputGroup}>
                        <label style={labelStyle}>Mensaje de presentación <span style={optionalLabel}>(opcional)</span></label>
                        <div style={{ position: "relative" }}>
                            <textarea
                                className="chamba-modal-textarea"
                                placeholder="Contanos por qué te interesa este puesto y qué podés aportar al equipo..."
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value.slice(0, 500))}
                                style={textareaField}
                            />
                            <div style={charCountStyle}>{mensaje.length}/500</div>
                        </div>
                    </div>
                    {/* Checkbox: Usar CV Nativo */}
                    <label style={checkboxContainerStyle}>
                        <div onClick={() => setUsarCvNativo(!usarCvNativo)} style={customCheckbox(usarCvNativo, primaryColor)}>
                            {usarCvNativo && <IconCheck />}
                        </div>
                        <div style={checkboxLabelTextWrapper}>
                            <span style={checkboxLabelMain}>Usar mi Currículum Nativo de Chamba</span>
                            <span style={checkboxLabelSub}>Tu perfil y experiencia serán enviados automáticamente.</span>
                        </div>
                    </label>
                    {/* Separator */}
                    <div style={separatorWrapper}>
                        <div style={separatorLine} />
                        <span style={separatorText}>o</span>
                        <div style={separatorLine} />
                    </div>
                    {/* PDF Uploader */}
                    <div
                        className="chamba-upload-box"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => !usarCvNativo && fileInputRef.current.click()}
                        style={{ ...uploaderBoxStyle, opacity: usarCvNativo ? 0.5 : 1, cursor: usarCvNativo ? "not-allowed" : "pointer" }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf"
                            disabled={usarCvNativo}
                            style={{ display: "none" }}
                        />
                        <IconUpload color={primaryColor} />
                        <div style={uploaderTextWrapper}>
                            {fileName ? (
                                <>
                                    <span style={uploaderMainText}>{fileName}</span>
                                    <span style={uploaderSubText}>{fileUploading ? "Subiendo archivo..." : "Archivo listo para enviar"}</span>
                                </>
                            ) : (
                                <>
                                    <span style={uploaderMainText}>Arrastrá y soltá tu CV en PDF aquí</span>
                                    <span style={uploaderSubText}>o hacé clic para seleccionar un archivo</span>
                                </>
                            )}
                        </div>
                        <span style={uploaderDetailsText}>Formatos permitidos: PDF. Tamaño máximo: 10MB</span>
                    </div>
                    {/* Preguntas filtro */}
                    {(targetOferta.preguntasFiltro && targetOferta.preguntasFiltro.length > 0) && (
                        <div style={questionsContainer}>
                            <h4 style={questionsTitle}>Preguntas filtro <span style={{ color: "#EF4444" }}>(obligatorias)</span></h4>
                            <p style={questionsSubtitle}>Estas preguntas son excluyentes. Si tu respuesta no cumple con los requisitos, tu postulación podría ser descartada.</p>
                            <div style={questionsListWrapper}>
                                {targetOferta.preguntasFiltro.map((q, idx) => (
                                    <div key={q.id} style={questionRow}>
                                        <div style={indexBoxStyle}>{idx + 1}</div>
                                        <p style={questionTextStyle}>{q.pregunta}</p>
                                        <div style={binaryBtnWrapper}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectOption(q.id, "SI")}
                                                style={binaryBtn(respuestas[q.id] === "SI", primaryColor)}
                                            >
                                                SI
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectOption(q.id, "NO")}
                                                style={binaryBtn(respuestas[q.id] === "NO", primaryColor)}
                                            >
                                                NO
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Alerts */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorAlertStyle}>
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={successAlertStyle}>
                                ¡Postulación enviada con éxito! Revisa tu perfil para seguir el estado.
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Footer actions */}
                    <div style={footerWrapper}>
                        <button type="button" onClick={onClose} className="chamba-modal-cancel" style={cancelBtnStyle}>Cancelar</button>
                        <button
                            type="submit"
                            disabled={loading || fileUploading}
                            className="chamba-modal-submit-btn"
                            style={submitBtnStyle}
                        >
                            {loading ? "Enviando..." : "Enviar Postulación ✓"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// --- ICONS ---

const IconBriefcase = ({ color }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
)

const IconVerified = ({ color }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "6px" }}>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill={color} />
    </svg>
)

const IconPin = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

const IconMonitor = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
)

const IconUpload = ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "8px" }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
)

const IconCheck = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

// --- STYLES (same as original file) ---

const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "24px",
    boxSizing: "border-box"
}

const modalCardStyle = {
    width: "100%",
    maxWidth: "680px",
    maxHeight: "90vh",
    background: "#FFFFFF",
    borderRadius: "28px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif"
}

const headerWrapper = {
    display: "flex",
    alignItems: "flex-start",
    padding: "32px 32px 24px 32px",
    borderBottom: "1px solid #F1F5F9",
    position: "relative",
    gap: "18px"
}

const iconBox = (color) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: `${color}10`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
})

const titleArea = { flex: 1, textAlign: "left" }

const modalTitle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "0 0 4px 0",
    lineHeight: "1.3"
}

const companyWrapper = { display: "flex", alignItems: "center", marginBottom: "12px" }

const companyName = { fontSize: "14px", color: "#475569", fontWeight: "600" }

const metadataRow = { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }

const metaItem = { display: "inline-flex", alignItems: "center", fontSize: "12.5px", color: "#64748B", fontWeight: "500" }

const salaryItem = (color) => ({ display: "inline-flex", alignItems: "center", fontSize: "13px", color: color, fontWeight: "700" })

const closeBtnStyle = { background: "transparent", border: "none", fontSize: "18px", color: "#94A3B8", cursor: "pointer", padding: "4px", position: "absolute", top: "32px", right: "32px" }

const formScrollableBody = { flex: 1, overflowY: "auto", padding: "24px 32px 32px 32px", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }

const inputGroup = { display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }

const labelStyle = { fontSize: "13.5px", fontWeight: "700", color: "#475569" }

const optionalLabel = { fontSize: "12px", color: "#94A3B8", fontWeight: "500" }

const textareaField = { width: "100%", minHeight: "100px", padding: "14px 16px", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "14px", color: "#0F172A", boxSizing: "border-box", background: "#FFFFFF", resize: "none" }

const charCountStyle = { position: "absolute", bottom: "12px", right: "16px", fontSize: "11px", color: "#94A3B8", fontWeight: "500" }

const checkboxContainerStyle = { display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", textAlign: "left", userSelect: "none" }

const customCheckbox = (checked, color) => ({
    width: "18px",
    height: "18px",
    borderRadius: "6px",
    border: checked ? `2px solid ${color}` : "2px solid #CBD5E1",
    background: checked ? color : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "2px",
    transition: "all 0.15s ease",
    flexShrink: 0
})

const checkboxLabelTextWrapper = { display: "flex", flexDirection: "column", gap: "2px" }

const checkboxLabelMain = { fontSize: "14px", fontWeight: "700", color: "#334155" }

const checkboxLabelSub = { fontSize: "12px", color: "#64748B", fontWeight: "500" }

const separatorWrapper = { display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }

const separatorLine = { flex: 1, height: "1px", background: "#F1F5F9" }

const separatorText = { fontSize: "13px", color: "#94A3B8", fontWeight: "600" }

const uploaderBoxStyle = { borderRadius: "16px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }

const uploaderTextWrapper = { display: "flex", flexDirection: "column", gap: "2px", marginBottom: "8px" }

const uploaderMainText = { fontSize: "14px", fontWeight: "700", color: "#334155" }

const uploaderSubText = { fontSize: "12.5px", color: "#64748B", fontWeight: "500" }

const uploaderDetailsText = { fontSize: "11px", color: "#94A3B8", fontWeight: "500" }

const questionsContainer = { background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "16px", padding: "20px 24px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }

const questionsTitle = { fontSize: "14px", fontWeight: "700", color: "#78350F", margin: 0 }

const questionsSubtitle = { fontSize: "12px", color: "#B45309", margin: 0, lineHeight: "1.4" }

const questionsListWrapper = { display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }

const questionRow = { display: "flex", alignItems: "center", gap: "12px" }

const indexBoxStyle = { width: "24px", height: "24px", borderRadius: "50%", background: "#FFF7ED", border: "1px solid #FFE3E3", color: "#F97316", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }

const questionTextStyle = { fontSize: "13.5px", color: "#451A03", fontWeight: "600", margin: 0, flex: 1, lineHeight: "1.4" }

const binaryBtnWrapper = { display: "flex", gap: "8px", flexShrink: 0 }

const binaryBtn = (selected, activeColor) => ({
    width: "48px",
    height: "32px",
    borderRadius: "8px",
    border: selected ? "none" : "1px solid #E2E8F0",
    background: selected ? activeColor : "#FFFFFF",
    color: selected ? "#FFFFFF" : "#64748B",
    fontSize: "12px"
})

const errorAlertStyle = { background: "#FEE2E2", color: "#B91C1C", padding: "12px 16px", borderRadius: "8px", fontWeight: "500" }

const successAlertStyle = { background: "#DCFCE7", color: "#166534", padding: "12px 16px", borderRadius: "8px", fontWeight: "500" }

const footerWrapper = { display: "flex", justifyContent: "flex-end", gap: "12px" }

const cancelBtnStyle = { background: "transparent", color: "#64748B", fontWeight: "600", border: "none", cursor: "pointer" }

const submitBtnStyle = { background: primaryColor, color: "#FFFFFF", fontWeight: "600", border: "none", borderRadius: "8px", padding: "10px 24px", cursor: "pointer" }

addPropertyControls(ModalPostularse, {
    oferta: { type: ControlType.Object, title: "Oferta" },
    onClose: { type: ControlType.Event, title: "Cerrar" },
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "http://localhost:8080/api/v1" },
    primaryColor: { type: ControlType.Color, title: "Color primario", defaultValue: "#A01EED" }
})
