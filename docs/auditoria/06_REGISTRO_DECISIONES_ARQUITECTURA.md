# Registro de Decisiones Arquitectónicas (ADR)
*Proyecto: Directorio de Profesionales y Empresas (Chamba/PPS)*
*Fecha de actualización: Mayo 2026*

Este documento centraliza todas las decisiones críticas de arquitectura, diseño de software y escalabilidad tomadas durante el ciclo de refactorización y modernización del proyecto. El propósito es explicar **el porqué** detrás de cómo funciona el código actualmente.

---

## 1. Transición a Clean Architecture y Desacoplamiento
**Contexto:** Los servicios principales (`DirectorioServiceImpl` y `AuthServiceImpl`) se habían convertido en "Clases Dios" (god objects) de más de 500 líneas. Mezclaban responsabilidades de geolocalización, manipulación de archivos multimedia, lógica de base de datos y llamadas a APIs de terceros.
**Decisión:** Se reestructuró el código separándolo en múltiples Casos de Uso específicos (`ValidarMultimediaUseCase`, `BuscarPerfilesCercanosUseCase`, `ConsultarDetallePerfilUseCase`) respaldados por interfaces puras.
**Por qué:** 
- **Mantenibilidad:** Archivos más cortos son más fáciles de leer.
- **Responsabilidad Única (SRP):** Cada clase tiene una única razón para cambiar.
- **Testabilidad:** Se puede probar la lógica de multimedia simulando (mocking) la base de datos sin levantar todo el contexto de Spring Boot.

## 2. Uso del Patrón Factory para Entidades Polimórficas
**Contexto:** El proceso de registro de nuevos usuarios tenía un bloque gigantesco de `if-else` para decidir si construir un `PerfilProveedor` o un `PerfilEmpresa`.
**Decisión:** Se implementó el patrón de diseño "Abstract Factory" (`IPerfilFactory`) con implementaciones dedicadas para cada tipo de perfil. El servicio de autenticación ahora delega la construcción del objeto a la fábrica correspondiente.
**Por qué:** Cumple con el principio Open-Closed (OCP). Si el negocio decide agregar un "Perfil de Institución Educativa", simplemente agregamos un nuevo Factory sin tocar ni arriesgar a romper el código core de Autenticación.

## 3. Migración de Redes Sociales de Columnas a JSONB
**Contexto:** El modelo relacional en PostgreSQL tenía columnas estáticas (hardcodeadas) para `instagram_url`, `facebook_url` y `linkedin_url`. Esto impedía escalar y agregar nuevas redes (como TikTok, GitHub, Behance) sin hacer scripts SQL complejos que rompían la base de datos temporalmente.
**Decisión:** Se eliminaron esas columnas y se agruparon en una sola columna dinámica de tipo `JSONB`. En el backend de Java, se usa un DTO que procesa la URL entrante mediante Expresiones Regulares (Regex) para "auto-detectar" la plataforma.
**Por qué:** 
- **Escalabilidad Infinita:** Soporte instantáneo para cualquier red social sin tocar la estructura SQL.
- **UX Optimizada:** El usuario simplemente pega el link y el servidor clasifica de dónde viene y qué ícono se debe mostrar en Framer.

## 4. Inyección de Coordenadas de Recorte (Cropping) de Imágenes
**Contexto:** Al registrarse o editar el perfil, el usuario podía usar la herramienta de Cloudinary para recortar su foto (hacer un encuadre perfecto 1:1 de su rostro). Sin embargo, Cloudinary devolvía la URL de la imagen original gigante, por lo que el mapa de CSS (`backgroundSize: "cover"`) mostraba recortes aleatorios de la foto original y "se veía mal".
**Decisión:** Se modificó la capa Frontend (`openUploadWidget`) para interceptar las coordenadas matemáticas del recorte hecho por el usuario. Esas coordenadas se inyectan como parámetros de transformación en la URL (`c_crop,x_10,y_10...`) antes de enviarlas al servidor. A nivel CSS se agregó `backgroundPosition: "center"`.
**Por qué:** Obligamos a los servidores de Cloudinary a procesar la imagen y enviar al cliente final solo los píxeles útiles. Garantiza avatares premium redondos o redondeados idénticos a los previsualizados.

