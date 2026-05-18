{
  "sprint_recomendado_dias": 14,
  "tickets": [
    {
      "origen_historia_id": "us_setup",
      "titulo_tecnico": "Backend/DB: Inicialización de Repositorio, PostgreSQL y PostGIS",
      "prioridad_release": "MVP",
      "epic_tag": "Cimientos, Seguridad e Identidad",
      "criterios_aceptacion": [
        "Proyecto Spring Boot 3.4.4 inicializado con dependencias Web, JPA, Security",
        "Conexión exitosa a Supabase PostgreSQL",
        "Habilitación de la extensión espacial PostGIS y configuración del dialecto de Hibernate"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Ejecutar CREATE EXTENSION postgis;" },
        { "capa": "Backend", "detalle": "Configurar pom.xml (hibernate-spatial) y application.yml" }
      ]
    },
    {
      "origen_historia_id": "us_setup",
      "titulo_tecnico": "Backend: Excepciones Globales y Documentación Swagger",
      "prioridad_release": "MVP",
      "epic_tag": "Cimientos, Seguridad e Identidad",
      "criterios_aceptacion": [
        "Implementar @RestControllerAdvice para manejar respuestas HTTP estandarizadas",
        "Configurar Swagger OpenAPI 3.0 con soporte de token Bearer",
        "Documentar endpoints iniciales para ser consumidos por el Frontend"
      ],
      "tareas_tecnicas": [
        { "capa": "Backend", "detalle": "Crear ManejadorGlobalExcepciones, ErrorRespuestaDto y OpenApiConfig" }
      ]
    },
    {
      "origen_historia_id": "us_auth",
      "titulo_tecnico": "Backend: Modelo de Usuarios e Integración Supabase Auth",
      "prioridad_release": "MVP",
      "epic_tag": "Cimientos, Seguridad e Identidad",
      "criterios_aceptacion": [
        "Crear entidad Usuario con UUID idéntico al de GoTrue (Supabase Auth)",
        "Validación estricta de fortaleza de contraseñas (Regex de negocio)",
        "Crear AuthController con endpoints de registro /api/v1/auth/registro"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear tabla usuarios" },
        { "capa": "Backend", "detalle": "Desarrollar SupabaseAuthAdapter y AuthService" }
      ]
    },
    {
      "origen_historia_id": "us_auth",
      "titulo_tecnico": "Backend: Login y Autenticación JWT (Spring Security)",
      "prioridad_release": "MVP",
      "epic_tag": "Cimientos, Seguridad e Identidad",
      "criterios_aceptacion": [
        "Endpoint /api/v1/auth/login devuelve un token JWT válido",
        "Spring Security filtra las peticiones asegurando endpoints protegidos",
        "Manejo de CORS para permitir peticiones desde Framer"
      ],
      "tareas_tecnicas": [
        { "capa": "Backend", "detalle": "Configurar SecurityConfig, JwtAuthFilter y CorsConfigurationSource" }
      ]
    },
    {
      "origen_historia_id": "us_rubros",
      "titulo_tecnico": "DB/Backend: Modelo de Datos de Rubros y API (Catálogo Maestro)",
      "prioridad_release": "MVP",
      "epic_tag": "Directorio y Descubrimiento Espacial",
      "criterios_aceptacion": [
        "Los perfiles deben poder asociarse a un Rubro predefinido",
        "El Frontend debe poder consultar la lista de rubros activos"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear tabla rubros e insertar seeds básicos (Plomería, Electricidad, etc.)" },
        { "capa": "Backend", "detalle": "Implementar RubroController con GET /api/v1/rubros" }
      ]
    },
    {
      "origen_historia_id": "us_wizard",
      "titulo_tecnico": "Backend: Gestión CRUD de Perfiles (Proveedor y Empresa)",
      "prioridad_release": "MVP",
      "epic_tag": "Cimientos, Seguridad e Identidad",
      "criterios_aceptacion": [
        "Usuarios pueden elegir ser Proveedor Independiente o Empresa",
        "Los perfiles tienen relación 1:1 con Usuario y guardan DNI/CUIT",
        "Validaciones de negocio para evitar que un usuario tenga múltiples perfiles"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear tablas perfiles_proveedor y perfiles_empresa" },
        { "capa": "Backend", "detalle": "Implementar IPerfilFactory y Casos de Uso para Gestionar Perfiles" }
      ]
    },
    {
      "origen_historia_id": "us_geocoding",
      "titulo_tecnico": "Backend: Integración Geocoding con Nominatim",
      "prioridad_release": "MVP",
      "epic_tag": "Directorio y Descubrimiento Espacial",
      "criterios_aceptacion": [
        "Al guardar un perfil, la API debe tomar Calle, Número y Ciudad y convertirlos a latitud/longitud",
        "El punto se debe persistir en formato PostGIS (Point, SRID 4326)"
      ],
      "tareas_tecnicas": [
        { "capa": "Backend", "detalle": "Crear GeocodingService usando RestClient contra la API de OpenStreetMap Nominatim" }
      ]
    },
    {
      "origen_historia_id": "us_wizard",
      "titulo_tecnico": "Frontend/Backend: Onboarding Wizard Premium y Registro Atómico",
      "prioridad_release": "MVP",
      "epic_tag": "Cimientos, Seguridad e Identidad",
      "criterios_aceptacion": [
        "UI interactiva en Framer con pasos (Credenciales, Perfil, Dirección)",
        "Transaccionalidad en DB: si falla la creación del perfil, se revierte el usuario"
      ],
      "tareas_tecnicas": [
        { "capa": "Frontend", "detalle": "Desarrollar componente RegirstroFormWizard.jsx (Framer/React)" },
        { "capa": "Backend", "detalle": "Desarrollar endpoint /auth/registro-completo con @Transactional" }
      ]
    },
    {
      "origen_historia_id": "us_mapa",
      "titulo_tecnico": "Backend: Motor Geospacial PostGIS (CQS y Solución N+1)",
      "prioridad_release": "MVP",
      "epic_tag": "Directorio y Descubrimiento Espacial",
      "criterios_aceptacion": [
        "Búsquedas geolocalizadas usando ST_DWithin (Radio en metros) en < 200ms",
        "Hard Cap de 50km máximo de búsqueda",
        "Ausencia de latencia por consultas N+1 (Uso de EntityGraph)"
      ],
      "tareas_tecnicas": [
        { "capa": "Backend", "detalle": "Implementar endpoints /buscar/mapa y /buscar/lista (CQS) en DirectorioController" }
      ]
    },
    {
      "origen_historia_id": "us_buscador",
      "titulo_tecnico": "Frontend: Componente Mapa Interactivo y Buscador Global",
      "prioridad_release": "MVP",
      "epic_tag": "Directorio y Descubrimiento Espacial",
      "criterios_aceptacion": [
        "Integración de mapa usando Pigeon Maps (React)",
        "Buscador textual que soporte nombre, rubro o ciudad con tolerancia a errores"
      ],
      "tareas_tecnicas": [
        { "capa": "Frontend", "detalle": "Desarrollar BuscadorMapa.jsx y ListadoProfesionales.jsx integrando paginación" }
      ]
    },
    {
      "origen_historia_id": "us_mp",
      "titulo_tecnico": "Backend: Integración Mercado Pago SDK (Planes Premium)",
      "prioridad_release": "Escala",
      "epic_tag": "Monetización, Ranking y Portafolio",
      "criterios_aceptacion": [
        "Sincronizar el estado de los planes de suscripción (ACTIVA/INACTIVA)",
        "Procesar Webhooks de MP como única fuente de la verdad para actualizar cuentas"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear planes_suscripcion y suscripciones_usuario" },
        { "capa": "Backend", "detalle": "Implementar SuscripcionController, MercadoPagoService y validación HMAC" }
      ]
    },
    {
      "origen_historia_id": "us_mp",
      "titulo_tecnico": "Frontend: Botón Suscripción Pro y Pricing UI",
      "prioridad_release": "Escala",
      "epic_tag": "Monetización, Ranking y Portafolio",
      "criterios_aceptacion": [
        "Componente estético (Glassmorphism) para ofrecer los planes de suscripción",
        "Abre el checkout nativo de Mercado Pago de forma delegada"
      ],
      "tareas_tecnicas": [
        { "capa": "Frontend", "detalle": "Desarrollar componente BotonSuscripcionPro.tsx para Framer" }
      ]
    },
    {
      "origen_historia_id": "us_cloud",
      "titulo_tecnico": "Backend: Integración Cloudinary y Límite Gratuito (Portafolio)",
      "prioridad_release": "MVP",
      "epic_tag": "Monetización, Ranking y Portafolio",
      "criterios_aceptacion": [
        "Carga de recursos delegada a Cloudinary",
        "Límite estricto devuelto por API: Máx 5 fotos si no tiene suscripción Premium",
        "Filtrado condicional aplicado sin eliminar los registros base (Graceful Downgrade)"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear tabla portafolios" },
        { "capa": "Backend", "detalle": "Implementar PortafolioController, CloudinaryConfig y validaciones en la capa DTO" }
      ]
    },
    {
      "origen_historia_id": "us_seo",
      "titulo_tecnico": "Backend/Frontend: SEO Slugs y Componente de Perfil Público",
      "prioridad_release": "MVP",
      "epic_tag": "Directorio y Descubrimiento Espacial",
      "criterios_aceptacion": [
        "Las URLs del Frontend utilizan un Slug autogenerado en lugar de UUIDs crudos",
        "Página de perfil muestra toda la data y galería (ListadoProfesionalesChamba.jsx)"
      ],
      "tareas_tecnicas": [
        { "capa": "Backend", "detalle": "Generar y guardar slugs en BD basados en nombre, apellido y rubro" },
        { "capa": "Frontend", "detalle": "Ajustar rutas dinámicas en Framer a /p/{slug}" }
      ]
    },
    {
      "origen_historia_id": "us_reveal",
      "titulo_tecnico": "Backend/Frontend: Secure Reveal y Logs de Intención de Contacto",
      "prioridad_release": "MVP",
      "epic_tag": "Privacidad, Reseñas y Confianza",
      "criterios_aceptacion": [
        "La API de perfil ofusca teléfono y dirección",
        "El botón 'Contactar' del Frontend realiza petición de log y revela la información real",
        "Evita vulnerabilidades de scraping DOM"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear tabla intenciones_contacto" },
        { "capa": "Frontend", "detalle": "Crear componente de contacto con estado Oculto/Revelado" }
      ]
    },
    {
      "origen_historia_id": "us_cooldown",
      "titulo_tecnico": "Backend/DB: Reseñas, Cooldown 24hs (Prestige V2) y Bloqueo Fraude",
      "prioridad_release": "Escala",
      "epic_tag": "Privacidad, Reseñas y Confianza",
      "criterios_aceptacion": [
        "Endpoint para calificar y dejar comentarios a perfiles de proveedores",
        "El Trigger relacional debe impedir una segunda reseña al mismo proveedor en <24hs",
        "Soporte dual: Reseña libre vs 'Trabajo Verificado'"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear tabla resenas y programar trigger validar_cooldown_resena" },
        { "capa": "Backend", "detalle": "Capturar DataIntegrityViolation generada por PostgreSQL y enviar Error 429 al cliente" }
      ]
    },
    {
      "origen_historia_id": "us_ranking",
      "titulo_tecnico": "Backend: Algoritmo Dinámico de Ranking Premium First",
      "prioridad_release": "Escala",
      "epic_tag": "Monetización, Ranking y Portafolio",
      "criterios_aceptacion": [
        "Las búsquedas geográficas deben ordernar primero a aquellos con suscripción Activa",
        "Orden de cascada: Premium -> Calidad de reseñas -> Distancia"
      ],
      "tareas_tecnicas": [
        { "capa": "Backend", "detalle": "Modificar el cruce JPQL / SQL de DirectorioService integrando la tabla suscripciones_usuario" }
      ]
    },
    {
      "origen_historia_id": "us_pwd",
      "titulo_tecnico": "Backend/Frontend: Gmail SMTP y Recuperación de Password",
      "prioridad_release": "Mejora",
      "epic_tag": "Cimientos, Seguridad e Identidad",
      "criterios_aceptacion": [
        "Sistema asíncrono de envío de correos usando variables spring.mail.*",
        "Flujo completo desde el frontend para pedir reset e inyectar el nuevo password"
      ],
      "tareas_tecnicas": [
        { "capa": "Backend", "detalle": "Endpoints de password-reset en AuthController" },
        { "capa": "Frontend", "detalle": "Gestión de recuperación y parseo del token hash en la URL de Supabase" }
      ]
    },
    {
      "origen_historia_id": "us_ofertas",
      "titulo_tecnico": "DB/Backend: Publicación de Ofertas y Knockout Questions",
      "prioridad_release": "Mejora",
      "epic_tag": "Bolsa de Empleo y Transparencia",
      "criterios_aceptacion": [
        "Las Empresas pueden publicar ofertas con rango salarial y modalidades (Híbrido/Remoto)",
        "Incorporación de preguntas excluyentes para pre-filtro de candidatos"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Diseñar esquemas para ofertas_empleo y preguntas_filtro_oferta" },
        { "capa": "Backend", "detalle": "Endpoints CRUD en OfertaController" }
      ]
    },
    {
      "origen_historia_id": "us_cv",
      "titulo_tecnico": "DB/Backend: Currículums Nativos JSONB y Postulaciones",
      "prioridad_release": "Mejora",
      "epic_tag": "Bolsa de Empleo y Transparencia",
      "criterios_aceptacion": [
        "Los perfiles pueden cargar historial híbrido (JSONB) para tener flexibilidad",
        "Endpoint de postulación con respuestas a las Knockout Questions"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Crear tabla curriculums_nativos (educacion, experiencia, JSONB) y postulaciones" },
        { "capa": "Backend", "detalle": "Capa de servicio de validación de perfil activo antes de postular" }
      ]
    },
    {
      "origen_historia_id": "us_agujero",
      "titulo_tecnico": "Backend: Lógica Anti Soft-Rejection (Descarte con motivo)",
      "prioridad_release": "Mejora",
      "epic_tag": "Bolsa de Empleo y Transparencia",
      "criterios_aceptacion": [
        "Si una empresa cambia una postulación a 'DESCARTADO', debe inyectar el código de motivo",
        "Bloqueo y rechazo a nivel transaccional (ValidacionNegocioException) si incumple regla"
      ],
      "tareas_tecnicas": [
        { "capa": "DB", "detalle": "Constraint condicional en motivo_rechazo_codigo" },
        { "capa": "Backend", "detalle": "Notificación instantánea generada al candidato" }
      ]
    }
  ]
}