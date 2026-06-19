import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { Client as StompClient } from "https://esm.sh/@stomp/stompjs@7.0.0"

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ==========================================
// CONFIGURACIÓN DE TIEMPO REAL
// ==========================================
const PROVIDER_TYPE = 'SUPABASE'; // Opciones: 'SUPABASE' | 'SPRING_BOOT'

// ==========================================
// PATRÓN ADAPTER PARA REAL-TIME
// ==========================================

class IRealtimeAdapter {
    /**
     * @param {string} userId
     * @param {function} onNotificationReceived
     */
    connect(userId, onNotificationReceived) {
        throw new Error("Método 'connect' debe ser implementado.");
    }
    disconnect() {
        throw new Error("Método 'disconnect' debe ser implementado.");
    }
}

class SupabaseRealtimeAdapter extends IRealtimeAdapter {
    constructor() {
        super();
        this.channel = null;
    }
    connect(userId, onNotificationReceived) {
        if (this.channel) return;
        console.log("WebSocket: Conectando Supabase Realtime para usuario:", userId);
        this.channel = supabase
            .channel(`noti-realtime-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notificaciones',
                    filter: `usuario_id=eq.${userId}`
                },
                (payload) => {
                    console.log("WebSocket: Notificación recibida en Supabase:", payload.new);
                    const dto = {
                        id: payload.new.id,
                        tipoNotificacion: payload.new.tipo_notificacion,
                        mensaje: payload.new.mensaje,
                        entidadReferenciaId: payload.new.entidad_referencia_id,
                        leida: payload.new.leida,
                        fechaCreacion: payload.new.created_at
                    };
                    onNotificationReceived(dto);
                }
            )
            .subscribe((status) => {
                console.log(`WebSocket: Estado del canal Supabase: ${status}`);
            });
    }
    disconnect() {
        if (this.channel) {
            console.log("WebSocket: Desconectando Supabase Realtime...");
            supabase.removeChannel(this.channel);
            this.channel = null;
        }
    }
}

class SpringBootRealtimeAdapter extends IRealtimeAdapter {
    constructor(apiUrl) {
        super();
        this.apiUrl = apiUrl;
        this.stompClient = null;
    }
    connect(userId, onNotificationReceived) {
        if (this.stompClient) return;
        const wsUrl = this.apiUrl.replace("http", "ws").replace("/api/v1", "/ws");
        console.log("WebSocket: Conectando Spring Boot WebSockets STOMP a:", wsUrl);
        this.stompClient = new StompClient({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("WebSocket: Conexión STOMP establecida");
                this.stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
                    console.log("WebSocket: Mensaje STOMP recibido:", message.body);
                    const data = JSON.parse(message.body);
                    onNotificationReceived(data);
                });
            },
            onStompError: (frame) => {
                console.error("WebSocket: Error STOMP:", frame);
            }
        });
        this.stompClient.activate();
    }
    disconnect() {
        if (this.stompClient) {
            console.log("WebSocket: Desconectando STOMP...");
            this.stompClient.deactivate();
            this.stompClient = null;
        }
    }
}

// Custom Hook que maneja el ciclo de vida de la conexión
function useRealtimeNotifications(userId, apiUrl, onNotificationReceived) {
    const adapterRef = useRef(null);
    useEffect(() => {
        if (!userId) return;
        console.log(`WebSocket: Inicializando con proveedor: ${PROVIDER_TYPE}`);
        if (PROVIDER_TYPE === 'SUPABASE') {
            adapterRef.current = new SupabaseRealtimeAdapter();
        } else {
            adapterRef.current = new SpringBootRealtimeAdapter(apiUrl);
        }
        adapterRef.current.connect(userId, onNotificationReceived);
        return () => {
            if (adapterRef.current) {
                adapterRef.current.disconnect();
            }
        };
    }, [userId, apiUrl, onNotificationReceived]);
}

// ==========================================
// COMPONENTE PRINCIPAL (CAMPANA)
// ==========================================

export default function CampanaNotificaciones(props) {
    const { apiUrl = "http://localhost:8080/api/v1", primaryColor = "#A01EED", verTodasUrl = "/notificaciones" } = props

    const [notificaciones, setNotificaciones] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)
    const [userId, setUserId] = useState(null)

    // Obtener el usuario activo de Supabase al montar
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setUserId(user.id)
                }
            } catch (err) {
                console.error("Error al obtener usuario de Supabase:", err)
            }
        }
        fetchUser()
    }, [])

    // Callback memoizado para procesar nuevas notificaciones del adapter
    const handleNuevaNotificacion = useCallback((nuevaNoti) => {
        setNotificaciones(prev => {
            if (prev.some(n => n.id === nuevaNoti.id)) return prev;
            const actualizadas = [nuevaNoti, ...prev];
            setUnreadCount(actualizadas.filter(n => !n.leida).length);
            return actualizadas.slice(0, 5);
        });
    }, []);

    // Conexión en tiempo real desacoplada mediante Adapter
    useRealtimeNotifications(userId, apiUrl, handleNuevaNotificacion);

    // Load Google Fonts & Native Hover Styles
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)

        const style = document.createElement("style")
        style.id = "chamba-noti-styles"
        style.innerHTML = `
            .chamba-bell-btn:hover {
                background: #F1F5F9 !important;
            }
            .chamba-noti-row:hover {
                background: rgba(160, 30, 237, 0.04) !important;
            }
            .chamba-noti-footer:hover {
                background: #F8FAFC !important;
            }
        `
        document.head.appendChild(style)

        return () => {
            link.remove()
            style.remove()
        }
    }, [])

    // Click outside to close popover
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const fetchConAuth = async (endpoint, options = {}) => {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        const { data: { user } } = await supabase.auth.getUser()

        const headers = {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(user && { "X-User-Id": user.id }),
            ...options.headers,
        }

        const response = await fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers,
        })

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`)
        }

