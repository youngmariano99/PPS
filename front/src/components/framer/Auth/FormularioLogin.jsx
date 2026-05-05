import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType, motion, AnimatePresence } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js"

/**
 * CHAMBA LOGIN UI - 1:1 DESIGN FIDELITY
 * --------------------------------------
 * Refactorización total basada en la guía de estilos:
 * Colores: #A01EED (Principal), #000000 (Neutro), #94A3B8 (Secundario)
 */

const supabase = createClient(
    "https://qlciljbuexklxjzxgitk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
)

export default function FormularioLogin(props) {
    const { apiUrl, btnText, onLoginSuccess } = props

    // Estados de datos
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [intentos, setIntentos] = useState(0)
    const [bloqueado, setBloqueado] = useState(false)

    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [forgotLoading, setForgotLoading] = useState(false)
    const [forgotSuccess, setForgotSuccess] = useState(false)

    // Inyectar Google Fonts
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)
        return () => document.head.removeChild(link)
    }, [])

    // Seguridad: Manejo de intentos
    useEffect(() => {
        if (intentos >= 5) {
            setBloqueado(true)
            setError("Demasiados intentos por seguridad. Esperá 30 segundos e intentá de nuevo.")
            const timer = setTimeout(() => {
                setBloqueado(false)
                setIntentos(0)
                setError(null)
            }, 30000)
            return () => clearTimeout(timer)
        }
    }, [intentos])

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setForgotLoading(true)
        setError(null)
        
        try {
            const base = (apiUrl || "").replace(/\/+$/, "")
            const response = await fetch(`${base}/auth/recuperar-password?email=${email}`, {
                method: "POST"
            })
            if (!response.ok) throw new Error("ERROR_SENDING_EMAIL")
            setForgotSuccess(true)
        } catch (err) {
            setError("No pudimos enviar el correo. Verificá que el email sea correcto.")
        } finally {
            setForgotLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (bloqueado) return

        setLoading(true)
        setError(null)

        const cleanEmail = email.trim()
        const cleanPassword = password.trim()
        const base = (apiUrl || "").replace(/\/+$/, "")
        const fullUrl = `${base}/auth/login`

        try {
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
            })

            let data = await response.json()

            if (!response.ok) {
                setIntentos(prev => prev + 1)
                throw new Error(response.status === 401 ? "INVALID_CREDENTIALS" : "SERVER_ERROR")
            }

            // Supabase Auth Sync
            const { error: sbError } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: cleanPassword,
            })
            if (sbError) throw new Error("AUTH_SYNC_ERROR")

            localStorage.setItem("usuario", JSON.stringify({
                id: data.usuarioId,
                nombre: data.nombre,
                email: data.email,
            }))

            setSuccess(true)
            
            if (onLoginSuccess) onLoginSuccess(data)

            // Redirección suave después de mostrar el éxito
            setTimeout(() => {
                window.location.href = "https://overly-mindset-259417.framer.app/"
            }, 2000)

        } catch (err) {
            const errorMap = {
                "INVALID_CREDENTIALS": "¡Ups! El email o la contraseña no coinciden. Por favor, revisalos e intentalo de nuevo.",
                "SERVER_ERROR": "Estamos teniendo un problema técnico en nuestros servidores. Por favor, danos unos minutos e intentalo más tarde.",
                "AUTH_SYNC_ERROR": "No pudimos sincronizar tu sesión de forma segura. Por favor, intentá ingresar una vez más.",
            }
            setError(errorMap[err.message] || "Algo no salió como esperábamos. Por favor, verificá tus datos e intentá de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={pageContainer}>
            <div style={mainContent}>
                {/* Ilustración Mate (Izquierda) */}
                <div style={mateWrapper}>
                    <MateIllustration />
                </div>

                {/* Card de Login */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={cardStyle}
                >
                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key={isForgotPassword ? "forgot-form" : "login-form"}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
                            >
                                <h1 style={titleStyle}>
                                    {isForgotPassword ? "Recuperar cuenta" : <span>¡Bienvenido a <span style={{ color: "#A01EED" }}>Chamba</span>!</span>}
                                </h1>
                                <p style={subtitleStyle}>
                                    {isForgotPassword 
                                        ? "Ingresá tu email y te enviaremos las instrucciones para restablecer tu contraseña." 
                                        : "Ingresá a tu cuenta y seguí conectando talento con oportunidades."}
                                </p>

                                {isForgotPassword && forgotSuccess ? (
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ ...successIconWrapper, width: "60px", height: "60px", margin: "0 auto 20px" }}>
                                            <IconCheck />
                                        </div>
                                        <p style={{ ...subtitleStyle, color: "#000", fontWeight: "600" }}>¡Mail enviado!</p>
                                        <p style={subtitleStyle}>Revisá tu bandeja de entrada para continuar.</p>
                                        <span style={linkVioletBold} onClick={() => { setIsForgotPassword(false); setForgotSuccess(false); }}>Volver al login</span>
                                    </div>
                                ) : (
                                    <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} style={formStyle}>
                                        {/* Email Input */}
                                        <div style={inputGroup}>
                                            <label style={labelStyle}>Email</label>
                                            <div style={inputWrapper}>
                                                <div style={inputIcon}><IconMail /></div>
                                                <input
                                                    type="email"
                                                    placeholder="tu@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    style={inputField}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {!isForgotPassword && (
                                            <>
                                                {/* Password Input */}
                                                <div style={inputGroup}>
                                                    <label style={labelStyle}>Contraseña</label>
                                                    <div style={inputWrapper}>
                                                        <div style={inputIcon}><IconLock /></div>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="••••••••"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            style={inputField}
                                                            required
                                                        />
                                                        <div 
                                                            style={passwordToggle} 
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            <IconEye show={showPassword} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={forgotPasswordWrapper}>
                                                    <span style={linkViolet} onClick={() => setIsForgotPassword(true)}>¿Olvidaste tu contraseña?</span>
                                                </div>
                                            </>
                                        )}

                                        {/* Submit Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="submit"
                                            disabled={loading || forgotLoading || bloqueado}
                                            style={{
                                                ...submitButton,
                                                background: (loading || forgotLoading) ? "#94A3B8" : "#A01EED"
                                            }}
                                        >
                                            {isForgotPassword 
                                                ? (forgotLoading ? "Enviando..." : "Enviar instrucciones") 
                                                : (loading ? "Ingresando..." : btnText)}
                                        </motion.button>

                                        {isForgotPassword && (
                                            <div style={footerText}>
                                                <span style={linkViolet} onClick={() => setIsForgotPassword(false)}>Volver al login</span>
                                            </div>
                                        )}

                                        {!isForgotPassword && (
                                            <>
                                                {/* Separator */}
                                                <div style={separatorWrapper}>
                                                    <div style={line} />
                                                    <span style={separatorText}>o continuá con</span>
                                                    <div style={line} />
                                                </div>

                                                {/* Social Buttons */}
                                                <div style={socialRow}>
                                                    <div style={socialButton}>
                                                        <IconGoogle />
                                                        <span>Continuar con Google</span>
                                                    </div>
                                                    <div style={socialButton}>
                                                        <IconFacebook />
                                                        <span>Continuar con Facebook</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Error Message */}
                                        <AnimatePresence>
                                            {error && (
                                                <motion.p 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }} 
                                                    style={errorTextStyle}
                                                >
                                                    {error}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>

                                        {!isForgotPassword && (
                                            <div style={footerText}>
                                                ¿No tenés cuenta? <span style={linkVioletBold} onClick={() => window.location.href = "https://overly-mindset-259417.framer.app/registro-general"}>Crear cuenta nueva</span>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-message"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "20px 0" }}
                            >
                                <div style={successIconWrapper}>
                                    <IconCheck />
                                </div>
                                <h2 style={{ ...titleStyle, marginTop: "24px" }}>¡Qué bueno verte de nuevo!</h2>
                                <p style={subtitleStyle}>Ingresaste correctamente. En unos segundos te llevamos al inicio...</p>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    style={{ marginTop: "20px" }}
                                >
                                    <IconSpinner />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Texto Derecha */}
                <div style={sideTextWrapper}>
                    <span style={sideText}>Acá pasan <br/> cosas.</span>
                    <div style={underline} />
                </div>
            </div>
        </div>
    )
}

