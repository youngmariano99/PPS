import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

export default function BuscadorHeroTrabajo(props) {
    const { 
        directorioUrl = "/directorio-ofertas", 
        primaryColor = "#A01EED",
        titleText = "Encontrá tu próximo trabajo",
        subtitleText = "Explorá cientos de ofertas de empleo locales y remotas en un solo lugar."
    } = props

    const [query, setQuery] = useState("")
    const [location, setLocation] = useState("")

    // Load Fonts & Inject Dynamic CSS
    useEffect(() => {
        const link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        link.rel = "stylesheet"
        document.head.appendChild(link)

        const style = document.createElement("style")
        style.id = "chamba-hero-styles"
        style.innerHTML = `
            .chamba-search-input:focus {
                outline: none !important;
            }
            .chamba-popular-chip {
                background: #F1F5F9 !important;
                color: #475569 !important;
                border: 1px solid #E2E8F0 !important;
                transition: all 0.2s ease !important;
            }
            .chamba-popular-chip:hover {
                background: #E2E8F0 !important;
                color: #0F172A !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
            }
            .chamba-search-btn {
                background: ${primaryColor} !important;
                transition: background 0.2s ease, transform 0.1s ease !important;
            }
            .chamba-search-btn:hover {
                background: #8B1BD3 !important;
            }
            .chamba-search-btn:active {
                transform: scale(0.98) !important;
            }
        `
        document.head.appendChild(style)

        return () => {
            link.remove()
            style.remove()
        }
    }, [primaryColor])

    const handleSearch = (e) => {
        if (e) e.preventDefault()
        const q = query.trim()
        const l = location.trim()
        let url = `${directorioUrl}?`
        const params = []
        if (q) params.push(`q=${encodeURIComponent(q)}`)
        if (l) params.push(`l=${encodeURIComponent(l)}`)
        url += params.join("&")
        window.location.href = url
    }

    const handlePopularClick = (type, value) => {
        let url = `${directorioUrl}?`
        if (type === "q") {
            url += `q=${encodeURIComponent(value)}`
        } else if (type === "l") {
            url += `l=${encodeURIComponent(value)}`
        }
        window.location.href = url
    }

    return (
        <div style={heroOuterWrapper}>
            {/* Soft Blurred Background Decorators */}
            <div style={backgroundDecoratorLeft} />
            <div style={backgroundDecoratorRight} />

            <div style={glassCardStyle}>
                {/* Logo Chamba */}
                <div style={logoWrapper}>
                    <LogoChamba />
                </div>

                {/* H1 Title & Subtitle */}
                <h1 style={h1TitleStyle}>{titleText}</h1>
                <p style={subtitleStyle}>{subtitleText}</p>

                {/* Horizontal Search Bar Form */}
                <form onSubmit={handleSearch} style={searchBarForm}>
                    <div style={inputSectionWrapper}>
                        {/* Input 1: Query */}
                        <div style={inputContainer}>
                            <IconSearch color={primaryColor} />
                            <input
                                type="text"
                                className="chamba-search-input"
                                placeholder="Puesto, habilidad o rubro... (ej: Gasista)"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={inputFieldRaw}
                            />
                        </div>

                        {/* Vertical sutil divider */}
                        <div style={verticalDivider} />

                        {/* Input 2: Location */}
                        <div style={inputContainer}>
                            <IconPin color={primaryColor} />
                            <input
                                type="text"
                                className="chamba-search-input"
                                placeholder="Ciudad o 'Remoto'..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={inputFieldRaw}
                            />
                        </div>
                    </div>

                    {/* Search Button */}
                    <button type="submit" className="chamba-search-btn" style={searchBtnStyle}>
                        Buscar empleo ✓
                    </button>
                </form>

                {/* Popular Searches block */}
                <div style={popularSearchesBlock}>
                    <span style={popularLabel}>Búsquedas populares:</span>
                    <div style={chipsRow}>
                        <button 
                            type="button" 
                            className="chamba-popular-chip" 
                            onClick={() => handlePopularClick("l", "Remoto")}
                            style={chipStyle}
                        >
                            <span style={{ marginRight: "4px" }}>💻</span> Remoto
                        </button>
                        <button 
                            type="button" 
                            className="chamba-popular-chip" 
                            onClick={() => handlePopularClick("q", "Plomería")}
                            style={chipStyle}
                        >
                            <span style={{ marginRight: "4px" }}>🔧</span> Plomería
                        </button>
                        <button 
                            type="button" 
                            className="chamba-popular-chip" 
                            onClick={() => handlePopularClick("q", "Electricidad")}
                            style={chipStyle}
                        >
                            <span style={{ marginRight: "4px" }}>⚡</span> Electricidad
                        </button>
                        <button 
                            type="button" 
                            className="chamba-popular-chip" 
                            onClick={() => handlePopularClick("q", "Construcción")}
                            style={chipStyle}
                        >
                            <span style={{ marginRight: "4px" }}>🔨</span> Construcción
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- ICONS & LOGO ---

const LogoChamba = () => (
    <svg width="150" height="38" viewBox="0 0 150 40" fill="none">
        <path d="M20 10C15 10 10 15 10 20S15 30 20 30S30 25 30 20S25 10 20 10ZM20 25C17.2 25 15 22.8 15 20S17.2 15 20 15S25 17.2 25 20S22.8 25 20 25Z" fill="#A01EED" />
        <text x="35" y="28" fontFamily="Poppins" fontWeight="700" fontSize="24" fill="#000000">chamba</text>
    </svg>
)

const IconSearch = ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const IconPin = ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
)

// --- STYLES ---

const heroOuterWrapper = {
    position: "relative",
    width: "100%",
    minHeight: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden"
}

const backgroundDecoratorLeft = {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "rgba(160, 30, 237, 0.12)",
    filter: "blur(80px)",
    left: "-80px",
    top: "-30px",
    zIndex: 1
}

const backgroundDecoratorRight = {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(219, 39, 119, 0.08)",
    filter: "blur(70px)",
    right: "-60px",
    bottom: "20px",
    zIndex: 1
}

const glassCardStyle = {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: "1040px",
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    borderRadius: "32px",
    boxShadow: "0 20px 40px -15px rgba(160, 30, 237, 0.06), 0 1px 3px rgba(0, 0, 0, 0.01)",
    padding: "64px 48px",
    boxSizing: "border-box",
    textAlign: "center"
}

const logoWrapper = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px"
}

