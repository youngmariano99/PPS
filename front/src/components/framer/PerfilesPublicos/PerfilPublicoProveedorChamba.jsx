import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Star,
    Shield,
    Camera,
    Maximize,
    RefreshCw,
    Zap,
    Award,
    Hash,
    Landmark,
    Edit3,
    Save,
    X,
    Instagram,
    Facebook,
    Linkedin,
    ExternalLink,
    CheckCircle2,
    Clock,
    ShieldCheck,
    MessageCircle,
    ChevronRight,
} from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * PERFIL PÚBLICO PROVEEDOR CHAMBA - REDISEÑO PREMIUM
 * -------------------------------------------------------------
 * - Lógica 1:1 con PerfilPublicoProveedor.jsx
 * - Diseño de alta fidelidad basado en el Branding Chamba.
 * - Soporte para Portfolio, Reseñas y Redes Sociales.
 * - Modo edición integrado.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function PerfilPublicoProveedorChamba(props) {
    const { apiUrl, enableDemoMode, primaryColor = "#A01EED", isProDemo = false } = props

    // --- ESTADOS LÓGICOS (1:1 con el original) ---
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [error, setError] = useState(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900)
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // --- INYECCIÓN DE ESTILOS Y FUENTES ---
    useEffect(() => {
        if (typeof document === "undefined") return

        const fontLink = document.createElement("link")
        fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
        fontLink.rel = "stylesheet"
        document.head.appendChild(fontLink)

        const styleSheet = document.createElement("style")
        styleSheet.textContent = `
            .chamba-perfil {
                font-family: 'Inter', sans-serif;
                color: #0F172A;
                background-color: #F8FAFC;
                min-height: 100vh;
            }
            .chamba-title {
                font-family: 'Poppins', sans-serif;
            }
            .chamba-card {
                background: white;
                border-radius: 16px;
                border: 1px solid #F1F5F9;
                box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                padding: 24px;
                margin-bottom: 24px;
            }
            .chamba-btn-primary {
                background: ${primaryColor};
                color: white;
                border: none;
                border-radius: 12px;
                padding: 14px 28px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                font-size: 15px;
            }
            .chamba-btn-primary:hover {
                filter: brightness(0.9);
                transform: translateY(-1px);
            }
            .chamba-btn-outline {
                background: white;
                color: #475569;
                border: 1px solid #E2E8F0;
                border-radius: 12px;
                padding: 10px 20px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            .chamba-btn-outline:hover {
                background: #F8FAFC;
                border-color: ${primaryColor};
                color: ${primaryColor};
            }
            .chamba-badge-pro {
                background: ${primaryColor};
                color: white;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
            }
            .chamba-tag {
                background: #F3E8FF;
                color: #7C3AED;
                padding: 4px 12px;
                border-radius: 100px;
                font-size: 12px;
                font-weight: 600;
            }
            .chamba-input {
                width: 100%;
                padding: 12px 16px;
                border-radius: 12px;
                border: 1px solid #E2E8F0;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                transition: border-color 0.2s;
            }
            .chamba-input:focus {
                outline: none;
                border-color: ${primaryColor};
                box-shadow: 0 0 0 3px ${primaryColor}15;
            }
            .spin {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .portfolio-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 16px;
            }
            .portfolio-item {
                aspect-ratio: 16/10;
                border-radius: 16px;
                background-size: cover;
                background-position: center;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .portfolio-item:hover {
                transform: scale(1.02);
            }
            .feature-icon-box {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 8px;
                padding: 16px;
            }
            .feature-label {
                font-size: 13px;
                font-weight: 700;
                color: #1E293B;
            }
            .feature-sub {
                font-size: 11px;
                color: #94A3B8;
            }
        `
        document.head.appendChild(styleSheet)

        return () => {
            document.head.removeChild(styleSheet)
            if (fontLink.parentNode) document.head.removeChild(fontLink)
        }
    }, [primaryColor])

    // --- LÓGICA DE DATOS (1:1) ---
    const discoverAndFetch = async () => {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams(window.location.search)
        const externalId = params.get("id")
        const { data: { user } } = await supabase.auth.getUser()
        const targetId = externalId || (user ? user.id : null)

        if (targetId) {
            try {
                setIsOwner(user && user.id === targetId)
                const { data: { session } } = await supabase.auth.getSession()
                const headers = { "X-User-Id": targetId }
                if (session) headers["Authorization"] = `Bearer ${session.access_token}`

                const response = await fetch(`${apiUrl}/directorio/proveedor/${targetId}`, { headers })
                if (response.ok) {
                    const res = await response.json()
                    const mapped = {
                        id: res.id,
                        name: res.nombrePublico || "Profesional",
                        category: res.rubro || "Especialista",
                        description: res.descripcion || "Sin descripción disponible.",
                        location: res.ciudad ? `${res.ciudad}, ${res.provincia}` : "Ubicación no especificada",
                        address: res.direccion || "",
                        city: res.ciudad || "",
                        province: res.provincia || "",
                        rating: res.promedioEstrellas || 0,
                        reviewCount: res.totalResenas || 0,
                        isPro: res.esPremium,
                        avatar: res.fotoPerfilUrl || "https://framerusercontent.com/images/4jB1l8K3z0V4nZlXWz7m6.png",
                        portfolio: res.fotosPortafolio || [],
                        specialties: res.especialidades || [],
                        conditions: res.condicionesServicio || [],
                        reviews: res.resenas || [],
                        phone: res.telefono || "",
                        email: res.email || (user && user.id === targetId ? user.email : ""),
                        matricula: res.matricula || "Sin matrícula registrada",
                        instagram: res.instagramUrl || "",
                        facebook: res.facebookUrl || "",
                        linkedin: res.linkedinUrl || "",
                    }
                    setData(mapped)
                    setEditForm(mapped)
                } else {
                    setError("No se pudo cargar el perfil.")
                }
            } catch (err) {
                setError("Error de conexión.")
            }
        } else if (enableDemoMode) {
            const demo = {
                name: "Mariano Lombardo",
                category: "Carpintería",
                description: "Carpintero con más de 10 años de experiencia en muebles a medida, reformas y trabajos de madera. Calidad, compromiso y atención personalizada.",
                location: "Moreno 1675, Pringles",
                rating: 4.8,
                reviewCount: 56,
                isPro: isProDemo, // Usamos el control de Framer
                avatar: "https://framerusercontent.com/images/4jB1l8K3z0V4nZlXWz7m6.png",
                portfolio: [
                    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1556909212-d5b604ad056f?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1556911261-6bd741363f39?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1600585154340-be6199f7a096?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1600607687940-47a093c3c930?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=400",
                ],
                phone: "291 44556677",
                email: "mariano.lombardo@gmail.com",
                matricula: "M.P No registrada",
                instagram: "https://instagram.com/marianolombardo",
                facebook: "https://facebook.com/marianolombardo",
                linkedin: "https://linkedin.com/in/marianolombardo",
            }
            setData(demo)
            setEditForm(demo)
            setIsOwner(true)
        } else {
            setError("No se encontró el perfil solicitado.")
        }
        setLoading(false)
    }

    useEffect(() => { discoverAndFetch() }, [apiUrl, enableDemoMode])

    const handleSave = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()

        try {
            // Actualización de perfil
            await fetch(`${apiUrl}/perfil/proveedor/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                    "X-User-Id": user.id,
                },
                body: JSON.stringify({
                    descripcion: editForm.description,
                    matricula: editForm.matricula,
                    fotoPerfilUrl: editForm.avatar,
                    ciudad: editForm.city,
                    provincia: editForm.province,
                    instagramUrl: editForm.instagram,
                    facebookUrl: editForm.facebook,
                    linkedinUrl: editForm.linkedin,
                }),
            })

            // Actualización de teléfono
            await fetch(`${apiUrl}/perfil/usuario/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                    "X-User-Id": user.id,
                },
                body: JSON.stringify({ telefono: editForm.phone }),
            })

            await discoverAndFetch()
            setIsEditing(false)
        } catch (e) { console.error(e) }
        setSaving(false)
    }

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc" }}>
            <RefreshCw size={32} color={primaryColor} className="spin" />
        </div>
    )

    if (error || !data) return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f8fafc", gap: "20px" }}>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#64748B" }}>{error || "No se pudo cargar el perfil"}</div>
            <button className="chamba-btn-outline" onClick={() => window.location.reload()} style={{ width: "auto" }}>Reintentar</button>
        </div>
    )

    // --- RENDERIZADO ---
    return (
        <div className="chamba-perfil">
            
            {/* HERO SECTION */}
            <div style={{ background: "linear-gradient(180deg, #F3E8FF 0%, #FFFFFF 100%)", padding: "40px 0", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 24px" }}>
                    
                    {/* Breadcrumbs (Mock) */}
                    <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#94A3B8", marginBottom: "32px", alignItems: "center" }}>
                        <span>Inicio</span> <ChevronRight size={12} />
                        <span>{data.category}</span> <ChevronRight size={12} />
                        <span style={{ color: "#475569", fontWeight: "600" }}>{data.name}</span>
                        <div style={{ flex: 1 }} />
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", color: primaryColor, fontWeight: "600", cursor: "pointer" }}>
                            Compartir perfil <ExternalLink size={14} />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
                        {/* Avatar */}
                        <div style={{ position: "relative" }}>
                            <div style={{ 
                                width: "160px", 
                                height: "160px", 
                                borderRadius: "48px", 
                                border: data.isPro ? `4px solid ${primaryColor}` : "4px solid white",
                                boxShadow: data.isPro ? `0 10px 30px ${primaryColor}20` : "0 10px 30px rgba(0,0,0,0.05)",
                                backgroundSize: "cover",
                                backgroundImage: `url(${data.avatar})`,
                                transition: "all 0.3s ease",
                                backgroundColor: "#F1F5F9"
                            }} />
                        </div>

                        {/* Info Header */}
                        <div style={{ flex: 1, minWidth: "300px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                <h1 className="chamba-title" style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{data.name}</h1>
                                {data.isPro && <span className="chamba-badge-pro">PRO</span>}
                                <CheckCircle2 size={24} color={primaryColor} fill={primaryColor + "20"} />
                            </div>
                            
                            <p style={{ fontSize: "18px", fontWeight: "600", color: primaryColor, marginBottom: "12px" }}>{data.category}</p>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                                <div style={{ display: "flex", gap: "2px" }}>
                                    {[1,2,3,4,5].map(i => (
                                        <Star 
                                            key={i} 
                                            size={16} 
                                            fill={data.reviewCount > 0 && i <= data.rating ? "#F59E0B" : "#D1D5DB"} 
                                            color={data.reviewCount > 0 && i <= data.rating ? "#F59E0B" : "#D1D5DB"} 
                                        />
                                    ))}
                                </div>
                                <span style={{ fontWeight: "700", fontSize: "15px" }}>{data.rating > 0 ? data.rating : "0"}</span>
                                <span style={{ color: "#94A3B8", fontSize: "14px" }}>({data.reviewCount} reseñas)</span>
                            </div>

                            <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6", maxWidth: "600px", marginBottom: "24px" }}>
                                {data.description}
                            </p>

                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {(data.specialties.length > 0 ? data.specialties : [data.category]).map((tag, i) => (
                                    <span key={i} className="chamba-tag">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Trust Badges - Horizontal Alignment */}
                        <div style={{ 
                            display: "flex", 
                            flexDirection: isMobile ? "column" : "row", 
                            gap: "24px", 
                            alignItems: "center", 
                            marginTop: isMobile ? "20px" : "10px"
                        }}>
                            <div className="feature-icon-box" style={{ padding: 0 }}>
                                <Zap size={24} color={primaryColor} />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span className="feature-label">Trabajo garantizado</span>
                                    <span className="feature-sub">Compromiso y calidad</span>
                                </div>
                            </div>
                            <div className="feature-icon-box" style={{ padding: 0 }}>
                                <Clock size={24} color={primaryColor} />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span className="feature-label">Respuesta rápida</span>
                                    <span className="feature-sub">Menos de 1 hora</span>
                                </div>
                            </div>
                            <div className="feature-icon-box" style={{ padding: 0 }}>
                                <ShieldCheck size={24} color={primaryColor} />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span className="feature-label">Profesional verificado</span>
                                    <span className="feature-sub">Perfil aprobado</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div style={{ maxWidth: "1120px", margin: "40px auto", padding: "0 24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: "40px" }}>
                
                {/* Left Column */}
                <div>
                    {/* Portfolio */}
                    <div className="chamba-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 className="chamba-title" style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Portfolio</h3>
                            <span style={{ color: primaryColor, fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Ver todo <ChevronRight size={14} style={{ verticalAlign: "middle" }} /></span>
                        </div>
                        <div className="portfolio-grid" style={{ gap: "12px" }}>
                            {data.portfolio.map((img, i) => (
                                <div key={i} className="portfolio-item" style={{ backgroundImage: `url(${img})`, borderRadius: "12px" }} />
                            ))}
                        </div>
                        {data.portfolio.length === 0 && (
                            <div style={{ marginTop: "16px", textAlign: "center", padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "2px dashed #E2E8F0" }}>
                                <Camera size={32} color="#CBD5E1" style={{ marginBottom: "12px" }} />
                                <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "16px" }}>{data.name.split(" ")[0]} aún no cargó trabajos a su portfolio.</p>
                                <button className="chamba-btn-primary" style={{ width: "auto", margin: "0 auto", padding: "10px 24px", fontSize: "14px" }}>Cargar trabajos</button>
                            </div>
                        )}
                    </div>

                    {/* Reseñas */}
                    <div className="chamba-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                            <h3 className="chamba-title" style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Reseñas</h3>
                        </div>
                        
                        <div style={{ display: "flex", gap: "40px", marginBottom: "40px", flexWrap: "wrap", alignItems: "center" }}>
                            <div style={{ textAlign: "center", padding: "24px", background: "#F8FAFC", borderRadius: "20px", border: "1px solid #F1F5F9", minWidth: "140px" }}>
                                <div style={{ fontSize: "48px", fontWeight: "800", color: data.reviewCount > 0 ? "#0F172A" : "#CBD5E1" }}>{data.rating > 0 ? data.rating : "0"}</div>
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center", margin: "8px 0" }}>
                                    {[1,2,3,4,5].map(i => (
                                        <Star 
                                            key={i} 
                                            size={20} 
                                            fill={data.reviewCount > 0 && i <= data.rating ? "#F59E0B" : "#D1D5DB"} 
                                            color={data.reviewCount > 0 && i <= data.rating ? "#F59E0B" : "#D1D5DB"} 
                                        />
                                    ))}
                                </div>
                                <div style={{ color: "#94A3B8", fontSize: "14px" }}>{data.reviewCount} reseñas</div>
                            </div>

                            <div style={{ flex: 1, minWidth: "200px" }}>
                                {[5,4,3,2,1].map(star => {
                                    const count = data.reviewCount > 0 ? (data.reviews.filter(r => Math.round(r.estrellas) === star).length) : 0;
                                    const percentage = data.reviewCount > 0 ? (count / data.reviewCount) * 100 : 0;
                                    return (
                                        <div key={star} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                            <span style={{ fontSize: "13px", fontWeight: "600", width: "12px" }}>{star}</span>
                                            <Star size={12} fill="#CBD5E1" color="#CBD5E1" />
                                            <div style={{ flex: 1, height: "8px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                                                <div style={{ width: `${percentage}%`, height: "100%", background: "#F59E0B", transition: "width 0.3s ease" }} />
                                            </div>
                                            <span style={{ fontSize: "12px", color: "#94A3B8", width: "24px", textAlign: "right" }}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ maxWidth: "240px" }}>
                                <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>¿Trabajaste con {data.name.split(" ")[0]}? Dejá tu reseña y ayudá a otros clientes.</p>
                                <button className="chamba-btn-primary" style={{ width: "auto", padding: "10px 24px" }}>Dejar una reseña</button>
                            </div>
                        </div>

                        {/* Recent Reviews List (Real) */}
                        <div style={{ display: "flex", gap: "20px", overflowX: data.reviews.length > 0 ? "auto" : "visible", paddingBottom: "16px" }}>
                            {data.reviews.length > 0 ? (
                                data.reviews.map((rev, i) => (
                                    <div key={i} style={{ minWidth: "280px", padding: "24px", background: "#F8FAFC", borderRadius: "24px", border: "1px solid #F1F5F9" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: primaryColor + "10", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: primaryColor }}>
                                                    {rev.nombreCliente.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>{rev.nombreCliente}</div>
                                                    <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                                                        {new Date(rev.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "2px" }}>
                                                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= rev.estrellas ? "#F59E0B" : "none"} color={s <= rev.estrellas ? "#F59E0B" : "#CBD5E1"} />)}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", marginBottom: "16px", minHeight: "60px" }}>
                                            {rev.comentario}
                                        </p>
                                        {rev.trabajoVerificado && (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#F1F5F9", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                                                <CheckCircle2 size={12} /> Trabajo verificado
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{ width: "100%", textAlign: "center", padding: "40px", background: "#F8FAFC", borderRadius: "24px", border: "1px dashed #E2E8F0" }}>
                                    <Star size={32} color="#CBD5E1" style={{ marginBottom: "12px" }} />
                                    <p style={{ color: "#94A3B8", fontSize: "15px" }}>{data.name.split(" ")[0]} aún no recibió reseñas.</p>
                                </div>
                            )}
                        </div>
                        {data.reviews.length > 0 && (
                            <button className="chamba-btn-outline" style={{ margin: "32px auto 0 auto" }}>Ver todas las reseñas ({data.reviewCount})</button>
                        )}
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div>
                    {/* Botón Principal */}
                    <button className="chamba-btn-primary" style={{ padding: "18px", marginBottom: "12px" }}>
                        <MessageCircle size={20} /> Contactar
                    </button>
                    <p style={{ textAlign: "center", fontSize: "12px", color: "#94A3B8", marginBottom: "32px" }}>Respondemos en menos de 1 hora</p>

                    {/* Información de contacto */}
                    <div className="chamba-card">
                        <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "24px" }}>Información de contacto</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                <Mail size={18} color={primaryColor} />
                                <div style={{ fontSize: "14px", color: "#475569" }}>{data.email}</div>
                            </div>
                            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                <MapPin size={18} color={primaryColor} />
                                <div style={{ fontSize: "14px", color: "#475569" }}>{data.location || "Ubicación no especificada"}</div>
                            </div>
                            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                <Hash size={18} color={primaryColor} />
                                <div style={{ fontSize: "14px" }}>
                                    <div style={{ fontWeight: "700", color: "#0F172A" }}>Matrícula Profesional</div>
                                    <div style={{ color: "#94A3B8", fontSize: "13px" }}>{data.matricula}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: "24px", background: "#F3E8FF", padding: "14px", borderRadius: "12px", fontSize: "12px", color: "#7C3AED", textAlign: "center", fontWeight: "600" }}>
                            Para ver el teléfono, contactá al profesional.
                        </div>
                    </div>

                    {/* Redes Sociales */}
                    <div className="chamba-card">
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Redes sociales</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {data.instagram && (
                                <a href={data.instagram} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", cursor: "pointer", color: "inherit", textDecoration: "none" }}>
                                    <Instagram size={20} color="#E1306C" /> <span>Instagram</span>
                                </a>
                            )}
                            {data.facebook && (
                                <a href={data.facebook} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", cursor: "pointer", color: "inherit", textDecoration: "none" }}>
                                    <Facebook size={20} color="#1877F2" /> <span>Facebook</span>
                                </a>
                            )}
                            {data.linkedin && (
                                <a href={data.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", cursor: "pointer", color: "inherit", textDecoration: "none" }}>
                                    <Linkedin size={20} color="#0077B5" /> <span>LinkedIn</span>
                                </a>
                            )}
                            {!data.instagram && !data.facebook && !data.linkedin && (
                                <span style={{ fontSize: "14px", color: "#94A3B8", fontStyle: "italic" }}>Sin redes vinculadas</span>
                            )}
                        </div>
                    </div>

                    {/* Servicios destacados */}
                    <div className="chamba-card">
                        <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Servicios destacados</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {(data.specialties.length > 0 ? data.specialties : [data.category]).map(s => (
                                <div key={s} style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "14px" }}>
                                    <CheckCircle2 size={16} color={primaryColor} /> {s}
                                </div>
                            ))}
                            {data.specialties.length === 0 && (
                                <p style={{ fontSize: "13px", color: "#94A3B8", fontStyle: "italic" }}>No se especificaron servicios adicionales.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTÓN DE EDICIÓN FLOTANTE (Solo para Dueño) */}
            {isOwner && (
                <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 1000 }}>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="chamba-btn-primary" 
                            style={{ width: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                        >
                            <Edit3 size={18} /> Editar mi perfil
                        </button>
                    ) : (
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setIsEditing(false)} className="chamba-btn-outline" style={{ padding: "14px" }}><X size={20} /></button>
                            <button onClick={handleSave} className="chamba-btn-primary" style={{ width: "auto", padding: "14px 32px" }}>
                                {saving ? <RefreshCw className="spin" /> : <Save size={18} />} Guardar cambios
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE EDICIÓN SIMPLIFICADO */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            style={{ background: "white", borderRadius: "32px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "40px" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                <h2 className="chamba-title" style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Editar Perfil</h2>
                                <X size={24} style={{ cursor: "pointer" }} onClick={() => setIsEditing(false)} />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px" }}>Resumen Profesional</label>
                                    <textarea 
                                        className="chamba-input" 
                                        style={{ height: "120px", resize: "none" }}
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px" }}>Teléfono</label>
                                        <input className="chamba-input" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px" }}>Matrícula</label>
                                        <input className="chamba-input" value={editForm.matricula} onChange={(e) => setEditForm({...editForm, matricula: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px" }}>Instagram URL</label>
                                    <input className="chamba-input" value={editForm.instagram} onChange={(e) => setEditForm({...editForm, instagram: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ marginTop: "40px", display: "flex", gap: "16px" }}>
                                <button className="chamba-btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancelar</button>
                                <button className="chamba-btn-primary" style={{ flex: 2 }} onClick={handleSave}>Guardar cambios</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ height: "100px" }} />
        </div>
    )
}

addPropertyControls(PerfilPublicoProveedorChamba, {
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    enableDemoMode: {
        type: ControlType.Boolean,
        title: "Modo Demo",
        defaultValue: false,
    },
    isProDemo: {
        type: ControlType.Boolean,
        title: "PRO en Demo",
        defaultValue: true,
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color PPS",
        defaultValue: "#A01EED",
    },
})