// --- SVGS & ASSETS ---

const LogoChamba = ({ color }) => (
    <svg width="150" height="40" viewBox="0 0 150 40" fill="none">
        <path d="M20 10C15 10 10 15 10 20S15 30 20 30S30 25 30 20S25 10 20 10ZM20 25C17.2 25 15 22.8 15 20S17.2 15 20 15S25 17.2 25 20S22.8 25 20 25Z" fill="#A01EED"/>
        <text x="35" y="28" fontFamily="Poppins" fontWeight="700" fontSize="24" fill={color}>chamba</text>
    </svg>
)

const MateIllustration = () => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <path d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z" stroke="#A01EED" strokeOpacity="0.1" strokeWidth="2"/>
        <path d="M100 160C133.137 160 160 133.137 160 100C160 66.8629 133.137 40 100 40C66.8629 40 40 66.8629 40 100C40 133.137 66.8629 160 100 160Z" fill="#F5F3FF"/>
        <circle cx="100" cy="100" r="10" fill="#A01EED" fillOpacity="0.2"/>
        <path d="M140 40L110 90" stroke="#A01EED" strokeWidth="4" strokeLinecap="round"/>
    </svg>
)

const IconMail = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
)

const IconLock = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
)

const IconEye = ({ show }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        {!show && <line x1="1" y1="1" x2="23" y2="23" stroke="#94A3B8" strokeWidth="2" />}
    </svg>
)

