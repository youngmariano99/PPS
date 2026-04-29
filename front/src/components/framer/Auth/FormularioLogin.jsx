import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType, motion, AnimatePresence } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js"

/**
 * COMPONENTE DE LOGIN PREMIUM PARA FRAMER
 * --------------------------------------
 * Rediseño estético con Glassmorphism y seguridad reforzada.
 */

const supabase = createClient(
    "https://qlciljbuexklxjzxgitk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
)

export default function FormularioLogin(props) {
    const { apiUrl, btnText, borderRadius, showGlass } = props

    // Estados
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [intentos, setIntentos] = useState(0)
    const [bloqueado, setBloqueado] = useState(false)

    // Seguridad: Manejo de intentos locales
    useEffect(() => {
        if (intentos >= 5) {
            setBloqueado(true)
            setError("Demasiados intentos. Por seguridad, el formulario se ha bloqueado temporalmente.")
            const timer = setTimeout(() => {
                setBloqueado(false)
                setIntentos(0)
                setError(null)
            }, 30000) // Bloqueo de 30 segundos
            return () => clearTimeout(timer)
        }
    }, [intentos])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (bloqueado) return

        setLoading(true)
        setError(null)

        // Sanitización básica
        const cleanEmail = email.trim()
        const cleanPassword = password.trim()

        const base = (apiUrl || "").replace(/\/+$/, "")
        const fullUrl = `${base}/auth/login`

        try {
            // Paso 1: Backend Spring Boot
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
            }).catch(fetchErr => {
                // Manejo de error de red (servidor apagado o sin internet)
                throw new Error("NETWORK_ERROR")
            })

            let data
            try {
                data = await response.json()
            } catch (jsonErr) {
                throw new Error("SERVER_ERROR")
            }

            if (!response.ok) {
                setIntentos(prev => prev + 1)
                if (response.status === 401 || response.status === 403) {
                    throw new Error("INVALID_CREDENTIALS")
                }
                throw new Error(data.mensaje || "SERVER_ERROR")
            }

            // Paso 2: Supabase Auth
            const { error: sbError } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: cleanPassword,
            })
            if (sbError) {
                if (sbError.message.includes("Invalid login credentials")) throw new Error("INVALID_CREDENTIALS")
                throw sbError
            }

            // Persistencia Local
            localStorage.setItem("usuario", JSON.stringify({
                id: data.usuarioId,
                nombre: data.nombre,
                email: data.email,
            }))

            if (props.onLoginSuccess) props.onLoginSuccess(data)

        } catch (err) {
            // Mapeo de errores técnicos a mensajes amigables
            const errorMap = {
                "NETWORK_ERROR": "No pudimos conectar con el servidor. Por favor, revisa tu conexión a internet o intenta más tarde.",
                "INVALID_CREDENTIALS": "El correo o la contraseña no son correctos. Por favor, verifícalos e intenta de nuevo.",
                "SERVER_ERROR": "Hubo un inconveniente técnico en nuestro sistema. Estamos trabajando para solucionarlo.",
                "auth/invalid-email": "El formato del correo electrónico no es válido.",
                "Too many requests": "Has realizado demasiados intentos. Por seguridad, espera unos minutos."
            }

            setError(errorMap[err.message] || errorMap[err.code] || "Ocurrió un error inesperado. Por favor, contacta a soporte.")
            console.error("DEBUG LOGIN:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                ...containerStyle,
                background: showGlass ? "rgba(255, 255, 255, 0.05)" : "transparent",
                backdropFilter: showGlass ? "blur(12px)" : "none",
                borderRadius: `${borderRadius}px`,
                border: showGlass ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
            }}
        >
            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={inputGroupStyle}>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ ...inputStyle, borderRadius: `${borderRadius}px` }}
                        required
                        disabled={bloqueado}
                    />
                </div>

                <div style={inputGroupStyle}>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ ...inputStyle, borderRadius: `${borderRadius}px` }}
                        required
                        disabled={bloqueado}
                    />
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            style={errorStyle}
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={!bloqueado && !loading ? { scale: 1.02, boxShadow: "0 10px 20px -10px rgba(99, 102, 241, 0.5)" } : {}}
                    whileTap={!bloqueado && !loading ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={loading || bloqueado}
                    style={{
                        ...buttonStyle,
                        background: bloqueado ? "#475569" : "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                        borderRadius: `${borderRadius}px`,
                        opacity: loading ? 0.8 : 1,
                    }}
                >
                    {loading ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            style={loaderStyle}
                        />
                    ) : btnText}
                </motion.button>

                <p style={footerStyle}>
                    ¿No tienes cuenta? <span style={{ color: "#818CF8", cursor: "pointer", fontWeight: "600" }}>Regístrate</span>
                </p>
            </form>
        </motion.div>
    )
}

// Estilos
const containerStyle = {
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    fontFamily: "'Inter', system-ui, sans-serif",
}

const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
}

const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
}

const inputStyle = {
    padding: "14px 16px",
    background: "#0A0A0B", // Negro profundo como en la imagen
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
}

const buttonStyle = {
    padding: "14px",
    border: "none",
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background 0.3s ease",
}

const errorStyle = {
    color: "#F87171",
    fontSize: "13px",
    textAlign: "center",
    margin: "0",
    fontWeight: "500",
    lineHeight: "1.4"
}

const footerStyle = {
    color: "#94A3B8",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "10px",
}

const loaderStyle = {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #FFFFFF",
    borderRadius: "50%",
}

// Controles para Framer
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
    borderRadius: {
        type: ControlType.Number,
        title: "Esquinas",
        defaultValue: 12,
        min: 0,
        max: 30,
    },
    showGlass: {
        type: ControlType.Boolean,
        title: "Efecto Cristal",
        defaultValue: true,
    },
})
