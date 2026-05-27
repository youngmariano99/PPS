import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { useIdentityStore } from "../PERFILES/LOGICA/UseIdentityStore.tsx"

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function MisPostulacionesProveedor(props) {
    const { 
        apiUrl = "http://localhost:8080/api/v1", 
        primaryColor = "#A01EED",
        enableDemoMode = true
    } = props

    // Active Identity Context
    const { contextoActivo, cuentaBase, isHydrated, hydrateFromApi } = useIdentityStore()

    // Core States
    const [postulaciones, setPostulaciones] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    
    // Pagination States (Frontend-side chunking of the flat response list, scalable for backend)
    const [paginaActual, setPaginaActual] = useState(0)
    const itemsPorPagina = 5

    // Expanded postulation row for showing feedback/details
    const [expandedPostulacionId, setExpandedPostulacionId] = useState(null)

    // Load Fonts & Inject Dynamic CSS
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)

        const style = document.createElement("style")
        style.id = "chamba-postulaciones-styles"
        style.innerHTML = `
            .chamba-nav-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 18px;
                border-radius: 12px;
                color: #64748B;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                background: transparent;
                border: none;
                width: 100%;
                text-align: left;
            }
            .chamba-nav-item:hover {
                color: #0F172A;
                background: #F1F5F9;
            }
            .chamba-nav-item.active {
                color: ${primaryColor} !important;
                background: ${primaryColor}10 !important;
            }
            .chamba-table-row {
                transition: background-color 0.2s ease;
            }
            .chamba-table-row:hover {
                background-color: #F8FAFC;
            }
            .chamba-action-btn {
                background: transparent;
                border: none;
                color: ${primaryColor};
                font-size: 13.5px;
                font-weight: 700;
                cursor: pointer;
                padding: 6px 12px;
                border-radius: 8px;
                transition: background-color 0.15s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .chamba-action-btn:hover {
                background-color: ${primaryColor}10;
            }
            .chamba-pag-btn {
                background: #FFFFFF;
                color: #475569;
                border: 1px solid #E2E8F0;
                padding: 8px 14px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .chamba-pag-btn:hover:not(:disabled) {
                background: #F8FAFC;
                color: #0F172A;
                border-color: #CBD5E1;
            }
            .chamba-pag-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `
        document.head.appendChild(style)

        return () => {
            link.remove()
            style.remove()
        }
    }, [primaryColor])

    // Load user applications
    const cargarPostulaciones = async () => {
        if (enableDemoMode) {
            cargarMocksDemo()
            return
        }

        setLoading(true)
        setError(null)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error("No hay usuario autenticado. Activando modo demo...")
            }

            const headers = {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                "X-User-Id": user.id
            }

            // Call Spring Boot endpoint
            const response = await fetch(`${apiUrl}/postulaciones/me`, { headers })
            if (response.ok) {
                const data = await response.json()
                // Sort by date descending
                const sorted = (data || []).sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
                setPostulaciones(sorted)
            } else {
                throw new Error(`Error API: ${response.status}`)
            }
        } catch (err) {
            console.warn("Fallo la carga de postulaciones desde API. Cargando mocks de demostración...", err.message)
            cargarMocksDemo()
        } finally {
            setLoading(false)
        }
    }

    const cargarMocksDemo = () => {
        // Mock data matching the details from mockup images, specifically including rejection reasons
        const mockList = [
            {
                id: "post-1",
                ofertaId: "off-1",
                ofertaTitulo: "Analista de Datos",
                empresaRazonSocial: "Data Insights",
                fechaCreacion: "2026-05-20T14:30:00Z",
                estado: "DESCARTADO",
                motivoRechazoCodigo: "FALTA_EXPERIENCIA",
                feedbackAdicional: "Te sugerimos ganar experiencia en soldadura antes de postularte.",
                mensajePresentacion: "Tengo fuertes bases en análisis estadístico y visualización de datos con Python y SQL, pero me gustaría mucho aprender sobre procesos industriales.",
                cvUrlAdjunto: "https://drive.google.com/file/d/chamba-cv-mock-1/view"
            },
            {
                id: "post-2",
                ofertaId: "off-2",
                ofertaTitulo: "Desarrollador Frontend React",
                empresaRazonSocial: "TechNova Solutions",
                fechaCreacion: "2026-05-24T10:15:00Z",
                estado: "EN_REVISION",
                motivoRechazoCodigo: null,
                feedbackAdicional: null,
                mensajePresentacion: "Hola, me interesa mucho la vacante de Frontend. Tengo 2 años de experiencia desarrollando con React.js y Tailwind CSS.",
                cvUrlAdjunto: null
            },
            {
                id: "post-3",
                ofertaId: "off-3",
                ofertaTitulo: "Diseñador/a UX UI",
                empresaRazonSocial: "DesignGroup",
                fechaCreacion: "2026-05-22T09:00:00Z",
                estado: "CONTACTADO",
                motivoRechazoCodigo: null,
                feedbackAdicional: null,
                mensajePresentacion: "¡Buenas! Soy diseñador UX UI enfocado en plataformas web y móviles. Les adjunto mi portafolio digital actualizado.",
                cvUrlAdjunto: "https://drive.google.com/file/d/chamba-cv-mock-3/view"
            },
            {
                id: "post-4",
                ofertaId: "off-4",
                ofertaTitulo: "Especialista en Marketing Digital",
                empresaRazonSocial: "Brandify",
                fechaCreacion: "2026-05-25T17:45:00Z",
                estado: "ENVIADO",
                motivoRechazoCodigo: null,
                feedbackAdicional: null,
                mensajePresentacion: "Especialista en Growth Marketing y optimización de pauta publicitaria en Meta/Google Ads. Dispuesto a sumarme de inmediato.",
                cvUrlAdjunto: "https://drive.google.com/file/d/chamba-cv-mock-4/view"
            }
        ]
        setPostulaciones(mockList)
    }

    useEffect(() => {
        cargarPostulaciones()
    }, [apiUrl, enableDemoMode])

    // Auto-hydration if store is not hydrated yet
    useEffect(() => {
        if (!isHydrated) {
            hydrateFromApi(apiUrl, supabase)
        }
    }, [isHydrated, apiUrl, hydrateFromApi])

    // Hydration loading fallback
    if (!isHydrated) {
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: "450px", 
                padding: "40px 24px",
                fontFamily: "Inter, sans-serif"
            }}>
                <div style={{
                    background: "white",
                    borderRadius: "24px",
                    border: "1px solid #E2E8F0",
                    padding: "40px",
                    maxWidth: "500px",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        border: `3px solid ${primaryColor}20`,
                        borderTop: `3px solid ${primaryColor}`,
                        borderRadius: "50%",
                        animation: "chamba-spin 1s linear infinite",
                        marginBottom: "16px"
                    }} />
                    <style>{`
                        @keyframes chamba-spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                    <p style={{ fontSize: "14.5px", color: "#64748B", fontWeight: "600", margin: 0 }}>
                        Cargando postulaciones y perfil...
                    </p>
                </div>
            </div>
        )
    }

    // Toggle row expansion
    const toggleExpand = (id) => {
        if (expandedPostulacionId === id) {
            setExpandedPostulacionId(null)
        } else {
            setExpandedPostulacionId(id)
        }
    }

    // Helper: Map rejection code to Spanish friendly description
    const mapRejectionReason = (code) => {
        switch (code) {
            case "FALTA_EXPERIENCIA":
                return "Falta de experiencia"
            case "EXPECTATIVA_SALARIAL_ALTA":
                return "Pretensión salarial superior al presupuesto"
            case "PERFIL_TECNICO_INSUFICIENTE":
                return "Perfil técnico no se ajusta a los requerimientos"
            case "INCOMPATIBILIDAD_HORARIA":
                return "Falta de disponibilidad horaria requerida"
            case "OTRO":
                return "Otros motivos de descarte"
            default:
                return "Requisitos no cumplidos"
        }
    }

    // Helper: Format Date
    const formatDate = (dateStr) => {
        if (!dateStr) return "-"
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        } catch (e) {
            return dateStr
        }
    }

    // Helper: State styling for pills
    const getStatusStyle = (status) => {
        switch (status) {
            case "EN_REVISION":
            case "VISTO":
                return {
                    background: `${primaryColor}15`,
                    color: primaryColor,
                    label: "En revisión"
                }
            case "CONTACTADO":
                return {
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#10B981",
                    label: "Contactado"
                }
            case "DESCARTADO":
            case "RECHAZADO":
                return {
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#EF4444",
                    label: "Descartado"
                }
            case "ENVIADO":
            default:
                return {
                    background: "rgba(59, 130, 246, 0.12)",
                    color: "#3B82F6",
                    label: "Postulado"
                }
        }
    }

    // Pagination slice
    const totalPaginas = Math.ceil(postulaciones.length / itemsPorPagina) || 1
    const postulacionesPaginadas = postulaciones.slice(
        paginaActual * itemsPorPagina,
        (paginaActual + 1) * itemsPorPagina
    )

    // User name formatting
    const getCandidatoNombre = () => {
        if (cuentaBase?.nombre) {
            return `${cuentaBase.nombre} ${cuentaBase.apellido || ""}`
        }
        if (contextoActivo?.nombreContexto) {
            return contextoActivo.nombreContexto
        }
        return "Mariano López"
    }

    // Calculate profile completion progress dynamically
    const calcularProgresoPerfil = () => {
        if (!cuentaBase) return 30 // fallback
        let score = 0
        if (cuentaBase.nombre) score += 20
        if (cuentaBase.apellido) score += 20
        if (cuentaBase.email) score += 20
        if (cuentaBase.telefono) score += 20
        if (cuentaBase.isPremium) score += 10
        if (contextoActivo?.fotoUrl) score += 10
        return Math.min(100, Math.max(30, score))
    }

    const perfilProgreso = calcularProgresoPerfil()

    if (contextoActivo?.tipo === 'EMPRESA') {
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: "450px", 
                padding: "40px 24px",
                fontFamily: "Inter, sans-serif"
            }}>
                <div style={{
                    background: "white",
                    borderRadius: "24px",
                    border: "1px solid #E2E8F0",
                    padding: "40px",
                    maxWidth: "500px",
                    textAlign: "center",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
                }}>
                    <div style={{ 
                        width: "64px", 
                        height: "64px", 
                        borderRadius: "50%", 
                        background: `${primaryColor}15`, 
                        color: primaryColor, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        margin: "0 auto 24px auto" 
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A", marginBottom: "12px" }}>
                        Módulo de Candidato
                    </h3>
                    <p style={{ fontSize: "14.5px", color: "#64748B", lineHeight: "1.6", marginBottom: "24px" }}>
                        Estás operando con tu perfil de <strong>Empresa</strong>. Las postulaciones de empleo son exclusivas para perfiles de <strong>Proveedor</strong> o <strong>Candidato</strong>.
                    </p>
                    <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: "1.5", margin: 0 }}>
                        Para postularte a búsquedas laborales o ver tu historial de postulaciones, por favor cambia tu rol desde el selector en el menú superior.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ ...containerStyle, background: "transparent", minHeight: "auto" }}>
            {/* Split layout */}
            <div style={{ ...mainContentLayout, padding: "20px 0" }}>
                {/* APPLICATIONS HISTORIC TABLE (RIGHT) */}
                <main style={rightMainContainer}>
                    {/* Dynamic Profile Progress Card as a Top Banner */}
                    <div style={progressBannerStyle}>
                        <div style={{ flex: "1 1 300px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <IconTrendingUp color={primaryColor} />
                                <span style={{ fontSize: "14.5px", fontWeight: "700", color: "#0F172A" }}>Mejorá tus oportunidades</span>
                            </div>
                            <p style={{ fontSize: "12.5px", color: "#64748B", margin: 0, lineHeight: "1.4" }}>
                                Completa tu perfil para aumentar tus probabilidades de contratación.
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 200px" }}>
                            <div style={{ flex: 1, height: "8px", borderRadius: "4px", background: "#F1F5F9", overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: "4px", background: primaryColor, width: `${perfilProgreso}%`, transition: "width 0.4s ease-out" }} />
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: primaryColor }}>{perfilProgreso}%</span>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => window.location.href = "/perfil"}
                            style={editProfileBtnHorizontal(primaryColor)}
                        >
                            Completar perfil →
                        </button>
                    </div>

                    <div style={tableHeaderArea}>
                        <div style={titleBox}>
                            <IconFileText />
                            <h2 style={tableTitle}>Mis Postulaciones</h2>
                        </div>
                        <span style={totalPostulationsBadge}>{postulaciones.length} en total</span>
                    </div>

                    <div style={tableCardContainer}>
                        {loading ? (
                            <div style={loadingState}>Buscando tu historial de postulaciones...</div>
                        ) : error ? (
                            <div style={errorState}>{error}</div>
                        ) : postulaciones.length === 0 ? (
                            <div style={emptyState}>Aún no te has postulado a ninguna oferta de empleo.</div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr style={tableHeaderRowStyle}>
                                            <th style={{ ...tableHeaderCellStyle, width: "35%" }}>Oferta de empleo</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "25%" }}>Empresa</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "15%" }}>Fecha de envío</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "15%" }}>Estado</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "10%", textAlign: "center" }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {postulacionesPaginadas.map((p) => {
                                            const status = getStatusStyle(p.estado)
                                            const isExpanded = expandedPostulacionId === p.id
                                            return (
                                                <React.Fragment key={p.id}>
                                                    <tr className="chamba-table-row" style={tableRowStyle}>
                                                        <td style={tableCellStyle}>
                                                            <div style={jobTitleWrapper}>
                                                                <span style={jobTitleBold}>{p.ofertaTitulo}</span>
                                                                {p.cvUrlAdjunto && (
                                                                    <span style={cvIndicator} title="CV Adjunto">
                                                                        PDF
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={tableCellStyle}>
                                                            <span style={companyText}>{p.empresaRazonSocial || "Empresa Reclutadora"}</span>
                                                        </td>
                                                        <td style={tableCellStyle}>
                                                            <span style={dateText}>{formatDate(p.fechaCreacion)}</span>
                                                        </td>
                                                        <td style={tableCellStyle}>
                                                            <span style={statusPillStyle(status.background, status.color)}>
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...tableCellStyle, textAlign: "center" }}>
                                                            <button 
                                                                type="button" 
                                                                className="chamba-action-btn"
                                                                onClick={() => toggleExpand(p.id)}
                                                            >
                                                                <span>{isExpanded ? "Ocultar" : "Ver detalles"}</span>
                                                                <IconChevron isDown={!isExpanded} color={primaryColor} />
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded Row Panel (Framer Motion details list) */}
                                                    <AnimatePresence initial={false}>
                                                        {isExpanded && (
                                                            <tr>
                                                                <td colSpan="5" style={expandedTdStyle}>
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: "auto" }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        style={{ overflow: "hidden" }}
                                                                    >
                                                                        <div style={expandedContentWrapper}>
                                                                            {/* Message block */}
                                                                            <div style={detailsBlockStyle}>
                                                                                <span style={detailsBlockTitle}>Mensaje de presentación enviado:</span>
                                                                                <p style={detailsBlockText}>
                                                                                    {p.mensajePresentacion || "No se adjuntó un mensaje de presentación."}
                                                                                </p>
                                                                            </div>

                                                                            {/* Rejection alert block */}
                                                                            {p.estado === "DESCARTADO" && (
                                                                                <div style={rejectionCardStyle}>
                                                                                    <div style={rejectionHeaderRow}>
                                                                                        <IconAlertCircle />
                                                                                        <span style={rejectionCardTitle}>Postulación Descartada</span>
                                                                                    </div>
                                                                                    <div style={rejectionBodyContent}>
                                                                                        <div style={rejectionDetailItem}>
                                                                                            <span style={rejectionLabel}>Motivo principal:</span>
                                                                                            <span style={rejectionValue}>{mapRejectionReason(p.motivoRechazoCodigo)}</span>
                                                                                        </div>
                                                                                        {p.feedbackAdicional && (
                                                                                            <div style={rejectionDetailItem}>
                                                                                                <span style={rejectionLabel}>Feedback de la empresa:</span>
                                                                                                <p style={rejectionFeedbackText}>"{p.feedbackAdicional}"</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* General Info block */}
                                                                            <div style={detailsFooterMetaRow}>
                                                                                <span style={footerMetaItem}>
                                                                                    <strong>Identificación Postulación:</strong> {p.id}
                                                                                </span>
                                                                                {p.cvUrlAdjunto && (
                                                                                    <span style={footerMetaItem}>
                                                                                        <strong>CV enviado:</strong> <a href={p.cvUrlAdjunto} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, textDecoration: "underline" }}>Ver archivo de currículum ↗</a>
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </AnimatePresence>
                                                </React.Fragment>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPaginas > 1 && (
                        <div style={paginationWrapper}>
                            <button 
                                type="button" 
                                className="chamba-pag-btn" 
                                disabled={paginaActual === 0}
                                onClick={() => setPaginaActual(prev => Math.max(0, prev - 1))}
                            >
                                ← Anterior
                            </button>
                            <span style={pageIndicatorText}>
                                Página <strong>{paginaActual + 1}</strong> de <strong>{totalPaginas}</strong>
                            </span>
                            <button 
                                type="button" 
                                className="chamba-pag-btn" 
                                disabled={paginaActual === totalPaginas - 1}
                                onClick={() => setPaginaActual(prev => Math.min(totalPaginas - 1, prev + 1))}
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

// --- VECTOR ICONS & LOGO ---

const LogoChamba = () => (
    <svg width="120" height="30" viewBox="0 0 150 40" fill="none">
        <path d="M20 10C15 10 10 15 10 20S15 30 20 30S30 25 30 20S25 10 20 10ZM20 25C17.2 25 15 22.8 15 20S17.2 15 20 15S25 17.2 25 20S22.8 25 20 25Z" fill="#A01EED" />
        <text x="35" y="28" fontFamily="Poppins" fontWeight="700" fontSize="24" fill="#000000">chamba</text>
    </svg>
)

const IconExplore = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
)

const IconBriefcaseSmall = ({ color }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
)

const IconBookmark = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
)

const IconMessage = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
)

const IconTrendingUp = ({ color }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
)

const IconFileText = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
)

const IconAlertCircle = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

const IconChevron = ({ isDown, color }) => (
    <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ 
            transform: isDown ? "rotate(0deg)" : "rotate(180deg)", 
            transition: "transform 0.2s ease" 
        }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

// --- STYLES ---

const containerStyle = {
    width: "100%",
    minHeight: "100vh",
    background: "#F8FAFC",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif"
}

const navbarStyle = {
    height: "72px",
    background: "#FFFFFF",
    borderBottom: "1px solid #F1F5F9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    boxSizing: "border-box",
    zIndex: 100
}

const navLeft = {
    display: "flex",
    alignItems: "center",
    gap: "24px"
}

const navTagline = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#475569",
    letterSpacing: "0.5px"
}

const navRight = {
    display: "flex",
    alignItems: "center",
    gap: "32px"
}

const navLink = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    padding: "24px 0",
    boxSizing: "border-box"
}

const bellIconStyle = {
    position: "relative",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#F1F5F9"
}

const badgeCount = {
    position: "absolute",
    top: "0px",
    right: "0px",
    background: "#EF4444",
    color: "white",
    fontSize: "9px",
    fontWeight: "700",
    borderRadius: "50%",
    width: "14px",
    height: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const avatarStyle = (color) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: color,
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
})

const mainContentLayout = {
    display: "flex",
    padding: "40px",
    gap: "32px",
    flex: 1,
    boxSizing: "border-box",
    maxWidth: "1440px",
    width: "100%",
    margin: "0 auto"
}

const sidebarStyle = {
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    flexShrink: 0
}

const menuContainer = {
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "16px",
    border: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
}

const progressCardStyle = {
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid #E2E8F0",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
}

const progressCardHeader = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
}

const progressCardTitle = {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0F172A"
}

const progressCardDescription = {
    fontSize: "12.5px",
    color: "#64748B",
    lineHeight: "1.4",
    margin: 0
}

const progressWrapper = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "8px"
}

const progressBarTrack = {
    flex: 1,
    height: "8px",
    borderRadius: "4px",
    background: "#F1F5F9",
    overflow: "hidden"
}

const progressBarFill = {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.4s ease-out"
}

const progressPercentLabel = {
    fontSize: "12px",
    fontWeight: "700"
}

const editProfileBtn = {
    background: "transparent",
    border: "1px solid",
    borderRadius: "10px",
    padding: "10px 0",
    width: "100%",
    fontSize: "12.5px",
    fontWeight: "700",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
    marginTop: "4px"
}

const rightMainContainer = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minWidth: 0 // Prevent table overflows
}

const tableHeaderArea = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
}

const titleBox = {
    display: "flex",
    alignItems: "center",
    gap: "12px"
}

const tableTitle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "22px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0
}

const totalPostulationsBadge = {
    background: "#F1F5F9",
    color: "#475569",
    fontSize: "12.5px",
    fontWeight: "600",
    padding: "6px 12px",
    borderRadius: "20px"
}

const tableCardContainer = {
    background: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
    overflow: "hidden"
}

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
}

const tableHeaderRowStyle = {
    borderBottom: "1px solid #E2E8F0",
    background: "#FAFBFD"
}

const tableHeaderCellStyle = {
    padding: "18px 24px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
}

const tableRowStyle = {
    borderBottom: "1px solid #F1F5F9"
}

const tableCellStyle = {
    padding: "18px 24px",
    verticalAlign: "middle"
}

const jobTitleWrapper = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
}

const jobTitleBold = {
    fontSize: "14.5px",
    fontWeight: "700",
    color: "#0F172A"
}

const cvIndicator = {
    background: "#EEF2F6",
    color: "#475569",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase"
}

const companyText = {
    fontSize: "14px",
    color: "#475569",
    fontWeight: "500"
}

const dateText = {
    fontSize: "13.5px",
    color: "#64748B",
    fontWeight: "500"
}

const statusPillStyle = (bg, fg) => ({
    background: bg,
    color: fg,
    fontSize: "12px",
    fontWeight: "700",
    padding: "6px 12px",
    borderRadius: "20px",
    display: "inline-block",
    textAlign: "center",
    whiteSpace: "nowrap"
})

const expandedTdStyle = {
    padding: 0,
    background: "#F8FAFC"
}

const expandedContentWrapper = {
    padding: "24px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    borderBottom: "1px solid #E2E8F0"
}

const detailsBlockStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    textAlign: "left"
}

const detailsBlockTitle = {
    fontSize: "12.5px",
    fontWeight: "700",
    color: "#475569"
}

const detailsBlockText = {
    fontSize: "13.5px",
    color: "#334155",
    lineHeight: "1.5",
    margin: 0,
    background: "#FFFFFF",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0"
}

const rejectionCardStyle = {
    background: "#FEF2F2",
    border: "1px solid #FCA5A5",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "left"
}

const rejectionHeaderRow = {
    display: "flex",
    alignItems: "center",
    gap: "8px"
}

const rejectionCardTitle = {
    fontSize: "14.5px",
    fontWeight: "700",
    color: "#991B1B"
}

const rejectionBodyContent = {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
}

const rejectionDetailItem = {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
}

const rejectionLabel = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#7F1D1D"
}

const rejectionValue = {
    fontSize: "13.5px",
    fontWeight: "600",
    color: "#B91C1C"
}

const rejectionFeedbackText = {
    fontSize: "13.5px",
    fontStyle: "italic",
    color: "#B91C1C",
    margin: 0,
    lineHeight: "1.4"
}

const detailsFooterMetaRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    color: "#94A3B8",
    marginTop: "4px"
}

const footerMetaItem = {
    fontWeight: "500"
}

const paginationWrapper = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "18px",
    marginTop: "16px"
}

const pageIndicatorText = {
    fontSize: "13.5px",
    color: "#475569"
}

const loadingState = {
    padding: "48px 0",
    fontSize: "14.5px",
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center"
}

const errorState = {
    padding: "48px 24px",
    fontSize: "14.5px",
    color: "#EF4444",
    fontWeight: "600",
    textAlign: "center"
}

const emptyState = {
    padding: "48px 24px",
    fontSize: "14.5px",
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center"
}

const progressBannerStyle = {
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "20px 28px",
    border: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px",
    flexWrap: "wrap",
    textAlign: "left",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
}

const editProfileBtnHorizontal = (color) => ({
    background: "transparent",
    border: `1px solid ${color}`,
    color: color,
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "12.5px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap"
})

addPropertyControls(MisPostulacionesProveedor, {
    apiUrl: {
        type: ControlType.String,
        title: "API Base URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Principal",
        defaultValue: "#A01EED",
    },
    enableDemoMode: {
        type: ControlType.Boolean,
        title: "Modo Demo",
        defaultValue: true,
    }
})
