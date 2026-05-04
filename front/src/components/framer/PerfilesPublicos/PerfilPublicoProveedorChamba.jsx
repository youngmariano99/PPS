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
    Youtube,
    Github,
    ExternalLink,
    CheckCircle2,
    Clock,
    ShieldCheck,
    MessageCircle,
    Video,
    Play,
    ChevronRight,
    ChevronLeft,
    Maximize2
} from "lucide-react"
import Swal from "https://esm.sh/sweetalert2"

const getEmbedUrl = (url) => {
    if (!url) return null
    try {
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop()
            return `https://www.youtube.com/embed/${id}`
        }
        if (url.includes("instagram.com")) {
            const parts = url.split("/")
            const pIdx = parts.indexOf("p")
            const rIdx = parts.indexOf("reel")
            const id = pIdx !== -1 ? parts[pIdx + 1] : (rIdx !== -1 ? parts[rIdx + 1] : null)
            if (id) return `https://www.instagram.com/p/${id.split("?")[0]}/embed/`
        }
        if (url.includes("tiktok.com")) {
            const id = url.split("/video/")[1]?.split("?")[0]
            if (id) return `https://www.tiktok.com/embed/v2/${id}`
        }
    } catch (e) {
        return null
    }
    return null
}

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

// --- HELPER MULTIMEDIA ---
function openUploadWidget(callback, multipleOrOptions) {
    const options = typeof multipleOrOptions === 'object' 
        ? multipleOrOptions 
        : { multiple: !!multipleOrOptions };

    if (window.cloudinary) {
        window.cloudinary.openUploadWidget({
            cloudName: "denfvu7zy",
            uploadPreset: "unsigned_preset",
            sources: ["local", "url", "camera"],
            ...options
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                let finalUrl = result.info.secure_url;
                if (result.info.coordinates && result.info.coordinates.custom && result.info.coordinates.custom.length > 0) {
                    const [x, y, w, h] = result.info.coordinates.custom[0];
                    finalUrl = finalUrl.replace("/upload/", `/upload/c_crop,x_${Math.round(x)},y_${Math.round(y)},w_${Math.round(w)},h_${Math.round(h)}/`);
                }
                callback(finalUrl)
            }
        })
    } else {
        alert("El servicio de carga aún no está listo. Por favor, reintente en un momento.")
    }
}

