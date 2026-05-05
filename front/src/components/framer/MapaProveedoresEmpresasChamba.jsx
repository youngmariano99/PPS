import React, { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    Map as PigeonMap,
    Marker,
    Overlay,
    ZoomControl,
} from "https://esm.sh/pigeon-maps@0.21.3?external=react,react-dom"
import Swal from "https://esm.sh/sweetalert2"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * MapaProveedoresEmpresasChamba
 * 
 * Un componente de mapa premium para el directorio de Chamba.
 * Sigue la lógica 1:1 de MapaProveedoresEmpresas pero con un rediseño "Propuesta A".
 * 
 * @param {Object} props - Propiedades de Framer
 */
export default function MapaProveedoresEmpresasChamba(props) {
    const { 
        apiUrl = "https://tu-api.com", 
        primaryColor = "#A01EED", 
        alturaMapa = "100%",
        mostrarZoom = true,
        radioInicial = 1000,
        defaultZoom = 12,
        providerProfileUrl = "/perfiles-prov",
        loginUrl = "/login"
    } = props

    // --- ESTADOS LÓGICOS (1:1 con el original) ---
    const [perfiles, setPerfiles] = useState([])
    const [perfilesFiltrados, setPerfilesFiltrados] = useState([])
    const [rubrosBase, setRubrosBase] = useState([]) // Rubros oficiales de BD
    const [rubrosSugeridos, setRubrosSugeridos] = useState([]) // Combinados y normalizados
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSearchActive, setIsSearchActive] = useState(false)

    const [coords, setCoords] = useState({ lat: -34.6037, lon: -58.3816 })
    const [ubicacionObtenida, setUbicacionObtenida] = useState(false)
    const [geolocalizacionError, setGeolocalizacionError] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Configuración Supabase (Mismas credenciales que AuthNavButton)
    const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const [terminoBusqueda, setTerminoBusqueda] = useState("")
    const [radioEfectivo, setRadioEfectivo] = useState(radioInicial)
    const [distanciaSeleccionada, setDistanciaSeleccionada] = useState(radioInicial)
    
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null)
    const [selectedRubros, setSelectedRubros] = useState([])
    const [mostrarDropdownDistancia, setMostrarDropdownDistancia] = useState(false)
    
    const mapRef = useRef(null)
    const searchInputRef = useRef(null)

    // --- INYECCIÓN DE ESTILOS Y FUENTES ---
    useEffect(() => {
        if (typeof document === "undefined") return

        // Cargar Poppins e Inter
        const fontLink = document.createElement("link")
        fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Poppins:wght@500;600;700&display=swap"
        fontLink.rel = "stylesheet"
        document.head.appendChild(fontLink)

        const styleSheet = document.createElement("style")
        styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .chamba-map-container {
                font-family: 'Inter', sans-serif;
                color: #000000;
            }

            .chamba-title {
                font-family: 'Poppins', sans-serif;
            }

            .chamba-marker {
                transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;
            }

            .chamba-marker:hover {
                transform: scale(1.1) translateY(-5px);
                z-index: 1000 !important;
            }

            .chamba-marker-pill {
                background: white;
                border: 2px solid ${primaryColor};
                border-radius: 20px;
                padding: 4px 12px;
                color: ${primaryColor};
                font-weight: 600;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(160, 30, 237, 0.15);
                position: relative;
            }

            .chamba-marker-pill::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid ${primaryColor};
            }

            .chamba-input:focus {
                outline: none;
                border-color: ${primaryColor};
            }

            .chamba-dropdown-item {
                padding: 10px 16px;
                cursor: pointer;
                transition: background 0.2s;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chamba-dropdown-item:hover {
                background: #f8fafc;
                color: ${primaryColor};
            }

            .chamba-button-primary {
                background: ${primaryColor};
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px 16px;
                font-weight: 600;
                cursor: pointer;
                transition: filter 0.2s;
            }

            .chamba-button-primary:hover {
                filter: brightness(0.9);
            }

            /* Estilo para el scrollbar del dropdown */
            .chamba-dropdown::-webkit-scrollbar {
                width: 4px;
            }
            .chamba-dropdown::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
            }

            .chamba-pills-container::-webkit-scrollbar {
                display: none;
            }
            .chamba-pill {
                white-space: nowrap;
                padding: 10px 20px;
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 100px;
                font-size: 14px;
                font-weight: 600;
                color: #475569;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            }
            .chamba-pill:hover {
                border-color: ${primaryColor};
                color: ${primaryColor};
                background: ${primaryColor}08;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            }
            .chamba-pill-active {
                background: ${primaryColor};
                color: white !important;
                border-color: ${primaryColor};
                box-shadow: 0 8px 20px ${primaryColor}30;
            }
        `
        document.head.appendChild(styleSheet)

        return () => {
            document.head.removeChild(styleSheet)
            if (fontLink.parentNode) document.head.removeChild(fontLink)
        }
    }, [primaryColor])

    // --- LÓGICA DE GEOLOCALIZACIÓN Y DATOS (1:1) ---
    const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371e3
        const φ1 = (lat1 * Math.PI) / 180
        const φ2 = (lat2 * Math.PI) / 180
        const Δφ = ((lat2 - lat1) * Math.PI) / 180
        const Δλ = ((lon2 - lon1) * Math.PI) / 180
        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }, [])

    const buscarServicios = useCallback(async (lat, lon) => {
        setLoading(true)
        setError(null)
        try {
            const api = apiUrl.replace(/\/+$/, "")
            // RADIO_MAXIMO_BUSQUEDA = 100km fijo para la API como en el original
            const url = `${api}/directorio/buscar/mapa?lat=${lat}&lon=${lon}&radioKm=100`
            console.log("📍 [Mapa] Fetching puntos en:", url)
            const res = await fetch(url)
            if (!res.ok) throw new Error(`Error ${res.status}`)
            const data = await res.json()
            console.log("🗺️ [Mapa] Puntos recibidos:", data.length, data)
            setPerfiles(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error("Error API:", e)
            setError("Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }, [apiUrl])

    const obtenerUbicacion = useCallback(() => {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            buscarServicios(coords.lat, coords.lon)
            return
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
                setCoords(newCoords)
                setUbicacionObtenida(true)
                buscarServicios(newCoords.lat, newCoords.lon)
            },
            () => {
                setUbicacionObtenida(false)
                buscarServicios(coords.lat, coords.lon)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [coords, buscarServicios])

    useEffect(() => {
        obtenerUbicacion()
    }, [])

    // --- EFECTOS DE AUTENTICACIÓN ---
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

    // --- FILTRADO (1:1) ---
    // 1. Cargar Rubros Oficiales desde la BD
    useEffect(() => {
        const fetchRubros = async () => {
            try {
                const response = await fetch(`${apiUrl}/rubros`)
                if (response.ok) {
                    const data = await response.json()
                    const nombres = data.filter(r => r.activa).map(r => r.nombre)
                    setRubrosBase(nombres)
                }
            } catch (err) {
                console.error("Error al cargar rubros:", err)
            }
        }
        fetchRubros()
    }, [apiUrl])

    // 2. Lógica de "Rubros Inteligentes" (Oficiales + Personalizados de Perfiles)
    useEffect(() => {
        const allRubros = new Map()
        const normalize = (s) => (s || "").toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/s$/, "") // Quitar plurales básicos (opcional, pero ayuda)

        // Primero los oficiales (tienen prioridad de nombre "bonito")
        rubrosBase.forEach(r => {
            const norm = normalize(r)
            if (norm && !allRubros.has(norm)) allRubros.set(norm, r)
        })

        // Luego los de los perfiles cargados en el mapa (Rubros secundarios/personalizados)
        perfiles.forEach(p => {
            const r = p.rubro
            if (r) {
                const norm = normalize(r)
                if (!allRubros.has(norm)) {
                    // Si no existe, lo agregamos. 
                    // Si ya existe algo parecido (ej: "Plomero" vs "Plomeros"), se queda el primero
                    allRubros.set(norm, r)
                }
            }
        })

        const sorted = Array.from(allRubros.values()).sort((a, b) => a.localeCompare(b))
        setRubrosSugeridos(sorted)
    }, [rubrosBase, perfiles])

    useEffect(() => {
        let filtrados = perfiles.map(p => ({
            ...p,
            distancia: calcularDistancia(coords.lat, coords.lon, p.latitud, p.longitud)
        })).filter(p => p.distancia <= radioEfectivo)

        // Filtrado por rubros seleccionados (Multi-select)
        if (selectedRubros.length > 0) {
            filtrados = filtrados.filter(p => {
                const rubroProv = (p.rubro || "").toLowerCase().trim()
                return selectedRubros.some(sel => sel.toLowerCase().trim() === rubroProv)
            })
        }

        // Si hay búsqueda por texto y NO hay rubros seleccionados, o como filtro adicional?
        // El usuario dice: "buscador que filtre las tarjetitas... al apretar una etiqueta filtrar"
        // Pero una vez activo, tal vez quiera filtrar por nombre dentro de esos rubros.
        // Lo mantendremos como filtro adicional si ya está activo.
        if (isSearchActive && terminoBusqueda.trim()) {
            const t = terminoBusqueda.toLowerCase().trim()
            filtrados = filtrados.filter(p => 
                (p.nombrePublico && p.nombrePublico.toLowerCase().includes(t)) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(t))
            )
        }

        filtrados.sort((a, b) => a.distancia - b.distancia)
        setPerfilesFiltrados(filtrados)
    }, [perfiles, coords, radioEfectivo, terminoBusqueda, selectedRubros, isSearchActive, calcularDistancia])
    

    const renderRubrosPills = () => {
        return rubrosSugeridos
            .filter(rub => !terminoBusqueda || rub.toLowerCase().includes(terminoBusqueda.toLowerCase()))
            .map(rub => {
                const isSelected = selectedRubros.includes(rub)
                return (
                    <button 
                        key={rub}
                        className={`chamba-pill ${isSelected ? 'chamba-pill-active' : ''}`}
                        onClick={() => {
                            let newSelected = [...selectedRubros]
                            if (isSelected) {
                                newSelected = newSelected.filter(r => r !== rub)
                            } else {
                                if (newSelected.length < 5) {
                                    newSelected.push(rub)
                                } else {
                                    Swal.fire({
                                        title: 'Límite alcanzado',
                                        text: 'Puedes seleccionar hasta 5 rubros para tu búsqueda.',
                                        icon: 'info',
                                        confirmButtonColor: primaryColor,
                                        confirmButtonText: 'Entendido'
                                    })
                                }
                            }
                            setSelectedRubros(newSelected)
                            setIsSearchActive(newSelected.length > 0)
                        }}
                    >
                        {rub}
                        {isSelected && <span style={{ marginLeft: "6px", fontSize: "10px" }}>✕</span>}
                    </button>
                )
            })
    }

    const handleDistanciaSelect = (valor) => {
        setDistanciaSeleccionada(valor)
        setRadioEfectivo(valor)
        setMostrarDropdownDistancia(false)
    }

    const formatearDistancia = (m) => {
        return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(0)} km`
    }

    const getZoomLevel = () => {
        const km = radioEfectivo / 1000
        if (km <= 0.5) return 15
        if (km <= 1) return 14
        if (km <= 5) return 12
        if (km <= 10) return 11
        return 9
    }

    // --- RENDERIZADO ---
    return (
        <div className="chamba-map-container" style={{ ...styles.mainContainer, height: alturaMapa }}>
            
            {/* HEADER / BARRA DE BÚSQUEDA (Propuesta A) */}
            <div style={styles.headerFloating}>
                <div style={styles.headerRow}>
                    {/* Input Búsqueda */}
                    <div style={styles.searchBox}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input 
                            style={styles.inputSearch}
                            placeholder={isSearchActive ? "Filtra por nombre o busca otro rubro..." : "Escribe para filtrar rubros (ej: Plomero)..."}
                            value={terminoBusqueda}
                            onChange={(e) => {
                                setTerminoBusqueda(e.target.value)
                                // La activación del mapa solo ocurre al seleccionar una pill
                            }}
                        />
                    </div>

                    {/* Controles avanzados: Solo si el mapa está activo */}
                    {isSearchActive && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", animation: "fadeIn 0.3s ease-out" }}>
                            {/* ... (resto de controles igual) ... */}
                            <div style={styles.locationBox}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                <input 
                                    style={styles.inputLocation}
                                    placeholder="Pringles, Buenos Aires"
                                    readOnly
                                />
                                <button style={styles.geoButton} onClick={obtenerUbicacion}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div style={styles.resultsBadge}>
                                <span style={{ color: primaryColor, fontWeight: "600" }}>
                                    {perfilesFiltrados.length}
                                </span>
                                <span style={{ color: "#94A3B8", marginLeft: "4px" }}>resultados</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pills de Rubros: Solo en el header si el mapa está ACTIVO */}
                {isSearchActive && (
                    <div 
                        className="chamba-pills-container"
                        style={{ 
                            display: "flex", 
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: "10px", 
                            marginTop: "16px", 
                            padding: "4px 0 12px 0",
                            width: "100%",
                            maxHeight: "120px",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {renderRubrosPills()}
                    </div>
                )}
            </div>

            {/* MAPA PIGEON */}
            <div style={styles.mapContainerWithOverlay}>
                <div style={{ ...styles.mapWrapper, filter: isSearchActive ? "none" : "blur(8px)", opacity: isSearchActive ? 1 : 0.6, transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                    <PigeonMap
                        ref={mapRef}
                        height={alturaMapa}
                        center={[coords.lat || -34.6037, coords.lon || -58.3816]}
                        zoom={getZoomLevel() || 12}
                        defaultCenter={[-34.6037, -58.3816]}
                        defaultZoom={12}
                        provider={(x, y, z) => `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`}
                        onBoundsChanged={() => perfilSeleccionado && setPerfilSeleccionado(null)}
                    >
                        {mostrarZoom && <ZoomControl />}

                        {ubicacionObtenida && (
                            <Overlay anchor={[coords.lat, coords.lon]} offset={[0, 0]}>
                                <div style={styles.userMarkerWrapper}>
                                    <div style={{ ...styles.userPulse, backgroundColor: primaryColor }} />
                                    <div style={{ ...styles.userDot, backgroundColor: primaryColor }} />
                                    <div style={{ 
                                        ...styles.visualRadius, 
                                        width: `${radioEfectivo / (40000 / Math.pow(2, getZoomLevel()))}px`, 
                                        height: `${radioEfectivo / (40000 / Math.pow(2, getZoomLevel()))}px`,
                                        borderColor: `${primaryColor}40`,
                                        backgroundColor: `${primaryColor}08`
                                    }} />
                                </div>
                            </Overlay>
                        )}

                        {isSearchActive && perfilesFiltrados.map(p => (
                            <Overlay key={p.id} anchor={[p.latitud, p.longitud]} offset={[0, 0]}>
                                <div 
                                    className="chamba-marker"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setPerfilSeleccionado(p)
                                    }}
                                    style={{ transform: "translate(-50%, -100%)", position: "absolute" }}
                                >
                                    <div className="chamba-marker-pill">
                                        {p.rubro || "Servicio"}
                                    </div>
                                </div>
                            </Overlay>
                        ))}

                        {perfilSeleccionado && (
                            <Overlay anchor={[perfilSeleccionado.latitud, perfilSeleccionado.longitud]} offset={[0, 0]}>
                                <div style={styles.cardOverlay}>
                                    <div style={styles.card}>
                                        <button style={styles.cardClose} onClick={() => setPerfilSeleccionado(null)}>✕</button>
                                        
                                        <div style={styles.cardHeader}>
                                            <div style={styles.avatarWrapper}>
                                                {perfilSeleccionado.fotoPerfilUrl ? (
                                                    <img 
                                                        src={perfilSeleccionado.fotoPerfilUrl} 
                                                        style={styles.avatarImg}
                                                        alt={perfilSeleccionado.nombrePublico}
                                                    />
                                                ) : (
                                                    <div style={{ ...styles.avatarPlaceholder, backgroundColor: primaryColor + "20", color: primaryColor }}>
                                                        {perfilSeleccionado.nombrePublico?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={styles.cardMainInfo}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <h4 className="chamba-title" style={styles.cardName}>
                                                        {perfilSeleccionado.nombrePublico}
                                                    </h4>
                                                    {perfilSeleccionado.destacado && (
                                                        <span style={{ ...styles.proBadge, backgroundColor: primaryColor }}>PRO</span>
                                                    )}
                                                </div>
                                                <p style={styles.cardCategory}>{perfilSeleccionado.rubro}</p>
                                            </div>
                                        </div>

                                        {perfilSeleccionado.especialidades && perfilSeleccionado.especialidades.length > 0 && (
                                            <div style={styles.tagContainer}>
                                                {perfilSeleccionado.especialidades.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} style={styles.tag}>
                                                        {tag}{idx < 2 && idx < perfilSeleccionado.especialidades.length - 1 ? " •" : ""}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div style={styles.cardMetrics}>
                                            <div style={styles.metricItem}>
                                                <span style={styles.starIcon}>⭐</span>
                                                <span style={styles.metricText}>
                                                    {perfilSeleccionado.promedioEstrellas > 0 ? perfilSeleccionado.promedioEstrellas.toFixed(1) : "N/A"} 
                                                    <span style={{ color: "#94A3B8", fontWeight: "400", marginLeft: "4px" }}>
                                                        ({perfilSeleccionado.cantidadResenas || 0})
                                                    </span>
                                                </span>
                                            </div>
                                            <div style={styles.metricDivider} />
                                            <div style={styles.metricItem}>
                                                <span style={styles.metricText}>
                                                    📍 {formatearDistancia(Math.round(perfilSeleccionado.distancia))}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.cardActions}>
                                            <button 
                                                style={{ 
                                                    ...styles.btnSecondary, 
                                                    opacity: (isLoggedIn && perfilSeleccionado.telefono) ? 1 : 0.5, 
                                                    cursor: (isLoggedIn && perfilSeleccionado.telefono) ? "pointer" : "not-allowed" 
                                                }}
                                                onClick={() => {
                                                    if (!isLoggedIn) {
                                                        Swal.fire({
                                                            title: 'Inicia sesión',
                                                            text: 'Debes estar conectado para contactar a los profesionales.',
                                                            icon: 'info',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Ir al Login',
                                                            confirmButtonColor: primaryColor
                                                        }).then((result) => {
                                                            if (result.isConfirmed) window.location.href = loginUrl
                                                        })
                                                        return
                                                    }
                                                    if (perfilSeleccionado.telefono) {
                                                        const msg = encodeURIComponent(`Hola ${perfilSeleccionado.nombrePublico}, te contacto desde Chamba por tu servicio de ${perfilSeleccionado.rubro}.`)
                                                        window.open(`https://wa.me/${perfilSeleccionado.telefono.replace(/\D/g, "")}?text=${msg}`, "_blank")
                                                    }
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
                                                {isLoggedIn ? "Contactar" : "Login para contactar"}
                                            </button>
                                            <button 
                                                className="chamba-button-primary" 
                                                style={{ ...styles.btnPrimary, backgroundColor: primaryColor }}
                                                onClick={() => {
                                                    const target = perfilSeleccionado.slug ? `p=${perfilSeleccionado.slug}` : `id=${perfilSeleccionado.id}`
                                                    window.location.href = `${providerProfileUrl}?${target}`
                                                }}
                                            >
                                                Ver perfil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Overlay>
                        )}
                    </PigeonMap>
                </div>

                {!isSearchActive && (
                    <div style={styles.emptyStateOverlay}>
                        <div style={styles.emptyStateCard}>
                            <div style={{ ...styles.emptyStateIcon, backgroundColor: primaryColor + "15", color: primaryColor }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                            <h2 style={styles.emptyStateTitle}>¿Qué necesitas resolver hoy?</h2>
                            <p style={styles.emptyStateSub}>Selecciona una categoría o busca lo que necesitas para comenzar.</p>
                            
                            {/* Rubros dinámicos AQUÍ para que no tapen el cartel y sean parte de la navegación */}
                            <div style={{ 
                                display: "flex", 
                                flexWrap: "wrap", 
                                gap: "8px", 
                                justifyContent: "center",
                                marginTop: "24px",
                                maxHeight: "200px",
                                overflowY: "auto",
                                padding: "4px"
                            }}>
                                {renderRubrosPills()}
                            </div>

                            <div style={{ ...styles.emptyStateHint, marginTop: "24px" }}>
                                <span>🚀 Prueba filtrando arriba por rubros específicos</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* Footer Info (Radio de búsqueda) */}
                <div style={styles.mapFooter}>
                    <div style={styles.footerInfo}>
                        <div style={{ ...styles.footerDot, backgroundColor: primaryColor }} />
                        <span>Radio de búsqueda: {formatearDistancia(radioEfectivo)}</span>
                    </div>
                </div>
            </div>

            {loading && <div style={styles.loader}>Cargando chambas...</div>}
        </div>
    )
}

// --- ESTILOS ---
const styles = {
    mainContainer: {
        width: "100%",
        position: "relative",
        background: "#F8FAFC",
        overflow: "hidden",
    },
    mapContainerWithOverlay: {
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    headerFloating: {
        position: "absolute",
        top: "24px",
        left: "24px",
        right: "24px",
        zIndex: 1000,
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        padding: "10px",
        borderRadius: "100px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.3)",
        width: "100%",
        maxWidth: "fit-content",
        margin: "0 auto",
    },
    searchBox: {
        flex: 2,
        display: "flex",
        alignItems: "center",
        background: "#F8FAFC",
        borderRadius: "12px",
        padding: "0 16px",
        height: "48px",
        gap: "10px",
    },
    inputSearch: {
        background: "transparent",
        border: "none",
        width: "100%",
        fontSize: "14px",
        color: "#1E293B",
        outline: "none",
    },
    locationBox: {
        flex: 1.5,
        display: "flex",
        alignItems: "center",
        background: "#F8FAFC",
        borderRadius: "12px",
        padding: "0 16px",
        height: "48px",
        gap: "10px",
    },
    inputLocation: {
        background: "transparent",
        border: "none",
        width: "100%",
        fontSize: "14px",
        color: "#1E293B",
        outline: "none",
    },
    geoButton: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        padding: "4px",
    },
    distanceButton: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "white",
        border: "2px solid #E2E8F0",
        borderRadius: "12px",
        height: "48px",
        padding: "0 16px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        minWidth: "120px",
    },
    dropdown: {
        position: "absolute",
        top: "56px",
        left: 0,
        width: "180px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        animation: "fadeIn 0.2s ease-out",
    },
    resultsBadge: {
        padding: "0 16px",
        fontSize: "14px",
        borderLeft: "1px solid #E2E8F0",
        height: "24px",
        display: "flex",
        alignItems: "center",
        minWidth: "140px",
    },
    emptyStateOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500,
        background: "rgba(248, 250, 252, 0.4)",
    },
    emptyStateCard: {
        background: "white",
        padding: "40px 32px",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
        textAlign: "center",
        maxWidth: "400px",
        margin: "0 24px",
        border: "1px solid rgba(255,255,255,0.8)",
        animation: "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    emptyStateIcon: {
        width: "64px",
        height: "64px",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px auto",
    },
    emptyStateTitle: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "24px",
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: "12px",
    },
    emptyStateSub: {
        fontSize: "15px",
        color: "#64748B",
        lineHeight: "1.6",
        marginBottom: "24px",
    },
    emptyStateHint: {
        background: "#F1F5F9",
        padding: "10px 16px",
        borderRadius: "12px",
        fontSize: "13px",
        color: "#475569",
        fontWeight: "600",
        display: "inline-block",
    },
    filterButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "transparent",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        height: "48px",
        padding: "0 20px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
    },
    mapWrapper: {
        width: "100%",
        height: "100%",
        background: "#F8FAFC", // Limpio y claro para el empty state
        position: "relative",
    },
    userMarkerWrapper: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    userDot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        border: "2px solid white",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        zIndex: 2,
    },
    userPulse: {
        position: "absolute",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        opacity: 0.3,
        animation: "pulse 2s infinite",
    },
    visualRadius: {
        position: "absolute",
        borderRadius: "50%",
        border: "1px dashed",
        pointerEvents: "none",
    },
    cardOverlay: {
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        animation: "fadeIn 0.3s ease-out",
    },
    card: {
        width: "300px",
        background: "white",
        borderRadius: "24px",
        padding: "20px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        position: "relative",
        border: "1px solid #F1F5F9",
    },
    cardClose: {
        position: "absolute",
        top: "16px",
        right: "16px",
        background: "#F8FAFC",
        border: "none",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        color: "#94A3B8",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        zIndex: 2,
    },
    cardHeader: {
        display: "flex",
        gap: "16px",
        alignItems: "center",
        marginBottom: "16px",
    },
    avatarWrapper: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        overflow: "hidden",
        border: "3px solid #F1F5F9",
        flexShrink: 0,
    },
    avatarImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        fontWeight: "700",
        fontFamily: "'Poppins', sans-serif",
    },
    cardMainInfo: {
        flex: 1,
        minWidth: 0,
    },
    cardName: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "700",
        color: "#0F172A",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    proBadge: {
        fontSize: "10px",
        fontWeight: "800",
        color: "white",
        padding: "2px 8px",
        borderRadius: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    cardCategory: {
        margin: "2px 0 0 0",
        fontSize: "14px",
        color: "#A01EED",
        fontWeight: "600",
    },
    tagContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginBottom: "16px",
    },
    tag: {
        fontSize: "13px",
        color: "#64748B",
        fontWeight: "500",
    },
    cardMetrics: {
        display: "flex",
        alignItems: "center",
        background: "#F8FAFC",
        borderRadius: "12px",
        padding: "10px 16px",
        marginBottom: "20px",
    },
    metricItem: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    metricDivider: {
        width: "1px",
        height: "14px",
        background: "#E2E8F0",
        margin: "0 12px",
    },
    starIcon: {
        fontSize: "14px",
    },
    metricText: {
        fontSize: "13px",
        fontWeight: "700",
        color: "#1E293B",
    },
    cardActions: {
        display: "flex",
        gap: "10px",
    },
    btnPrimary: {
        flex: 1.2,
        height: "44px",
        borderRadius: "12px",
        border: "none",
        color: "white",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    btnSecondary: {
        flex: 1,
        height: "44px",
        borderRadius: "12px",
        border: "2px solid #F1F5F9",
        background: "white",
        color: "#0F172A",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "background 0.2s",
    },
    mapFooter: {
        position: "absolute",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
    },
    footerInfo: {
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        padding: "8px 16px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: "600",
        color: "#64748B",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.3)",
    },
    footerDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
    },
    loader: {
        position: "absolute",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        padding: "8px 20px",
        borderRadius: "100px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        fontSize: "13px",
        fontWeight: "600",
        color: "#A01EED",
        zIndex: 1000,
    },
}

// --- FRAMER CONTROLS ---
addPropertyControls(MapaProveedoresEmpresasChamba, {
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Principal",
        defaultValue: "#A01EED",
    },
    alturaMapa: {
        type: ControlType.Number,
        title: "Altura del Mapa (px)",
        defaultValue: 600,
        min: 300,
        max: 1200,
        step: 50,
    },
    radioInicial: {
        type: ControlType.Number,
        title: "Radio Inicial (m)",
        defaultValue: 1000,
        min: 100,
        max: 100000,
    },
    mostrarZoom: {
        type: ControlType.Boolean,
        title: "Mostrar Zoom",
        defaultValue: true,
    },
    defaultZoom: {
        type: ControlType.Number,
        title: "Zoom por Defecto",
        defaultValue: 12,
        min: 1,
        max: 20,
    },
    providerProfileUrl: {
        type: ControlType.String,
        title: "URL Perfil Proveedor",
        defaultValue: "/perfiles-prov",
    },
    loginUrl: {
        type: ControlType.String,
        title: "URL Login",
        defaultValue: "/login",
    },
})