        if (response.status === 204) return null
        return response.json()
    }

    const cargarNotificaciones = async () => {
        setLoading(true)
        try {
            const data = await fetchConAuth("/notificaciones/me?soloNoLeidas=false")
            if (data) {
                setNotificaciones(data)
                setUnreadCount(data.filter(n => !n.leida).length)
            }
        } catch (err) {
            console.error("Error al cargar notificaciones:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        cargarNotificaciones()
        // Polling cada 30 segundos como fallback secundario
        const interval = setInterval(cargarNotificaciones, 30000)
        return () => clearInterval(interval)
    }, [apiUrl])

    const marcarComoLeida = async (id) => {
        try {
            await fetchConAuth(`/notificaciones/${id}/leer`, { method: "PUT" })
            setNotificaciones(prev =>
                prev.map(n => (n.id === id ? { ...n, leida: true } : n))
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error("Error al marcar como leída:", err)
        }
    }

    const marcarTodasComoLeidas = async () => {
        try {
            const unread = notificaciones.filter(n => !n.leida)
            await Promise.all(
                unread.map(n => fetchConAuth(`/notificaciones/${n.id}/leer`, { method: "PUT" }))
            )
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error("Error al marcar todas como leídas:", err)
        }
    }

    // Helper para formatear fecha de creación
    const formatTime = (dateStr) => {
        if (!dateStr) return "Hace un momento"
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)

        if (diffMins < 1) return "Hace un momento"
        if (diffMins < 60) return `Hace ${diffMins} min`
        if (diffHours < 24) return `Hace ${diffHours} horas`
        const diffDays = Math.floor(diffHours / 24)
        if (diffDays === 1) return "Hace 1 día"
        return `Hace ${diffDays} días`
    }

    // Helper para formatear texto con negritas en palabras clave
    const formatMessageText = (msg) => {
        if (!msg) return ""
        const regex = /'([^']+)'|(\bPlomero\b|\bTechNova Solutions\b|\bDesignGroup\b)/gi
        const parts = msg.split(regex)
        
        return parts.map((part, i) => {
            if (!part) return null
            const isMatch = part.startsWith("'") || 
                ["plomero", "technova solutions", "designgroup"].includes(part.toLowerCase())
            const cleanPart = part.replace(/'/g, "")
            return isMatch ? <strong key={i} style={{ fontWeight: "700", color: "#000000" }}>{cleanPart}</strong> : cleanPart
        })
    }

    // Helper para renderizar iconos descriptivos
    const renderIcon = (msg) => {
        const text = msg.toLowerCase()
        if (text.includes("leída") || text.includes("vista") || text.includes("visto")) {
            return (
                <div style={iconContainerStyle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </div>
            )
        }
        if (text.includes("mensaje") || text.includes("escribió")) {
            return (
                <div style={iconContainerStyle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
            )
        }
        if (text.includes("currículum") || text.includes("cv") || text.includes("descargado")) {
            return (
                <div style={iconContainerStyle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                </div>
            )
        }
        return (
            <div style={iconContainerStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
            </div>
        )
    }

    return (
        <div ref={dropdownRef} style={wrapperStyle}>
            <div className="chamba-bell-btn" style={bellButtonContainer} onClick={() => setIsOpen(!isOpen)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer" }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                    <span style={{ ...badgeStyle }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={popoverStyle}
                    >
                        {/* Tooltip Pointer Arrow */}
                        <div style={arrowPointerStyle} />

                        <div style={headerStyle}>
                            <h3 style={titleStyle}>Notificaciones</h3>
                            {unreadCount > 0 && (
                                <button style={{ ...actionBtnStyle, color: primaryColor }} onClick={marcarTodasComoLeidas}>
                                    Marcar todo como leído
                                </button>
                            )}
                        </div>

                        <div style={listStyle}>
                            {notificaciones.length === 0 ? (
                                <div style={emptyStateStyle}>No tenés notificaciones nuevas.</div>
                            ) : (
                                notificaciones.slice(0, 5).map((noti) => (
                                    <div
                                        key={noti.id}
                                        className="chamba-noti-row"
                                        style={{
                                            ...rowStyle,
                                            background: !noti.leida ? "rgba(160, 30, 237, 0.03)" : "#FFFFFF",
                                        }}
                                        onClick={() => {
                                            if (!noti.leida) marcarComoLeida(noti.id)
                                        }}
                                    >
                                        <div style={dotColStyle}>
                                            {!noti.leida && <div style={{ ...dotStyle, background: primaryColor }} />}
                                        </div>

                                        {renderIcon(noti.mensaje)}

                                        <div style={textColStyle}>
                                            <p style={messageStyle}>{formatMessageText(noti.mensaje)}</p>
                                            <span style={timeStyle}>{formatTime(noti.fechaCreacion)}</span>
                                        </div>

                                        <div style={arrowColStyle}>
                                            {!noti.leida ? (
                                                <div style={{ ...grayDotStyle }} />
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6"/>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="chamba-noti-footer" style={footerStyle} onClick={() => { setIsOpen(false); window.location.href = verTodasUrl }}>
                            <span style={{ ...footerLinkStyle, color: primaryColor }}>
                                Ver todas las notificaciones
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px" }}>
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// --- STYLES ---

const wrapperStyle = {
    position: "relative",
    display: "inline-block",
    fontFamily: "'Inter', sans-serif"
}

const bellButtonContainer = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#F8FAFC",
    cursor: "pointer",
    transition: "background 0.2s"
}

const badgeStyle = {
    position: "absolute",
    top: "4px",
    right: "4px",
    minWidth: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "#EF4444",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    boxSizing: "border-box"
}

const popoverStyle = {
    position: "absolute",
    top: "50px",
    right: "0px",
    width: "420px",
    background: "#FFFFFF",
    borderRadius: "20px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #F1F5F9",
    zIndex: 1000
}

const arrowPointerStyle = {
    position: "absolute",
    top: "-6px",
    right: "16px",
    width: "12px",
    height: "12px",
    background: "#FFFFFF",
    borderLeft: "1px solid #F1F5F9",
    borderTop: "1px solid #F1F5F9",
    transform: "rotate(45deg)",
    zIndex: 1001
}

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #F1F5F9",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px"
}

const titleStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0
}

const actionBtnStyle = {
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0
}

const listStyle = {
    maxHeight: "360px",
    overflowY: "auto"
}

const emptyStateStyle = {
    padding: "32px 24px",
    textAlign: "center",
    color: "#64748B",
    fontSize: "14px"
}

const rowStyle = {
    display: "flex",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #F8FAFC",
    cursor: "pointer",
    transition: "background 0.2s"
}

const dotColStyle = {
    width: "12px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
}

const dotStyle = {
    width: "6px",
    height: "6px",
    borderRadius: "50%"
}

const iconContainerStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #F1F5F9",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
}

const textColStyle = {
    flex: 1,
    padding: "0 16px",
    textAlign: "left"
}

const messageStyle = {
    fontSize: "13.5px",
    color: "#334155",
    margin: "0 0 4px 0",
    lineHeight: "1.4"
}

const timeStyle = {
    fontSize: "11.5px",
    color: "#94A3B8",
    fontWeight: "500"
}

const arrowColStyle = {
    width: "20px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
}

const grayDotStyle = {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#94A3B8"
}

const footerStyle = {
    padding: "16px 24px",
    borderTop: "1px solid #F1F5F9",
    textAlign: "center",
    cursor: "pointer",
    transition: "background 0.2s",
    background: "#FFFFFF",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px"
}

const footerLinkStyle = {
    fontSize: "13px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
}

addPropertyControls(CampanaNotificaciones, {
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
    verTodasUrl: {
        type: ControlType.String,
        title: "URL Historial",
        defaultValue: "/notificaciones",
    }
})
