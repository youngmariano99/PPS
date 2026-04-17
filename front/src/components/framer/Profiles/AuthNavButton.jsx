import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { User, LogIn, ChevronRight, RefreshCw, LogOut } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * BOTÓN DE NAVEGACIÓN PPS (AUTH DINÁMICO) - V2
 * -------------------------------------------
 * - Robusto contra errores de CORS.
 * - Soporta URLs absolutas para la web real.
 * - Detecta rol de forma automática para redirigir.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function AuthNavButton(props) {
    const { 
        apiUrl, loginUrl, providerProfileUrl, userProfileUrl,
        primaryColor, textColor, fontSize, borderRadius, padding,
        showLogoutWhenLoggedIn
    } = props

    const [status, setStatus] = useState("checking") 
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                await discoverRole(session)
            } else {
                setStatus("guest")
            }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) discoverRole(session)
            else {
                setStatus("guest")
                setUserRole(null)
            }
        })

        const discoverRole = async (session) => {
            try {
                // Intentamos descubrir el rol
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
                    // Si falla el endpoint (ej. CORS o 404), igual estamos autenticados
                    setStatus("authenticated")
                }
            } catch (err) {
                console.warn("Role discovery bypassed due to error:", err)
                setStatus("authenticated")
            }
        }

        checkSession()
        return () => subscription.unsubscribe()
    }, [apiUrl])

    const handleClick = () => {
        if (status === "guest") {
            // Ir al login de la web real
            window.location.href = loginUrl
        } else if (status === "authenticated") {
            if (userRole === "PROVEEDOR") {
                window.location.href = providerProfileUrl
            } else {
                window.location.href = userProfileUrl
            }
        }
    }

    const handleLogout = async (e) => {
        e.stopPropagation()
        await supabase.auth.signOut()
        window.location.href = loginUrl
    }

    const btnStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        backgroundColor: primaryColor,
        color: textColor,
        fontSize: `${fontSize}px`,
        fontWeight: "800",
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px 28px`,
        border: "none",
        cursor: "pointer",
        width: "100%",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        height: "50px"
    }

    if (status === "checking") {
        return (
            <button style={{ ...btnStyle, opacity: 0.7, cursor: "wait" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <RefreshCw size={18} />
                </motion.div>
            </button>
        )
    }

    return (
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
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
                        <span>{userRole === "PROVEEDOR" ? "Perfil PRO" : "Mi Perfil"}</span>
                        <ChevronRight size={14} style={{ opacity: 0.6 }} />
                    </>
                )}
            </motion.button>
            
            {status === "authenticated" && showLogoutWhenLoggedIn && (
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    onClick={handleLogout}
                    style={{ ...btnStyle, width: "60px", padding: 0, backgroundColor: "#fee2e2", color: "#ef4444" }}
                    title="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </motion.button>
            )}
        </div>
    )
}

addPropertyControls(AuthNavButton, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    loginUrl: { type: ControlType.String, title: "Login URL", defaultValue: "https://overly-mindset-259417.framer.app/login" },
    providerProfileUrl: { type: ControlType.String, title: "Provider Profile URL", defaultValue: "https://overly-mindset-259417.framer.app/perfiles-prov" },
    userProfileUrl: { type: ControlType.String, title: "User Profile URL", defaultValue: "https://overly-mindset-259417.framer.app/perfil-base" },
    primaryColor: { type: ControlType.Color, title: "Color Botón", defaultValue: "#7c3aed" },
    textColor: { type: ControlType.Color, title: "Color Texto", defaultValue: "#ffffff" },
    fontSize: { type: ControlType.Number, title: "Tamaño Fuente", defaultValue: 14, min: 10, max: 24 },
    borderRadius: { type: ControlType.Number, title: "Radio Borde", defaultValue: 14, min: 0, max: 40 },
    padding: { type: ControlType.Number, title: "Padding Y", defaultValue: 12, min: 4, max: 32 },
    showLogoutWhenLoggedIn: { type: ControlType.Boolean, title: "Mostrar Logout", defaultValue: true },
})
