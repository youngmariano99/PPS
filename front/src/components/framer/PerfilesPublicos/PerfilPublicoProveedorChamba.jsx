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
    const [isOwner, setIsOwner] = useState(false)
    const [editingSection, setEditingSection] = useState(null) // 'header', 'bio', 'specialties', 'portfolio', 'conditions', 'contact'
    const [tempData, setTempData] = useState({})
    const [isSaving, setIsSaving] = useState(false)
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
                    setTempData(mapped)
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
            setTempData(demo)
            setIsOwner(true)
        } else {
            setError("No se encontró el perfil solicitado.")
        }
        setLoading(false)
    }

    useEffect(() => { discoverAndFetch() }, [apiUrl, enableDemoMode])

    const handleEditSection = (section) => {
        setTempData({ ...data })
        setEditingSection(section)
    }

    const handleSaveSection = async () => {
        setIsSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: { session } } = await supabase.auth.getSession()
            
            // Mapeo de tempData a PerfilSolicitudDto
            const payload = {
                descripcion: tempData.description,
                matricula: tempData.matricula,
                fotoPerfilUrl: tempData.avatar,
                instagramUrl: tempData.instagram,
                facebookUrl: tempData.facebook,
                linkedinUrl: tempData.linkedin,
                especialidades: tempData.specialties,
                condicionesServicio: tempData.conditions,
                fotosPortafolioUrls: tempData.portfolio,
                pais: data.pais || "Argentina", // Mantener campos obligatorios
                provincia: data.province,
                ciudad: data.city,
                calle: data.address ? data.address.split(" ")[0] : "",
                numero: data.address ? parseInt(data.address.split(" ")[1]) || 0 : 0,
                codigoPostal: 0 // Mock o traer de data si existe
            }

            const response = await fetch(`${apiUrl}/perfil/proveedor/me`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: session ? `Bearer ${session.access_token}` : "",
                    "X-User-Id": user ? user.id : ""
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                setData({ ...tempData })
                setEditingSection(null)
            } else {
                alert("Error al guardar los cambios")
            }
        } catch (err) {
            console.error("Error saving section:", err)
        } finally {
            setIsSaving(false)
        }
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
                        <div 
                            onClick={() => {
                                const text = encodeURIComponent(`¡Hola! Mirá el perfil de profesional de ${data.name} en Chamba: ${window.location.href}. Encontrá los mejores talentos de tu zona de forma rápida y segura. 🚀`);
                                window.open(`https://wa.me/?text=${text}`, "_blank");
                            }}
                            style={{ display: "flex", gap: "6px", alignItems: "center", color: primaryColor, fontWeight: "700", cursor: "pointer", background: primaryColor + "10", padding: "8px 16px", borderRadius: "100px", transition: "all 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = primaryColor + "20"}
                            onMouseLeave={(e) => e.currentTarget.style.background = primaryColor + "10"}
                        >
                            <span style={{ fontSize: "13px" }}>Compartir perfil</span> <ExternalLink size={14} />
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
                                backgroundImage: `url(${tempData.avatar || data.avatar})`,
                                transition: "all 0.3s ease",
                                backgroundColor: "#F1F5F9"
                            }} />
                            {isOwner && (
                                <button 
                                    onClick={() => openUploadWidget((url) => {
                                        setTempData(prev => ({ ...prev, avatar: url }))
                                        setEditingSection("header")
                                    }, false)}
                                    style={{
                                        position: "absolute",
                                        bottom: "-10px",
                                        right: "-10px",
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        background: "white",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        zIndex: 10
                                    }}
                                >
                                    <Camera size={20} color={primaryColor} />
                                </button>
                            )}
                        </div>

                        {/* Info Header */}
                        <div style={{ flex: 1, minWidth: "300px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <h1 className="chamba-title" style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{data.name}</h1>
                                    {data.isPro && <span className="chamba-badge-pro">PRO</span>}
                                    <CheckCircle2 size={24} color={primaryColor} fill={primaryColor + "20"} />
                                </div>
                                {isOwner && editingSection !== "header" && (
                                    <button onClick={() => handleEditSection("header")} style={{ background: "transparent", border: "none", color: primaryColor, cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                                        <Edit3 size={16} /> Editar
                                    </button>
                                )}
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

                            {editingSection === "header" ? (
                                <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: `1px solid ${primaryColor}20`, marginBottom: "20px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                            <div>
                                                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Instagram</label>
                                                <input className="chamba-input" value={tempData.instagram} onChange={e => setTempData({...tempData, instagram: e.target.value})} placeholder="URL de Instagram" />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Facebook</label>
                                                <input className="chamba-input" value={tempData.facebook} onChange={e => setTempData({...tempData, facebook: e.target.value})} placeholder="URL de Facebook" />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>LinkedIn</label>
                                            <input className="chamba-input" value={tempData.linkedin} onChange={e => setTempData({...tempData, linkedin: e.target.value})} placeholder="URL de LinkedIn" />
                                        </div>
                                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                                            <button onClick={() => setEditingSection(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
                                            <button onClick={handleSaveSection} style={{ background: primaryColor, color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                                                {isSaving ? "Guardando..." : "Guardar"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {editingSection === "bio" ? (
                                        <div style={{ marginBottom: "24px" }}>
                                            <textarea 
                                                className="chamba-input" 
                                                style={{ minHeight: "100px", resize: "none" }}
                                                value={tempData.description}
                                                onChange={e => setTempData({...tempData, description: e.target.value})}
                                            />
                                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                                                <button onClick={() => setEditingSection(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
                                                <button onClick={handleSaveSection} style={{ background: primaryColor, color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Guardar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ position: "relative" }}>
                                            <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6", maxWidth: "600px", marginBottom: "24px" }}>
                                                {data.description}
                                                {isOwner && <Edit3 size={14} style={{ marginLeft: "8px", cursor: "pointer", color: primaryColor }} onClick={() => handleEditSection("bio")} />}
                                            </p>
                                        </div>
                                    )}

                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Especialidades</div>
                                        {isOwner && editingSection !== "specialties" && <Edit3 size={14} style={{ cursor: "pointer", color: primaryColor }} onClick={() => handleEditSection("specialties")} />}
                                    </div>
                                    
                                    {editingSection === "specialties" ? (
                                        <div style={{ marginBottom: "20px" }}>
                                            <TagInput 
                                                tags={tempData.specialties} 
                                                setTags={(t) => setTempData({...tempData, specialties: t})} 
                                            />
                                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                                                <button onClick={() => setEditingSection(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
                                                <button onClick={handleSaveSection} style={{ background: primaryColor, color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Guardar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            {data.specialties.length > 0 ? (
                                                data.specialties.map((tag, i) => (
                                                    <span key={i} className="chamba-tag">{tag}</span>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: "14px", color: "#94A3B8", fontStyle: "italic" }}>{data.name.split(" ")[0]} aún no especificó especialidades.</span>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
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
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <h3 className="chamba-title" style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Portfolio</h3>
                                {isOwner && (
                                    <button 
                                        onClick={() => openUploadWidget((url) => {
                                            const newPortfolio = [...data.portfolio, url]
                                            setTempData({...data, portfolio: newPortfolio})
                                            handleEditSection("portfolio")
                                        }, true)}
                                        style={{ background: primaryColor + "15", border: "none", color: primaryColor, borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            {editingSection === "portfolio" && (
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button onClick={() => setEditingSection(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>Cancelar</button>
                                    <button onClick={handleSaveSection} style={{ background: primaryColor, color: "white", border: "none", padding: "4px 12px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Guardar</button>
                                </div>
                            )}
                        </div>

                        <div className="portfolio-grid" style={{ gap: "12px" }}>
                            {(editingSection === "portfolio" ? tempData.portfolio : data.portfolio).map((img, i) => (
                                <div key={i} style={{ position: "relative" }}>
                                    <div className="portfolio-item" style={{ backgroundImage: `url(${img})`, borderRadius: "12px" }} />
                                    {editingSection === "portfolio" && (
                                        <button 
                                            onClick={() => {
                                                const newP = tempData.portfolio.filter((_, idx) => idx !== i)
                                                setTempData({...tempData, portfolio: newP})
                                            }}
                                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", fontSize: "12px" }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {data.portfolio.length === 0 && !editingSection && (
                            <div style={{ marginTop: "16px", textAlign: "center", padding: "32px", background: "#F8FAFC", borderRadius: "16px", border: "2px dashed #E2E8F0" }}>
                                <Camera size={32} color="#CBD5E1" style={{ marginBottom: "12px" }} />
                                <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "16px" }}>{data.name.split(" ")[0]} aún no cargó trabajos a su portfolio.</p>
                                {isOwner && <button onClick={() => handleEditSection("portfolio")} className="chamba-btn-primary" style={{ width: "auto", margin: "0 auto", padding: "10px 24px", fontSize: "14px" }}>Configurar Portfolio</button>}
                            </div>
                        )}
                    </div>

                    {/* Cómo Trabajo (Condiciones) */}
                    <div className="chamba-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 className="chamba-title" style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Cómo trabajo</h3>
                            {isOwner && editingSection !== "conditions" && (
                                <button onClick={() => handleEditSection("conditions")} style={{ background: "transparent", border: "none", color: primaryColor, cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                                    <Edit3 size={14} /> Editar
                                </button>
                            )}
                        </div>

                        {editingSection === "conditions" ? (
                            <div>
                                <TagInput 
                                    tags={tempData.conditions} 
                                    setTags={(t) => setTempData({...tempData, conditions: t})} 
                                />
                                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                                    <button onClick={() => setEditingSection(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", fontWeight: "600", cursor: "pointer" }}>Cancelar</button>
                                    <button onClick={handleSaveSection} style={{ background: primaryColor, color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Guardar</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                                <div>
                                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "16px" }}>Condiciones del servicio</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {data.conditions.length > 0 ? (
                                            data.conditions.map((c, i) => (
                                                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "14px", color: "#475569" }}>
                                                    <CheckCircle2 size={18} color="#10B981" style={{ marginTop: "2px", flexShrink: 0 }} />
                                                    <span>{c}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: "14px", color: "#94A3B8", fontStyle: "italic" }}>{data.name.split(" ")[0]} aún no especificó condiciones de contratación.</p>
                                        )}
                                    </div>
                                </div>
                                <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "20px", border: "1px solid #F1F5F9" }}>
                                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "16px" }}>Métodos de pago</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                        <div style={{ background: "white", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: "#475569", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} /> Efectivo
                                        </div>
                                        <div style={{ background: "white", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: "#009EE3", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#009EE3" }} /> Mercado Pago
                                        </div>
                                        <div style={{ background: "white", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", color: "#475569", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#64748B" }} /> Transferencia
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "16px" }}>Consulta otros medios de pago directamente con el profesional.</p>
                                </div>
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
                    <button 
                        className="chamba-btn-primary" 
                        style={{ padding: "18px", marginBottom: "12px" }}
                        onClick={() => {
                            if (!data.phone) {
                                alert("El profesional aún no ha registrado un teléfono de contacto.");
                                return;
                            }
                            const text = encodeURIComponent(`Hola ${data.name.split(" ")[0]}, te vi en Chamba y me gustaría consultarte por tus servicios.`);
                            window.open(`https://wa.me/${data.phone.replace(/\s+/g, "")}?text=${text}`, "_blank");
                        }}
                    >
                        <MessageCircle size={20} /> Contactar por WhatsApp
                    </button>
                    <p style={{ textAlign: "center", fontSize: "12px", color: "#94A3B8", marginBottom: "32px" }}>Respondemos en menos de 1 hora</p>

                    {/* Información de contacto */}
                    <div className="chamba-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Información de contacto</h4>
                            {isOwner && editingSection !== "contact" && (
                                <button onClick={() => handleEditSection("contact")} style={{ background: "transparent", border: "none", color: primaryColor, cursor: "pointer" }}>
                                    <Edit3 size={14} />
                                </button>
                            )}
                        </div>

                        {editingSection === "contact" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Email</label>
                                    <input className="chamba-input" value={tempData.email} onChange={e => setTempData({...tempData, email: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Teléfono (WhatsApp)</label>
                                    <input className="chamba-input" value={tempData.phone} onChange={e => setTempData({...tempData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Matrícula</label>
                                    <input className="chamba-input" value={tempData.matricula} onChange={e => setTempData({...tempData, matricula: e.target.value})} />
                                </div>
                                <div style={editActionRow}>
                                    <button onClick={() => setEditingSection(null)} style={secondaryBtnStyle}>Cancelar</button>
                                    <button onClick={handleSaveSection} style={primaryBtnSmallStyle}>Guardar</button>
                                </div>
                            </div>
                        ) : (
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
                        )}
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


            <FloatingContact />
            <div style={{ height: "40px" }} />
        </div>
    )

    // --- SUB-COMPONENTES AUXILIARES ---
    function FloatingContact() {
        if (isOwner) return null
        return (
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 1000, display: "flex", gap: "12px" }}
            >
                <button 
                    onClick={() => {
                        const text = encodeURIComponent(`Hola ${data.name.split(" ")[0]}, te vi en Chamba y me gustaría consultarte por tus servicios.`);
                        window.open(`https://wa.me/${data.phone.replace(/\s+/g, "")}?text=${text}`, "_blank");
                    }}
                    className="chamba-btn-primary" 
                    style={{ width: "auto", padding: "16px 32px", boxShadow: "0 15px 35px " + primaryColor + "40", background: primaryColor, borderRadius: "100px" }}
                >
                    <MessageCircle size={20} /> <span style={{ fontWeight: "800" }}>Contactar ahora</span>
                </button>
            </motion.div>
        )
    }
}

const TagInput = ({ tags, setTags, placeholder = "Escribí y presioná Enter..." }) => {
    const [inputValue, setInputValue] = useState("")

    const addTag = () => {
        if (inputValue.trim() && !tags.includes(inputValue.trim())) {
            setTags([...tags, inputValue.trim()])
            setInputValue("")
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", background: "white", padding: "8px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                {tags.map((tag, i) => (
                    <span key={i} className="chamba-tag" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {tag} <X size={12} style={{ cursor: "pointer" }} onClick={() => setTags(tags.filter((_, idx) => idx !== i))} />
                    </span>
                ))}
                <input 
                    style={{ border: "none", outline: "none", fontSize: "13px", padding: "4px", flex: 1, minWidth: "100px" }}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                />
            </div>
        </div>
    )
}

const secondaryBtnStyle = { background: "transparent", border: "none", color: "#94A3B8", fontWeight: "600", cursor: "pointer", fontSize: "13px" }
const primaryBtnSmallStyle = { background: "#A01EED", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }

// --- FRAMER CONTROLS ---
addPropertyControls(PerfilPublicoProveedorChamba, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    enableDemoMode: { type: ControlType.Boolean, title: "Modo Demo", defaultValue: false },
    isProDemo: { type: ControlType.Boolean, title: "PRO en Demo", defaultValue: true },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#A01EED" },
})
