import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { User, LogIn, ChevronRight, RefreshCw } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * BOTÓN DE NAVEGACIÓN PPS (AUTH DINÁMICO)
 * --------------------------------------
 * Cambia automáticamente entre "Iniciar Sesión" y "Mi Perfil".
 * Redirige a la página correcta según el ROL del usuario.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function AuthNavButton(props) {
    const { 
        apiUrl, loginUrl, providerProfileUrl, userProfileUrl,
        primaryColor, textColor, fontSize, borderRadius, padding
    } = props

    const [status, setStatus] = useState("checking") // checking, guest, authenticated
    const [userRole, setUserRole] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Detectar sesión inicial
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                await discoverRole(session)
            } else {
                setStatus("guest")
            }
        }

        // Escuchar cambios (Login/Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) discoverRole(session)
            else setStatus("guest")
        })

        const discoverRole = async (session) => {
            try {
                const response = await fetch(`${apiUrl}/usuarios/me`, {
                    headers: {
                        "Authorization": `Bearer ${session.access_token}`,
                        "X-User-Id": session.user.id
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setUserRole(data.rol)
                    setStatus("authenticated")
                } else {
                    setStatus("authenticated") // Fallback to basic auth even if /me fails
                }
            } catch (err) {
                console.error("Auth button discovery error:", err)
                setStatus("authenticated")
            }
        }

        checkSession()
        return () => subscription.unsubscribe()
    }, [apiUrl])

    const handleClick = () => {
        if (status === "guest") {
            window.location.href = loginUrl
        } else if (status === "authenticated") {
            if (userRole === "PROVEEDOR") {
                window.location.href = providerProfileUrl
            } else {
                window.location.href = userProfileUrl
            }
        }
    }

    const btnStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: primaryColor,
        color: textColor,
        fontSize: `${fontSize}px`,
        fontWeight: "700",
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px 24px`,
        border: "none",
        cursor: "pointer",
        width: "100%",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 4px 14px 0 rgba(0,0,0,0.1)",
    }

    if (status === "checking") {
        return (
            <button style={{ ...btnStyle, opacity: 0.8, cursor: "wait" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <RefreshCw size={16} />
                </motion.div>
            </button>
        )
    }

    return (
        <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            style={btnStyle}
        >
            {status === "guest" ? (
                <>
                    <LogIn size={18} />
                    <span>Iniciar Sesión</span>
                </>
            ) : (
                <>
                    <User size={18} />
                    <span>Mi Perfil</span>
                    <ChevronRight size={14} style={{ opacity: 0.6 }} />
                </>
            )}
        </motion.button>
    )
}

addPropertyControls(AuthNavButton, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    loginUrl: { type: ControlType.String, title: "Login URL", defaultValue: "/login" },
    providerProfileUrl: { type: ControlType.String, title: "Provider Profile URL", defaultValue: "/perfiles-prov" },
    userProfileUrl: { type: ControlType.String, title: "User Profile URL", defaultValue: "/perfil-base" },
    primaryColor: { type: ControlType.Color, title: "Fondo", defaultValue: "#7c3aed" },
    textColor: { type: ControlType.Color, title: "Texto", defaultValue: "#ffffff" },
    fontSize: { type: ControlType.Number, title: "Tamaño Fuente", defaultValue: 14, min: 10, max: 24 },
    borderRadius: { type: ControlType.Number, title: "Radio Borde", defaultValue: 12, min: 0, max: 40 },
    padding: { type: ControlType.Number, title: "Padding Y", defaultValue: 12, min: 4, max: 32 },
})