const IconGoogle = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
)

const IconFacebook = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
)

const IconCheck = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
)

const IconSpinner = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A01EED" strokeWidth="3" strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
)

// --- ESTILOS ---

const successIconWrapper = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#A01EED",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(160, 30, 237, 0.3)",
}

const pageContainer = {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "transparent",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
    boxSizing: "border-box",
}

const headerLogo = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    padding: "20px 0",
}

const headerTagline = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#000000",
    letterSpacing: "0.5px",
}

const mainContent = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
}

const mateWrapper = {
    position: "absolute",
    left: "50px",
    opacity: 0.8,
}

const cardStyle = {
    width: "100%",
    maxWidth: "480px",
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "48px",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
    border: "1px solid rgba(0,0,0,0.02)",
}

const titleStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "28px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 12px 0",
    textAlign: "center",
}

const subtitleStyle = {
    fontSize: "14px",
    color: "#94A3B8",
    textAlign: "center",
    margin: "0 0 32px 0",
    maxWidth: "300px",
    lineHeight: "1.5",
}

const formStyle = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
}

const inputGroup = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
}

const labelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#000000",
}

const inputWrapper = {
    position: "relative",
    display: "flex",
    alignItems: "center",
}

const inputIcon = {
    position: "absolute",
    left: "16px",
    color: "#94A3B8",
    display: "flex",
}

const inputField = {
    width: "100%",
    padding: "14px 16px 14px 48px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    fontSize: "15px",
    color: "#000000",
    outline: "none",
    background: "#FFFFFF",
    transition: "border-color 0.2s ease",
}

const passwordToggle = {
    position: "absolute",
    right: "16px",
    cursor: "pointer",
    display: "flex",
}

const forgotPasswordWrapper = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-8px",
}

const linkViolet = {
    color: "#A01EED",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
}

const submitButton = {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    color: "#FFFFFF",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "12px",
    transition: "all 0.2s ease",
}

const separatorWrapper = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "12px 0",
}

const line = {
    flex: 1,
    height: "1px",
    background: "#E2E8F0",
}

const separatorText = {
    fontSize: "13px",
    color: "#94A3B8",
}

const socialRow = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
}

const socialButton = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    background: "#FFFFFF",
    fontSize: "14px",
    color: "#64748B",
    fontWeight: "500",
    cursor: "pointer",
}

const footerText = {
    textAlign: "center",
    fontSize: "14px",
    color: "#000000",
    marginTop: "20px",
}

const linkVioletBold = {
    color: "#A01EED",
    fontWeight: "700",
    cursor: "pointer",
}

const errorTextStyle = {
    color: "#EF4444",
    fontSize: "13px",
    textAlign: "center",
    margin: "0",
}

const sideTextWrapper = {
    position: "absolute",
    right: "50px",
    transform: "rotate(5deg)",
}

const sideText = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "32px",
    fontWeight: "700",
    color: "#A01EED",
    lineHeight: "1",
}

const underline = {
    width: "100%",
    height: "4px",
    background: "#A01EED",
    borderRadius: "2px",
    marginTop: "8px",
}

// --- CONTROLES FRAMER ---
addPropertyControls(FormularioLogin, {
    apiUrl: {
        type: ControlType.String,
        title: "URL Backend",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    btnText: {
        type: ControlType.String,
        title: "Botón",
        defaultValue: "Ingresar",
    },
})
