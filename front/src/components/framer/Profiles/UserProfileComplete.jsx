import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { 
    User, Mail, Calendar, 
    ChevronRight, Briefcase, 
    Shield, RefreshCw, Hash, Phone
} from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * PANTALLA DE PERFIL DE USUARIO BASE PPS - V7 (UI MATURA)
 * ------------------------------------------------------------------
 * - Diseño Minimalista/Maduro (Inter Display equilibrada).
 * - Estructura Full Width con contenedor de 1120px.
 * - Sincronización robusta con el backend PPS.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function UserProfileComplete(props) {
    const { 
        apiUrl, enableDemoMode,
        demoName, demoEmail, demoLoc, demoDate, demoAvatar,
        primaryColor, secondaryColor 
    } = props

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const response = await fetch(`${apiUrl}/usuarios/me`, {
                        headers: {
                            "Authorization": `Bearer ${session.access_token}`,
                            "X-User-Id": user.id
                        }
                    })

                    if (response.ok) {
                        const res = await response.json()
                        setData({
                            name: `${res.nombre} ${res.apellido}`,
                            email: res.email,
                            phone: res.telefono || "No registrado",
                            location: demoLoc, 
                            date: res.fechaRegistro || demoDate,
                            avatar: demoAvatar,
                            rol: res.rol || "Usuario"
                        })
                    } else {
                        setError("No pudimos obtener tus datos.")
                    }
                } catch (err) {
                    setError("Error de conexión.")
                }
            } else if (enableDemoMode) {
                setData({
                    name: demoName, email: demoEmail, location: demoLoc,
                    date: demoDate, avatar: demoAvatar, rol: "Usuario (Demo)", phone: "261445566"
                })
            } else {
                setError("Debes iniciar sesión.")
            }
            setLoading(false)
        }
        fetchUserData()
    }, [apiUrl, enableDemoMode])

    if (loading) return <div style={s.loader}><RefreshCw size={32} color={primaryColor} className="spin" /></div>

    if (error && !data) return (
        <div style={s.errorContainer}>
            <User size={64} color="#e2e8f0" />
            <h2 style={{ fontSize: "24px", color: "#0f172a", marginTop: "24px", fontFamily: "Inter Display" }}>{error}</h2>
            <button onClick={() => window.location.href = "https://overly-mindset-259417.framer.app/login"} style={{ ...s.mainBtn, backgroundColor: primaryColor, marginTop: "24px" }}>Ir al Login</button>
        </div>
    )

    return (
        <div style={s.page}>
            {/* Minimal Header */}
            <div style={{ ...s.header, backgroundColor: secondaryColor }}>
                <div style={s.container}>
                    <div style={s.avatarWrap}>
                        <div style={{ ...s.avatar, backgroundImage: data.avatar ? `url(${data.avatar})` : "none" }}>
                            {!data.avatar && <User size={40} color="#94a3b8" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Info */}
            <div style={s.container}>
                <div style={s.info}>
                    <h1 style={s.name}>{data.name}</h1>
                    <div style={{...s.badge, color: primaryColor}}>{data.rol}</div>
                    
                    <div style={s.meta}>
                        <div style={s.metaItem}><Mail size={16} /> <span>{data.email}</span></div>
                        <div style={s.metaItem}><Phone size={16} /> <span>{data.phone}</span></div>
                        <div style={s.metaItem}><Calendar size={16} /> <span>Desde el {data.date}</span></div>
                    </div>
                </div>

                <div style={s.grid}>
                    <div style={s.section}>
                        <h3 style={s.label}>Mi Actividad</h3>
                        <motion.button whileHover={{ y: -2 }} style={s.card}>
                            <div style={s.row}>
                                <div style={s.iconTitle}><Briefcase size={20} color={primaryColor} /> <div><h4>Mis Postulaciones</h4><p>Estado de tus empleos solicitados</p></div></div>
                                <ChevronRight size={18} color="#cbd5e1" />
                            </div>
                        </motion.button>
                    </div>

                    <div style={s.section}>
                        <h3 style={s.label}>Oportunidades PRO</h3>
                        <motion.div whileHover={{ y: -2 }} style={{ ...s.card, border: `1px solid ${primaryColor}33`, backgroundColor: `${primaryColor}05` }}>
                            <div style={s.row}>
                                <div style={s.iconTitle}><Shield size={20} color={primaryColor} /> <div><h4>Ser Profesional</h4><p>Publica tus servicios gratis hoy</p></div></div>
                                <button 
                                    onClick={() => window.location.href = "https://overly-mindset-259417.framer.app/registro-general"}
                                    style={{ ...s.mainBtn, backgroundColor: primaryColor, padding: "8px 16px", fontSize: "13px" }}
                                >
                                    ¡Comenzar!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <div style={{ height: "100px" }} />
        </div>
    )
}

addPropertyControls(UserProfileComplete, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    enableDemoMode: { type: ControlType.Boolean, title: "Modo Demo", defaultValue: false },
    demoName: { type: ControlType.String, title: "Nombre Demo", defaultValue: "Carlos Gomez" },
    demoEmail: { type: ControlType.String, title: "Email Demo", defaultValue: "carlos@mail.com" },
    demoLoc: { type: ControlType.String, title: "Ciudad Demo", defaultValue: "Buenos Aires, ARG" },
    demoDate: { type: ControlType.String, title: "Fecha Demo", defaultValue: "Abril 2024" },
    demoAvatar: { type: ControlType.Image, title: "Avatar Demo" },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#7c3aed" },
    secondaryColor: { type: ControlType.Color, title: "Color Fondo", defaultValue: "#f8fafc" },
})

const s = {
    page: { width: "100%", minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "Inter, sans-serif" },
    container: { width: "100%", maxWidth: "1120px", margin: "0 auto", padding: "0 24px", position: "relative" },
    header: { width: "100%", height: "140px", marginBottom: "70px" },
    avatarWrap: { position: "absolute", bottom: "-30px", left: "24px", padding: "4px", backgroundColor: "white", borderRadius: "28px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" },
    avatar: { width: "90px", height: "90px", borderRadius: "24px", backgroundColor: "#f8fafc", backgroundSize: "cover", display: "flex", alignItems: "center", justifyContent: "center" },
    info: { marginBottom: "40px" },
    name: { fontSize: "32px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-1px", fontFamily: "Inter Display, sans-serif" },
    badge: { fontSize: "11px", fontWeight: "800", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "1px" },
    meta: { display: "flex", flexWrap: "wrap", gap: "28px", color: "#64748b", fontSize: "14px" },
    metaItem: { display: "flex", alignItems: "center", gap: "8px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" },
    section: { display: "flex", flexDirection: "column", gap: "16px" },
    label: { fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2.5px" },
    card: { padding: "24px", backgroundColor: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", width: "100%", textAlign: "left", cursor: "pointer" },
    row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" },
    iconTitle: { display: "flex", alignItems: "center", gap: "16px" },
    mainBtn: { 
        height: "38px",
        padding: "0 22px", 
        borderRadius: "10px", 
        border: "none", 
        color: "white", 
        fontWeight: "700", 
        cursor: "pointer", 
        fontFamily: "Inter",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    },
    loader: { width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
    errorContainer: { width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }
}
