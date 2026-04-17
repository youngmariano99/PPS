import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { 
    User, Mail, Phone, MapPin, Calendar, 
    Star, Shield, Briefcase, Camera,
    MessageSquare, Maximize, RefreshCw, Zap
} from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * PANTALLA DE PERFIL DE PROVEEDOR COMPLETA (PPS) - V6 (REAL-ONLY)
 * -----------------------------------------------------------
 * - FULL WIDTH (100% de la web)
 * - SIN PORTADA (Diseño profesional compacto)
 * - DATOS REALES PRIORITARIOS (Espera sesión de Supabase)
 * - MODO DEMO opcional para diseño en Framer
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// --- SUB-COMPONENTES ---

const Header = ({ name, category, location, rating, isPro, avatarUrl, primaryColor }) => (
    <div style={hS.container}>
        <div style={hS.contentWrapper}>
            <div style={hS.content}>
                <div style={hS.row}>
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={hS.avatarWrap}>
                        <div style={{ ...hS.avatar, backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none" }}>
                            {!avatarUrl && <User size={48} color="#94a3b8" />}
                        </div>
                        {isPro && <div style={{ ...hS.proBadge, backgroundColor: primaryColor }}><Shield size={16} color="white" /></div>}
                    </motion.div>
                    <div style={hS.info}>
                        <div style={hS.nameRow}>
                            <h1 style={hS.name}>{name || "Cargando..."}</h1>
                            {isPro && <span style={{ ...hS.proTag, border: `1px solid ${primaryColor}`, color: primaryColor }}>PRO</span>}
                        </div>
                        <div style={hS.meta}>
                            <span style={{ color: primaryColor, fontWeight: "600" }}>{category || "Rubro"}</span>
                            <div style={hS.metaItem}><MapPin size={14} /><span>{location || "Ubicación"}</span></div>
                            <div style={hS.metaItem}><Star size={14} fill="#f59e0b" color="#f59e0b" /><b>{rating || 0}</b></div>
                        </div>
                    </div>
                </div>
                <div style={hS.desktopAction}>
                    <button style={{ ...hS.btn, backgroundColor: primaryColor, width: "auto", minWidth: "160px" }}>Contactar ahora</button>
                </div>
            </div>
        </div>
    </div>
)

const Portfolio = ({ images, primaryColor }) => (
    <div style={pS.container}>
        <h2 style={fS.title}>Portfolio de Trabajos</h2>
        {(!images || images.length === 0) ? (
            <div style={pS.empty}><Camera size={32} color={primaryColor} /><p>Sin trabajos aún</p></div>
        ) : (
            <div style={pS.grid}>
                {images.map((img, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.02 }} style={pS.imgWrap}>
                        <div style={{ ...pS.img, backgroundImage: `url(${img})` }} />
                        <div style={pS.overlay}><Maximize size={20} color="white" /></div>
                    </motion.div>
                ))}
            </div>
        )}
    </div>
)

// --- COMPONENTE PRINCIPAL ---

