import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import Swal from "https://esm.sh/sweetalert2"

/**
 * WIZARD DE ONBOARDING PREMIUM v4.3 (SweetAlert2 Integration)
 * -----------------------------------------------
 * Ahora con feedback visual avanzado y estilo Premium.
 */

export default function WizardOnboarding(props) {
    const {
        apiUrl,
        primaryColor,
        cardBg,
        textColor,
        borderRadius,
        cloudinaryCloudName,
        cloudinaryPreset,
    } = props

    const [step, setStep] = useState(1)
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [usuarioId, setUsuarioId] = useState(null)
    const [rubros, setRubros] = useState([])
    const [showCustom, setShowCustom] = useState(false)

    // Multimedia
    const [fotoPerfil, setFotoPerfil] = useState("")
    const [fotosPortafolio, setFotosPortafolio] = useState([])
    const [videoLinks, setVideoLinks] = useState(["", "", ""])

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        telefono: "",
        rubroId: "",
        rubroPersonalizado: "",
        descripcion: "",
        pais: "Argentina",
        provincia: "",
        ciudad: "",
        calle: "",
        numero: "",
        codigoPostal: "",
        dni: "",
        razonSocial: "",
        cuit: "",
        matricula: "",
        cvUrlPdf: "",
    })

    useEffect(() => {
        if (!window.cloudinary) {
            const script = document.createElement("script")
            script.src = "https://widget.cloudinary.com/v2.0/global/all.js"
            script.async = true
            document.body.appendChild(script)
        }
        if (step === 3 && rubros.length === 0) {
            fetchRubros()
        }
    }, [step])

    const fetchRubros = async () => {
        try {
            const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/rubros`)
            if (res.ok) setRubros(await res.json())
        } catch (e) {
            console.error("Error rubros", e)
        }
    }

    const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        color: "#1e293b",
        background: "#ffffff",
        iconColor: primaryColor,
    })

    const openCloudinary = (isMultiple) => {
        if (!window.cloudinary) return
        window.cloudinary
            .openUploadWidget(
                {
                    cloudName: cloudinaryCloudName,
                    uploadPreset: cloudinaryPreset,
                    multiple: isMultiple,
                    folder: isMultiple ? "pps_portfolio" : "pps_profiles",
                    clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                    maxFileSize: isMultiple ? 10000000 : 2000000,
                    language: "es",
                },
                (err, result) => {
                    if (!err && result && result.event === "success") {
                        if (isMultiple) {
                            setFotosPortafolio((prev) => [
                                ...prev,
                                result.info.secure_url,
                            ])
                            toast.fire({
                                icon: "success",
                                title: "Imagen agregada al portfolio",
                            })
                        } else {
                            setFotoPerfil(result.info.secure_url)
                            toast.fire({
                                icon: "success",
                                title: "Foto de perfil actualizada",
                            })
                        }
                    }
                }
            )
            .open()
    }

    const removeFoto = (index) => {
        setFotosPortafolio((prev) => prev.filter((_, i) => i !== index))
        toast.fire({ icon: "info", title: "Imagen eliminada" })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === "rubroId") {
            if (value === "OTRO") {
                setShowCustom(true)
                setFormData({ ...formData, rubroId: null })
            } else {
                setShowCustom(false)
                setFormData({
                    ...formData,
                    rubroId: value,
                    rubroPersonalizado: "",
                })
            }
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const submitCuentaBase = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(
                `${apiUrl.replace(/\/+$/, "")}/auth/registro`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        nombre: formData.nombre,
                        apellido: formData.apellido,
                        telefono: formData.telefono,
                    }),
                }
            )
            const data = await response.json()
            if (!response.ok)
                throw new Error(data.mensaje || "Error en el registro.")

            setUsuarioId(data.id || data.usuarioId)

            if (role === "CLIENTE") {
                Swal.fire({
                    title: "¡Bienvenido!",
                    text: "Tu cuenta ha sido creada con éxito.",
                    icon: "success",
                    confirmButtonColor: primaryColor,
                }).then(() => setSuccess(true))
            } else {
                setStep(3)
            }
        } catch (err) {
            setError(err.message)
            Swal.fire({
                title: "Opps...",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#ef4444",
            })
        } finally {
            setLoading(false)
        }
    }

    const submitFinal = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const endpoint = role === "PROVEEDOR" ? "proveedor" : "empresa"

        const payload = {
            ...formData,
            numero: parseInt(formData.numero) || 0,
            codigoPostal: parseInt(formData.codigoPostal) || 0,
            fotoPerfilUrl: fotoPerfil || null,
            logoUrl: role === "EMPRESA" ? fotoPerfil : null,
            fotosPortafolioUrls: fotosPortafolio,
            videoLinks: videoLinks.filter((l) => l.trim() !== ""),
        }

        try {
            const response = await fetch(
                `${apiUrl.replace(/\/+$/, "")}/perfiles/${endpoint}/${usuarioId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            )

            if (!response.ok)
                throw new Error(
                    (await response.json()).mensaje || "Error al crear perfil."
                )

            Swal.fire({
                title: "¡Perfil Creado!",
                text: "Ya sos parte de la comunidad PPS. ¡Muchos éxitos!",
                icon: "success",
                confirmButtonColor: primaryColor,
            }).then(() => setSuccess(true))
        } catch (err) {
            setError(err.message)
            Swal.fire({
                title: "Error de Perfil",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#ef4444",
            })
        } finally {
            setLoading(false)
        }
    }

    if (success)
        return (
            <div style={containerStyle}>
                <div
                    style={{
                        ...cardStyle(false),
                        backgroundColor: cardBg,
                        textAlign: "center",
                        padding: "40px",
                        borderRadius: `${borderRadius}px`,
                    }}
                >
                    <h2 style={{ color: "#10b981", fontSize: "40px" }}>✨</h2>
                    <h2 style={{ color: "#000" }}>
                        Todo listo, {formData.nombre}
                    </h2>
                    <p style={{ color: "#64748b", margin: "20px 0" }}>
                        Tu perfil ya es público. ¡Empezá a conectar ahora mismo!
                    </p>
                    <button
                        style={{
                            ...buttonStyle,
                            backgroundColor: primaryColor,
                        }}
                        onClick={() => window.location.reload()}
                    >
                        Ir al Panel de Control
                    </button>
                </div>
            </div>
        )

    return (
        <div style={containerStyle}>
            <div
                style={{
                    ...cardStyle(step >= 3),
                    backgroundColor: cardBg,
                    borderRadius: `${borderRadius}px`,
                }}
            >
                <div style={progressHeader}>
                    <div
                        style={{
                            color: primaryColor,
                            fontSize: "11px",
                            fontWeight: "bold",
                        }}
                    >
                        PASO {step} DE {role === "CLIENTE" || !role ? 2 : 4}
                    </div>
                    <div style={progressBar}>
                        <div
                            style={{
                                ...progressFill(primaryColor),
                                width: `${(step / (role === "CLIENTE" ? 2 : 4)) * 100}%`,
                            }}
                        ></div>
                    </div>
                </div>

                {step === 1 && (
                    <div style={fadeStyle}>
                        <h2 style={stepTitle}>
                            ¿Cómo querés usar la plataforma?
                        </h2>
                        <div
                            style={roleCard(role === "CLIENTE")}
                            onClick={() => {
                                setRole("CLIENTE")
                                setStep(2)
                            }}
                        >
                            <div style={roleIcon}>🤝</div>
                            <div style={{ flex: 1 }}>
                                <strong>Busco servicios</strong>
                                <p>
                                    Quiero contratar profesionales en mi zona.
                                </p>
                            </div>
                        </div>
                        <div
                            style={roleCard(role === "PROVEEDOR")}
                            onClick={() => {
                                setRole("PROVEEDOR")
                                setStep(2)
                            }}
                        >
                            <div style={roleIcon}>🛠️</div>
                            <div style={{ flex: 1 }}>
                                <strong>Soy profesional</strong>
                                <p>Quiero ofrecer mis servicios y crecer.</p>
                            </div>
                        </div>
                        <div
                            style={roleCard(role === "EMPRESA")}
                            onClick={() => {
                                setRole("EMPRESA")
                                setStep(2)
                            }}
                        >
                            <div style={roleIcon}>🏢</div>
                            <div style={{ flex: 1 }}>
                                <strong>Soy empresa</strong>
                                <p>Busco talentos para mis proyectos.</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={submitCuentaBase} style={fadeStyle}>
                        <h2 style={stepTitle}>Creá tu cuenta de acceso</h2>
                        <div style={gridRow(2)}>
                            <input
                                name="nombre"
                                placeholder="Nombre"
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                            <input
                                name="apellido"
                                placeholder="Apellido"
                                onChange={handleChange}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email (ej: usuario@gmail.com)"
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                        <input
                            name="telefono"
                            placeholder="WhatsApp (ej: 2923...)"
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Contraseña segura"
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...buttonStyle,
                                backgroundColor: primaryColor,
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading
                                ? "Confirmando datos..."
                                : "Siguiente paso"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div style={fadeStyle}>
                        <h2 style={stepTitle}>Tu Identidad Profesional</h2>
                        <div style={gridRow("180px 1fr")}>
                            <div style={identityCol}>
                                <div
                                    style={profileCircleLarge}
                                    onClick={() => openCloudinary(false)}
                                >
                                    {fotoPerfil ? (
                                        <img src={fotoPerfil} style={fullImg} />
                                    ) : (
                                        <span>📸</span>
                                    )}
                                    <div style={editBadge}>+</div>
                                </div>
                                <small style={helpText}>
                                    Subí tu mejor foto de{" "}
                                    {role === "EMPRESA" ? "logo" : "perfil"}
                                </small>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <select
                                    name="rubroId"
                                    onChange={handleChange}
                                    style={selectStyle}
                                    required
                                >
                                    <option value="">
                                        ¿A qué rubro te dedicás?
                                    </option>
                                    {rubros.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.nombre}
                                        </option>
                                    ))}
                                    <option value="OTRO">
                                        + Agregar otro rubro
                                    </option>
                                </select>
                                {showCustom && (
                                    <input
                                        name="rubroPersonalizado"
                                        placeholder="Escribí tu rubro..."
                                        onChange={handleChange}
                                        style={inputStyle}
                                        required
                                    />
                                )}
                                <div style={gridRow(2)}>
                                    {role === "PROVEEDOR" ? (
                                        <>
                                            {" "}
                                            <input
                                                name="dni"
                                                placeholder="DNI"
                                                onChange={handleChange}
                                                style={inputStyle}
                                                required
                                            />{" "}
                                            <input
                                                name="matricula"
                                                placeholder="Matrícula"
                                                onChange={handleChange}
                                                style={inputStyle}
                                            />{" "}
                                        </>
                                    ) : (
                                        <>
                                            {" "}
                                            <input
                                                name="razonSocial"
                                                placeholder="Nombre Empresa"
                                                onChange={handleChange}
                                                style={inputStyle}
                                                required
                                            />{" "}
                                            <input
                                                name="cuit"
                                                placeholder="CUIT"
                                                onChange={handleChange}
                                                style={inputStyle}
                                                required
                                            />{" "}
                                        </>
                                    )}
                                </div>
                                <textarea
                                    name="descripcion"
                                    placeholder="Contale a tus clientes quién sos y qué hacés mejor que nadie..."
                                    onChange={handleChange}
                                    style={textAreaStyle}
                                    required
                                />
                            </div>
                        </div>
                        <div style={addressBox}>
                            <h4 style={labelH}>
                                Ubicación para el mapa buscador
                            </h4>
                            <div style={gridRow("2fr 1fr 1fr")}>
                                <input
                                    name="calle"
                                    placeholder="Calle"
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                />
                                <input
                                    name="numero"
                                    placeholder="Altura"
                                    type="number"
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                />
                                <input
                                    name="codigoPostal"
                                    placeholder="CP"
                                    type="number"
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                            <div style={{ ...gridRow(2), marginTop: "8px" }}>
                                <input
                                    name="ciudad"
                                    placeholder="Ciudad"
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                />
                                <input
                                    name="provincia"
                                    placeholder="Provincia"
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(4)}
                            style={{
                                ...buttonStyle,
                                backgroundColor: primaryColor,
                            }}
                        >
                            Personalizar Portfolio
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <form onSubmit={submitFinal} style={fadeStyle}>
                        <h2 style={stepTitle}>Tu Galería de Trabajos</h2>
                        <p
                            style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginTop: "-10px",
                            }}
                        >
                            Subí fotos reales de tus trabajos para generar
                            confianza en tus clientes.{" "}
                            <strong>(Límite: 20 fotos)</strong>
                        </p>

                        <div style={portfolioGrid}>
                            <div
                                style={addMediaCard}
                                onClick={() => openCloudinary(true)}
                            >
                                <span style={{ fontSize: "24px" }}>➕</span>
                                <small style={{ fontWeight: "700" }}>
                                    Agregar
                                </small>
                            </div>
                            {fotosPortafolio.map((url, i) => (
                                <div key={i} style={mediaThumb}>
                                    <img src={url} style={fullImg} />
                                    <div
                                        style={removeBtn}
                                        onClick={() => removeFoto(i)}
                                    >
                                        ×
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "15px" }}>
                            <h4 style={labelH}>
                                Enlaces de Video (Youtube / Instagram / TikTok)
                            </h4>
                            <div style={gridRow(1)}>
                                {videoLinks.map((link, i) => (
                                    <input
                                        key={i}
                                        placeholder={`Ej: https://youtube.com/watch... (Opcional)`}
                                        value={link}
                                        onChange={(e) => {
                                            const nl = [...videoLinks]
                                            nl[i] = e.target.value
                                            setVideoLinks(nl)
                                        }}
                                        style={{
                                            ...inputStyle,
                                            marginBottom: "8px",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...buttonStyle,
                                backgroundColor: primaryColor,
                                marginTop: "15px",
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading
                                ? "Creando tu perfil profesional..."
                                : "Finalizar y publicar"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

// --- ESTILOS MEJORADOS (PREMIUM) ---
const containerStyle = {
    width: "100%",
    minHeight: "100%",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    boxSizing: "border-box",
}
const cardStyle = (wide) => ({
    width: "100%",
    maxWidth: wide ? "700px" : "460px",
    padding: "40px",
    background: "#fff",
    boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.12)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
})
const progressHeader = { marginBottom: "25px" }
const progressBar = {
    width: "100%",
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "10px",
    marginTop: "10px",
    overflow: "hidden",
}
const progressFill = (c) => ({
    height: "100%",
    background: c,
    transition: "width 0.6s ease",
})
const stepTitle = {
    fontSize: "24px",
    margin: "0 0 20px 0",
    color: "#0f172a",
    fontWeight: "900",
    letterSpacing: "-0.5px",
}
const fadeStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
}

const roleCard = (active) => ({
    padding: "24px",
    borderRadius: "20px",
    border: active ? "2.5px solid #7c3aed" : "2px solid #f1f5f9",
    background: active ? "#f5f3ff" : "#fff",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
})
const roleIcon = {
    fontSize: "32px",
    background: "#f8fafc",
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
}

const identityCol = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
}
const profileCircleLarge = {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    background: "#f8fafc",
    border: "3px dashed #cbd5e1",
    position: "relative",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    fontSize: "45px",
    transition: "0.3s",
}
const editBadge = {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    background: "#7c3aed",
    color: "#fff",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "bold",
    border: "3px solid #fff",
}
const helpText = {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "700",
    textAlign: "center",
}

const inputStyle = {
    padding: "14px 18px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    transition: "0.2s",
}
const selectStyle = { ...inputStyle, appearance: "auto" }
const textAreaStyle = { ...inputStyle, height: "110px", resize: "none" }
const buttonStyle = {
    padding: "18px",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
    color: "white",
    borderRadius: "16px",
    width: "100%",
    fontSize: "16px",
    boxShadow: "0 12px 20px -8px rgba(124, 58, 237, 0.5)",
    transition: "0.3s",
}
const errorStyle = {
    color: "#ef4444",
    fontSize: "13px",
    padding: "12px",
    background: "#fef2f2",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #fee2e2",
}
const gridRow = (t) => ({
    display: "grid",
    gridTemplateColumns: typeof t === "string" ? t : `repeat(${t}, 1fr)`,
    gap: "15px",
})
const labelH = {
    fontSize: "14px",
    color: "#1e293b",
    margin: "0 0 10px 0",
    fontWeight: "800",
}
const addressBox = {
    padding: "24px",
    background: "#f8fafc",
    borderRadius: "20px",
    border: "1.5px solid #e2e8f0",
}

const portfolioGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
    gap: "15px",
    marginTop: "12px",
}
const addMediaCard = {
    height: "90px",
    border: "2.5px dashed #cbd5e1",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    color: "#64748b",
    transition: "0.3s",
    background: "#f8fafc",
}
const mediaThumb = {
    height: "100px",
    borderRadius: "16px",
    overflow: "hidden",
    position: "relative",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
}
const fullImg = { width: "100%", height: "100%", objectFit: "cover" }
const removeBtn = {
    position: "absolute",
    top: "6px",
    right: "6px",
    background: "rgba(15, 23, 42, 0.8)",
    color: "#fff",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
}

addPropertyControls(WizardOnboarding, {
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://pps-sk7p.onrender.com/api/v1",
    },
    cloudinaryCloudName: {
        type: ControlType.String,
        title: "Cloud Name",
        defaultValue: "demo",
    },
    cloudinaryPreset: {
        type: ControlType.String,
        title: "Upload Preset",
        defaultValue: "unsigned_preset",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Acento",
        defaultValue: "#7c3aed",
    },
    cardBg: {
        type: ControlType.Color,
        title: "Fondo",
        defaultValue: "#ffffff",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Esquinas",
        defaultValue: 32,
    },
})
