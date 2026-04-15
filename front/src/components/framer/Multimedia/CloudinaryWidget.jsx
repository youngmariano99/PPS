import React, { useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * CLOUDINARY UPLOAD WIDGET - FRAMER COMPONENT
 * -------------------------------------------
 * Permite la subida directa desde el cliente a Cloudinary.
 * Devuelve la URL optimizada al formulario padre.
 */

export default function CloudinaryWidget(props) {
    const { 
        cloudName, 
        uploadPreset, 
        buttonText, 
        primaryColor, 
        onUpload, 
        isMultiple,
        folder
    } = props

    const widgetRef = useRef(null)

    useEffect(() => {
        // Cargar el script de Cloudinary dinámicamente si no existe
        if (!window.cloudinary) {
            const script = document.createElement("script")
            script.src = "https://widget.cloudinary.com/v2.0/global/all.js"
            script.type = "text/javascript"
            script.async = true
            document.body.appendChild(script)
        }
    }, [])

    const openWidget = () => {
        if (!window.cloudinary) {
            alert("Cargando servicios de imagen... Reintente en un segundo.")
            return
        }

        if (!widgetRef.current) {
            widgetRef.current = window.cloudinary.createUploadWidget(
                {
                    cloudName: cloudName,
                    uploadPreset: uploadPreset,
                    multiple: isMultiple,
                    folder: folder,
                    clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                    maxFileSize: 5000000, // 5MB
                    sources: ["local", "url", "camera"],
                    // Transformaciones automáticas para optimizar
                    transformation: [
                        { quality: "auto", fetch_format: "auto" }
                    ]
                },
                (error, result) => {
                    if (!error && result && result.event === "success") {
                        console.log("Respuesta Cloudinary:", result.info)
                        if (onUpload) {
                            onUpload(result.info.secure_url)
                        }
                    }
                }
            )
        }
        widgetRef.current.open()
    }

    return (
        <button 
            onClick={openWidget} 
            style={{ 
                ...buttonStyle, 
                backgroundColor: primaryColor 
            }}
        >
            {buttonText}
        </button>
    )
}

CloudinaryWidget.defaultProps = {
    cloudName: "demo",
    uploadPreset: "unsigned_preset",
    buttonText: "Subir Imagen",
    primaryColor: "#7c3aed",
    isMultiple: false,
    folder: "pps_profiles"
}

addPropertyControls(CloudinaryWidget, {
    cloudName: { type: ControlType.String, title: "Cloud Name" },
    uploadPreset: { type: ControlType.String, title: "Upload Preset" },
    buttonText: { type: ControlType.String, title: "Texto Botón" },
    primaryColor: { type: ControlType.Color, title: "Color Principal" },
    isMultiple: { type: ControlType.Boolean, title: "Múltiple" },
    folder: { type: ControlType.String, title: "Carpeta Cloudinary" },
})

const buttonStyle = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    fontSize: "14px"
}
