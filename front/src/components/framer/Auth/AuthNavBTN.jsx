import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { User, LogIn, ChevronRight, RefreshCw, LogOut } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * BOTÓN DE NAVEGACIÓN PPS (AUTH DINÁMICO) - V4 (ANTI-CACHE)
 * --------------------------------------------------------
 * - Usa getUser() para validación real del servidor (evita sesiones viejas).
 * - Cierre de sesión con limpieza total de localStorage.
 * - Logs de auditoría por email de usuario.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function AuthNavButton(props) {
    const {
        apiUrl,
        loginUrl,
        providerProfileUrl,
        userProfileUrl,
        primaryColor,
        textColor,
        fontSize,
        borderRadius,
        padding,
        showLogoutWhenLoggedIn,
    } = props

    const [status, setStatus] = useState("checking")
    const [userRole, setUserRole] = useState(null)
    const [isPremium, setIsPremium] = useState(false)
    const [userEmail, setUserEmail] = useState("")

    useEffect(() => {
        const fetchFreshUser = async () => {
            // getUser() es mejor que getSession() porque valida con el servidor
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser()

            if (user) {
                console.log("AuthNav: Valid user found:", user.email)
                setUserEmail(user.email)
                // Obtenemos la sesión para el token necesario en discoverRole
                const {
                    data: { session },
                } = await supabase.auth.getSession()
                if (session) await discoverRole(session)
                else setStatus("guest")
            } else {
                console.log("AuthNav: No valid user detected.")
                setStatus("guest")
            }
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthNav: Auth Event triggered:", event)
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                if (session) {
                    setUserEmail(session.user.email)
                    await discoverRole(session)
                }
            } else if (event === "SIGNED_OUT") {
                setStatus("guest")
                setUserRole(null)
                setIsPremium(false)
                setUserEmail("")
            }
        })

        const discoverRole = async (session) => {
            try {
                const response = await fetch(`${apiUrl}/usuarios/me`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "X-User-Id": session.user.id,
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    console.log(
                        `AuthNav: Role for ${session.user.email} is ${data.rol}, Premium: ${data.isPremium}`
                    )
                    setUserRole(data.rol)
                    setIsPremium(data.isPremium || false)
                    setStatus("authenticated")
                } else {
                    console.warn("AuthNav: Discovery failed for user.")
                    setStatus("authenticated")
                }
            } catch (err) {
                console.error("AuthNav: Discovery fetch error:", err)
                setStatus("authenticated")
            }
        }

        fetchFreshUser()
        return () => subscription.unsubscribe()
    }, [apiUrl])

    const handleClick = () => {
        if (status === "guest") {
            window.location.href = loginUrl
        } else if (status === "authenticated") {
            const targetUrl =
                userRole === "PROVEEDOR" ? providerProfileUrl : userProfileUrl
            window.location.href = targetUrl
        }
    }

    const handleLogout = async (e) => {
        e.stopPropagation()
        console.log("AuthNav: Initiating total logout and cache clear...")

        // 1. Sign out de Supabase
        await supabase.auth.signOut()

        // 2. Limpieza agresiva de localStorage para evitar persistencia de sesion vieja
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes("supabase") || key.includes("sb-"))) {
                localStorage.removeItem(key)
            }
        }

        // 3. Redirección y recarga total
        window.location.href = loginUrl
        // Dejamos un pequeño delay para asegurar que el storage se limpie
        setTimeout(() => window.location.reload(), 200)
    }

    const btnStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: "transparent",
        color: "#374151", // gris tipo navbar
        fontSize: "13px",
        fontWeight: "500",
        borderRadius: "8px",
        padding: "6px 12px",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
        width: "auto", // 🔥 clave
        fontFamily: "Inter, sans-serif",
        height: "32px",
    }

    if (status === "checking") {
        return (
            <button style={{ ...btnStyle, opacity: 0.7, cursor: "wait" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
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
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "2px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    opacity: 0.8,
                                    lineHeight: 1,
                                    color: isPremium ? primaryColor : "inherit",
                                }}
                            >
                                {isPremium ? "PRO" : (userRole === "PROVEEDOR" ? "PROVEEDOR" : "USUARIO")}
                            </span>
                            <span style={{ fontSize: "12px", fontWeight: "600", lineHeight: 1 }}>
                                Mi Perfil
                            </span>
                        </div>
                        <ChevronRight size={14} style={{ opacity: 0.6 }} />
                    </>
                )}
            </motion.button>

            {status === "authenticated" && showLogoutWhenLoggedIn && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleLogout}
                    style={{
                        ...btnStyle,
                        width: "60px",
                        padding: 0,
                        backgroundColor: "#fee2e2",
                        color: "#ef4444",
                    }}
                    title={`Cerrar Sesión (${userEmail})`}
                >
                    <LogOut size={20} />
                </motion.button>
            )}
        </div>
    )
}

addPropertyControls(AuthNavButton, {
    apiUrl: {
        type: ControlType.String,
        title: "Backend URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    loginUrl: {
        type: ControlType.String,
        title: "Login URL",
        defaultValue: "https://overly-mindset-259417.framer.app/login",
    },
    providerProfileUrl: {
        type: ControlType.String,
        title: "Provider Profile URL",
        defaultValue: "https://overly-mindset-259417.framer.app/perfiles-prov",
    },
    userProfileUrl: {
        type: ControlType.String,
        title: "User Profile URL",
        defaultValue: "https://overly-mindset-259417.framer.app/perfil-base",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Botón",
        defaultValue: "#7c3aed",
    },
    textColor: {
        type: ControlType.Color,
        title: "Color Texto",
        defaultValue: "#ffffff",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Tamaño Fuente",
        defaultValue: 14,
        min: 10,
        max: 24,
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radio Borde",
        defaultValue: 14,
        min: 0,
        max: 40,
    },
    padding: {
        type: ControlType.Number,
        title: "Padding Y",
        defaultValue: 12,
        min: 4,
        max: 32,
    },
    showLogoutWhenLoggedIn: {
        type: ControlType.Boolean,
        title: "Mostrar Logout",
        defaultValue: true,
    },
})
