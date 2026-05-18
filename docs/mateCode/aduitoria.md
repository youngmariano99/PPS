Actúa como Product Manager Senior. Para el proyecto "Proyecto", responde este cuestionario técnico.

PREGUNTAS:
- ¿Cuál es el dolor, fricción o problema principal que estamos intentando resolver? (REF_ID: definicion_problema##0)
- ¿Por qué este problema vale la pena ser resuelto ahora? (REF_ID: definicion_problema##1)
- En una oración, ¿cuál es nuestra propuesta de valor (la solución)? (REF_ID: definicion_problema##2)
- ¿Qué impacto directo y positivo esperamos generar en la vida o el trabajo de los usuarios? (REF_ID: mapa_impacto##3)
- ¿Cómo beneficia esto al negocio a corto y largo plazo (estrategia de monetización, retención, imagen de marca)? (REF_ID: mapa_impacto##4)
- ¿Cuál es el riesgo o el costo de no hacer este proyecto? (REF_ID: mapa_impacto##5)
- ¿Quiénes son los usuarios finales que van a interactuar con el sistema (roles o arquetipos)? (REF_ID: usuarios_contexto##6)
- ¿En qué contexto físico y mental van a usar la aplicación (ej. en la calle apurados desde el celular, sentados tranquilos en una oficina, con mala conexión a internet)? (REF_ID: usuarios_contexto##7)
- ¿Qué nivel de conocimiento técnico o alfabetización digital tienen estos usuarios? (REF_ID: usuarios_contexto##8)
- ¿Cómo resuelven los usuarios este problema hoy en día sin nuestra aplicación (ej. papel y lápiz, Excel, grupos de WhatsApp)? (REF_ID: procesos_actuales##9)
- A grandes rasgos, ¿cómo va a ser el nuevo "camino feliz" (flujo principal) del usuario una vez que use nuestra plataforma? (REF_ID: procesos_actuales##10)
- Sin pensar en código, ¿cuáles son los "conceptos" u "objetos" principales que maneja este negocio (ej. Turnos, Pacientes, Facturas, Vehículos)? (REF_ID: entidades_clave##11)
- ¿Existen datos críticos o sensibles que requieran un tratamiento especial de seguridad? (REF_ID: entidades_clave##12)
- Éxito de Negocio/Producto: ¿Qué números nos van a indicar que la gente realmente usa y valora esto (ej. cantidad de registros, porcentaje de conversión, usuarios activos diarios)? (REF_ID: kpis##13)
- Éxito Técnico: ¿Qué métricas de rendimiento son innegociables para considerar que el sistema funciona bien (ej. tiempos de carga menores a X segundos, soporte para X usuarios concurrentes)? (REF_ID: kpis##14)
- Técnicas: ¿Hay alguna tecnología obligatoria a usar, o alguna limitación de infraestructura que debamos conocer de antemano? (REF_ID: restricciones##15)
- De Tiempo/Legales: ¿Existen fechas límite inamovibles (ej. salir a producción antes de Navidad) o normativas legales que cumplir sí o sí? (REF_ID: restricciones##16)
- ¿Con qué recursos económicos contamos para infraestructura, licencias de software y APIs externas de pago? (REF_ID: presupuesto##17)
- ¿El proyecto debe diseñarse priorizando tecnologías gratuitas (Free Tiers) o hay presupuesto mensual asignado para escalar? (REF_ID: presupuesto##18)
- ¿Quién o quiénes son las personas con autoridad para aprobar los avances y dar el "OK" final del proyecto? (REF_ID: autoridad##19)
- ¿Cuáles son los criterios de aceptación mínimos y obligatorios para que el sistema se considere terminado y listo para producción? (REF_ID: autoridad##20)

REGLA CRÍTICA: Responde con un JSON donde cada clave sea el REF_ID exacto (ej. tag##index) y el valor sea tu respuesta.

{
  "definicion_problema##0": "La fragmentación y dificultad en la búsqueda de profesionales locales de confianza, y el 'agujero negro' de incertidumbre que sufren los postulantes en la búsqueda de empleo formal (falta de transparencia y respuestas).",
  "definicion_problema##1": "Porque la digitalización de oficios está en auge, los usuarios demandan soluciones inmediatas y seguras, y el mercado laboral necesita herramientas que garanticen respuestas y transparencia bidireccional, eliminando el 'soft rejection'.",
  "definicion_problema##2": "Una plataforma de fricción cero ('Chamba') que conecta la oferta y demanda de servicios locales mediante geolocalización en tiempo real, un sistema de reputación inmutable y una bolsa de empleo transparente.",
  "mapa_impacto##3": "Inmediatez y seguridad para los clientes al contratar cerca de casa, un flujo constante de leads para profesionales independientes, y certeza para los candidatos de empleo al conocer el estado real de sus postulaciones.",
  "mapa_impacto##4": "Genera retención mediante un ecosistema de confianza (reseñas verificadas). La monetización se asegura a través de suscripciones de planes Premium (integrados con Mercado Pago) que otorgan mayor visibilidad en el mapa, ranking top y ampliación de la galería multimedia.",
  "mapa_impacto##5": "Perder el mercado frente a la informalidad de redes sociales (grupos de Facebook/WhatsApp) donde no hay garantías de seguridad, verificación de identidad, ni protección de datos sensibles contra scraping masivo.",
  "usuarios_contexto##6": "Tres roles principales: 1) Clientes/Usuarios (buscan servicios para el hogar/empresas), 2) Proveedores/Profesionales independientes (ofrecen oficios y servicios), 3) Empresas (contratan profesionales o publican ofertas de empleo formal).",
  "usuarios_contexto##7": "Clientes en contextos móviles y de urgencia buscando soluciones locales rápidas. Profesionales desde el móvil o PC actualizando su portafolio y respondiendo leads. Empresas desde oficinas gestionando reclutamiento.",
  "usuarios_contexto##8": "Muy variable. Desde básico (personas buscando oficios tradicionales) hasta avanzado (equipos de RRHH). Por ello el branding prioriza accesibilidad, diseño limpio ('Framer ecosystem') e identidad cultural argentina cercana y no elitista ('chamba', 'laburo').",
  "procesos_actuales##9": "Mediante el 'boca a boca', panfletos físicos en la calle, o grupos informales de redes sociales, sin filtros espaciales reales, filtros de calidad estandarizados, o seguridad (sistemas anti-fraude).",
  "procesos_actuales##10": "El usuario ingresa, acepta geolocalización, busca un rubro en el Directorio, el mapa (OpenStreetMap + Pigeon Maps) muestra profesionales cercanos. Revisa el portafolio/reseñas, y hace clic en 'Contactar'. Esto registra la intención, revela datos ofuscados (Secure Reveal) y notifica al profesional.",
  "entidades_clave##11": "Usuarios, Perfiles (Proveedor/Empresa), Rubros (Catálogo maestro), Portafolios (Galería multimedia), Intenciones de Contacto, Reseñas, Suscripciones (Planes), Ofertas de Empleo, Postulaciones y Currículums Nativos.",
  "entidades_clave##12": "Sí. Contraseñas (gestionadas 100% por Supabase Auth), pagos (gestionados por Mercado Pago), y datos de contacto reales (teléfono, calle, número) que se protegen en BD y se revelan únicamente mediante ofuscación Server-Side y 'Secure Reveal' al legitimar la intención de contacto.",
  "kpis##13": "Tasa de conversión de Búsqueda a Intención de Contacto, volumen de suscripciones Premium activas, cantidad de reseñas generadas por 'Trabajo Verificado' vs. 'Contacto', y % de postulaciones que superan el estado 'Enviado'.",
  "kpis##14": "Consultas espaciales de latencia mínima (<200ms) usando índices GIST en PostGIS. UI sin latencia mediante carga de Entidades Completas (EntityGraphs para evitar N+1). Carga de multimedia en ms delegada al CDN de Cloudinary. Soporte firme para el Hard Cap de búsqueda de 50km.",
  "restricciones##15": "Backend estrictamente en Java 21 y Spring Boot 3.4.4. Clean Architecture (Dominio, Aplicación, Infra). Base de datos PostgreSQL con PostGIS. Tipo JSONB para currículums híbridos y knockout questions. Almacenamiento multimedia prohibido en BD, uso obligatorio de Cloudinary.",
  "restricciones##16": "El proyecto debe estar listo, funcional y completamente documentado (Swagger/OpenAPI 3) para la fecha de Defensa Final académica (Mayo 2026), cumpliendo con el Checklist de Aceptación del evaluador.",
  "presupuesto##17": "Recursos económicos limitados (etapa académica). La arquitectura técnica y de infraestructura debe acoplarse a los límites gratuitos de terceros.",
  "presupuesto##18": "Diseño totalmente 'Free Tier' / Serverless: Supabase (Auth + DB), Cloudinary (Límites gratuitos para fotos), Nominatim (Geocoding), Sandbox Mercado Pago, y Gmail SMTP (STARTTLS). Aplicación de 'Graceful Downgrade' para suspender recursos si un usuario abandona su suscripción, en lugar de borrar datos masivos.",
  "autoridad##19": "El Profesor Experto de la cátedra de Programación IV y el tribunal evaluador universitario de la UTN.",
  "autoridad##20": "Arquitectura Limpia demostrable en código (separación de Entity y UseCase, DIP), Controladores aisaldos que manejen solo DTOs, borrado lógico implementado, transaccionalidad atómica robusta, consultas geográficas eficientes, Swagger interactivo y reglas anti-fraude verificables (Cooldowns, bloqueos IP, validaciones de reseñas únicas)."
}