## 5. Resiliencia y Tolerancia a Fallos (Geolocalización)
**Contexto:** Cada vez que el usuario hacía clic en "Guardar" en la configuración de su perfil (ej. para cambiar una palabra en su descripción), el backend volvía a consultar la API gratuita de OpenStreetMap (Nominatim) para recalcular coordenadas. Al exceder el límite de consultas (rate limit), Nominatim bloqueaba la petición, lo que causaba que la API tirara un Error 400 e impidiera guardar TODO el perfil.
**Decisión:** Se aisló la llamada al servicio de Geocodificación dentro del `UseCase` en un bloque `try-catch`.
**Por qué:** Un fallo en un servicio de terceros secundario no debe interrumpir la persistencia de datos críticos del usuario. Si Nominatim falla, simplemente se mantiene la coordenada vieja de forma silenciosa (log warning) y el resto del perfil se guarda exitosamente.

## 6. Optimización de Consultas Espaciales (Búsqueda Diferida)
**Contexto:** El componente del Mapa interactivo intentaba cargar **todos** los profesionales registrados en un radio de 100km apenas se montaba, dejando el trabajo de filtrado a React (Frontend).
**Decisión:** Se planificó en el Roadmap cambiar esto a "Búsqueda Diferida" (Server-Side Filtering). El mapa iniciará borroso y solo disparará la búsqueda al backend cuando el usuario elija un "Rubro". (A diferencia del Listado de Profesionales, que *ya* estaba optimizado porque usa Paginación desde base de datos cargando de a 8 elementos).
**Por qué:** A medida que la app consiga miles de profesionales registrados, cargar un JSON con 10,000 usuarios en un celular destruirá el plan de datos móviles y la memoria RAM del dispositivo. La base de datos de PostgreSQL es inmensamente más rápida para filtrar texto y coordenadas que el motor de JavaScript de un navegador.

## 7. Registro Atómico "Todo o Nada" (Transaccional)
**Contexto:** En versiones tempranas, registrar un usuario implicaba varios pasos sueltos: crear auth en Supabase, registrar en la tabla local, crear el perfil de proveedor y subir fotos. Si algo fallaba a mitad de camino, dejaba bases de datos asimétricas (datos huérfanos).
**Decisión:** Se consolidó todo en una única llamada transaccional (`RegistroCompletoSolicitudDto`) decorada con `@Transactional`. 
**Por qué:** Integridad de datos absoluta. Si un usuario se registra y la base local falla, la operación completa hace *rollback*, evitando escenarios de inicio de sesión corrompidos.

## 8. Arquitectura CQS y Erradicación de N+1 Query en PostGIS
**Contexto:** La consulta espacial del mapa disparaba consultas secundarias silenciosas (Lazy Loading) para obtener las especialidades y las suscripciones de cada perfil. Al traer 50 perfiles, se lanzaban 100 queries extra (N+1), causando latencia severa. Además, el mapa necesitaba datos planos, mientras que el listado necesitaba paginación.
**Decisión:** 
1) Se aplicó el principio CQS (Command Query Separation), separando el endpoint `/buscar/mapa` del `/buscar/lista`.
2) Se reemplazó la carga ingenua por una estrategia de 2 pasos: un `SELECT UUID` nativo de PostGIS (ultra-rápido) seguido de un JPQL con `@EntityGraph` para cargar todas las relaciones de esos UUIDs en un solo salto a memoria (Batch Fetching).
**Por qué:** Evita colapsos de memoria (Out Of Memory) en la JVM y reduce los tiempos de respuesta de milisegundos a microsegundos bajo alto tráfico concurrente.

