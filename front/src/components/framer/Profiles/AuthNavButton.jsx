import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { User, LogIn, ChevronDown, LogOut, Plus, Building, Briefcase } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { useIdentityStore } from "./UseIdentityStore.tsx"

/**
 * BOTÓN DE NAVEGACIÓN MULTI-IDENTIDAD CHAMBA
 * --------------------------------------------------------
 * - Se conecta al store global de Zustand.
 * - Muestra un Switcher desplegable con las entidades del usuario.
 * - Soporta la creación de nuevas páginas desde el menú.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function AuthNavButton(props) {
    const {
        apiUrl, loginUrl, providerProfileUrl, userProfileUrl,
        primaryColor, textColor, showLogoutWhenLoggedIn
    } = props

    const [isHovered, setIsHovered] = useState(false)

    // Conexión al Cerebro Global
    const {
        isHydrated, cuentaBase, contextosDisponibles, contextoActivo,
        setContextoActivo, hydrateFromApi, setShowUpgradeModal
    } = useIdentityStore()

    useEffect(() => {
        // Al montar el botón en el Navbar, hidratamos el estado global
        hydrateFromApi(apiUrl, supabase)

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                hydrateFromApi(apiUrl, supabase)
            }
        })
        return () => subscription.unsubscribe()
    }, [apiUrl, hydrateFromApi])

    const handleLogout = async (e) => {
        e?.stopPropagation()
        await supabase.auth.signOut()
        localStorage.removeItem('chamba_active_context')
        window.location.href = loginUrl
        setTimeout(() => window.location.reload(), 200)
    }

    const handleSwitchContext = (ctx) => {
        setContextoActivo(ctx)
        setIsHovered(false)

        // Redirigir siempre a la misma página (Dashboard/Perfil), el componente inteligente hará el resto
        if (ctx.tipo === "USUARIO_BASE") {
            window.location.href = providerProfileUrl
        } else {
            // Asumimos que providerProfileUrl es el Dashboard para Proveedores/Empresas
            window.location.href = providerProfileUrl
        }
    }

    // Mientras carga
    if (!isHydrated) return <div style={{ width: "120px", height: "42px", borderRadius: "21px", background: "#f1f5f9" }} />

    // Usuario Invitado
    if (!cuentaBase) {
        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => window.location.href = loginUrl}
                style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: primaryColor, color: textColor,
                    padding: "0 22px", height: "42px", borderRadius: "10px",
                    border: "none", fontWeight: "700", cursor: "pointer", fontFamily: "Inter"
                }}
            >
                <LogIn size={18} /> Iniciar Sesión
            </motion.button>
        )
    }

    // Lógica visual del Contexto Activo
    const currentName = contextoActivo.tipo === 'USUARIO_BASE'
        ? `${cuentaBase.nombre} (Cliente)`
        : `${contextoActivo.nombreContexto} (${contextoActivo.tipo === 'EMPRESA' ? 'Empresa' : 'Proveedor'})`;

    const currentIcon = contextoActivo.tipo === 'EMPRESA'
        ? <Building size={16} />
        : contextoActivo.tipo === 'PROVEEDOR' ? <Briefcase size={16} /> : <User size={16} />;

    return (
        <div
            style={{ position: "relative", fontFamily: "Inter" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Botón Principal (Indicador de Contexto Activo) */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: "white", color: "#1e293b",
                    padding: "6px 16px 6px 6px", height: "42px", borderRadius: "21px",
                    border: "1px solid #e2e8f0", cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}
            >
                <div style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: primaryColor, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundImage: contextoActivo.fotoUrl ? `url(${contextoActivo.fotoUrl})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                }}>
                    {!contextoActivo.fotoUrl && currentIcon}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "600", maxWidth: "120px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentName}
                </span>
                <ChevronDown size={16} style={{ color: "#94a3b8", transform: isHovered ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s ease" }} />
            </motion.div>

            {/* Menú Desplegable (Dropdown Multi-Identidad) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "absolute", top: "100%", right: 0, marginTop: "8px",
                            width: "240px", background: "white", borderRadius: "16px",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            border: "1px solid #f1f5f9", overflow: "hidden", zIndex: 1000
                        }}
                    >
                        <div style={{ padding: "8px" }}>
                            <div style={{ padding: "8px 12px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Cambiar de Perfil</div>

                            {/* Opción 1: Cuenta Base */}
                            <div
                                onClick={() => handleSwitchContext({ tipo: 'USUARIO_BASE', idPerfil: null, nombreContexto: 'Cuenta Personal', fotoUrl: null })}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                    borderRadius: "10px", cursor: "pointer",
                                    background: contextoActivo.tipo === 'USUARIO_BASE' ? "#f8fafc" : "transparent"
                                }}
                            >
                                <User size={16} style={{ color: contextoActivo.tipo === 'USUARIO_BASE' ? primaryColor : "#64748b" }} />
                                <span style={{ fontSize: "14px", fontWeight: contextoActivo.tipo === 'USUARIO_BASE' ? "600" : "500", color: "#334155" }}>Modo Cliente</span>
                            </div>

                            {/* Opciones Dinámicas: Empresas y Proveedor */}
                            {contextosDisponibles.map((ctx, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSwitchContext(ctx)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                        borderRadius: "10px", cursor: "pointer", marginTop: "4px",
                                        background: contextoActivo.idPerfil === ctx.idPerfil ? "#f8fafc" : "transparent"
                                    }}
                                >
                                    {ctx.tipo === 'EMPRESA' ?
                                        <Building size={16} style={{ color: contextoActivo.idPerfil === ctx.idPerfil ? primaryColor : "#64748b" }} /> :
                                        <Briefcase size={16} style={{ color: contextoActivo.idPerfil === ctx.idPerfil ? primaryColor : "#64748b" }} />
                                    }
                                    <span style={{ fontSize: "14px", fontWeight: contextoActivo.idPerfil === ctx.idPerfil ? "600" : "500", color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {ctx.nombreContexto} <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "500" }}>({ctx.tipo === 'EMPRESA' ? 'Empresa' : 'Proveedor'})</span>
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Botonera Inferior */}
                        <div style={{ borderTop: "1px solid #f1f5f9", padding: "8px" }}>
                            <div
                                onClick={() => { setIsHovered(false); setShowUpgradeModal(true); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px",
                                    borderRadius: "10px", cursor: "pointer", color: "#7c3aed", fontWeight: "600"
                                }}
                            >
                                <Plus size={16} /> <span style={{ fontSize: "14px" }}>Crear Página Nueva</span>
                            </div>

                            {showLogoutWhenLoggedIn && (
                                <div
                                    onClick={handleLogout}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px",
                                        borderRadius: "10px", cursor: "pointer", color: "#ef4444", fontWeight: "600", marginTop: "4px"
                                    }}
                                >
                                    <LogOut size={16} /> <span style={{ fontSize: "14px" }}>Cerrar Sesión</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

addPropertyControls(AuthNavButton, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    loginUrl: { type: ControlType.String, title: "Login URL", defaultValue: "https://overly-mindset-259417.framer.app/login" },
    providerProfileUrl: { type: ControlType.String, title: "Dashboard URL", defaultValue: "https://overly-mindset-259417.framer.app/proveedor" },
    userProfileUrl: {
        type: ControlType.String,
        title: "User Profile URL",
        defaultValue: "https://overly-mindset-259417.framer.app/proveedor",
    },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#7c3aed" },
    textColor: { type: ControlType.Color, title: "Color Texto", defaultValue: "#ffffff" },
    showLogoutWhenLoggedIn: { type: ControlType.Boolean, title: "Mostrar Logout", defaultValue: true },
})