export default function ProviderProfileComplete(props) {
    const { 
        apiUrl, enableDemoMode,
        demoName, demoCategory, demoDesc, demoLoc, demoRating, demoTotal,
        demoAvatar, demoPhone, demoEmail, primaryColor 
    } = props

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isDesktop, setIsDesktop] = useState(true)

    useEffect(() => {
        const checkWidth = () => setIsDesktop(window.innerWidth > 900)
        checkWidth()
        window.addEventListener("resize", checkWidth)
        return () => window.removeEventListener("resize", checkWidth)
    }, [])

    useEffect(() => {
        const discoverAndFetch = async () => {
            setLoading(true)
            setError(null)

            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
                console.log("Conectado con UID:", session.user.id)
                try {
                    const userId = session.user.id
                    const response = await fetch(`${apiUrl}/directorio/proveedor/${userId}`, {
                        headers: {
                            "Authorization": `Bearer ${session.access_token}`,
                            "X-User-Id": userId
                        }
                    })
                    
                    if (response.ok) {
                        const res = await response.json()
                        setData({
                            name: res.nombrePublico,
                            category: res.rubro,
                            description: res.descripcion,
                            location: res.ciudad ? `${res.ciudad}, ${res.provincia}` : "No definida",
                            rating: res.promedioEstrellas || 0,
                            total: res.cantidadResenas || 0,
                            isPro: res.esPremium,
                            avatar: res.fotoPerfilUrl,
                            portfolio: res.fotosPortafolio || [],
                            phone: demoPhone, // TODO: Backend debe devolver telefono
                            email: res.email || demoEmail
                        })
                    } else {
                        setError("No se pudo cargar tu perfil real. ¿Eres proveedor?")
                    }
                } catch (err) {
                    setError("Error de conexión con el servidor.")
                }
            } else if (enableDemoMode) {
                // Modo Demo solo si no hay sesión y está activado
                setData({
                    name: demoName, category: demoCategory, description: demoDesc, location: demoLoc,
                    rating: demoRating, total: demoTotal, isPro: true, avatar: demoAvatar,
                    portfolio: [], phone: demoPhone, email: demoEmail
                })
            } else {
                setError("Inicia sesión para ver tu perfil PPS.")
            }
            setLoading(false)
        }

        discoverAndFetch()
    }, [apiUrl, enableDemoMode, demoName, demoCategory, demoDesc, demoLoc, demoRating, demoTotal, demoAvatar, demoPhone, demoEmail])

    if (loading) {
        return (
            <div style={{ ...fS.page, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={48} color={primaryColor} /></motion.div>
                <p style={{ color: "#64748b", marginTop: "16px", fontWeight: "600" }}>Sincronizando con PPS...</p>
            </div>
        )
    }

    if (error && !data) {
        return (
            <div style={{ ...fS.page, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
                <Shield size={64} color="#cbd5e1" style={{ marginBottom: "24px" }} />
                <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a" }}>{error}</h2>
                <p style={{ color: "#64748b", marginTop: "12px", maxWidth: "400px" }}>Si acabas de registrarte, asegúrate de haber completado tu perfil profesional.</p>
                <button 
                   onClick={() => window.location.href = "/login"}
                   style={{ ...hS.btn, backgroundColor: primaryColor, marginTop: "24px", width: "auto" }}
                >
                    Ir al inicio de sesión
                </button>
            </div>
        )
    }

    return (
        <div style={fS.page}>
            {enableDemoMode && !loading && !error && (
                <div style={fS.demoBanner}>
                    <Zap size={14} color="#854d0e" fill="#854d0e" />
                    <span><b>Modo Edición:</b> Estos datos son temporales de Framer.</span>
                </div>
            )}
            <Header 
                name={data.name} category={data.category} location={data.location} 
                rating={data.rating} isPro={data.isPro} avatarUrl={data.avatar} 
                primaryColor={primaryColor} 
            />
            <div style={fS.mainContentWrapper}>
                <div style={{ ...fS.body, gridTemplateColumns: isDesktop ? "1.8fr 1fr" : "1fr" }}>
                    <div style={fS.column}>
                        <div style={fS.section}>
                            <h2 style={fS.title}>Sobre el servicio</h2>
                            <div style={fS.card}><p style={fS.desc}>{data.description}</p></div>
                        </div>
                        <Portfolio images={data.portfolio} primaryColor={primaryColor} />
                    </div>
                    <div style={fS.column}>
                        <div style={fS.section}>
                            <h2 style={fS.title}>Contacto Directo</h2>
                            <div style={{ ...fS.card, display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={fS.cardItem}><Phone size={20} color={primaryColor} /><span>{data.phone}</span></div>
                                <div style={fS.cardItem}><Mail size={20} color={primaryColor} /><span>{data.email}</span></div>
                                <div style={fS.cardItem}><MapPin size={20} color={primaryColor} /><span>{data.location}</span></div>
                            </div>
                        </div>
                        <div style={{ ...fS.verified, backgroundColor: "#0f172a" }}>
                            <Shield size={32} color={primaryColor} />
                            <div><h4 style={fS.vTitle}>Profesional Verificado</h4><p style={fS.vText}>Información validada por PPS.</p></div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height: "100px" }} />
        </div>
    )
}

addPropertyControls(ProviderProfileComplete, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    enableDemoMode: { type: ControlType.Boolean, title: "Modo Demo (Framer)", defaultValue: false },
    demoName: { type: ControlType.String, title: "Nombre Demo", defaultValue: "Juan Perez", hidden(p) { return !p.enableDemoMode } },
    demoCategory: { type: ControlType.String, title: "Rubro Demo", defaultValue: "Gasista", hidden(p) { return !p.enableDemoMode } },
    demoDesc: { type: ControlType.String, title: "Desc Demo", display: "textarea", defaultValue: "Matriculado con 10 años de exp.", hidden(p) { return !p.enableDemoMode } },
    demoLoc: { type: ControlType.String, title: "Ciudad Demo", defaultValue: "Mendoza, ARG", hidden(p) { return !p.enableDemoMode } },
    demoRating: { type: ControlType.Number, title: "Rating Demo", defaultValue: 4.8, min: 0, max: 5, step: 0.1, hidden(p) { return !p.enableDemoMode } },
    demoTotal: { type: ControlType.Number, title: "Reseñas Demo", defaultValue: 45, hidden(p) { return !p.enableDemoMode } },
    demoAvatar: { type: ControlType.Image, title: "Avatar Demo", hidden(p) { return !p.enableDemoMode } },
    demoPhone: { type: ControlType.String, title: "Tel Demo", defaultValue: "+54 9 261 445566", hidden(p) { return !p.enableDemoMode } },
    demoEmail: { type: ControlType.String, title: "Email Demo", defaultValue: "juan@pps.com", hidden(p) { return !p.enableDemoMode } },
    primaryColor: { type: ControlType.Color, title: "Color PPS", defaultValue: "#7c3aed" },
})

const fS = {
    page: { width: "100%", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, sans-serif" },
    demoBanner: { padding: "10px 24px", backgroundColor: "#fdf2f2", color: "#991b1b", fontSize: "12px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #fee2e2" },
    mainContentWrapper: { width: "100%", display: "flex", justifyContent: "center" },
    body: { width: "100%", padding: "60px 24px", display: "grid", gap: "60px" },
    column: { display: "flex", flexDirection: "column", gap: "60px" },
    section: { width: "100%" },
    title: { fontSize: "13px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", marginBottom: "20px", letterSpacing: "2px" },
    card: { padding: "40px", backgroundColor: "white", borderRadius: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    desc: { fontSize: "18px", color: "#334155", lineHeight: "1.8", margin: 0 },
    cardItem: { display: "flex", alignItems: "center", gap: "20px", fontSize: "16px", fontWeight: "700", color: "#0f172a" },
    verified: { display: "flex", alignItems: "center", gap: "24px", padding: "40px", borderRadius: "32px", color: "white" },
    vTitle: { fontSize: "20px", fontWeight: "900", margin: "0 0 6px 0" },
    vText: { fontSize: "15px", opacity: 0.7, margin: 0 },
}

const hS = {
    container: { width: "100%", backgroundColor: "white", padding: "80px 0 60px 0", borderBottom: "1px solid #e2e8f0" },
    contentWrapper: { width: "100%", display: "flex", justifyContent: "center" },
    content: { width: "100%", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "40px" },
    row: { display: "flex", alignItems: "center", gap: "48px" },
    avatarWrap: { position: "relative" },
    avatar: { width: "180px", height: "180px", borderRadius: "50px", backgroundColor: "#f1f5f9", backgroundSize: "cover", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
    proBadge: { position: "absolute", top: "-15px", right: "-15px", width: "50px", height: "50px", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", border: "5px solid white" },
    info: { display: "flex", flexDirection: "column", gap: "12px" },
    nameRow: { display: "flex", alignItems: "center", gap: "20px" },
    name: { fontSize: "48px", fontWeight: "900", color: "#000", margin: 0, letterSpacing: "-2px" },
    proTag: { fontSize: "14px", fontWeight: "900", padding: "6px 14px", borderRadius: "10px" },
    meta: { display: "flex", flexWrap: "wrap", gap: "32px", fontSize: "18px", color: "#64748b" },
    metaItem: { display: "flex", alignItems: "center", gap: "10px" },
    btn: { padding: "20px 48px", borderRadius: "22px", border: "none", color: "white", fontWeight: "900", fontSize: "18px", cursor: "pointer", boxShadow: "0 15px 30px rgba(124, 58, 237, 0.3)" }
}

const pS = {
    container: { width: "100%" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
    imgWrap: { position: "relative", aspectRatio: "16/11", borderRadius: "32px", overflow: "hidden", backgroundColor: "#f1f5f9", cursor: "pointer" },
    img: { width: "100%", height: "100%", backgroundSize: "cover", backgroundPosition: "center" },
    overlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" },
    empty: { padding: "100px", backgroundColor: "white", borderRadius: "32px", border: "1px dashed #cbd5e1", textAlign: "center" }
}
