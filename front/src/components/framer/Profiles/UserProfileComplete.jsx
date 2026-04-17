import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { 
    User, Mail, MapPin, Calendar, 
    Zap, Check, ArrowRight,
    Layout, Shield, RefreshCw
} from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * PANTALLA DE PERFIL DE USUARIO COMPLETA (PPS) - V6 (REAL-ONLY)
 * --------------------------------------------------------
 * - FULL WIDTH (100% de la web)
 * - DATOS REALES PRIORITARIOS (Espera sesión de Supabase)
 * - MODO DEMO opcional para diseño en Framer
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// --- SUB-COMPONENTES ---

const ProfileHeader = ({ name, email, location, avatarUrl, primaryColor, rol }) => {
    return (
        <div style={headerStyles.container}>
            <div style={headerStyles.contentWrapper}>
                <div style={headerStyles.layoutRow}>
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={headerStyles.avatarWrapper}
                    >
                        <div style={{ ...headerStyles.avatar, backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none" }}>
                            {!avatarUrl && <User size={48} color="#94a3b8" />}
                        </div>
                    </motion.div>
                    <div style={headerStyles.infoBlock}>
                        <div style={headerStyles.infoRow}>
                            <h1 style={headerStyles.nameStyle}>{name || "Cargando..."}</h1>
                            <span style={headerStyles.userTag}>{rol || "Usuario"}</span>
                        </div>
                        <div style={headerStyles.metaRow}>
                            <div style={headerStyles.metaItem}><Mail size={16} /><span>{email}</span></div>
                            <div style={headerStyles.metaItem}><MapPin size={16} /><span>{location}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProfileInfoCard = ({ title, items, primaryColor }) => {
    const icons = {
        mail: <Mail size={18} color={primaryColor} />,
        map: <MapPin size={18} color={primaryColor} />,
        calendar: <Calendar size={18} color={primaryColor} />,
    }
    return (
        <div style={cardStyles.container}>
            <h3 style={cardStyles.title}>{title}</h3>
            <div style={cardStyles.list}>
                {items.map((item, i) => (
                    <div key={i} style={cardStyles.item}>
                        <div style={cardStyles.icon}>{icons[item.icon] || <Check size={18} />}</div>
                        <div style={cardStyles.text}>
                            <span style={cardStyles.label}>{item.label}</span>
                            <span style={cardStyles.value}>{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const CTAUpgrade = ({ primaryColor }) => {
    return (
        <motion.div whileHover={{ y: -5 }} style={{ ...ctaStyles.container, border: `1px solid ${primaryColor}44` }}>
            <div style={ctaStyles.header}>
                <div style={{ ...ctaStyles.iconCircle, backgroundColor: primaryColor }}><Zap size={20} color="white" /></div>
                <div>
                    <h2 style={ctaStyles.title}>¿Querés ofrecer servicios?</h2>
                    <p style={ctaStyles.subtitle}>Convertite en proveedor en PPS.</p>
                </div>
            </div>
            <button style={{ ...ctaStyles.button, backgroundColor: primaryColor }}>
                Comenzar ahora <ArrowRight size={18} />
            </button>
        </motion.div>
    )
}

// --- COMPONENTE PRINCIPAL ---

export default function UserProfileComplete(props) {
    const { 
        apiUrl, enableDemoMode,
        demoName, demoEmail, demoLoc, demoDate, demoAvatar, primaryColor 
    } = props

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const discoverAndFetch = async () => {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
                try {
                    const userId = session.user.id
                    const response = await fetch(`${apiUrl}/usuarios/me`, {
                        headers: {
                            "Authorization": `Bearer ${session.access_token}`,
                            "X-User-Id": userId
                        }
                    })
                    
                    if (response.ok) {
                        const res = await response.json()
                        setData({
                            name: `${res.nombre} ${res.apellido}`,
                            email: res.email,
                            location: demoLoc, 
                            date: res.fechaRegistro || demoDate,
                            avatar: demoAvatar,
                            rol: res.rol || "Usuario"
                        })
                    } else {
                        setError("Inicia sesión para ver tu perfil.")
                    }
                } catch (err) {
                    setError("Error de conexión.")
                }
            } else if (enableDemoMode) {
                setData({
                    name: demoName, email: demoEmail, location: demoLoc,
                    date: demoDate, avatar: demoAvatar, rol: "Usuario Demo"
                })
            } else {
                setError("Inicia sesión para acceder.")
            }
            setLoading(false)
        }
        discoverAndFetch()
    }, [apiUrl, enableDemoMode, demoName, demoEmail, demoLoc, demoDate, demoAvatar])

    if (loading) {
        return (
            <div style={{ ...pageStyles.container, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={48} color={primaryColor} /></motion.div>
            </div>
        )
    }

    if (error && !data) {
        return (
            <div style={{ ...pageStyles.container, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
                <User size={64} color="#cbd5e1" style={{ marginBottom: "24px" }} />
                <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a" }}>{error}</h2>
                <button 
                   onClick={() => window.location.href = "/login"}
                   style={{ ...ctaStyles.button, backgroundColor: primaryColor, marginTop: "24px", width: "auto", padding: "12px 32px" }}
                >
                    Ir al login
                </button>
            </div>
        )
    }

    const infoItems = [
        { label: "Email", value: data.email, icon: "mail" },
        { label: "Ubicación", value: data.location, icon: "map" },
        { label: "Miembro desde", value: data.date, icon: "calendar" },
    ]

    return (
        <div style={pageStyles.container}>
            {enableDemoMode && (
                <div style={pageStyles.demoBanner}>
                    <Zap size={14} color="#854d0e" fill="#854d0e" />
                    <span><b>Modo Edición:</b> Estos datos son temporales de Framer.</span>
                </div>
            )}
            <ProfileHeader {...data} avatarUrl={data.avatar} primaryColor={primaryColor} />
            <div style={pageStyles.mainContentWrapper}>
                <div style={pageStyles.body}>
                    <ProfileInfoCard title="Mi información" items={infoItems} primaryColor={primaryColor} />
                    <CTAUpgrade primaryColor={primaryColor} />
                </div>
            </div>
            <div style={{ height: "100px" }} />
        </div>
    )
}

addPropertyControls(UserProfileComplete, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    enableDemoMode: { type: ControlType.Boolean, title: "Modo Demo (Framer)", defaultValue: false },
    demoName: { type: ControlType.String, title: "Nombre Demo", defaultValue: "Alex Rivera", hidden(p) { return !p.enableDemoMode } },
    demoEmail: { type: ControlType.String, title: "Email Demo", defaultValue: "alex@email.com", hidden(p) { return !p.enableDemoMode } },
    demoLoc: { type: ControlType.String, title: "Ubicación Demo", defaultValue: "Mendoza, ARG", hidden(p) { return !p.enableDemoMode } },
    demoDate: { type: ControlType.String, title: "Registro Demo", defaultValue: "Enero 2024", hidden(p) { return !p.enableDemoMode } },
    demoAvatar: { type: ControlType.Image, title: "Avatar Demo", hidden(p) { return !p.enableDemoMode } },
    primaryColor: { type: ControlType.Color, title: "Color PPS", defaultValue: "#7c3aed" },
})

const pageStyles = {
    container: { width: "100%", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, sans-serif" },
    demoBanner: { padding: "10px 24px", backgroundColor: "#fdf2f2", color: "#991b1b", fontSize: "12px", borderBottom: "1px solid #fee2e2" },
    mainContentWrapper: { width: "100%", display: "flex", justifyContent: "center" },
    body: { width: "100%", padding: "60px 24px", display: "flex", flexDirection: "column", gap: "60px" },
}

const headerStyles = {
    container: { width: "100%", backgroundColor: "white", padding: "60px 0", borderBottom: "1px solid #e2e8f0" },
    contentWrapper: { width: "100%", display: "flex", justifyContent: "center" },
    layoutRow: { width: "100%", padding: "0 40px", display: "flex", alignItems: "center", gap: "48px" },
    avatarWrapper: { position: "relative" },
    avatar: { width: "140px", height: "140px", borderRadius: "40px", backgroundColor: "#f1f5f9", backgroundSize: "cover", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" },
    infoBlock: { flex: 1, display: "flex", flexDirection: "column", gap: "12px" },
    infoRow: { display: "flex", alignItems: "center", gap: "20px" },
    nameStyle: { fontSize: "40px", fontWeight: "900", margin: 0, letterSpacing: "-1.5px" },
    userTag: { fontSize: "13px", fontWeight: "900", color: "#64748b", backgroundColor: "#f1f5f9", padding: "6px 14px", borderRadius: "10px", textTransform: "uppercase" },
    metaRow: { display: "flex", gap: "32px", color: "#64748b", fontSize: "18px" },
    metaItem: { display: "flex", alignItems: "center", gap: "10px" }
}

const cardStyles = {
    container: { padding: "48px", backgroundColor: "white", borderRadius: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    title: { fontSize: "13px", fontWeight: "900", color: "#000", textTransform: "uppercase", marginBottom: "40px", letterSpacing: "2px" },
    list: { display: "flex", flexDirection: "column", gap: "32px" },
    item: { display: "flex", alignItems: "center", gap: "24px" },
    icon: { width: "56px", height: "56px", borderRadius: "18px", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" },
    text: { display: "flex", flexDirection: "column" },
    label: { fontSize: "14px", color: "#94a3b8" },
    value: { fontSize: "20px", fontWeight: "700", color: "#1e293b" }
}

const ctaStyles = {
    container: { padding: "60px", borderRadius: "40px", display: "flex", flexDirection: "column", gap: "40px", boxShadow: "0 20px 40px rgba(124, 58, 237, 0.1)" },
    header: { display: "flex", gap: "24px", alignItems: "center" },
    iconCircle: { width: "72px", height: "72px", borderRadius: "22px", display: "flex", alignItems: "center", justifyContent: "center" },
    title: { fontSize: "28px", fontWeight: "900", margin: 0 },
    subtitle: { fontSize: "18px", color: "#475569", margin: 0 },
    button: { width: "100%", padding: "24px", borderRadius: "22px", border: "none", color: "white", fontWeight: "900", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer", boxShadow: "0 15px 30px rgba(124, 58, 237, 0.3)" }
}