const h1TitleStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "48px",
    fontWeight: "800",
    color: "#0F172A",
    margin: "0 0 16px 0",
    letterSpacing: "-1px",
    lineHeight: "1.15"
}

const subtitleStyle = {
    fontSize: "16px",
    color: "#475569",
    fontWeight: "500",
    margin: "0 0 40px 0",
    lineHeight: "1.5"
}

const searchBarForm = {
    display: "flex",
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.02)",
    padding: "8px 8px 8px 24px",
    boxSizing: "border-box",
    alignItems: "center",
    width: "100%",
    maxWidth: "880px",
    margin: "0 auto 32px auto",
    gap: "16px",
    flexWrap: "wrap"
}

const inputSectionWrapper = {
    display: "flex",
    flex: 1,
    alignItems: "center",
    gap: "16px",
    minWidth: "280px"
}

const inputContainer = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1
}

const inputFieldRaw = {
    width: "100%",
    border: "none",
    background: "transparent",
    fontSize: "15px",
    color: "#0F172A",
    fontWeight: "500",
    padding: "12px 0"
}

const verticalDivider = {
    width: "1px",
    height: "36px",
    background: "#E2E8F0",
    flexShrink: 0
}

const searchBtnStyle = {
    color: "#FFFFFF",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "15px",
    fontWeight: "700",
    border: "none",
    borderRadius: "14px",
    padding: "16px 28px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(160, 30, 237, 0.15)"
}

const popularSearchesBlock = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap"
}

const popularLabel = {
    fontSize: "13.5px",
    color: "#64748B",
    fontWeight: "600"
}

const chipsRow = {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
}

const chipStyle = {
    border: "none",
    borderRadius: "12px",
    padding: "8px 16px",
    fontSize: "13.5px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
}

addPropertyControls(BuscadorHeroTrabajo, {
    directorioUrl: {
        type: ControlType.String,
        title: "URL Directorio",
        defaultValue: "/directorio-ofertas",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Principal",
        defaultValue: "#A01EED",
    },
    titleText: {
        type: ControlType.String,
        title: "Título H1",
        defaultValue: "Encontrá tu próximo trabajo",
    },
    subtitleText: {
        type: ControlType.String,
        title: "Subtítulo",
        defaultValue: "Explorá cientos de ofertas de empleo locales y remotas en un solo lugar.",
    }
})