## 9. Blindaje de Privacidad y Modelo de Prestigio (Server-Side Security)
**Contexto:** Exponer los números de WhatsApp o emails en el JSON de respuesta pública permitía a los *scrapers* (bots) robar las bases de datos de profesionales.
**Decisión:** Se implementó una ofuscación condicional Server-Side. El backend **elimina** el teléfono y datos privados del JSON a menos que quien consulta esté validado mediante un token JWT y registre una "Intención de Contacto". Las reseñas también se vincularon a nivel propietario para evitar duplicaciones (1 voto por perfil).
**Por qué:** Seguridad de nivel empresarial. Evita el spam a nuestros clientes, fomenta el registro real en la plataforma (Lead Generation) y previene la manipulación de las calificaciones.

## 10. Persistencia Híbrida (Relacional + Documental) en PostgreSQL
**Contexto:** Modelar el "Currículum" (experiencias laborales infinitas, formaciones académicas) mediante tablas relacionales requeriría sobre-normalización y excesivos `JOINs`.
**Decisión:** Se implementó un esquema mixto. Lo transaccional (ofertas, pagos, usuarios) sigue la 3ra Forma Normal. Lo descriptivo (CV, redes sociales) se guarda en columnas `JSONB` nativas de Postgres y se mapean en Java mediante librerías de tipos genéricos.
**Por qué:** Equilibrio perfecto entre agilidad y rigor relacional. Consultar el perfil de un proveedor es rapidísimo (0 joins para su CV), y permite escalar los campos del currículum o las redes sociales sin hacer `ALTER TABLE`.

## 11. Suscripciones Reactivas y Asíncronas (Webhooks Mercado Pago)
**Contexto:** Confirmar pagos de Suscripciones Premium "confiando" en que el Frontend redirija a la pantalla de éxito es una vulnerabilidad clásica que permite ataques o fallos por cierres de conexión.
**Decisión:** Se configuró a Spring Boot como la única fuente de verdad, reaccionando de forma asíncrona a los Webhooks oficiales de Mercado Pago.
**Por qué:** Garantiza la integridad del negocio. Las membresías solo se activan si Mercado Pago le avisa directamente a nuestro servidor de fondo, haciendo imposible que un usuario forje o evada un pago.

## 12. Navegación SEO-Friendly mediante Slugs Dinámicos
**Contexto:** Los perfiles públicos se cargaban mediante parámetros de ID (`?id=uuid`), lo cual es ilegible para humanos y nulo para el posicionamiento en motores de búsqueda.
**Decisión:** Se implementó una columna `slug` indexada en la base de datos y una lógica de generación automática basada en `nombre + apellido + rubro`. El frontend ahora prioriza el parámetro `?p=slug` en todas las navegaciones desde el listado y el mapa.
**Por qué:** 
- **SEO (Search Engine Optimization):** Permite que Google indexe los perfiles por el oficio y nombre del profesional.
- **UX Premium:** URLs como `/perfiles-prov?p=juan-perez-plomero` generan más confianza y son más fáciles de compartir que un código alfanumérico aleatorio.

## 13. Organización de DTOs por Dirección de Datos (Request/Response)
**Contexto:** La carpeta de DTOs contenía más de 20 archivos mezclados, dificultando saber qué objeto era para recibir datos y cuál para enviarlos.
**Decisión:** Se refactorizó la estructura a subpaquetes `application.dto.request` y `application.dto.response`.
**Por qué:** 
- **Semántica:** Mejora la legibilidad del código. Al importar un DTO, el desarrollador sabe inmediatamente su propósito.
- **Seguridad:** Evita la reutilización accidental de objetos de entrada para salida, previniendo la fuga de datos sensibles.
- **Estándar Profesional:** Alinea el proyecto con prácticas de nivel corporativo en Spring Boot.
