import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { UserPlus } from "lucide-react"

// Importación para Framer
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

/**
 * BOTÓN DE REGISTRO PPS (DINÁMICO)
 * -------------------------------
 * - Desaparece automáticamente si el usuario ya tiene sesión iniciada.
 * - Redirige a la sección de registro general.
 * - Estética premium integrada con el navbar.
 */

const SUPABASE_URL = "https://qlciljbuexklxjzxgitk.supabase.co"
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps"
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default function AuthRegisterBTN(props) {
    const {
        registerUrl,
        buttonText,
        primaryColor,
        textColor,
        fontSize,
        borderRadius,
        paddingX,
        showIcon,
    } = props

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
            setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsLoggedIn(!!session)
        })

        checkAuth()
        return () => subscription.unsubscribe()
    }, [])

    const handleClick = () => {
        window.location.href = registerUrl
    }

    const style = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: primaryColor,
        color: textColor,
        fontSize: `${fontSize}px`,
        fontWeight: "600",
        borderRadius: `${borderRadius}px`,
        padding: `0 ${paddingX}px`,
        border: "none",
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        height: "32px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        whiteSpace: "nowrap",
    }

    if (loading || isLoggedIn) return null

    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
                style={style}
            >
                {showIcon && <UserPlus size={fontSize + 2} />}
                <span>{buttonText}</span>
            </motion.button>
        </AnimatePresence>
    )
}

addPropertyControls(AuthRegisterBTN, {
    registerUrl: {
        type: ControlType.String,
        title: "Register URL",
        defaultValue: "https://overly-mindset-259417.framer.app/registro-general",
    },
    buttonText: {
        type: ControlType.String,
        title: "Texto Botón",
        defaultValue: "Registrarme",
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Color Fondo",
        defaultValue: "#7c3aed",
    },
    textColor: {
        type: ControlType.Color,
        title: "Color Texto",
        defaultValue: "#ffffff",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Tamaño Fuente",
        defaultValue: 13,
        min: 10,
        max: 20,
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radio Borde",
        defaultValue: 8,
        min: 0,
        max: 40,
    },
    paddingX: {
        type: ControlType.Number,
        title: "Padding X",
        defaultValue: 16,
        min: 4,
        max: 40,
    },
    showIcon: {
        type: ControlType.Boolean,
        title: "Mostrar Icono",
        defaultValue: true,
    },
})
