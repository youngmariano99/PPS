import React, { useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js"

/**
 * COMPONENTE DE LOGIN PARA FRAMER
 * ------------------------------
 * Este componente permite iniciar sesión contra el backend de Spring Boot
 * y sincronizar la sesión con Supabase para manejar el JWT.
 */

// NOTA: En Framer, puedes inyectar las claves como Properties o dejarlas hardcodeadas aquí
const supabase = createClient(
    "https://qlciljbuexklxjzxgitk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
)

export default function FormularioLogin(props) {
    const { apiUrl, btnColor, btnText, textColor, borderRadius } = props
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Limpieza de URL para evitar dobles barras
        const cleanApiUrl = apiUrl.replace(/\/+$/, "")
        const fullUrl = `${cleanApiUrl}/auth/login`

        console.log("🚀 Llamando a:", fullUrl)

        try {
            // Paso 1: Llamada al backend de Spring Boot
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()
            console.log("📦 Respuesta:", data)

            if (!response.ok) throw new Error(data.mensaje || "Credenciales incorrectas")

            // Paso 2: Autenticación en Supabase para obtener sesión local (JWT)
            // Esto es necesario si usamos funciones de Supabase como Storage o RLS
            const { error: sbError } = await supabase.auth.signInWithPassword({ email, password })
            if (sbError) throw sbError

            alert(`¡Hola ${data.nombre}! Ingreso exitoso.`)

            // Aquí podrías disparar un evento de Framer para navegar a otra página
            if (props.onLoginSuccess) props.onLoginSuccess(data)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ ...inputStyle, borderRadius: `${borderRadius}px` }}
                    required
                />
                <input
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...inputStyle, borderRadius: `${borderRadius}px` }}
                    required
                />
                {error && <p style={errorStyle}>{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...buttonStyle,
                        backgroundColor: btnColor,
                        color: textColor,
                        borderRadius: `${borderRadius}px`
                    }}
                >
                    {loading ? "Verificando..." : btnText}
                </button>
            </form>
        </div>
    )
}

// Controles para el panel de Framer
addPropertyControls(FormularioLogin, {
    apiUrl: {
        type: ControlType.String,
        title: "URL del Backend",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1"
    },
    btnText: { type: ControlType.String, title: "Texto", defaultValue: "Ingresar" },
    btnColor: { type: ControlType.Color, title: "Color Fondo", defaultValue: "#0070f3" },
    textColor: { type: ControlType.Color, title: "Color Texto", defaultValue: "#FFFFFF" },
    borderRadius: { type: ControlType.Number, title: "Esquinas", defaultValue: 8, min: 0, max: 20 }
})

const containerStyle = { width: "100%", height: "100%", display: "flex", flexDirection: "column" }
const formStyle = { display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }
const inputStyle = { padding: "12px", border: "1px solid #333", background: "#000", color: "white" }
const buttonStyle = { padding: "12px", border: "none", fontWeight: "bold", cursor: "pointer" }
const errorStyle = { color: "#ff4d4d", fontSize: "14px", textAlign: "center" }
