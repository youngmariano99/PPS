{
  "proyecto": "CHAMBA - Marketplace de Servicios",
  "personas": [
    {
      "id": "p1",
      "nombre": "Ana",
      "rol": "Cliente/Usuario"
    },
    {
      "id": "p2",
      "nombre": "Carlos",
      "rol": "Profesional Independiente"
    },
    {
      "id": "p3",
      "nombre": "TechCorp",
      "rol": "Empresa"
    },
    {
      "id": "p4",
      "nombre": "Admin",
      "rol": "Sistema / Stakeholder"
    }
  ],
  "releases": [
    {
      "id": "v1",
      "nombre": "MVP Core y Fricción Cero",
      "descripcion": "Infraestructura Base, Autenticación (Supabase/Wizard), Directorio Espacial (PostGIS), Geocoding y Contacto Seguro."
    },
    {
      "id": "v2",
      "nombre": "Monetización, Confianza y SEO",
      "descripcion": "Suscripciones Mercado Pago, Portafolio Cloudinary, Ranking Dinámico Premium, Reseñas Anti-Fraude y URLs Amigables."
    },
    {
      "id": "v3",
      "nombre": "Bolsa de Empleo y Transparencia",
      "descripcion": "Ofertas de Trabajo (Knockout Qs), CV Híbrido (JSONB) y Sistema de Postulaciones Anti-Soft Rejection."
    }
  ],
  "epics": [
    {
      "id": "e1",
      "nombre": "Cimientos, Seguridad e Identidad",
      "color": "#3B82F6",
      "features": [
        {
          "id": "f1_1",
          "nombre": "Infraestructura y Auth (Supabase)",
          "color": "#2563EB",
          "user_stories": [
            {
              "id": "us_setup",
              "titulo": "Como Admin quiero una base robusta (PostGIS, Swagger) para iniciar la API de forma segura.",
              "user": "Admin",
              "release_id": "v1",
              "prioridad": "Crítica",
              "bdd": "Dado que inicia el desarrollo, Cuando configuro Spring Boot, Entonces PostGIS, Swagger y manejo de excepciones quedan globales.",
              "criterios_aceptacion": ["Dialecto PostGIS habilitado", "Swagger con JWT Configurado"]
            },
            {
              "id": "us_auth",
              "titulo": "Como Carlos quiero registrarme y loguearme de forma segura para acceder al sistema.",
              "user": "Carlos",
              "release_id": "v1",
              "prioridad": "Crítica",
              "bdd": "Dado que descargo la app, Cuando me registro, Entonces Supabase Auth gestiona mis credenciales y recibo un JWT válido.",
              "criterios_aceptacion": ["Registro Supabase", "Validación Regex contraseñas"]
            }
          ]
        },
        {
          "id": "f1_2",
          "nombre": "Onboarding Premium y Recuperación",
          "color": "#1D4ED8",
          "user_stories": [
            {
              "id": "us_wizard",
              "titulo": "Como Carlos quiero completar mi perfil en pasos claros y de forma atómica.",
              "user": "Carlos",
              "release_id": "v1",
              "prioridad": "Alta",
              "bdd": "Dado que completo el Onboarding, Cuando hay un error en mis datos, Entonces el sistema revierte toda la operación (Todo o nada).",
              "criterios_aceptacion": ["UI Framer Multi-step", "Endpoint @Transactional"]
            },
            {
              "id": "us_pwd",
              "titulo": "Como Ana quiero poder recuperar mi contraseña vía email si la olvido.",
              "user": "Ana",
              "release_id": "v2",
              "prioridad": "Media",
              "bdd": "Dado que olvido mi contraseña, Cuando pido reset, Entonces recibo un correo SMTP asíncrono con el token de recuperación seguro.",
              "criterios_aceptacion": ["Gmail SMTP configurado", "Token de recuperación en UI"]
            }
          ]
        }
      ]
    },
    {
      "id": "e2",
      "nombre": "Directorio y Descubrimiento Espacial",
      "color": "#8B5CF6",
      "features": [
        {
          "id": "f2_1",
          "nombre": "Catálogo y Geocoding",
          "color": "#7C3AED",
          "user_stories": [
            {
              "id": "us_rubros",
              "titulo": "Como Carlos quiero asociar mi perfil a un Rubro para que me encuentren fácilmente.",
              "user": "Carlos",
              "release_id": "v1",
              "prioridad": "Crítica",
              "bdd": "Dado que elijo mi profesión, Cuando busco, Entonces veo un catálogo semilla inicial de oficios.",
              "criterios_aceptacion": ["Seeds de Rubros implementados"]
            },
            {
              "id": "us_geocoding",
              "titulo": "Como Carlos quiero poner mi dirección y que el sistema detecte mis coordenadas.",
              "user": "Carlos",
              "release_id": "v1",
              "prioridad": "Crítica",
              "bdd": "Dado que ingreso Calle y Ciudad, Cuando guardo, Entonces Nominatim traduce esto a un Point PostGIS (SRID 4326).",
              "criterios_aceptacion": ["Integración RestClient Nominatim"]
            }
          ]
        },
        {
          "id": "f2_2",
          "nombre": "Mapa Interactivo, CQS y SEO",
          "color": "#6D28D9",
          "user_stories": [
            {
              "id": "us_mapa",
              "titulo": "Como Ana quiero buscar profesionales a <50km sin tiempos de carga lentos.",
              "user": "Ana",
              "release_id": "v1",
              "prioridad": "Crítica",
              "bdd": "Dado que abro el mapa, Cuando busca 'Plomero', Entonces ST_DWithin devuelve la data <200ms sin colapsar memoria.",
              "criterios_aceptacion": ["Hard cap 50km", "EntityGraphs aplicados para evadir N+1"]
            },
            {
              "id": "us_buscador",
              "titulo": "Como Ana quiero un buscador textual masivo para encontrar a alguien por nombre.",
              "user": "Ana",
              "release_id": "v1",
              "prioridad": "Alta",
              "bdd": "Dado que tipeo un nombre sin tildes, Cuando doy enter, Entonces el buscador global me retorna la página correcta.",
              "criterios_aceptacion": ["Paginación Pageable", "Tolerancia ortográfica"]
            },
            {
              "id": "us_seo",
              "titulo": "Como Carlos quiero un enlace de perfil estético (Slug) en vez de un código largo.",
              "user": "Carlos",
              "release_id": "v2",
              "prioridad": "Alta",
              "bdd": "Dado que comparto mi perfil, Cuando Ana lo abre, Entonces la URL es amigable (/p/carlos-perez).",
              "criterios_aceptacion": ["Slugs dinámicos autogenerados"]
            }
          ]
        }
      ]
    },
    {
      "id": "e3",
      "nombre": "Monetización, Ranking y Portafolio",
      "color": "#F59E0B",
      "features": [
        {
          "id": "f3_1",
          "nombre": "Pagos MP y Ranking Dinámico",
          "color": "#D97706",
          "user_stories": [
            {
              "id": "us_mp",
              "titulo": "Como Carlos quiero pagar una suscripción Premium con Mercado Pago.",
              "user": "Carlos",
              "release_id": "v2",
              "prioridad": "Alta",
              "bdd": "Dado que selecciono un plan en UI, Cuando pago, Entonces un Webhook sincroniza asíncronamente mi estado ACTIVO.",
              "criterios_aceptacion": ["Sandbox SDK Integrado", "Webhooks HMAC validados"]
            },
            {
              "id": "us_ranking",
              "titulo": "Como Carlos quiero salir primero en las búsquedas si tengo suscripción Activa.",
              "user": "Carlos",
              "release_id": "v2",
              "prioridad": "Alta",
              "bdd": "Dado que mi suscripción es Premium, Cuando un cliente busca, Entonces encabezo el listado ignorando distancia.",
              "criterios_aceptacion": ["Algoritmo: Premium -> Estrellas -> Distancia"]
            }
          ]
        },
        {
          "id": "f3_2",
          "nombre": "Multimedia en Cloudinary",
          "color": "#B45309",
          "user_stories": [
            {
              "id": "us_cloud",
              "titulo": "Como Carlos quiero subir mi portafolio multimedia y mantener mis recursos al alcance.",
              "user": "Carlos",
              "release_id": "v2",
              "prioridad": "Alta",
              "bdd": "Dado que uso Cloudinary, Cuando cancelo mi plan, Entonces no borran mis fotos sino que el sistema aplica un 'Graceful Downgrade' (Límite visual de 5).",
              "criterios_aceptacion": ["Integración cloudinary-http44", "Filtrado condicional en la respuesta API"]
            }
          ]
        }
      ]
    },
    {
      "id": "e4",
      "nombre": "Privacidad, Reseñas y Confianza",
      "color": "#10B981",
      "features": [
        {
          "id": "f4_1",
          "nombre": "Anti-Scraping (Secure Reveal)",
          "color": "#059669",
          "user_stories": [
            {
              "id": "us_reveal",
              "titulo": "Como Carlos quiero que mi teléfono esté oculto de bots y scraping.",
              "user": "Carlos",
              "release_id": "v1",
              "prioridad": "Crítica",
              "bdd": "Dado que mi perfil es público, Cuando se carga, Entonces la API ofusca el número hasta que se registre una Intención de Contacto.",
              "criterios_aceptacion": ["Tabla intenciones_contacto funcional"]
            }
          ]
        },
        {
          "id": "f4_2",
          "nombre": "Prestige V2 y Anti-Fraude",
          "color": "#047857",
          "user_stories": [
            {
              "id": "us_resenas",
              "titulo": "Como Ana quiero calificar el servicio para construir reputación real.",
              "user": "Ana",
              "release_id": "v2",
              "prioridad": "Alta",
              "bdd": "Dado que el contacto terminó, Cuando dejo estrellas, Entonces el sistema actualiza el ranking dinámico del profesional.",
              "criterios_aceptacion": ["Reseñas Duales soportadas"]
            },
            {
              "id": "us_cooldown",
              "titulo": "Como Admin quiero evitar el spam masivo de reseñas al mismo perfil.",
              "user": "Admin",
              "release_id": "v2",
              "prioridad": "Alta",
              "bdd": "Dado un proveedor, Cuando Ana lo reseña dos veces el mismo día, Entonces un DB Trigger rechaza la operación por Cooldown 24hs.",
              "criterios_aceptacion": ["Trigger BEFORE INSERT implementado"]
            }
          ]
        }
      ]
    },
    {
      "id": "e5",
      "nombre": "Bolsa de Empleo y Transparencia",
      "color": "#EF4444",
      "features": [
        {
          "id": "f5_1",
          "nombre": "Ofertas Excluyentes y CV Híbrido",
          "color": "#DC2626",
          "user_stories": [
            {
              "id": "us_ofertas",
              "titulo": "Como TechCorp quiero publicar ofertas con Preguntas Excluyentes (Knockout Qs).",
              "user": "TechCorp",
              "release_id": "v3",
              "prioridad": "Alta",
              "bdd": "Dado que necesito empleados, Cuando publico oferta, Entonces le obligo al candidato a responder ciertas preguntas clave.",
              "criterios_aceptacion": ["Inserción en cascada implementada"]
            },
            {
              "id": "us_cv",
              "titulo": "Como Carlos quiero armar un currículum dinámico in-app.",
              "user": "Carlos",
              "release_id": "v3",
              "prioridad": "Alta",
              "bdd": "Dado que lleno mi experiencia y estudios, Cuando guardo, Entonces se guarda en formato JSONB para tener escalabilidad y mutabilidad futura.",
              "criterios_aceptacion": ["Columna JSONB para CV nativo"]
            }
          ]
        },
        {
          "id": "f5_2",
          "nombre": "Anti Soft-Rejection",
          "color": "#B91C1C",
          "user_stories": [
            {
              "id": "us_agujero",
              "titulo": "Como Carlos quiero dejar de ser ignorado (Agujero Negro) si me rechazan.",
              "user": "Carlos",
              "release_id": "v3",
              "prioridad": "Crítica",
              "bdd": "Dado que postulé a la empresa, Cuando TechCorp me pasa a DESCARTADO, Entonces la base de datos lo obliga a asignar un 'código de motivo'.",
              "criterios_aceptacion": ["Motivo obligatorio en BD", "Notificación asíncrona"]
            }
          ]
        }
      ]
    }
  ]
}