export default function PerfilPublicoProveedorChamba(props) {
    const { apiUrl, enableDemoMode, primaryColor = "#A01EED", isProDemo = false } = props

    // --- ESTADOS LÓGICOS (1:1 con el original) ---
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [editingSection, setEditingSection] = useState(null)
    const [selectedImgIndex, setSelectedImgIndex] = useState(null)
    const [tempData, setTempData] = useState({})
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [intencionContactoId, setIntencionContactoId] = useState(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [revealSensitive, setRevealSensitive] = useState(false)

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

        const cloudinaryScript = document.createElement("script")
        cloudinaryScript.src = "https://widget.cloudinary.com/v2.0/global/all.js"
        cloudinaryScript.type = "text/javascript"
        cloudinaryScript.async = true
        document.body.appendChild(cloudinaryScript)

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
                        calle: res.calle || "",
                        numero: res.numero || "",
                        city: res.ciudad || "",
                        province: res.provincia || "",
                        pais: res.pais || "Argentina",
                        codigoPostal: res.codigoPostal || "",
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
                        redesSociales: res.redesSociales || [],
                        sitioWebUrl: res.sitioWebUrl || "",
                        videoLinks: res.videoLinks || [],
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
                redesSociales: [
                    { plataforma: "INSTAGRAM", url: "https://instagram.com/marianolombardo" },
                    { plataforma: "LINKEDIN", url: "https://linkedin.com/in/marianolombardo" }
                ],
                sitioWebUrl: "https://marianolombardo.com",
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

    // --- INTERCEPCIÓN DE LINK MÁGICO (?review=true) ---
    useEffect(() => {
        const handleMagicLink = async () => {
            const params = new URLSearchParams(window.location.search)
            if (params.get("review") === "true") {
                try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) return // No abrimos si no hay usuario

                    // Disparo silencioso de intención de contacto para generar el Badge
                    const response = await fetch(`${apiUrl}/contactos`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-User-Id": user.id
                        },
                        body: JSON.stringify({ destinoId: data.id })
                    })

                    if (response.ok) {
                        const id = await response.json()
                        setIntencionContactoId(id)

                        // Feedback premium
                        Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "success",
                            title: "Link mágico activado",
                            text: "Podés dejar tu reseña ahora.",
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true
                        })
                    }

                    // Abrir modal automáticamente
                    setShowReviewModal(true)
                } catch (err) {
                    console.error("Error en el flujo de link mágico:", err)
                }
            }
        }
        if (data && !isOwner) handleMagicLink()
    }, [data, isOwner])

    const handleEditSection = (section) => {
        setTempData({ ...data })
        setEditingSection(section)
    }

    const handleSaveSection = async () => {
        setIsSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: { session } } = await supabase.auth.getSession()

            // Validación de Ubicación (solo si estamos editando la sección de ubicación)
            if (editingSection === "ubicacion") {
                const direccionCompleta = `${tempData.calle} ${tempData.numero}, ${tempData.city}, ${tempData.province}, ${tempData.pais}`
                const resGeo = await fetch(`${apiUrl.replace(/\/+$/, "")}/directorio/geocodificar?direccion=${encodeURIComponent(direccionCompleta)}`)

                if (!resGeo.ok) {
                    alert("No pudimos encontrar esa dirección en el mapa. Por favor, verificá que los datos (Calle, Número, Ciudad y Provincia) sean correctos.")
                    setIsSaving(false)
                    return
                }
            }

            // Mapeo de tempData a PerfilSolicitudDto
            const payload = {
                descripcion: tempData.description,
                matricula: tempData.matricula,
                fotoPerfilUrl: tempData.avatar,
                redesSocialesUrls: (tempData.redesSociales || []).map(r => r.url || r).filter(url => typeof url === 'string' && url.trim() !== ""),
                sitioWebUrl: tempData.sitioWebUrl,
                especialidades: tempData.specialties,
                condicionesServicio: tempData.conditions,
                fotosPortafolioUrls: tempData.portfolio,
                pais: tempData.pais || "Argentina",
                provincia: tempData.province,
                ciudad: tempData.city,
                calle: tempData.calle,
                numero: parseInt(tempData.numero) || 0,
                codigoPostal: parseInt(tempData.codigoPostal) || 0,
                videoLinks: (tempData.videoLinks || []).filter(l => l.trim() !== "")
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
                setEditingSection(null)
                discoverAndFetch()
            } else {
                alert("Error al guardar los cambios")
            }
        } catch (err) {
            console.error("Error saving section:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const handleContactClick = async () => {
        if (!data.phone) {
            alert("El profesional aún no ha registrado un teléfono de contacto.")
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert("Debes iniciar sesión para contactar a un profesional.")
                return
            }

            // Registrar Intención de Contacto y obtener datos revelados
            const response = await fetch(`${apiUrl}/contactos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": user.id
                },
                body: JSON.stringify({ destinoId: data.id })
            })

            if (response.ok) {
                const resData = await response.json()
                setIntencionContactoId(resData.contactoId)
                
                // REVELAR DATOS EN LA UI TRAS EL CONTACTO EXITOSO
                setData(prev => ({
                    ...prev,
                    phone: resData.telefonoRevelado || prev.phone,
                    calle: resData.calleRevelada || prev.calle,
                    numero: resData.numeroRevelado || prev.numero
                }))
                setRevealSensitive(true)

                const text = encodeURIComponent(`Hola ${data.name.split(" ")[0]}, te vi en Chamba y me gustaría consultarte por tus servicios.`)
                window.open(`https://wa.me/${resData.telefonoRevelado.replace(/\s+/g, "")}?text=${text}`, "_blank")
            }
        } catch (err) {
            console.error("Error al registrar contacto:", err)
        }
    }

    const handleReviewSubmit = async () => {
        setIsSubmittingReview(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const response = await fetch(`${apiUrl}/resenas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": user.id
                },
                body: JSON.stringify({
                    intencionContactoId: intencionContactoId,
                    estrellas: reviewRating,
                    comentario: reviewComment,
                    propietarioId: data.id
                })
            })

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "¡Gracias!",
                    text: "Tu reseña ha sido publicada con éxito.",
                    confirmButtonColor: primaryColor
                })
                setShowReviewModal(false)
                setReviewComment("")
                setIntencionContactoId(null) // Resetear para evitar 409 en el próximo envío
                discoverAndFetch() // Recargar datos
            } else {
                const errorData = await response.json()
                Swal.fire({
                    icon: "error",
                    title: "Ups...",
                    text: errorData.mensaje || "Error al enviar la reseña.",
                    confirmButtonColor: primaryColor
                })
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudo conectar con el servidor para enviar la reseña.",
                confirmButtonColor: primaryColor
            })
        } finally {
            setIsSubmittingReview(false)
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
                                backgroundPosition: "center",
                                backgroundImage: `url(${tempData.avatar || data.avatar})`,
                                transition: "all 0.3s ease",
                                backgroundColor: "#F1F5F9"
                            }} />
                            {isOwner && (
                                <button
                                    onClick={() => openUploadWidget((url) => {
                                        setTempData(prev => ({ ...prev, avatar: url }))
                                        setEditingSection("avatar")
                                    }, { 
                                        multiple: false, 
                                        cropping: true, 
                                        showSkipCropButton: false,
                                        croppingAspectRatio: 1,
                                        croppingDefaultSelectionRatio: 1
                                    })}
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
                            {editingSection === "avatar" && (
                                <div style={{ position: "absolute", bottom: "-60px", left: "0", right: "0", display: "flex", gap: "8px", justifyContent: "center", zIndex: 20 }}>
                                    <button onClick={handleSaveSection} style={{ ...primaryBtnSmallStyle, padding: "6px 12px", fontSize: "11px" }}>Guardar</button>
                                    <button onClick={() => { setTempData(prev => ({ ...prev, avatar: data.avatar })); setEditingSection(null); }} style={{ ...secondaryBtnStyle, padding: "6px 12px", fontSize: "11px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>X</button>
                                </div>
                            )}
                        </div>

                        {/* Info Header */}
                        <div style={{ flex: 1, minWidth: "300px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <h1 className="chamba-title" style={{ fontSize: "32px", fontWeight: "700", margin: 0 }}>{data.name}</h1>
                                    {data.isPro && <span className="chamba-badge-pro">PRO</span>}
                                </div>
                            </div>

                            <p style={{ fontSize: "18px", fontWeight: "600", color: primaryColor, marginBottom: "12px" }}>{data.category}</p>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                                <div style={{ display: "flex", gap: "2px" }}>
                                    {[1, 2, 3, 4, 5].map(i => (
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

                            {editingSection === "bio" ? (
                                <div style={{ marginBottom: "24px" }}>
                                    <textarea
                                        className="chamba-input"
                                        style={{ minHeight: "100px", resize: "none" }}
                                        value={tempData.description}
                                        onChange={e => setTempData({ ...tempData, description: e.target.value })}
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
                                        setTags={(t) => setTempData({ ...tempData, specialties: t })}
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
                        </div>

                        {/* Botón Compartir + Redes Sociales (Columna) */}
                        <div style={{
                            marginTop: isMobile ? "32px" : "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px"
                        }}>
                            {/* Compartir Perfil */}
                            <div
                                onClick={() => {
                                    const text = encodeURIComponent(`¡Hola! Mirá el perfil de profesional de ${data.name} en Chamba: ${window.location.href}. Encontrá los mejores talentos de tu zona de forma rápida y segura. 🚀`);
                                    window.open(`https://wa.me/?text=${text}`, "_blank");
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    background: "white",
                                    padding: "12px 24px",
                                    borderRadius: "16px",
                                    border: `2px solid ${primaryColor}15`,
                                    cursor: "pointer",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    width: "fit-content"
                                }}
                                className="chamba-share-btn"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)"
                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)"
                                    e.currentTarget.style.borderColor = primaryColor + "30"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)"
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)"
                                    e.currentTarget.style.borderColor = primaryColor + "15"
                                }}
                            >
                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: primaryColor + "10", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ExternalLink size={18} color={primaryColor} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>Compartir perfil</span>
                                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>Recomendar a otros</span>
                                </div>
                            </div>

                            {/* Redes Sociales - Nueva Ubicación Minimalista */}
                            <div style={{ padding: "0 4px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>Redes sociales</div>
                                    {isOwner && editingSection !== "social" && (
                                        <button onClick={() => handleEditSection("social")} style={{ background: "transparent", border: "none", color: primaryColor, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}>
                                            <Edit3 size={12} /> Editar
                                        </button>
                                    )}
                                </div>

                                {editingSection === "social" ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "white", padding: "16px", borderRadius: "16px", border: `1px solid ${primaryColor}20`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Redes Sociales (URLs)</label>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                                                {(tempData.redesSociales || []).map((red, idx) => (
                                                    <input 
                                                        key={idx}
                                                        className="chamba-input" 
                                                        style={{ padding: "8px 12px" }} 
                                                        value={typeof red === 'string' ? red : red.url} 
                                                        onChange={(e) => {
                                                            const newRedes = [...(tempData.redesSociales || [])];
                                                            newRedes[idx] = e.target.value;
                                                            setTempData({ ...tempData, redesSociales: newRedes });
                                                        }} 
                                                        placeholder="https://instagram.com/..." 
                                                    />
                                                ))}
                                                <button onClick={() => setTempData({ ...tempData, redesSociales: [...(tempData.redesSociales || []), ""] })} style={{ ...secondaryBtnStyle, fontSize: "11px", padding: "4px 8px", alignSelf: "flex-start" }}>+ Agregar red social</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Sitio Web (URL)</label>
                                            <input className="chamba-input" style={{ padding: "8px 12px", marginTop: "8px" }} value={tempData.sitioWebUrl || ""} onChange={e => setTempData({ ...tempData, sitioWebUrl: e.target.value })} placeholder="https://mi-sitio.com" />
                                        </div>
                                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                                            <button onClick={() => setEditingSection(null)} style={{ ...secondaryBtnStyle, fontSize: "12px", padding: "6px 12px" }}>Cancelar</button>
                                            <button onClick={handleSaveSection} style={{ ...primaryBtnSmallStyle, fontSize: "12px", padding: "6px 16px" }}>Guardar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", flexDirection: "column" }}>
                                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                            {data.redesSociales && data.redesSociales.length > 0 ? (
                                                data.redesSociales.map((red, idx) => {
                                                    let Icono = ExternalLink;
                                                    let color = "#475569";
                                                    if (red.plataforma === "INSTAGRAM") { Icono = Instagram; color = "#E1306C"; }
                                                    if (red.plataforma === "FACEBOOK") { Icono = Facebook; color = "#1877F2"; }
                                                    if (red.plataforma === "LINKEDIN") { Icono = Linkedin; color = "#0077B5"; }
                                                    if (red.plataforma === "YOUTUBE") { Icono = Youtube; color = "#FF0000"; }
                                                    if (red.plataforma === "GITHUB") { Icono = Github; color = "#333333"; }
                                                    if (red.plataforma === "TIKTOK") { Icono = Video; color = "#000000"; }
                                                    
                                                    return (
                                                        <a key={idx} href={red.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "#475569", textDecoration: "none", fontWeight: "600" }}>
                                                            <Icono size={18} color={color} /> <span>{red.plataforma !== "OTRO" ? red.plataforma.charAt(0) + red.plataforma.slice(1).toLowerCase() : "Link"}</span>
                                                        </a>
                                                    );
                                                })
                                            ) : (
                                                <span style={{ fontSize: "13px", color: "#94A3B8", fontStyle: "italic" }}>Sin redes vinculadas</span>
                                            )}
                                        </div>
                                        {data.sitioWebUrl && (
                                            <div style={{ paddingTop: "8px", borderTop: "1px solid #F1F5F9" }}>
                                                <a href={data.sitioWebUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: primaryColor, textDecoration: "none", fontWeight: "600" }}>
                                                    <ExternalLink size={16} /> <span>Visitar Sitio Web</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                    <>
                                        <button
                                            onClick={() => openUploadWidget((url) => {
                                                const currentPortfolio = tempData.portfolio || data.portfolio
                                                const newPortfolio = [...currentPortfolio, url]
                                                setTempData(prev => ({ ...prev, portfolio: newPortfolio }))
                                                setEditingSection("portfolio")
                                            }, true)}
                                            style={{ background: primaryColor + "15", border: "none", color: primaryColor, borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            title="Agregar Foto"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!editingSection) handleEditSection("portfolio")
                                                setTempData(prev => ({ ...prev, videoLinks: [...(prev.videoLinks || []), ""] }))
                                            }}
                                            style={{ background: primaryColor + "15", border: "none", color: primaryColor, borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            title="Agregar Link de Video"
                                        >
                                            <Video size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {editingSection === "portfolio" && (
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button onClick={() => setEditingSection(null)} style={{ background: "transparent", border: "none", color: "#94A3B8", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>Cancelar</button>
                                    <button onClick={handleSaveSection} style={{ background: primaryColor, color: "white", border: "none", padding: "4px 12px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Guardar</button>
                                </div>
                            )}
                        </div>

                        {/* Imágenes del Portfolio */}
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Fotos de trabajos</div>
                        <div className="portfolio-grid" style={{ gap: "12px", marginBottom: "32px" }}>
                            {(editingSection === "portfolio" ? tempData.portfolio : data.portfolio).map((img, i) => (
                                <div key={i} style={{ position: "relative" }}>
                                    <div
                                        className="portfolio-item"
                                        style={{ backgroundImage: `url(${img})`, borderRadius: "12px", cursor: "pointer" }}
                                        onClick={() => setSelectedImgIndex(i)}
                                    />
                                    {editingSection === "portfolio" && (
                                        <button
                                            onClick={() => {
                                                const newP = tempData.portfolio.filter((_, idx) => idx !== i)
                                                setTempData({ ...tempData, portfolio: newP })
                                            }}
                                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", fontSize: "12px" }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Videos del Portfolio */}
                        {(data.videoLinks.length > 0 || editingSection === "portfolio") && (
                            <div style={{ marginTop: "32px" }}>
                                <div style={{ fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>Videos y Presentaciones</div>

                                {editingSection === "portfolio" ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {(tempData.videoLinks || []).map((link, idx) => (
                                            <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                <div style={{ flex: 1, position: "relative" }}>
                                                    <input
                                                        className="chamba-input"
                                                        placeholder="Link de YouTube, Instagram o TikTok..."
                                                        value={link}
                                                        onChange={e => {
                                                            const newLinks = [...tempData.videoLinks]
                                                            newLinks[idx] = e.target.value
                                                            setTempData({ ...tempData, videoLinks: newLinks })
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newLinks = tempData.videoLinks.filter((_, i) => i !== idx)
                                                        setTempData({ ...tempData, videoLinks: newLinks })
                                                    }}
                                                    style={{ background: "#FEE2E2", color: "#EF4444", border: "none", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setTempData(prev => ({ ...prev, videoLinks: [...(prev.videoLinks || []), ""] }))}
                                            style={{ ...secondaryBtnStyle, color: primaryColor, textAlign: "left", padding: "8px 0" }}
                                        >
                                            + Agregar otro link de video
                                        </button>
                                        <p style={{ fontSize: "11px", color: "#94A3B8" }}>Pega el link directo de la publicación o video.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
                                        {data.videoLinks.map((link, i) => {
                                            const embedUrl = getEmbedUrl(link)
                                            return (
                                                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <div style={{
                                                        position: "relative",
                                                        paddingTop: "177.77%", // Aspect ratio para Reels/TikTok (9:16)
                                                        background: "#000",
                                                        borderRadius: "20px",
                                                        overflow: "hidden",
                                                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                                                    }}>
                                                        {embedUrl ? (
                                                            <iframe
                                                                src={embedUrl}
                                                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        ) : (
                                                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", padding: "20px", textAlign: "center" }}>
                                                                <Video size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                                                                <div style={{ fontSize: "13px" }}>Formato de link no compatible para previsualización</div>
                                                                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, marginTop: "12px", fontSize: "12px", fontWeight: "700" }}>Ver en red social</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
                                                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>Video de presentación {i + 1}</span>
                                                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: primaryColor, fontWeight: "600" }}>Abrir original ↗</a>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
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
                                    setTags={(t) => setTempData({ ...tempData, conditions: t })}
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
                            </div>
                        )}
                    </div>

                    {/* Reseñas */}
                    <div className="chamba-card" style={{ padding: "32px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", border: `2px solid ${primaryColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Star size={18} color={primaryColor} />
                            </div>
                            <h3 className="chamba-title" style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>Reseñas</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "160px 1fr 240px", gap: "40px", marginBottom: "48px", alignItems: "center" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "56px", fontWeight: "800", color: data.reviewCount > 0 ? "#0F172A" : "#CBD5E1", lineHeight: 1 }}>{data.rating > 0 ? data.rating : "0"}</div>
                                <div style={{ display: "flex", gap: "3px", justifyContent: "center", margin: "12px 0" }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            size={18}
                                            fill={data.reviewCount > 0 && i <= data.rating ? "#F59E0B" : "none"}
                                            color={data.reviewCount > 0 && i <= data.rating ? "#F59E0B" : "#CBD5E1"}
                                        />
                                    ))}
                                </div>
                                <div style={{ color: "#94A3B8", fontSize: "13px", fontWeight: "600" }}>{data.reviewCount} reseñas</div>
                            </div>

                            <div style={{ flex: 1 }}>
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = data.reviewCount > 0 ? (data.reviews.filter(r => Math.round(r.estrellas) === star).length) : 0;
                                    const percentage = data.reviewCount > 0 ? (count / data.reviewCount) * 100 : 0;
                                    return (
                                        <div key={star} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "12px", fontWeight: "700", width: "10px", color: "#64748B" }}>{star}</span>
                                            <Star size={12} fill="#F59E0B" color="#F59E0B" style={{ opacity: percentage > 0 ? 1 : 0.3 }} />
                                            <div style={{ flex: 1, height: "6px", background: "#F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
                                                <div style={{ width: `${percentage}%`, height: "100%", background: "#F59E0B", borderRadius: "10px" }} />
                                            </div>
                                            <span style={{ fontSize: "12px", color: "#94A3B8", width: "24px", textAlign: "right", fontWeight: "600" }}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ maxWidth: "240px" }}>
                                <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>¿Trabajaste con {data.name.split(" ")[0]}? Dejá tu reseña y ayudá a otros clientes.</p>
                                <button
                                    className="chamba-btn-primary"
                                    style={{ width: "auto", padding: "10px 24px" }}
                                    onClick={() => {
                                        if (isOwner) {
                                            Swal.fire({
                                                icon: "info",
                                                title: "Perfil propio",
                                                text: "No podés calificar tu propio perfil.",
                                                confirmButtonColor: primaryColor
                                            })
                                            return
                                        }

                                        const checkUser = async () => {
                                            const { data: { user } } = await supabase.auth.getUser()
                                            if (!user) {
                                                Swal.fire({
                                                    icon: "warning",
                                                    title: "Sesión requerida",
                                                    text: "Debes iniciar sesión para calificar.",
                                                    confirmButtonColor: primaryColor
                                                })
                                                return
                                            }
                                            setShowReviewModal(true)
                                        }
                                        checkUser()
                                    }}
                                >
                                    Dejar una reseña
                                </button>
                            </div>
                        </div>

                        {/* Recent Reviews List (Real) */}
                        <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "24px", scrollbarWidth: "none" }}>
                            {data.reviews.length > 0 ? (
                                data.reviews.map((rev, i) => (
                                    <div key={i} style={{ 
                                        minWidth: "320px", 
                                        padding: "24px", 
                                        background: "white", 
                                        borderRadius: "24px", 
                                        border: "1px solid #F1F5F9",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: primaryColor + "10", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: primaryColor, fontSize: "16px", border: `2px solid ${primaryColor}20` }}>
                                                    {rev.nombreCliente.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#0F172A" }}>{rev.nombreCliente}</div>
                                                    <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "600" }}>
                                                        {new Date(rev.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "700" }}>{new Date(rev.fecha).getFullYear()}</div>
                                        </div>

                                        <div style={{ display: "flex", gap: "2px", marginBottom: "12px" }}>
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= rev.estrellas ? "#F59E0B" : "none"} color={s <= rev.estrellas ? "#F59E0B" : "#E2E8F0"} />)}
                                        </div>

                                        <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", marginBottom: "20px", minHeight: "50px", fontWeight: "500" }}>
                                            {rev.comentario}
                                        </p>

                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            {rev.intencionContactoId && (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: primaryColor + "08", padding: "6px 12px", borderRadius: "100px", fontSize: "11px", color: primaryColor, fontWeight: "800" }}>
                                                    <span style={{ fontSize: "14px" }}>🎯</span> Contacto Directo
                                                </span>
                                            )}
                                            {rev.trabajoVerificado && (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ECFDF5", padding: "6px 12px", borderRadius: "100px", fontSize: "11px", color: "#059669", fontWeight: "800" }}>
                                                    <CheckCircle2 size={12} /> Trabajo Realizado
                                                </span>
                                            )}
                                        </div>
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
                            <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
                                <button 
                                    className="chamba-btn-outline" 
                                    style={{ 
                                        width: "auto", 
                                        padding: "12px 32px", 
                                        borderRadius: "100px", 
                                        fontSize: "14px", 
                                        fontWeight: "700",
                                        borderColor: "#E2E8F0"
                                    }}
                                >
                                    Ver todas las reseñas ({data.reviewCount})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div>
                    {/* Botón Principal */}
                    <button
                        className="chamba-btn-primary"
                        style={{ padding: "18px", marginBottom: "12px" }}
                        onClick={handleContactClick}
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
                                    <input className="chamba-input" value={tempData.email} onChange={e => setTempData({ ...tempData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Teléfono (WhatsApp)</label>
                                    <input className="chamba-input" value={tempData.phone} onChange={e => setTempData({ ...tempData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8" }}>Matrícula</label>
                                    <input className="chamba-input" value={tempData.matricula} onChange={e => setTempData({ ...tempData, matricula: e.target.value })} />
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
                                <div style={{ display: "flex", gap: "16px", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        <Phone size={18} color={primaryColor} />
                                        <div style={{ fontSize: "14px", color: "#475569" }}>
                                            {(isOwner || revealSensitive) ? data.phone : "•••• •••• •••"}
                                        </div>
                                    </div>
                                    {!isOwner && !revealSensitive && (
                                        <button 
                                            onClick={handleContactClick}
                                            style={{ background: "transparent", border: "none", color: primaryColor, fontSize: "11px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
                                        >
                                            Mostrar
                                        </button>
                                    )}
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

                    {/* Nueva Sección de Ubicación */}
                    <div className="chamba-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Ubicación</h4>
                            {isOwner && editingSection !== "ubicacion" && (
                                <button onClick={() => handleEditSection("ubicacion")} style={{ background: "transparent", border: "none", color: primaryColor, cursor: "pointer" }}>
                                    <Edit3 size={14} />
                                </button>
                            )}
                        </div>

                        {editingSection === "ubicacion" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B" }}>Calle</label>
                                        <input className="chamba-input" placeholder="Ej: Bolivar" value={tempData.calle} onChange={e => setTempData({ ...tempData, calle: e.target.value })} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B" }}>Número</label>
                                        <input className="chamba-input" type="number" placeholder="123" value={tempData.numero} onChange={e => setTempData({ ...tempData, numero: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B" }}>Ciudad</label>
                                        <input className="chamba-input" placeholder="Ej: Coronel Pringles" value={tempData.city} onChange={e => setTempData({ ...tempData, city: e.target.value })} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B" }}>Provincia</label>
                                        <input className="chamba-input" placeholder="Ej: Buenos Aires" value={tempData.province} onChange={e => setTempData({ ...tempData, province: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B" }}>País</label>
                                        <input className="chamba-input" value={tempData.pais} onChange={e => setTempData({ ...tempData, pais: e.target.value })} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748B" }}>Cód. Postal</label>
                                        <input className="chamba-input" placeholder="7530" value={tempData.codigoPostal} onChange={e => setTempData({ ...tempData, codigoPostal: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ ...editActionRow, marginTop: "8px" }}>
                                    <button onClick={() => setEditingSection(null)} style={secondaryBtnStyle}>Cancelar</button>
                                    <button
                                        onClick={handleSaveSection}
                                        disabled={isSaving}
                                        style={{
                                            ...primaryBtnSmallStyle,
                                            opacity: isSaving ? 0.7 : 1,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {isSaving ? <RefreshCw size={14} className="spin" /> : null}
                                        {isSaving ? "Validando..." : "Guardar Ubicación"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "12px",
                                        background: primaryColor + "10",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <MapPin size={20} color={primaryColor} />
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#475569", flex: 1 }}>
                                        <div style={{ fontWeight: "700", color: "#0F172A", fontSize: "15px" }}>{data.city}, {data.province}</div>
                                        <div style={{ color: "#94A3B8", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span>
                                                {(isOwner || revealSensitive) ? `${data.calle} ${data.numero}` : "Dirección oculta"}
                                                {data.codigoPostal && (isOwner || revealSensitive) ? `, CP ${data.codigoPostal}` : ""}
                                            </span>
                                            {!isOwner && !revealSensitive && (
                                                <button 
                                                    onClick={handleContactClick}
                                                    style={{ background: "transparent", border: "none", color: primaryColor, fontSize: "11px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
                                                >
                                                    Ver
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: "12px",
                                    background: "#F8FAFC",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    color: "#64748B",
                                    border: "1px solid #F1F5F9"
                                }}>
                                    📍 Esta ubicación se utiliza para mostrarte en las búsquedas por cercanía de los clientes.
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>


            <ReviewModal
                show={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                data={data}
                reviewRating={reviewRating}
                setReviewRating={setReviewRating}
                reviewComment={reviewComment}
                setReviewComment={setReviewComment}
                onSubmit={handleReviewSubmit}
                isSubmitting={isSubmittingReview}
            />
            <FloatingContact />
            <PortfolioLightbox />
            <div style={{ height: "40px" }} />
        </div>
    )


    function FloatingContact() {
        if (isOwner) return null
        return (
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 1000, display: "flex", gap: "12px" }}
            >
                <button
                    onClick={handleContactClick}
                    className="chamba-btn-primary"
                    style={{ width: "auto", padding: "16px 32px", boxShadow: "0 15px 35px " + primaryColor + "40", background: primaryColor, borderRadius: "100px" }}
                >
                    <MessageCircle size={20} /> <span style={{ fontWeight: "800" }}>Contactar ahora</span>
                </button>
            </motion.div>
        )
    }

    function PortfolioLightbox() {
        if (selectedImgIndex === null) return null
        const currentPortfolio = data.portfolio
        const currentImg = currentPortfolio[selectedImgIndex]

        const nextImg = () => setSelectedImgIndex((selectedImgIndex + 1) % currentPortfolio.length)
        const prevImg = () => setSelectedImgIndex((selectedImgIndex - 1 + currentPortfolio.length) % currentPortfolio.length)

        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}
                    onClick={() => setSelectedImgIndex(null)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedImgIndex(null); }}
                        style={{ position: "absolute", top: "32px", right: "32px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "48px", height: "48px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevImg(); }}
                        style={{ position: "absolute", left: "32px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "56px", height: "56px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <motion.div
                        key={selectedImgIndex}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ maxWidth: "100%", maxHeight: "100%", position: "relative" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={currentImg}
                            style={{ maxWidth: "80vw", maxHeight: "80vh", borderRadius: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", objectFit: "contain" }}
                            alt="Portfolio"
                        />
                        <div style={{ position: "absolute", bottom: "-40px", left: 0, right: 0, textAlign: "center", color: "white", fontSize: "14px", fontWeight: "600" }}>
                            {selectedImgIndex + 1} / {currentPortfolio.length}
                        </div>
                    </motion.div>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextImg(); }}
                        style={{ position: "absolute", right: "32px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "56px", height: "56px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
                    >
                        <ChevronRight size={32} />
                    </button>
                </motion.div>
            </AnimatePresence>
        )
    }
}

// --- COMPONENTES AUXILIARES (FUERA PARA EVITAR RE-RENDER/LOST FOCUS) ---

function ReviewModal({ show, onClose, data, reviewRating, setReviewRating, reviewComment, setReviewComment, onSubmit, isSubmitting }) {
    if (!show) return null
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "450px", padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h3 className="chamba-title" style={{ fontSize: "22px", fontWeight: "700", margin: 0 }}>Calificar servicio</h3>
                    <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
                </div>

                <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "24px" }}>¿Cómo fue tu experiencia trabajando con <b>{data.name}</b>?</p>

                <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Tu calificación</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => setReviewRating(star)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                            >
                                <Star
                                    size={32}
                                    fill={star <= reviewRating ? "#F59E0B" : "none"}
                                    color={star <= reviewRating ? "#F59E0B" : "#CBD5E1"}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: "32px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Comentario (Opcional)</label>
                    <textarea
                        className="chamba-input"
                        style={{ minHeight: "120px", resize: "none" }}
                        placeholder="Contanos un poco más sobre el trabajo realizado..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                    />
                </div>

                <button
                    className="chamba-btn-primary"
                    disabled={isSubmitting}
                    onClick={onSubmit}
                    style={{ height: "56px", fontSize: "16px" }}
                >
                    {isSubmitting ? <RefreshCw className="spin" size={20} /> : "Publicar Reseña"}
                </button>
            </motion.div>
        </div>
    )
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
const editActionRow = { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }


// --- FRAMER CONTROLS ---
addPropertyControls(PerfilPublicoProveedorChamba, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    enableDemoMode: { type: ControlType.Boolean, title: "Modo Demo", defaultValue: false },
    isProDemo: { type: ControlType.Boolean, title: "PRO en Demo", defaultValue: true },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#A01EED" },
})
