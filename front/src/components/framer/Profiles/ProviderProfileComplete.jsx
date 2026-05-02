import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { 
    User, Mail, Phone, MapPin, 
    Star, Shield, Camera,
    Maximize, RefreshCw, Zap,
    Award, Hash, Landmark, Edit3, Save, X,
    Instagram, Facebook, Linkedin, ExternalLink
} from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * PANTALLA DE PERFIL DE PROVEEDOR PPS - V10 (UI MATURA & EDICIÓN)
 * -------------------------------------------------------------
 * - Diseño Minimalista/Maduro (Tipografía Inter Display equilibrada).
 * - Sistema de Edición en tiempo real (Instagram, LinkedIn, Bio, Tel).
 * - Botones refinados y micro-interacciones.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function ProviderProfileComplete(props) {
    const { 
        apiUrl, enableDemoMode, primaryColor 
    } = props

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
        handleResize() // Set initial value safely after mount
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // --- STYLES (PURE INTER MATURE UI) ---
    const fS = {
        page: { width: "100%", minHeight: "100vh", backgroundColor: "#fdfdfd", color: "#1e293b", fontFamily: "Inter, sans-serif" },
        content: { width: "100%", maxWidth: "1120px", margin: "0 auto", padding: "0 24px" },
        grid: { 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "340px 1fr", 
            gap: isMobile ? "30px" : "40px", 
            marginTop: "40px",
            alignItems: "start"
        },
        stickyCol: { 
            display: "flex", 
            flexDirection: "column", 
            gap: "40px", 
            position: isMobile ? "static" : "sticky", 
            top: "120px", 
            height: "fit-content"
        },
        scrollCol: { display: "flex", flexDirection: "column", gap: "40px" },
        section: { width: "100%" },
        label: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px" },
        card: { padding: "28px", backgroundColor: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
        desc: { fontSize: "16px", lineHeight: "1.7", color: "#475569", margin: 0 },
        cRow: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", fontSize: "15px", color: "#334155" },
        link: { color: "#334155", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" },
        input: { width: "100%", padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none" },
        inputArea: { width: "100%", minHeight: "120px", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", fontSize: "15px", fontFamily: "Inter", resize: "none", backgroundColor: "#f8fafc" },
        pGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" },
        pImg: { aspectRatio: "4/3", borderRadius: "20px", backgroundSize: "cover", backgroundColor: "#f1f5f9", position: "relative", overflow: "hidden", cursor: "pointer" },
        pImgOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", opacity: 0, transition: "opacity 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", color: "white" },
        loader: { width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
        errorContainer: { width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" },
        empty: { padding: "60px 40px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "24px", border: "2px dashed #e2e8f0", color: "#94a3b8", fontSize: "14px", display: "flex", flexDirection: "column", alignItems: "center" },
        mainBtn: { height: "38px", padding: "0 22px", borderRadius: "10px", border: "none", color: "white", fontWeight: "700", cursor: "pointer", fontFamily: "Inter", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }
    }

    const hS = {
        container: { 
            padding: isMobile ? "40px 0 30px 0" : "60px 0 40px 0", 
            borderBottom: "1px solid #f1f5f9", 
            backgroundColor: "white",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        },
        flex: { display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "24px", marginBottom: "32px" },
        left: { display: "flex", alignItems: "center", gap: "32px" },
        avatar: { width: "100px", height: "100px", borderRadius: "32px", backgroundSize: "cover", position: "relative", backgroundColor: "#f8fafc", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" },
        avatarOverlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", borderRadius: "32px" },
        info: { display: "flex", flexDirection: "column", gap: "4px" },
        nameRow: { display: "flex", alignItems: "center", gap: "12px" },
        name: { fontSize: "36px", fontWeight: "700", letterSpacing: "-1.5px", margin: 0, fontFamily: "Inter Display, sans-serif" },
        proTag: { fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" },
        cat: { fontSize: "16px", fontWeight: "600" },
        bioSection: { marginTop: "12px", borderTop: "1px solid #f8fafc", paddingTop: "24px" },
        bioText: { fontSize: "16px", lineHeight: "1.6", color: "#475569", maxWidth: "800px", margin: 0 },
        actions: { display: "flex", alignItems: "center" },
        btnEdit: { 
            height: "38px",
            padding: "0 18px", 
            borderRadius: "10px", 
            border: "1px solid #e2e8f0", 
            backgroundColor: "white", 
            color: "#475569", 
            fontWeight: "600", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            cursor: "pointer", 
            fontSize: "13px",
            fontFamily: "Inter"
        },
        btnSave: { 
            height: "38px",
            padding: "0 20px", 
            borderRadius: "10px", 
            border: "none", 
            color: "white", 
            fontWeight: "700", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            cursor: "pointer", 
            fontSize: "13px", 
            fontFamily: "Inter",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)" 
        },
        btnCancel: { 
            height: "38px",
            padding: "0 12px", 
            borderRadius: "10px", 
            border: "1px solid #fee2e2", 
            backgroundColor: "#fef2f2", 
            color: "#ef4444", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }
    }

    const discoverAndFetch = async () => {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams(window.location.search)
        const externalId = params.get("id")
        
        const { data: { user } } = await supabase.auth.getUser()
        
        // El ID que vamos a buscar: Prioridad el de la URL, sino el del usuario logueado
        const targetId = externalId || (user ? user.id : null)

        if (targetId) {
            try {
                // Si es su propio perfil (o no hay user logueado pero coincide el ID), habilitamos edición
                setIsOwner(user && user.id === targetId)

                const { data: { session } } = await supabase.auth.getSession()
                const headers = { "X-User-Id": targetId }
                if (session) headers["Authorization"] = `Bearer ${session.access_token}`

                const response = await fetch(`${apiUrl}/directorio/proveedor/${targetId}`, { headers })
                
                if (response.ok) {
                    const res = await response.json()
                    const mapped = {
                        id: res.id, name: res.nombrePublico, category: res.rubro,
                        description: res.descripcion, location: res.ciudad ? `${res.ciudad}, ${res.provincia}` : "",
                        address: res.direccion || "", city: res.ciudad || "", province: res.provincia || "",
                        rating: res.promedioEstrellas || 0, isPro: res.esPremium,
                        avatar: res.fotoPerfilUrl, portfolio: res.fotosPortafolio || [],
                        phone: res.telefono || "", email: res.email || (user && user.id === targetId ? user.email : ""),
                        matricula: res.matricula || "",
                        instagram: res.instagramUrl || "", facebook: res.facebookUrl || "", linkedin: res.linkedinUrl || ""
                    }
                    setData(mapped)
                    setEditForm(mapped)
                } else if (response.status === 404) {
                    setError("Perfil no encontrado.")
                } else {
                    setError("Error al cargar el perfil.")
                }
            } catch (err) { setError("Error de conexión.") }
        } else if (enableDemoMode) {
             const demo = { name: "Juan Perez", category: "Gasista", description: "Exp. 10 años", location: "Mendoza", rating: 4.8, isPro: true, phone: "261445566", email: "demo@pps.com", matricula: "123", portfolio: [] }
             setData(demo); setEditForm(demo); setIsOwner(true)
        } else {
            setError("No se especificó un perfil.")
        }
        setLoading(false)
    }

    useEffect(() => { discoverAndFetch() }, [apiUrl, enableDemoMode])

    const handleSave = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()
        
        try {
            // 1. Actualizar Datos Profesionales
            await fetch(`${apiUrl}/perfil/proveedor/me`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`, 
                    "X-User-Id": user.id 
                },
                body: JSON.stringify({
                    descripcion: editForm.description,
                    matricula: editForm.matricula,
                    fotoPerfilUrl: editForm.avatar,
                    calle: editForm.address.split(" ")[0] || "",
                    numero: parseInt(editForm.address.split(" ")[1]) || 0,
                    ciudad: editForm.city,
                    provincia: editForm.province,
                    pais: "Argentina", 
                    instagramUrl: editForm.instagram,
                    facebookUrl: editForm.facebook,
                    linkedinUrl: editForm.linkedin
                })
            })

            // 2. Actualizar Teléfono en Usuario Base
            await fetch(`${apiUrl}/perfil/usuario/me`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`, 
                    "X-User-Id": user.id 
                },
                body: JSON.stringify({ telefono: editForm.phone })
            })

            await discoverAndFetch()
            setIsEditing(false)
        } catch (e) { console.error(e) }
        setSaving(false)
    }

    if (loading) return <div style={fS.loader}><RefreshCw size={32} color={primaryColor} className="spin" /></div>

    if (error || !data) {
        return (
            <div style={fS.errorContainer}>
                <Shield size={64} color="#e2e8f0" />
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginTop: "20px" }}>{error || "Cargando perfil..."}</h2>
                <button 
                   onClick={() => window.location.href = "https://overly-mindset-259417.framer.app/login"}
                   style={{ ...fS.mainBtn, backgroundColor: primaryColor, marginTop: "20px" }}
                >
                    Volver al Inicio
                </button>
            </div>
        )
    }

    return (
        <div style={fS.page}>
            {/* Header Area */}
            <div style={hS.container}>
                <div style={fS.content}>
                    <div style={hS.flex}>
                        <div style={hS.left}>
                            <div style={{ 
                                ...hS.avatar, 
                                backgroundImage: data && data.avatar ? `url(${data.avatar})` : "none" 
                            }}>
                                {(!data || !data.avatar) && <User size={40} color="#94a3b8" />}
                                {isEditing && <div style={hS.avatarOverlay}><Camera size={20} /></div>}
                            </div>
                            <div style={hS.info}>
                                <div style={hS.nameRow}>
                                    <h1 style={hS.name}>{data.name}</h1>
                                    {data.isPro && <span style={{...hS.proTag, color: primaryColor}}><Award size={14} /> PRO</span>}
                                </div>
                                <p style={{...hS.cat, color: primaryColor}}>{data.category}</p>
                            </div>
                        </div>
                        <div style={{ ...hS.actions, gap: "12px" }}>
                             {isOwner && (
                                  !isEditing ? (
                                    <>
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }} 
                                            onClick={() => {
                                                const url = `${window.location.origin}/perfiles/proveedor/${data.id}?review=true`
                                                navigator.clipboard.writeText(url)
                                                alert("¡Link para reseñas copiado al portapapeles!")
                                            }} 
                                            style={{ ...hS.btnEdit, color: "#3B6790", borderColor: "#3B6790" }}
                                        >
                                            <Landmark size={16} /> <span>Copiar Link para Reseñas</span>
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setIsEditing(true)} style={hS.btnEdit}>
                                            <Edit3 size={16} /> <span>Editar Perfil</span>
                                        </motion.button>
                                    </>
                                  ) : (
                                     <div style={{ display: "flex", gap: "10px" }}>
                                         <button onClick={() => setIsEditing(false)} style={hS.btnCancel} disabled={saving}><X size={16} /></button>
                                         <button onClick={handleSave} style={{...hS.btnSave, backgroundColor: primaryColor}} disabled={saving}>
                                             {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />} <span>Guardar</span>
                                         </button>
                                     </div>
                                  )
                             )}
                        </div>
                    </div>

                    {/* Resumen Profesional movido al Top */}
                    <div style={hS.bioSection}>
                        <h4 style={fS.label}>Resumen Profesional</h4>
                        {isEditing ? (
                            <textarea 
                                style={fS.inputArea} 
                                value={editForm.description} 
                                onChange={e => setEditForm({...editForm, description: e.target.value})}
                                placeholder="Escribe tu resumen profesional aquí..."
                            />
                        ) : (
                            <p style={hS.bioText}>{data.description || "Sin descripción profesional cargada."}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={fS.content}>
                <div style={fS.grid}>
                    {/* Left Column: Contact & Networks (Sticky) */}
                    <aside style={fS.stickyCol}>
                        <section style={fS.section}>
                            <h4 style={fS.label}>Información de Contacto</h4>
                            <div style={fS.card}>
                                <div style={fS.cRow}>
                                    <Phone size={18} color={primaryColor} />
                                    {isEditing ? <input style={fS.input} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /> : <span>{data.phone}</span>}
                                </div>
                                <div style={fS.cRow}><Mail size={18} color={primaryColor} /> <span>{data.email}</span></div>
                                <div style={fS.cRow}>
                                    <Landmark size={18} color={primaryColor} />
                                    {isEditing ? <input style={fS.input} placeholder="Dirección" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} /> : <span>{data.address}</span>}
                                </div>
                                <div style={fS.cRow}>
                                    <Hash size={18} color={primaryColor} />
                                    {isEditing ? <input style={fS.input} placeholder="Matrícula" value={editForm.matricula} onChange={e => setEditForm({...editForm, matricula: e.target.value})} /> : <span>M.P {data.matricula || "No registrada"}</span>}
                                </div>
                            </div>
                        </section>

                        <section style={fS.section}>
                            <h4 style={fS.label}>Redes Sociales</h4>
                            <div style={fS.card}>
                                <div style={fS.cRow}>
                                    <Instagram size={18} color="#e1306c" />
                                    {isEditing ? <input style={fS.input} placeholder="Instagram URL" value={editForm.instagram} onChange={e => setEditForm({...editForm, instagram: e.target.value})} /> : (data.instagram ? <a href={data.instagram} target="_blank" style={fS.link}>Instagram <ExternalLink size={12}/></a> : <span>No vinculado</span>)}
                                </div>
                                <div style={fS.cRow}>
                                    <Linkedin size={18} color="#0077b5" />
                                    {isEditing ? <input style={fS.input} placeholder="LinkedIn URL" value={editForm.linkedin} onChange={e => setEditForm({...editForm, linkedin: e.target.value})} /> : (data.linkedin ? <a href={data.linkedin} target="_blank" style={fS.link}>LinkedIn <ExternalLink size={12}/></a> : <span>No vinculado</span>)}
                                </div>
                                <div style={fS.cRow}>
                                    <Facebook size={18} color="#1877f2" />
                                    {isEditing ? <input style={fS.input} placeholder="Facebook URL" value={editForm.facebook} onChange={e => setEditForm({...editForm, facebook: e.target.value})} /> : (data.facebook ? <a href={data.facebook} target="_blank" style={fS.link}>Facebook <ExternalLink size={12}/></a> : <span>No vinculado</span>)}
                                </div>
                            </div>
                        </section>
                    </aside>

                    {/* Right Column: Portfolio (Scrollable) */}
                    <div style={fS.scrollCol}>
                        <section style={fS.section}>
                            <h4 style={fS.label}>Portfolio de Trabajos</h4>
                            {data.portfolio.length === 0 ? (
                                <div style={fS.empty}>
                                    <Camera size={32} color="#cbd5e1" style={{ marginBottom: "12px" }} />
                                    <p>No hay trabajos cargados en el portfolio aún.</p>
                                </div>
                            ) : (
                                <div style={fS.pGrid}>
                                    {data.portfolio.map((img, i) => (
                                        <div key={i} style={{...fS.pImg, backgroundImage: `url(${img})`}}>
                                            <div style={fS.pImgOverlay}><Maximize size={16} /></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <div style={{ height: "60px" }} />
        </div>
    )
}




addPropertyControls(ProviderProfileComplete, {
    apiUrl: { type: ControlType.String, title: "Backend URL", defaultValue: "https://pps-sk7p.onrender.com/api/v1" },
    enableDemoMode: { type: ControlType.Boolean, title: "Modo Demo", defaultValue: false },
    primaryColor: { type: ControlType.Color, title: "Color PPS", defaultValue: "#7c3aed" }
})
