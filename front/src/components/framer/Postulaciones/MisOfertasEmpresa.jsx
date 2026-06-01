import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { useIdentityStore } from "../PERFILES/LOGICA/UseIdentityStore.tsx"
import PostulacionGestionEmpresa from "./PostulacionGestionEmpresa.tsx"

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function MisOfertasEmpresa(props) {
    const {
        apiUrl = "http://localhost:8080/api/v1",
        primaryColor = "#A01EED",
        enableDemoMode = true,
        gestionarPostulacionesUrl = "/gestionar-postulaciones"
    } = props

    // Active Identity Context from Zustand Store
    const { contextoActivo, cuentaBase, isHydrated, hydrateFromApi } = useIdentityStore()

    // Core States
    const [ofertas, setOfertas] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [filtroTexto, setFiltroTexto] = useState("")
    const [verPostuladosOfertaId, setVerPostuladosOfertaId] = useState(null)

    // Pagination
    const [paginaActual, setPaginaActual] = useState(0)
    const itemsPorPagina = 5

    // Inyectar fuentes y estilos responsivos
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)

        const style = document.createElement("style")
        style.id = "chamba-misofertas-styles"
        style.innerHTML = `
            .chamba-mo-table-row {
                transition: background-color 0.2s ease;
            }
            .chamba-mo-table-row:hover {
                background-color: #F8FAFC;
            }
            .chamba-mo-action-btn {
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
            .chamba-mo-action-btn:hover {
                background-color: ${primaryColor}10;
            }
            .chamba-mo-delete-btn {
                background: transparent;
                border: none;
                color: #EF4444;
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
            .chamba-mo-delete-btn:hover {
                background-color: #FEF2F2;
            }
            .chamba-mo-pag-btn {
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
            .chamba-mo-pag-btn:hover:not(:disabled) {
                background: #F8FAFC;
                color: #0F172A;
            }
            .chamba-mo-pag-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .chamba-mo-input:focus {
                border-color: ${primaryColor} !important;
                outline: none !important;
            }

            /* Responsive rules */
            @media (max-width: 900px) {
                .chamba-mo-layout {
                    flex-direction: column !important;
                    padding: 20px !important;
                }
                .chamba-mo-right-col {
                    width: 100% !important;
                }
            }
            @media (max-width: 600px) {
                .chamba-mo-header-area {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 16px !important;
                }
                .chamba-mo-search-bar {
                    width: 100% !important;
                }
                .chamba-mo-card-container {
                    padding: 16px !important;
                }
                .chamba-mo-table th, .chamba-mo-table td {
                    padding: 12px 8px !important;
                    font-size: 13px !important;
                }
                .chamba-mo-actions-cell {
                    flex-direction: column !important;
                    gap: 4px !important;
                    align-items: center !important;
                }
            }
        `
        document.head.appendChild(style)

        return () => {
            link.remove()
            style.remove()
        }
    }, [primaryColor])

    // Load and populate offers with counts
    const cargarOfertasPropias = async () => {
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

            // 1. Fetch own job offers
            const response = await fetch(`${apiUrl}/ofertas/propias`, { headers })
            if (response.ok) {
                const data = await response.json()
                // 2. Fetch candidates counts in parallel for each offer
                const enriched = await Promise.all((data || []).map(async (oferta) => {
                    try {
                        const applicants = await fetch(`${apiUrl}/postulaciones/oferta/${oferta.id}`, { headers })
                        if (applicants.ok) {
                            const appsList = await applicants.json()
                            return { ...oferta, cantidadPostulantes: appsList?.length || 0 }
                        }
                    } catch (e) {
                        console.warn("Fallo al consultar postulantes de la oferta:", oferta.id, e)
                    }
                    return { ...oferta, cantidadPostulantes: 0 }
                }))

                // Sort by creation date descending
                const sorted = enriched.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
                setOfertas(sorted)
            } else {
                throw new Error(`Error API: ${response.status}`)
            }
        } catch (err) {
            console.warn("Fallo la carga de ofertas desde API. Cargando mocks de demostración...", err.message)
            cargarMocksDemo()
        } finally {
            setLoading(false)
        }
    }

    const cargarMocksDemo = () => {
        const mockList = [
            {
                id: "off-1",
                titulo: "Plomero Gasista Matriculado",
                fechaCreacion: "2026-05-20T14:30:00Z",
                activa: true,
                cantidadPostulantes: 5,
                modalidad: "PRESENCIAL"
            },
            {
                id: "off-2",
                titulo: "Ayudante de Albañil / Peón de Obra",
                fechaCreacion: "2026-05-24T10:15:00Z",
                activa: true,
                cantidadPostulantes: 2,
                modalidad: "PRESENCIAL"
            },
            {
                id: "off-3",
                titulo: "Electricista Industrial Matriculado",
                fechaCreacion: "2026-05-22T09:00:00Z",
                activa: false,
                cantidadPostulantes: 8,
                modalidad: "HIBRIDO"
            },
            {
                id: "off-4",
                titulo: "Instalador de Durlock y Yeso",
                fechaCreacion: "2026-05-25T17:45:00Z",
                activa: true,
                cantidadPostulantes: 0,
                modalidad: "PRESENCIAL"
            }
        ]
        setOfertas(mockList)
    }

    // Auto-hydration
    useEffect(() => {
        if (!isHydrated) {
            hydrateFromApi(apiUrl, supabase)
        }
    }, [isHydrated, apiUrl, hydrateFromApi])

    // Load data upon hydration
    useEffect(() => {
        if (isHydrated) {
            cargarOfertasPropias()
        }
    }, [isHydrated, apiUrl, enableDemoMode])

    // Logically delete (deactivate) an offer
    const handleFinalizarOferta = async (id, titulo) => {
        if (!window.confirm(`¿Estás seguro de que deseas finalizar la oferta "${titulo}"? Ya no estará visible para postulaciones.`)) {
            return
        }

        // Optimistic update
        setOfertas(prev => prev.map(o => o.id === id ? { ...o, activa: false } : o))

        if (enableDemoMode) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token
            const { data: { user } } = await supabase.auth.getUser()

            const headers = {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                "X-User-Id": user?.id || ""
            }

            const response = await fetch(`${apiUrl}/ofertas/${id}`, {
                method: "DELETE",
                headers
            })

            if (!response.ok) {
                throw new Error("No se pudo desactivar en el servidor.")
            }
        } catch (err) {
            console.error("Fallo al desactivar oferta:", err)
            alert("Ocurrió un error al intentar finalizar la oferta en el servidor. Revirtiendo...")
            cargarOfertasPropias()
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

    // Filter and Paginate
    const ofertasFiltradas = ofertas.filter(o =>
        o.titulo.toLowerCase().includes(filtroTexto.toLowerCase())
    )

    const totalPaginas = Math.ceil(ofertasFiltradas.length / itemsPorPagina) || 1
    const ofertasPaginadas = ofertasFiltradas.slice(
        paginaActual * itemsPorPagina,
        (paginaActual + 1) * itemsPorPagina
    )

    // Fallback: Loading profile state
    if (!isHydrated) {
        return (
            <div style={spinnerWrapper}>
                <div style={spinnerCard}>
                    <div style={{ ...spinnerRing, borderTopColor: primaryColor }} />
                    <p style={spinnerText}>Cargando ofertas y perfil...</p>
                </div>
            </div>
        )
    }

    // Security Gate: Redirect Base candidate accounts
    if (contextoActivo?.tipo === 'USUARIO_BASE') {
        return (
            <div style={spinnerWrapper}>
                <div style={spinnerCard}>
                    <div style={iconBoxContainer(primaryColor)}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A", marginBottom: "12px", fontFamily: "Poppins" }}>
                        Módulo de Reclutamiento
                    </h3>
                    <p style={{ fontSize: "14.5px", color: "#64748B", lineHeight: "1.6", marginBottom: "24px", margin: "0 0 24px 0" }}>
                        Estás operando con tu perfil personal. La gestión de ofertas y la revisión de candidatos postulados son exclusivas para perfiles de <strong>Empresa</strong> o <strong>Proveedor</strong>.
                    </p>
                    <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: "1.5", margin: 0 }}>
                        Para publicar ofertas y ver candidatos recibidos, por favor selecciona un perfil comercial o crea uno desde tu perfil público.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ ...containerStyle, background: "transparent", minHeight: "auto" }}>
            <div className="chamba-mo-layout" style={{ ...mainContentLayout, padding: "20px 0" }}>

                {/* OFFERS HISTORIC TABLE (RIGHT) */}
                <main className="chamba-mo-right-col" style={rightMainContainer}>
                    {/* Header info */}
                    <div className="chamba-mo-header-area" style={tableHeaderArea}>
                        <div style={titleBox}>
                            <IconFileText />
                            <h2 style={tableTitle}>Mis Ofertas Creadas</h2>
                        </div>

                        {/* Search input inside header */}
                        <div className="chamba-mo-search-bar" style={searchBarWrapper}>
                            <IconSearch />
                            <input
                                type="text"
                                className="chamba-mo-input"
                                placeholder="Filtrar por puesto..."
                                value={filtroTexto}
                                onChange={(e) => { setFiltroTexto(e.target.value); setPaginaActual(0); }}
                                style={searchFieldStyle}
                            />
                        </div>

                        <span style={{ ...totalPostulationsBadge, background: primaryColor + "10", color: primaryColor }}>
                            {ofertasFiltradas.length} ofertas
                        </span>
                    </div>

                    <div className="chamba-mo-card-container" style={tableCardContainer}>
                        {loading ? (
                            <div style={loadingState}>Cargando ofertas de empleo...</div>
                        ) : error ? (
                            <div style={errorState}>{error}</div>
                        ) : ofertasFiltradas.length === 0 ? (
                            <div style={emptyState}>No se encontraron ofertas creadas.</div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table className="chamba-mo-table" style={tableStyle}>
                                    <thead>
                                        <tr style={tableHeaderRowStyle}>
                                            <th style={{ ...tableHeaderCellStyle, width: "35%" }}>Título del puesto</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "20%" }}>Fecha de creación</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "15%" }}>Modalidad</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "15%" }}>Estado</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "15%", textAlign: "center" }}>Postulantes</th>
                                            <th style={{ ...tableHeaderCellStyle, width: "20%", textAlign: "center" }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ofertasPaginadas.map((o) => {
                                            return (
                                                <tr key={o.id} className="chamba-mo-table-row" style={tableRowStyle}>
                                                    <td style={tableCellStyle}>
                                                        <span style={jobTitleBold}>{o.titulo}</span>
                                                    </td>
                                                    <td style={tableCellStyle}>
                                                        <span style={dateText}>{formatDate(o.fechaCreacion)}</span>
                                                    </td>
                                                    <td style={tableCellStyle}>
                                                        <span style={modalidadText}>{o.modalidad}</span>
                                                    </td>
                                                    <td style={tableCellStyle}>
                                                        {o.activa ? (
                                                            <span style={statusPillStyle("rgba(16, 185, 129, 0.12)", "#10B981")}>
                                                                Activa
                                                            </span>
                                                        ) : (
                                                            <span style={statusPillStyle("#F1F5F9", "#64748B")}>
                                                                Finalizada
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                                                        <span style={{
                                                            fontSize: "13px",
                                                            fontWeight: "700",
                                                            color: o.cantidadPostulantes > 0 ? primaryColor : "#64748B",
                                                            background: o.cantidadPostulantes > 0 ? primaryColor + "12" : "#F1F5F9",
                                                            padding: "4px 10px",
                                                            borderRadius: "12px"
                                                        }}>
                                                            {o.cantidadPostulantes} candidatos
                                                        </span>
                                                    </td>
                                                    <td style={{ ...tableCellStyle, textAlign: "center" }}>
                                                        <div className="chamba-mo-actions-cell" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                            <button
                                                                type="button"
                                                                className="chamba-mo-action-btn"
                                                                onClick={() => {
                                                                    setVerPostuladosOfertaId(o.id)
                                                                }}
                                                                style={{ color: primaryColor }}
                                                            >
                                                                <IconCandidates color={primaryColor} />
                                                                Ver postulados
                                                            </button>
                                                            {o.activa && (
                                                                <button
                                                                    type="button"
                                                                    className="chamba-mo-delete-btn"
                                                                    onClick={() => handleFinalizarOferta(o.id, o.titulo)}
                                                                >
                                                                    ✕ Finalizar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
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
                                className="chamba-mo-pag-btn"
                                disabled={paginaActual === 0}
                                onClick={() => setPaginaActual(prev => Math.max(0, prev - 1))}
                            >
                                Anterior
                            </button>
                            <span style={paginationInfoText}>Página {paginaActual + 1} de {totalPaginas}</span>
                            <button
                                type="button"
                                className="chamba-mo-pag-btn"
                                disabled={paginaActual === totalPaginas - 1}
                                onClick={() => setPaginaActual(prev => Math.min(totalPaginas - 1, prev + 1))}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Gestión de Postulados */}
            <AnimatePresence>
                {verPostuladosOfertaId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={modalOverlayStyle}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            style={modalContentStyle}
                        >
                            {/* Modal Header */}
                            <div style={modalHeaderStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: primaryColor + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <IconCandidates color={primaryColor} />
                                    </div>
                                    <h3 style={modalTitleStyle}>Administración de Candidatos</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setVerPostuladosOfertaId(null)}
                                    style={modalCloseBtnStyle(primaryColor)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#FEF2F2"
                                        e.currentTarget.style.color = "#EF4444"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#F1F5F9"
                                        e.currentTarget.style.color = "#475569"
                                    }}
                                >
                                    ✕ Cerrar
                                </button>
                            </div>

                            {/* Modal Body container rendering the entire PostulacionGestionEmpresa component */}
                            <div style={modalBodyStyle}>
                                <PostulacionGestionEmpresa
                                    apiUrl={apiUrl}
                                    ofertaId={verPostuladosOfertaId}
                                    ofertaContexto={ofertas.find(o => o.id === verPostuladosOfertaId)}
                                    enableDemoMode={enableDemoMode}
                                    primaryColor={primaryColor}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// --- VECTOR ICONS ---

const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const IconCandidates = ({ color }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

// --- STYLES ---

const containerStyle = {
    width: "100%",
    minHeight: "100vh",
    background: "#F8FAFC",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif"
}

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

const rightMainContainer = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px"
}

const tableHeaderArea = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    textAlign: "left"
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

const searchBarWrapper = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "4px 14px",
    width: "240px",
    boxSizing: "border-box",
    boxShadow: "0 2px 8px rgba(0,0,0,0.015)"
}

const searchFieldStyle = {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "13.5px",
    fontWeight: "500",
    color: "#0F172A",
    padding: "6px 0"
}

const totalPostulationsBadge = {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12.5px",
    fontWeight: "700"
}

const tableCardContainer = {
    background: "#FFFFFF",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
    boxSizing: "border-box"
}

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse"
}

const tableHeaderRowStyle = {
    borderBottom: "2px solid #F1F5F9"
}

const tableHeaderCellStyle = {
    padding: "16px 20px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    textAlign: "left"
}

const tableRowStyle = {
    borderBottom: "1px solid #F1F5F9"
}

const tableCellStyle = {
    padding: "20px",
    fontSize: "14px",
    color: "#475569",
    textAlign: "left",
    verticalAlign: "middle"
}

const jobTitleBold = {
    fontSize: "14.5px",
    fontWeight: "700",
    color: "#0F172A"
}

const dateText = {
    fontWeight: "500",
    color: "#64748B"
}

const modalidadText = {
    fontWeight: "600",
    fontSize: "13px",
    color: "#475569",
    background: "#F1F5F9",
    padding: "4px 8px",
    borderRadius: "6px"
}

const statusPillStyle = (bg, fg) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12.5px",
    fontWeight: "700",
    background: bg,
    color: fg
})

const paginationWrapper = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "16px"
}

const paginationInfoText = {
    fontSize: "13.5px",
    fontWeight: "600",
    color: "#64748B"
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


// Loading and gateway fallbacks
const spinnerWrapper = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "450px",
    padding: "40px 24px",
    fontFamily: "Inter, sans-serif"
}

const spinnerCard = {
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
}

const spinnerRing = {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(160, 30, 237, 0.12)",
    borderRadius: "50%",
    animation: "chamba-spin 1s linear infinite",
    marginBottom: "16px"
}

const spinnerText = {
    fontSize: "14.5px",
    color: "#64748B",
    fontWeight: "600",
    margin: 0
}

const iconBoxContainer = (color) => ({
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: color + "15",
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px auto"
})

const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "24px",
    boxSizing: "border-box"
}

const modalContentStyle = {
    background: "#FFFFFF",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "1280px",
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
    border: "1px solid #E2E8F0"
}

const modalHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid #E2E8F0",
    background: "#FFFFFF"
}

const modalTitleStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0
}

const modalCloseBtnStyle = (color) => ({
    background: "#F1F5F9",
    color: "#475569",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px"
})

const modalBodyStyle = {
    flex: 1,
    overflow: "hidden",
    background: "#F8FAFC",
    padding: "0"
}

addPropertyControls(MisOfertasEmpresa, {
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
        title: "Modo Demostración",
        defaultValue: true,
    },
    gestionarPostulacionesUrl: {
        type: ControlType.String,
        title: "URL Gestión Postulaciones",
        defaultValue: "/gestionar-postulaciones",
    }
})
