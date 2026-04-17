import React from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { LogOut, RefreshCw } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * BOTÓN DE CIERRE DE SESIÓN PPS (ROBUSTO)
 * --------------------------------------
 * - Limpia caché y localStorage de Supabase.
 * - Redirige al login y fuerza recarga total.
 * - Estética premium integrada.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function LogoutButton(props) {
    const { 
        loginUrl, buttonText, primaryColor, 
        textColor, borderRadius, fontSize, showIcon 
    } = props

    const handleLogout = async () => {
        try {
            console.log("LogoutButton: Clearing session and storage...")
            
            // 1. Sign out oficial
            await supabase.auth.signOut()
            
            // 2. Limpieza agresiva de todas las llaves de Supabase en el navegador
            Object.keys(localStorage).forEach(key => {
                if (key.includes("supabase") || key.includes("sb-")) {
                    localStorage.removeItem(key)
                }
            })

            // 3. Redirección forzada
            window.location.href = loginUrl
            
            // 4. Fallback de recarga si la redirección tarda
            setTimeout(() => {
                window.location.reload()
            }, 300)

        } catch (error) {
            console.error("LogoutButton: Error during logout:", error)
        }
    }

    const style = {
        width: "100%",
        height: "38px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        backgroundColor: primaryColor,
        color: textColor,
        fontSize: "13px",
        fontWeight: "700",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        padding: "0 22px",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 4px 10px rgba(220, 38, 38, 0.1)",
        transition: "all 0.2s ease"
    }

    return (
        <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "#ef4444" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            style={style}
        >
            {showIcon && <LogOut size={18} />}
            <span>{buttonText}</span>
        </motion.button>
    )
}

addPropertyControls(LogoutButton, {
    loginUrl: { type: ControlType.String, title: "Login URL", defaultValue: "https://overly-mindset-259417.framer.app/login" },
    buttonText: { type: ControlType.String, title: "Texto Botón", defaultValue: "Cerrar mi sesión" },
    primaryColor: { type: ControlType.Color, title: "Color Botón", defaultValue: "#dc2626" },
    textColor: { type: ControlType.Color, title: "Color Texto", defaultValue: "#ffffff" },
    borderRadius: { type: ControlType.Number, title: "Radio Borde", defaultValue: 16, min: 0, max: 40 },
    fontSize: { type: ControlType.Number, title: "Tamaño Fuente", defaultValue: 14, min: 10, max: 24 },
    showIcon: { type: ControlType.Boolean, title: "Mostrar Icono", defaultValue: true },
})
