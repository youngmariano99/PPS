import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * 🟣 CHAMBA — PANEL DE GESTIÓN DE POSTULACIONES (VISTA DE RECLUTADOR)
 * -------------------------------------------------------------
 * Adaptado 1:1 según el mockup visual provisto.
 * Incluye visualización de Knockout Questions, currículum nativo, visor de PDF
 * e integración asíncrona de transiciones de estado (VISTO, EN_REVISION, CONTACTADO, DESCARTADO).
 */

export default function PostulacionGestionEmpresa(props) {
    const { apiUrl, defaultOfertaId, enableDemoMode, primaryColor } = props

    // Función base para realizar peticiones autenticadas al backend Spring Boot.
    const fetchConAuth = async (endpoint, options = {}) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const { data: { user } } = await supabase.auth.getUser();

      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(user && { 'X-User-Id': user.id }),
        ...options.headers,
      };

      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
      }

      return response.json();
    }

    // Cargar Fuentes Google Poppins e Inter
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)
    }, [])

    // Estados Core
    const [candidatos, setCandidatos] = useState([])
    const [cargando, setCargando] = useState(false)
    const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [filtroCompatibilidad, setFiltroCompatibilidad] = useState("Todos") // Todos, Compatibles, Incompatibles
    
    // Estados de Modals
    const [mostrarModalDescarte, setMostrarModalDescarte] = useState(false)
    const [mostrarModalPdf, setMostrarModalPdf] = useState(false)
    
    // Formulario de Descarte (Anti-Soft Rejection)
    const [motivoRechazo, setMotivoRechazo] = useState("")
    const [feedbackAdicional, setFeedbackAdicional] = useState("")
    const [enviandoDescarte, setEnviandoDescarte] = useState(false)
    
    // Oferta info mock/dinámica
    const [ofertaInfo, setOfertaInfo] = useState({
        titulo: "Plomero Gasista Matriculado",
        ubicacion: "San Telmo, CABA",
        modalidad: "Presencial",
        salario: "$350k - $450k"
    })

    // --- MOCK DATA FALLBACK (1:1 con Mockup de la IA) ---
    const mockCandidatos = useMemo(() => [
        {
            id: "1",
            candidatoNombreCompleto: "Juan Carlos Pérez",
            candidatoEmail: "juan.perez@gmail.com",
            titularProfesional: "Plomero Gasista Matriculado y Climatización",
            sobreMi: "Especializado en instalaciones de gas por termofusión, detección de fugas y planos de habilitación. Busco laburos estables o de obra limpia.",
            cvUrlAdjunto: "https://drive.google.com/file/d/1BXI8Dd5H1F5fj_t1V9fJ-XWz7m6.png/preview",
            estado: "VISTO",
            esExcluido: false,
            telefono: "+54 9 11 4455-6677",
            respuestas: [
                { id: "r1", preguntaEnunciado: "¿Tenés matrícula de gasista de 1ra categoría activa?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r2", preguntaEnunciado: "¿Disponés de herramientas de termofusión propias?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r3", preguntaEnunciado: "¿Residís en CABA o primer cordón de GBA?", respuestaDada: "SI", respuestaEsperada: "SI" }
            ],
            experienciaLaboral: [
                { puesto: "Plomero Oficial", empresa: "Constructora Sudamericana", periodo: "2021 - Presente", descripcion: "Instalación completa de cañerías de gas y agua en edificios de 10 pisos." },
                { puesto: "Plomero Gasista Autónomo", empresa: "Servicios Particulares", periodo: "2018 - 2021", descripcion: "Habilitación de firmas y planos para Metrogas." }
            ],
            habilidades: ["Termofusión", "Instalaciones de Gas", "Planos de Habilitación", "Metrogas", "Soldadura de Cobre"],
            educacion: [
                { titulo: "Gasista Matriculado de Primera", institucion: "Instituto Tecnológico Argentino", periodo: "2017" }
            ]
        },
        {
            id: "2",
            candidatoNombreCompleto: "Mateo Rodríguez",
            candidatoEmail: "mateo.rodriguez@hotmail.com",
            titularProfesional: "Ayudante de Plomería General",
            sobreMi: "Ayudante con experiencia práctica en tendido de cañerías y reparaciones hogareñas básicas de agua.",
            cvUrlAdjunto: "https://drive.google.com/file/d/1BXI8Dd5H1F5fj_t2V9fJ-XWz7m6.png/preview",
            estado: "ENVIADO",
            esExcluido: true,
            telefono: "+54 9 11 9988-7766",
            respuestas: [
                { id: "r4", preguntaEnunciado: "¿Tenés matrícula de gasista de 1ra categoría activa?", respuestaDada: "NO", respuestaEsperada: "SI" },
                { id: "r5", preguntaEnunciado: "¿Disponés de herramientas de termofusión propias?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r6", preguntaEnunciado: "¿Residís en CABA o primer cordón de GBA?", respuestaDada: "SI", respuestaEsperada: "SI" }
            ],
            experienciaLaboral: [
                { puesto: "Ayudante de Plomería", empresa: "Instalaciones San Miguel", periodo: "2023 - Presente", descripcion: "Colaboración en zanjeo y tendido de tuberías pluviales y cloacales." }
            ],
            habilidades: ["Plomería básica", "Tendido de Cañerías", "Detección de fugas"],
            educacion: [
                { titulo: "Secundario Completo técnico", institucion: "E.E.T N° 1", periodo: "2022" }
            ]
        },
        {
            id: "3",
            candidatoNombreCompleto: "Lucas Gómez",
            candidatoEmail: "lucas.gomez@yahoo.com",
            titularProfesional: "Plomero Instalador",
            sobreMi: "Plomero con amplia experiencia en sanitarios, griferías de alta gama y reparaciones cloacales.",
            cvUrlAdjunto: "https://drive.google.com/file/d/1BXI8Dd5H1F5fj_t3V9fJ-XWz7m6.png/preview",
            estado: "VISTO",
            esExcluido: false,
            telefono: "+54 9 11 3344-5566",
            respuestas: [
                { id: "r7", preguntaEnunciado: "¿Tenés matrícula de gasista de 1ra categoría activa?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r8", preguntaEnunciado: "¿Disponés de herramientas de termofusión propias?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r9", preguntaEnunciado: "¿Residís en CABA o primer cordón de GBA?", respuestaDada: "SI", respuestaEsperada: "SI" }
            ],
            experienciaLaboral: [
                { puesto: "Oficial Sanitartista", empresa: "Mantenimientos Express", periodo: "2019 - Presente", descripcion: "Mantenimiento preventivo y correctivo en oficinas y hotelería." }
            ],
            habilidades: ["Sanitarios", "Griferías", "Termofusión", "Agua caliente"],
            educacion: [
                { titulo: "Curso de Plomería Avanzado", institucion: "UOCRA", periodo: "2018" }
            ]
        },
        {
            id: "4",
            candidatoNombreCompleto: "Andrés Fernández",
            candidatoEmail: "andres.fer@gmail.com",
            titularProfesional: "Plomero Gasista",
            sobreMi: "Especialista en gas y plomería domiciliaria, con experiencia en urgencias y reparaciones rápidas.",
            cvUrlAdjunto: "https://drive.google.com/file/d/1BXI8Dd5H1F5fj_t4V9fJ-XWz7m6.png/preview",
            estado: "ENVIADO",
            esExcluido: true,
            telefono: "+54 9 11 5566-7788",
            respuestas: [
                { id: "r10", preguntaEnunciado: "¿Tenés matrícula de gasista de 1ra categoría activa?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r11", preguntaEnunciado: "¿Disponés de herramientas de termofusión propias?", respuestaDada: "NO", respuestaEsperada: "SI" },
                { id: "r12", preguntaEnunciado: "¿Residís en CABA o primer cordón de GBA?", respuestaDada: "SI", respuestaEsperada: "SI" }
            ],
            experienciaLaboral: [
                { puesto: "Plomero Gasista", empresa: "Urgencias YA", periodo: "2020 - 2024", descripcion: "Atención de reclamos por fugas de gas y filtraciones de agua." }
            ],
            habilidades: ["Urgencias domiciliarias", "Caños de Cobre", "Termofusión"],
            educacion: [
                { titulo: "Gasista Matriculado de Segunda", institucion: "Centro de Formación Profesional 2", periodo: "2019" }
            ]
        },
        {
            id: "5",
            candidatoNombreCompleto: "Diego Suárez",
            candidatoEmail: "diego.suarez@outlook.com",
            titularProfesional: "Gasista Matriculado",
            sobreMi: "Especialista matriculado con amplia trayectoria en tendido de redes de gas natural residenciales.",
            cvUrlAdjunto: "https://drive.google.com/file/d/1BXI8Dd5H1F5fj_t5V9fJ-XWz7m6.png/preview",
            estado: "ENVIADO",
            esExcluido: false,
            telefono: "+54 9 11 7766-5544",
            respuestas: [
                { id: "r13", preguntaEnunciado: "¿Tenés matrícula de gasista de 1ra categoría activa?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r14", preguntaEnunciado: "¿Disponés de herramientas de termofusión propias?", respuestaDada: "SI", respuestaEsperada: "SI" },
                { id: "r15", preguntaEnunciado: "¿Residís en CABA o primer cordón de GBA?", respuestaDada: "SI", respuestaEsperada: "SI" }
            ],
            experienciaLaboral: [
                { puesto: "Oficial Gasista", empresa: "Redes e Infraestructuras", periodo: "2022 - Presente", descripcion: "Conexión de redes troncales a consorcios de vivienda." }
            ],
            habilidades: ["Instalación industrial", "Termofusión", "Planos de Gas"],
            educacion: [
                { titulo: "Matriculado de Gasista", institucion: "Metrogas Formación", periodo: "2021" }
            ]
        }
    ], [])

    // --- ACCESO A DATOS (FETCH/DEMO) ---
    const cargarPostulaciones = async () => {
        if (enableDemoMode || !defaultOfertaId || defaultOfertaId === "00000000-0000-0000-0000-000000000000") {
            setCandidatos(mockCandidatos)
            setCandidatoSeleccionado(mockCandidatos[0])
            return
        }

        setCargando(true)
        try {
            // 1. Obtener postulantes de la oferta
            const data = await fetchConAuth(`/postulaciones/oferta/${defaultOfertaId}`)
            if (data && data.length > 0) {
                // Mapeo dinámico para inflar currículum nativo y detalles que vienen del candidato
                const candidatosInflatos = await Promise.all(data.map(async (post) => {
                    try {
                        // Cargar currículum nativo del candidato
                        const cvData = await fetchConAuth(`/curriculums/candidato/${post.candidatoId}`).catch(() => null)
                        return {
                            ...post,
                            titularProfesional: cvData?.titularProfesional || "Postulante",
                            sobreMi: cvData?.sobreMi || "Sin descripción provista.",
                            experienciaLaboral: cvData?.experienciaLaboral || [],
                            habilidades: cvData?.habilidades || [],
                            educacion: cvData?.educacion || [],
                            telefono: "+54 9 11 1234-5678" // Default telefónico si no está expuesto
                        }
                    } catch (e) {
                        return post
                    }
                }))

                setCandidatos(candidatosInflatos)
                setCandidatoSeleccionado(candidatosInflatos[0])
            } else {
                setCandidatos([])
                setCandidatoSeleccionado(null)
            }

            // 2. Obtener metadatos de la oferta para el encabezado
            const oferta = await fetchConAuth(`/ofertas/${defaultOfertaId}`).catch(() => null)
            if (oferta) {
                setOfertaInfo({
                    titulo: oferta.titulo,
                    ubicacion: oferta.ciudad ? `${oferta.ciudad}, ${oferta.provincia || "Argentina"}` : "Ubicación no especificada",
                    modalidad: oferta.modalidad,
                    salario: oferta.salarioMin ? `$${(oferta.salarioMin / 1000).toFixed(0)}k - $${(oferta.salarioMax / 1000).toFixed(0)}k` : "A convenir"
                })
            }
        } catch (err) {
            console.error("Error al cargar postulaciones del servidor:", err)
            setCandidatos(mockCandidatos)
            setCandidatoSeleccionado(mockCandidatos[0])
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarPostulaciones()
    }, [defaultOfertaId, enableDemoMode])

    // --- TRANSICIONES DE ESTADO ---
    
    // Al seleccionar candidato, si está en 'ENVIADO', cambia a 'VISTO' en el backend
    const seleccionarCandidato = async (candidato) => {
        setCandidatoSeleccionado(candidato)

        if (candidato.estado === "ENVIADO") {
            // Actualización local para UX inmediata
            actualizarEstadoLocal(candidato.id, "VISTO")

            if (!enableDemoMode && defaultOfertaId !== "00000000-0000-0000-0000-000000000000") {
                try {
                    // El GET de detalle ejecuta la transición implícita a VISTO en el backend
                    await fetchConAuth(`/postulaciones/${candidato.id}`)
                } catch (e) {
                    console.error("Error al marcar como VISTO en el servidor:", e)
                }
            }
        }
    }

    // Actualiza el estado de forma local
    const actualizarEstadoLocal = (id, nuevoEstado, motivo = null, feedback = null) => {
        setCandidatos(prev => prev.map(c => {
            if (c.id === id) {
                const updated = { ...c, estado: nuevoEstado }
                if (motivo) updated.motivoRechazoCodigo = motivo
                if (feedback) updated.feedbackAdicional = feedback
                
                // Si el seleccionado actualmente es este, actualizar el detalle
                if (candidatoSeleccionado && candidatoSeleccionado.id === id) {
                    setCandidatoSeleccionado(updated)
                }
                return updated
            }
            return c
        }))
    }

    // Mueve la postulación a EN_REVISION
    const moverARevision = async () => {
        if (!candidatoSeleccionado) return

        actualizarEstadoLocal(candidatoSeleccionado.id, "EN_REVISION")

        if (!enableDemoMode && defaultOfertaId !== "00000000-0000-0000-0000-000000000000") {
            try {
                await fetchConAuth(`/postulaciones/${candidatoSeleccionado.id}/estado?nuevoEstado=EN_REVISION`, {
                    method: "PUT"
                })
            } catch (err) {
                console.error("Error al mover a revisión en el servidor:", err)
            }
        }
    }

    // Abre chat de WhatsApp y cambia a CONTACTADO
    const contactarPorWhatsApp = async () => {
        if (!candidatoSeleccionado) return

        actualizarEstadoLocal(candidatoSeleccionado.id, "CONTACTADO")

        // Abrir link de WhatsApp
        const msg = encodeURIComponent(`Hola ${candidatoSeleccionado.candidatoNombreCompleto.split(" ")[0]}, te contacto desde Chamba por tu postulación a la búsqueda de "${ofertaInfo.titulo}".`)
        const cleanPhone = candidatoSeleccionado.telefono.replace(/\D/g, "")
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank")

        if (!enableDemoMode && defaultOfertaId !== "00000000-0000-0000-0000-000000000000") {
            try {
                await fetchConAuth(`/postulaciones/${candidatoSeleccionado.id}/estado?nuevoEstado=CONTACTADO`, {
                    method: "PUT"
                })
            } catch (err) {
                console.error("Error al marcar como contactado en el servidor:", err)
            }
        }
    }

    // Confirma el descarte de la postulación (Anti-Soft Rejection)
    const confirmarDescarte = async () => {
        if (!candidatoSeleccionado || !motivoRechazo) return

        setEnviandoDescarte(true)
        try {
            // Actualización local
            actualizarEstadoLocal(candidatoSeleccionado.id, "DESCARTADO", motivoRechazo, feedbackAdicional)
            setMostrarModalDescarte(false)

            if (!enableDemoMode && defaultOfertaId !== "00000000-0000-0000-0000-000000000000") {
                await fetchConAuth(`/postulaciones/${candidatoSeleccionado.id}/descartar`, {
                    method: "POST",
                    body: JSON.stringify({
                        motivoRechazoCodigo: motivoRechazo,
                        feedbackAdicional: feedbackAdicional
                    })
                })
            }
            
            // Limpiar formulario
            setMotivoRechazo("")
            setFeedbackAdicional("")
        } catch (err) {
            console.error("Error al descartar candidato:", err)
            alert(err.message || "Error al procesar el descarte.")
        } finally {
            setEnviandoDescarte(false)
        }
    }

    // --- FILTROS Y BÚSQUEDA ---
    const candidatosFiltrados = useMemo(() => {
        return candidatos.filter(c => {
            // Búsqueda por texto
            const matchesBusqueda = c.candidatoNombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
                c.titularProfesional.toLowerCase().includes(busqueda.toLowerCase())
            
            // Filtro por compatibilidad
            if (filtroCompatibilidad === "Compatibles") {
                return matchesBusqueda && !c.esExcluido
            } else if (filtroCompatibilidad === "Incompatibles") {
                return matchesBusqueda && c.esExcluido
            }
            return matchesBusqueda
        })
    }, [candidatos, busqueda, filtroCompatibilidad])

    // Métricas del Header
    const metricas = useMemo(() => {
        const total = candidatos.length
        const aptos = candidatos.filter(c => !c.esExcluido).length
        const excluidos = candidatos.filter(c => c.esExcluido).length
        return { total, aptos, excluidos }
    }, [candidatos])

    return (
        <div style={containerStyle}>
            
            {/* 1. HEADER SECTOR */}
            <div style={headerStyle}>
                <div style={headerLeft}>
                    {/* Logo Chamba */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={logoIconStyle(primaryColor)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
                        </div>
                        <span style={logoTextStyle}>chamba</span>
                    </div>

                    {/* Título de la búsqueda y datos */}
                    <div style={{ marginLeft: "32px" }}>
                        <h1 style={titleStyle}>Postulaciones: {ofertaInfo.titulo}</h1>
                        <p style={subtitleStyle}>
                            Ubicación: {ofertaInfo.ubicacion} • Modalidad: {ofertaInfo.modalidad} • Salario: {ofertaInfo.salario}
                        </p>
                    </div>
                </div>

                {/* Métricas e Info */}
                <div style={headerRight}>
                    <div style={metricsWrapper}>
                        <div style={metricCard}>
                            <IconUsers />
                            <div style={{ textAlign: "left" }}>
                                <div style={metricNumber}>{metricas.total}</div>
                                <div style={metricLabel}>postulados</div>
                            </div>
                        </div>
                        
                        <div style={{ ...metricCard, background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                            <IconCheckGreen />
                            <div style={{ textAlign: "left" }}>
                                <div style={{ ...metricNumber, color: "#10B981" }}>{metricas.aptos}</div>
                                <div style={{ ...metricLabel, color: "#10B981" }}>Aptos</div>
                            </div>
                        </div>

                        <div style={{ ...metricCard, background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                            <IconExcluidoOrange />
                            <div style={{ textAlign: "left" }}>
                                <div style={{ ...metricNumber, color: "#F59E0B" }}>{metricas.excluidos}</div>
                                <div style={{ ...metricLabel, color: "#F59E0B" }}>Excluidos</div>
                            </div>
                        </div>
                    </div>

                    <button 
                        style={btnExportar}
                        onClick={() => alert("Función para exportar a CSV/PDF.")}
                    >
                        <IconDownload />
                        Exportar lista
                    </button>
                </div>
            </div>

            {/* 2. BODY GRID */}
            <div style={mainGridStyle}>
                
                {/* COLUMNA IZQUIERDA: LISTA Y FILTROS */}
                <div style={leftColStyle}>
                    
                    {/* Búsqueda */}
                    <div style={searchWrapper}>
                        <IconSearch />
                        <input 
                            placeholder="Buscar candidatos..."
                            style={searchInputStyle}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Filtros Chips */}
                    <div style={chipsWrapper}>
                        <button 
                            style={{ ...chipBtnStyle, background: filtroCompatibilidad === "Todos" ? primaryColor : "#FFFFFF", color: filtroCompatibilidad === "Todos" ? "#FFFFFF" : "#475569" }}
                            onClick={() => setFiltroCompatibilidad("Todos")}
                        >
                            Todos
                        </button>
                        <button 
                            style={{ ...chipBtnStyle, background: filtroCompatibilidad === "Compatibles" ? "#10B981" : "#FFFFFF", color: filtroCompatibilidad === "Compatibles" ? "#FFFFFF" : "#475569" }}
                            onClick={() => setFiltroCompatibilidad("Compatibles")}
                        >
                            Compatibles
                        </button>
                        <button 
                            style={{ ...chipBtnStyle, background: filtroCompatibilidad === "Incompatibles" ? "#F59E0B" : "#FFFFFF", color: filtroCompatibilidad === "Incompatibles" ? "#FFFFFF" : "#475569" }}
                            onClick={() => setFiltroCompatibilidad("Incompatibles")}
                        >
                            Incompatibles
                        </button>
                    </div>

                    {/* Lista Vertical */}
                    <div style={listScrollWrapper}>
                        {cargando ? (
                            <div style={loadingStateStyle}>Cargando candidatos...</div>
                        ) : candidatosFiltrados.length === 0 ? (
                            <div style={emptyStateListStyle}>No se encontraron candidatos.</div>
                        ) : (
                            candidatosFiltrados.map((cand) => {
                                const selected = candidatoSeleccionado && candidatoSeleccionado.id === cand.id
                                return (
                                    <div 
                                        key={cand.id}
                                        style={{ 
                                            ...candidateCardStyle, 
                                            borderColor: selected ? primaryColor : "#E2E8F0",
                                            boxShadow: selected ? `0 4px 20px ${primaryColor}15` : "none"
                                        }}
                                        onClick={() => seleccionarCandidato(cand)}
                                    >
                                        {/* Avatar */}
                                        <div style={cardAvatarStyle(cand.esExcluido ? "#FEF3C7" : "#F3E8FF", cand.esExcluido ? "#D97706" : primaryColor)}>
                                            {cand.candidatoNombreCompleto.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                        </div>

                                        {/* Detalles */}
                                        <div style={{ flex: 1, textAlign: "left" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <h4 style={cardNameStyle}>{cand.candidatoNombreCompleto}</h4>
                                                <span style={stateBadgeStyle(cand.estado)}>{cand.estado}</span>
                                            </div>
                                            <p style={cardTitularStyle}>{cand.titularProfesional}</p>
                                            
                                            {/* Tag de exclusión */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                                                {cand.esExcluido ? (
                                                    <span style={excluidoPillStyle}>
                                                        <IconCloseSmall /> Excluido (Preguntas Filtro)
                                                    </span>
                                                ) : (
                                                    <span style={compatiblePillStyle}>
                                                        <IconCheckSmall /> Apto para el puesto
                                                    </span>
                                                )}
                                                <span style={cardTimeStyle}>Hace 2 horas</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: DETALLE COMPLETO */}
                <div style={rightColStyle}>
                    {candidatoSeleccionado ? (
                        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                            
                            {/* Panel Scrolleable del Currículum */}
                            <div style={detailsScrollWrapper}>
                                
                                {/* 1. Encabezado del Perfil */}
                                <div style={profileHeaderStyle}>
                                    <div style={profileAvatarStyle(primaryColor)}>
                                        {candidatoSeleccionado.candidatoNombreCompleto.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, textAlign: "left" }}>
                                        <h2 style={profileNameStyle}>{candidatoSeleccionado.candidatoNombreCompleto}</h2>
                                        <p style={profileTitularStyle}>{candidatoSeleccionado.titularProfesional}</p>
                                        <div style={actionButtonsRow}>
                                            <button 
                                                style={{ ...btnPrimaryStyle, background: "#25D366" }}
                                                onClick={contactarPorWhatsApp}
                                            >
                                                <IconWhatsApp /> Contactar por WhatsApp
                                            </button>
                                            
                                            {candidatoSeleccionado.cvUrlAdjunto && (
                                                <button 
                                                    style={btnOutlineStyle}
                                                    onClick={() => setMostrarModalPdf(true)}
                                                >
                                                    <IconPdf /> Ver CV Adjunto (PDF)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <hr style={dividerStyle} />

                                {/* 2. Respuestas a Preguntas de Filtro */}
                                <div style={sectionBoxStyle}>
                                    <h3 style={sectionTitleStyle}>Respuestas de Filtro (Knockout Questions)</h3>
                                    <div style={questionsListStyle}>
                                        {candidatoSeleccionado.respuestas && candidatoSeleccionado.respuestas.map((resp, index) => {
                                            // Averiguar si esta respuesta en particular falló el knockout
                                            // En mock data viene mapeado directo. En data real comparamos
                                            const incorrecta = candidatoSeleccionado.esExcluido && resp.respuestaDada !== "SI"
                                            
                                            return (
                                                <div 
                                                    key={resp.id || index}
                                                    style={{ 
                                                        ...questionItemStyle, 
                                                        background: incorrecta ? "rgba(245, 158, 11, 0.03)" : "rgba(16, 185, 129, 0.02)",
                                                        borderColor: incorrecta ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.1)"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", textAlign: "left", flex: 1 }}>
                                                        {incorrecta ? <IconExcluidoOrange /> : <IconCheckGreen />}
                                                        <div>
                                                            <div style={questionEnunciadoStyle}>{resp.preguntaEnunciado}</div>
                                                            <div style={questionAnswerDetailsStyle}>
                                                                Dada: <strong style={{ color: incorrecta ? "#D97706" : "#059669" }}>{resp.respuestaDada}</strong> 
                                                                {resp.respuestaEsperada && ` (Esperado: ${resp.respuestaEsperada})`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <hr style={dividerStyle} />

                                {/* 3. Currículum Nativo */}
                                <div style={sectionBoxStyle}>
                                    <h3 style={sectionTitleStyle}>Currículum Nativo de Chamba</h3>
                                    
                                    {/* Sobre Mí */}
                                    <div style={{ textAlign: "left", marginBottom: "24px" }}>
                                        <div style={subTitleLabelStyle}>Sobre mí</div>
                                        <p style={sobreMiTextStyle}>{candidatoSeleccionado.sobreMi}</p>
                                    </div>

                                    {/* Experiencia Laboral */}
                                    <div style={{ textAlign: "left", marginBottom: "24px" }}>
                                        <div style={subTitleLabelStyle}>Experiencia laboral</div>
                                        {candidatoSeleccionado.experienciaLaboral && candidatoSeleccionado.experienciaLaboral.length > 0 ? (
                                            <div style={timelineWrapperStyle}>
                                                {candidatoSeleccionado.experienciaLaboral.map((exp, idx) => (
                                                    <div key={idx} style={timelineItemStyle}>
                                                        <div style={timelineDotStyle(primaryColor)} />
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                            <strong style={timelineJobTitleStyle}>{exp.puesto}</strong>
                                                            <span style={timelinePeriodStyle}>{exp.periodo}</span>
                                                        </div>
                                                        <div style={timelineCompanyStyle}>{exp.empresa}</div>
                                                        <p style={timelineDescStyle}>{exp.descripcion}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={emptySectionTextStyle}>Sin experiencia laboral registrada.</p>
                                        )}
                                    </div>

                                    {/* Habilidades */}
                                    <div style={{ textAlign: "left" }}>
                                        <div style={subTitleLabelStyle}>Habilidades</div>
                                        <div style={skillsGridStyle}>
                                            {candidatoSeleccionado.habilidades && candidatoSeleccionado.habilidades.length > 0 ? (
                                                candidatoSeleccionado.habilidades.map((skill, idx) => (
                                                    <span key={idx} style={skillPillStyle}>{skill}</span>
                                                ))
                                            ) : (
                                                <span style={emptySectionTextStyle}>Sin habilidades registradas.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Mostrar motivo de rechazo si está descartado */}
                                {candidatoSeleccionado.estado === "DESCARTADO" && (
                                    <div style={rejectFeedbackBoxStyle}>
                                        <h4 style={{ margin: "0 0 8px 0", color: "#B91C1C", fontSize: "14px", fontWeight: "700" }}>Postulante Descartado</h4>
                                        <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#7F1D1D" }}>
                                            <strong>Motivo:</strong> {candidatoSeleccionado.motivoRechazoCodigo}
                                        </p>
                                        {candidatoSeleccionado.feedbackAdicional && (
                                            <p style={{ margin: 0, fontSize: "12px", color: "#991B1B", fontStyle: "italic" }}>
                                                " {candidatoSeleccionado.feedbackAdicional} "
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 4. Pie de Página del Detalle (Acciones de Cambio de Estado) */}
                            <div style={actionFooterStyle}>
                                <div style={footerStatusLabelStyle}>
                                    Estado actual de la postulación: <strong style={{ color: primaryColor }}>{candidatoSeleccionado.estado}</strong>
                                </div>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    {candidatoSeleccionado.estado !== "DESCARTADO" && (
                                        <>
                                            {candidatoSeleccionado.estado !== "EN_REVISION" && (
                                                <button 
                                                    style={{ ...btnOutlineStyle, borderColor: primaryColor, color: primaryColor }}
                                                    onClick={moverARevision}
                                                >
                                                    Mover a En Revisión
                                                </button>
                                            )}
                                            <button 
                                                style={btnRejectStyle}
                                                onClick={() => setMostrarModalDescarte(true)}
                                            >
                                                Descartar Candidato
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={emptyDetailStateStyle}>
                            <IconClickCard />
                            <h3>Seleccioná un candidato</h3>
                            <p>Elegí una postulación de la lista izquierda para visualizar su currículum nativo, respuestas de filtro y gestionar su estado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL OVERLAY: DESCARTAR CANDIDATO (ANTI-SOFT REJECTION) --- */}
            <AnimatePresence>
                {mostrarModalDescarte && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                        >
                            {/* Header modal */}
                            <div style={modalHeaderStyle}>
                                <h3 style={modalTitleStyle}>Descartar a {candidatoSeleccionado?.candidatoNombreCompleto}</h3>
                                <button style={modalCloseBtnStyle} onClick={() => setMostrarModalDescarte(false)}>✕</button>
                            </div>

                            {/* Alerta de Transparencia */}
                            <div style={warningBoxStyle}>
                                <IconWarning />
                                <div style={{ fontSize: "12px", color: "#92400E", textAlign: "left", lineHeight: "1.4" }}>
                                    <strong>Chamba promueve la transparencia.</strong> Para evitar el agujero negro laboral, debés ingresar un motivo válido de descarte. El candidato recibirá una notificación automática con este motivo.
                                </div>
                            </div>

                            {/* Dropdown Motivo */}
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>Motivo de descarte <span style={{ color: "#EF4444" }}>*</span></label>
                                <select 
                                    style={formSelectStyle}
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                >
                                    <option value="">Seleccioná un motivo...</option>
                                    <option value="EXPECTATIVA_SALARIAL">Expectativa salarial superior al presupuesto</option>
                                    <option value="FALTA_EXPERIENCIA">Falta de experiencia en el rubro / herramientas</option>
                                    <option value="PERFIL_TECNICO_INSUFICIENTE">El perfil técnico no se ajusta al requerimiento de la obra</option>
                                    <option value="UBICACION_GEOGRAFICA">Distancia geográfica o imposibilidad de traslado</option>
                                    <option value="OTRO">Otro motivo (Explicar en feedback adicional)</option>
                                </select>
                            </div>

                            {/* Textarea Feedback */}
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>Comentarios o Feedback Adicional <span style={{ color: "#94A3B8" }}>(Opcional)</span></label>
                                <textarea 
                                    placeholder="Escribí detalles constructivos para ayudar al candidato a mejorar..."
                                    style={formTextareaStyle}
                                    value={feedbackAdicional}
                                    onChange={(e) => setFeedbackAdicional(e.target.value)}
                                />
                            </div>

                            {/* Footer Modal */}
                            <div style={modalFooterStyle}>
                                <button 
                                    style={{ ...secondaryBtnStyle, fontSize: "14px" }} 
                                    onClick={() => setMostrarModalDescarte(false)}
                                    disabled={enviandoDescarte}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    style={{ 
                                        ...btnConfirmRejectStyle, 
                                        opacity: motivoRechazo ? 1 : 0.5,
                                        cursor: motivoRechazo ? "pointer" : "not-allowed" 
                                    }}
                                    disabled={!motivoRechazo || enviandoDescarte}
                                    onClick={confirmarDescarte}
                                >
                                    {enviandoDescarte ? "Procesando..." : "Confirmar Descarte"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL OVERLAY: VISOR PDF GOOGLE DRIVE --- */}
            <AnimatePresence>
                {mostrarModalPdf && candidatoSeleccionado && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            style={pdfModalContentStyle}
                        >
                            <div style={modalHeaderStyle}>
                                <h3 style={modalTitleStyle}>Currículum Adjunto: {candidatoSeleccionado.candidatoNombreCompleto}</h3>
                                <button style={modalCloseBtnStyle} onClick={() => setMostrarModalPdf(false)}>✕ Cerrar</button>
                            </div>
                            <div style={pdfIframeWrapperStyle}>
                                <iframe 
                                    src={candidatoSeleccionado.cvUrlAdjunto} 
                                    style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }}
                                    title="Visor PDF Google Drive"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

// --- ICONOS INLINE SVG ---

const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconCheckGreen = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
const IconExcluidoOrange = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconCloseSmall = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconCheckSmall = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
const IconWhatsApp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
const IconPdf = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconClickCard = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/></svg>
const IconWarning = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

// --- ESTILOS VISUALES (1:1 CON MOCKUP DE LA IA) ---

const containerStyle = {
    width: "100%",
    minHeight: "100vh",
    background: "#F8FAFC",
    fontFamily: "'Inter', sans-serif",
    padding: "24px 24px 40px 24px",
    boxSizing: "border-box"
}

const headerStyle = {
    height: "100px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    background: "#FFFFFF",
    borderRadius: "16px",
    padding: "0 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    border: "1px solid #E2E8F0"
}

const headerLeft = {
    display: "flex",
    alignItems: "center",
}

const logoIconStyle = (color) => ({
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: `${color}15`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
})

const logoTextStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#000000",
    letterSpacing: "-0.5px"
}

const titleStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 4px 0",
    textAlign: "left"
}

const subtitleStyle = {
    fontSize: "13px",
    color: "#94A3B8",
    margin: 0,
    textAlign: "left"
}

const headerRight = {
    display: "flex",
    alignItems: "center",
    gap: "24px"
}

const metricsWrapper = {
    display: "flex",
    gap: "16px"
}

const metricCard = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "8px 16px"
}

const metricNumber = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#64748B",
    lineHeight: "1"
}

const metricLabel = {
    fontSize: "10px",
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginTop: "2px"
}

const btnExportar = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#FFFFFF",
    color: "#000000",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
}

const mainGridStyle = {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "24px",
    height: "calc(100vh - 172px)"
}

const leftColStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    height: "100%"
}

const searchWrapper = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "0 16px",
    height: "44px"
}

const searchInputStyle = {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "13px",
    color: "#0F172A"
}

const chipsWrapper = {
    display: "flex",
    gap: "8px",
    overflowX: "auto"
}

const chipBtnStyle = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
}

const listScrollWrapper = {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingRight: "4px"
}

const loadingStateStyle = {
    padding: "40px",
    color: "#94A3B8",
    fontSize: "13px"
}

const emptyStateListStyle = {
    padding: "40px",
    color: "#94A3B8",
    fontSize: "13px"
}

const candidateCardStyle = {
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "2px solid",
    padding: "16px",
    display: "flex",
    gap: "16px",
    cursor: "pointer",
    transition: "all 0.2s"
}

const cardAvatarStyle = (bg, color) => ({
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: bg,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    fontWeight: "700"
})

const cardNameStyle = {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "0 0 4px 0"
}

const cardTitularStyle = {
    fontSize: "12px",
    color: "#94A3B8",
    margin: 0,
    lineHeight: "1.4"
}

const cardTimeStyle = {
    fontSize: "11px",
    color: "#94A3B8"
}

const stateBadgeStyle = (state) => {
    let bg = "#F1F5F9"
    let color = "#475569"
    if (state === "VISTO") { bg = "#F3E8FF"; color = "#A01EED"; }
    else if (state === "EN_REVISION") { bg = "#FEF3C7"; color = "#D97706"; }
    else if (state === "CONTACTADO") { bg = "#D1FAE5"; color = "#059669"; }
    else if (state === "DESCARTADO") { bg = "#FEE2E2"; color = "#B91C1C"; }

    return {
        background: bg,
        color: color,
        fontSize: "10px",
        fontWeight: "700",
        padding: "4px 8px",
        borderRadius: "6px",
        textTransform: "uppercase"
    }
}

const excluidoPillStyle = {
    fontSize: "11px",
    fontWeight: "600",
    color: "#D97706",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
}

const compatiblePillStyle = {
    fontSize: "11px",
    fontWeight: "600",
    color: "#059669",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
}

const rightColStyle = {
    background: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    height: "100%",
    overflow: "hidden"
}

const detailsScrollWrapper = {
    flex: 1,
    overflowY: "auto",
    padding: "24px"
}

const profileHeaderStyle = {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start"
}

const profileAvatarStyle = (color) => ({
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: `${color}10`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    border: `2px solid ${color}20`
})

const profileNameStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "24px",
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 6px 0"
}

const profileTitularStyle = {
    fontSize: "14px",
    color: "#64748B",
    margin: "0 0 16px 0"
}

const actionButtonsRow = {
    display: "flex",
    gap: "12px"
}

const btnPrimaryStyle = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px"
}

const btnOutlineStyle = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #94A3B8",
    background: "transparent",
    color: "#000000",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px"
}

const dividerStyle = {
    border: "none",
    borderTop: "1px solid #F1F5F9",
    margin: "24px 0"
}

const sectionBoxStyle = {
    marginBottom: "8px"
}

const sectionTitleStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "16px",
    fontWeight: "600",
    color: "#000000",
    margin: "0 0 16px 0",
    textAlign: "left"
}

const questionsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
}

const questionItemStyle = {
    borderRadius: "10px",
    border: "1px solid",
    padding: "16px"
}

const questionEnunciadoStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "4px"
}

const questionAnswerDetailsStyle = {
    fontSize: "12px",
    color: "#64748B"
}

const subTitleLabelStyle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px"
}

const sobreMiTextStyle = {
    fontSize: "13px",
    color: "#475569",
    lineHeight: "1.6",
    margin: 0
}

const timelineWrapperStyle = {
    position: "relative",
    paddingLeft: "20px",
    borderLeft: "2px solid #F1F5F9",
    marginLeft: "8px"
}

const timelineItemStyle = {
    position: "relative",
    marginBottom: "20px"
}

const timelineDotStyle = (color) => ({
    position: "absolute",
    left: "-25px",
    top: "4px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: color,
    border: "2px solid #FFFFFF"
})

const timelineJobTitleStyle = {
    fontSize: "13px",
    fontWeight: "700",
    color: "#000000"
}

const timelinePeriodStyle = {
    fontSize: "11px",
    color: "#94A3B8"
}

const timelineCompanyStyle = {
    fontSize: "12px",
    color: "#A01EED",
    fontWeight: "600",
    marginBottom: "6px"
}

const timelineDescStyle = {
    fontSize: "12px",
    color: "#475569",
    margin: 0,
    lineHeight: "1.4"
}

const skillsGridStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
}

const skillPillStyle = {
    background: "#F1F5F9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
    padding: "6px 14px",
    borderRadius: "20px"
}

const rejectFeedbackBoxStyle = {
    background: "#FEF2F2",
    borderRadius: "10px",
    padding: "16px",
    border: "1px solid #FEE2E2",
    textAlign: "left",
    marginTop: "24px"
}

const actionFooterStyle = {
    height: "72px",
    borderTop: "1px solid #F1F5F9",
    background: "#FFFFFF",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px"
}

const footerStatusLabelStyle = {
    fontSize: "13px",
    color: "#475569"
}

const btnRejectStyle = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#B91C1C",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
}

const emptyDetailStateStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: "40px",
    color: "#94A3B8"
}

// Modals

const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.35)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(2px)"
}

const modalContentStyle = {
    background: "#FFFFFF",
    borderRadius: "12px",
    width: "500px",
    padding: "24px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
}

const modalHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
}

const modalTitleStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#000000",
    margin: 0
}

const modalCloseBtnStyle = {
    background: "transparent",
    border: "none",
    fontSize: "14px",
    color: "#94A3B8",
    cursor: "pointer"
}

const warningBoxStyle = {
    background: "#FEF3C7",
    borderRadius: "8px",
    padding: "12px 16px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    border: "1px solid #FDE68A"
}

const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "left"
}

const formLabelStyle = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569"
}

const formSelectStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    outline: "none",
    fontSize: "13px",
    color: "#1E293B",
    background: "#FFFFFF"
}

const formTextareaStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    outline: "none",
    fontSize: "13px",
    color: "#1E293B",
    minHeight: "100px",
    resize: "none"
}

const modalFooterStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px"
}

const secondaryBtnStyle = {
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    fontWeight: "700",
    cursor: "pointer",
    padding: "10px 16px"
}

const btnConfirmRejectStyle = {
    background: "#DC2626",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "700"
}

const pdfModalContentStyle = {
    background: "#FFFFFF",
    borderRadius: "12px",
    width: "80%",
    height: "85%",
    padding: "24px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
}

const pdfIframeWrapperStyle = {
    flex: 1,
    background: "#F1F5F9",
    borderRadius: "8px"
}

const emptySectionTextStyle = {
    fontSize: "13px",
    color: "#94A3B8",
    fontStyle: "italic",
    margin: 0,
    textAlign: "left"
}


// --- CONTROLES DE PROPIEDADES FRAMER ---
addPropertyControls(PostulacionGestionEmpresa, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "http://localhost:8080/api/v1" },
    defaultOfertaId: { type: ControlType.String, title: "Oferta ID (UUID)", defaultValue: "00000000-0000-0000-0000-000000000000" },
    enableDemoMode: { type: ControlType.Boolean, title: "Modo Demo / Preview", defaultValue: true },
    primaryColor: { type: ControlType.Color, title: "Color Principal", defaultValue: "#A01EED" }
})
