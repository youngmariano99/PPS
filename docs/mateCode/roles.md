{
  "roles": [
    {
      "name": "Cliente",
      "description": "Usuario estándar que busca servicios locales, contacta profesionales y deja reseñas tras un servicio."
    },
    {
      "name": "Profesional",
      "description": "Profesional independiente o trabajador de oficio que ofrece sus servicios, gestiona su portafolio y se postula a ofertas de empleo."
    },
    {
      "name": "Empresa",
      "description": "Entidad jurídica que busca contratar profesionales, publica ofertas de empleo formales y gestiona el flujo de postulaciones."
    }
  ],
  "permission_matrix": [
    {
      "modulo": "Directorio y Búsqueda",
      "permiso": "Buscar profesionales mediante geolocalización (PostGIS)",
      "Cliente": "SÍ",
      "Profesional": "SÍ",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Directorio y Búsqueda",
      "permiso": "Aparecer destacado en los primeros resultados (Requiere Plan Premium)",
      "Cliente": "NO",
      "Profesional": "SÍ",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Privacidad e Interacción",
      "permiso": "Revelar teléfono y dirección exacta ofuscada (Secure Reveal)",
      "Cliente": "SÍ",
      "Profesional": "SÍ",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Reputación (Prestige V2)",
      "permiso": "Dejar calificación y reseña (tras registrar intención de contacto)",
      "Cliente": "SÍ",
      "Profesional": "NO",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Reputación (Prestige V2)",
      "permiso": "Responder públicamente a una reseña recibida en su perfil",
      "Cliente": "NO",
      "Profesional": "SÍ",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Reputación (Anti-Fraude)",
      "permiso": "Dejar múltiples reseñas al mismo proveedor en menos de 24hs (Evadir Cooldown)",
      "Cliente": "NO",
      "Profesional": "NO",
      "Empresa": "NO"
    },
    {
      "modulo": "Suscripciones y Pagos",
      "permiso": "Adquirir o cancelar plan de suscripción Premium (Mercado Pago)",
      "Cliente": "NO",
      "Profesional": "SÍ",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Gestión Multimedia",
      "permiso": "Subir imágenes y documentos al portafolio (Cloudinary)",
      "Cliente": "NO",
      "Profesional": "SÍ",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Gestión Multimedia",
      "permiso": "Mostrar más de 5 elementos en el portafolio público (Límite Gratuito)",
      "Cliente": "NO",
      "Profesional": "SÍ",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Bolsa de Empleo",
      "permiso": "Publicar ofertas laborales con salario y modalidad",
      "Cliente": "NO",
      "Profesional": "NO",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Bolsa de Empleo",
      "permiso": "Añadir preguntas de filtro excluyentes (Knockout Questions) a una oferta",
      "Cliente": "NO",
      "Profesional": "NO",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Postulaciones",
      "permiso": "Postularse a una oferta adjuntando Currículum Nativo (JSONB)",
      "Cliente": "NO",
      "Profesional": "SÍ",
      "Empresa": "NO"
    },
    {
      "modulo": "Postulaciones",
      "permiso": "Visualizar CVs y cambiar estado de postulantes (Enviado a Visto, etc.)",
      "Cliente": "NO",
      "Profesional": "NO",
      "Empresa": "SÍ"
    },
    {
      "modulo": "Postulaciones (Anti-Agujero Negro)",
      "permiso": "Descartar un candidato en silencio sin proveer un código de motivo (Soft Rejection)",
      "Cliente": "NO",
      "Profesional": "NO",
      "Empresa": "NO"
    }
  ]
}
