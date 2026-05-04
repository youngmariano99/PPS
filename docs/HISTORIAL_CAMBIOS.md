# HISTORIAL DE CAMBIOS

* **Fecha:** 2026-05-02
* **Módulo/Tarea:** Prestige V2 y Blindaje de Privacidad (Seguridad Server-Side)
* **Archivos Tocados:** `DirectorioService.java`, `IntencionContactoService.java`, `IntencionContactoController.java`, `PerfilPublicoProveedorChamba.jsx`, `ContactoRespuestaDto.java`
* **Qué y Por Qué (1 oración clara):** Se implementó un sistema de reseñas basado en el prestigio del vínculo (un voto por usuario) y un mecanismo de seguridad server-side que ofusca datos sensibles (teléfono/dirección) hasta que se registra una intención de contacto real, eliminando vulnerabilidades de inspección de código.

* **Fecha:** 2026-04-28
* **Módulo/Tarea:** Rediseño Premium de Autenticación y Registro Atómico
* **Archivos Tocados:** `AuthService.java`, `AuthController.java`, `RegistroCompletoSolicitudDto.java`, `FormularioLogin.jsx`, `RegirstroFormWizard.jsx`
* **Qué y Por Qué (1 oración clara):** Se implementó una arquitectura de registro atómico (Todo o Nada) con un nuevo endpoint transaccional en el backend y un rediseño completo del frontend bajo estética Glassmorphism, incluyendo validaciones de seguridad avanzadas para contraseñas y navegación persistente.

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Sprint 0 / Configuración Base (Cimientos y Setup Inicial)
* **Archivos Tocados:** `pom.xml`, `application.yml`, `OpenApiConfig.java`, `ErrorRespuestaDto.java`, `ManejadorGlobalExcepciones.java`, `RecursoNoEncontradoException.java`, `ValidacionNegocioException.java`
* **Qué y Por Qué (1 oración clara):** Se estableció la base del proyecto configurando PostGIS, Swagger con JWT y un manejador global de excepciones para estandarizar las respuestas del backend.

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Sprint 1 / Seguridad y Usuarios (Autenticación y Perfiles Base)
* **Archivos Tocados:** `application.yml`, `Usuario.java`, `UsuarioRepository.java`, `AuthService.java`, `AuthController.java`, `RegistroSolicitudDto.java`, `LoginSolicitudDto.java`, `AuthRespuestaDto.java`, `authApi.js`
* **Qué y Por Qué (1 oración clara):** Se implementó el flujo de registro y login integrando Supabase Auth (GoTrue) y sincronizando el UUID con la base de datos local, junto con sus contratos API para el frontend.

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Mantenimiento / Estabilización de Arquitectura Backend
* **Archivos Tocados:** `pom.xml`, `application.yml`
* **Qué y Por Qué (1 oración clara):** Se migró a Spring Boot 3.4.4 y se corrigieron nombres de starters oficiales para resolver conflictos de dependencias (Hibernate 6) y asegurar la compatibilidad con el ecosistema de Supabase y PostGIS.

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Debugging / Refactorización de AuthService (Login)
* **Archivos Tocados:** `AuthService.java`
* **Qué y Por Qué (1 oración clara):** Se corrigió un error 500 (NPE) mediante validaciones de nulidad en la respuesta de Supabase y se subsanó un error de compilación en el manejador de estados de RestClient, mejorando la transparencia de los mensajes de error para el usuario final.

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Sprint 2 / Directorio y Geolocalización (Core Marketplace)
* **Archivos Tocados:** `GeometryConfig.java`, `Rubro.java`, `PerfilProveedor.java`, `PerfilEmpresa.java`, `GeocodingService.java`, `DirectorioService.java`, `PerfilController.java`, `DirectorioController.java`, `directorioApi.js`
* **Qué y Por Qué (1 oración clara):** Se implementó el motor de geoposicionamiento integrando PostGIS y Nominatim, permitiendo la creación de perfiles con coordenadas reales y la búsqueda de servicios por radio de cercanía.

* **Fecha:** 2026-04-14
* **Módulo/Tarea:** Debugging / Estabilización de Registro y CORS
* **Archivos Tocados:** `AuthService.java`, `RestClientConfig.java`, `FormularioLogin.jsx`, `FormularioRegistro.jsx`, `FormularioPerfilEmpresa.jsx`, `FormularioPerfilProveedor.jsx`, `BuscadorMapa.jsx`
* **Qué y Por Qué (1 oración clara):** Se resolvió el error 422 en el registro al robustecer la extracción del ID de Supabase (soportando anidación en "user") y se eliminaron bloqueos de CORS mediante URLs absolutas y cabeceras de autorización Bearer.

* **Fecha:** 2026-04-15
* **Módulo/Tarea:** Sprint 3 / Membresías y Suscripciones (Fase de Diseño MP)
* **Archivos Tocados:** `docs/modulos/sprint_3_suscripciones_mp.md`
* **Qué y Por Qué (1 oración clara):** Se documentó el flujo transaccional inicial y la arquitectura de integración con el Sandbox de Mercado Pago para permitir perfiles destacados en la plataforma.

* **Fecha:** 2026-04-15
* **Módulo/Tarea:** Sprint 3 / Persistencia de Suscripciones
* **Archivos Tocados:** `01_MODELO_DE_DATOS.md`, `docs/modulos/sprint_3_suscripciones_mp.md`
* **Qué y Por Qué (1 oración clara):** Se crearon las tablas `planes_suscripcion` y `suscripciones_usuario` para la persistencia de Mercado Pago.

* **Fecha:** 2026-04-15
* **Módulo/Tarea:** Sprint 3 / Integración y Arquitectura Final de Suscripciones
* **Archivos Tocados:** `application.yml`, `SuscripcionController.java`, `SuscripcionService.java`, `MercadoPagoService.java`, `SecurityConfig.java`, `data.sql`, (Frontend) `BotonSuscripcionPro.tsx`
* **Qué y Por Qué (1 oración clara):** Se implementó y documentó el flujo robusto de suscripciones reales con MP, utilizando webhooks como fuente única de verdad, asegurando el CORS y proveyendo un componente de React adaptado a Framer para la interacción delegada a la pasarela de pagos.

* **Fecha:** 2026-04-16
* **Módulo/Tarea:** Sprint 4 / Configuración de Cloudinary
* **Archivos Tocados:** `pom.xml`, `application.yml`, `CloudinaryConfig.java`
* **Qué y Por Qué (1 oración clara):** Se añadió la dependencia `cloudinary-http44` y se creó `CloudinaryConfig` con sus variables de entorno en `application.yml` para posibilitar operaciones de gestión multimedia en backend.

* **Fecha:** 2026-04-17
* **Módulo/Tarea:** Sprint 2 / Auditoría de Arquitectura, CQS y N+1 Query
* **Archivos Tocados:** `DirectorioController.java`, `DirectorioService.java`, `SuscripcionUsuarioRepository.java`, `ListadoProfesionales.jsx`, `BuscadorMapa.jsx`
* **Qué y Por Qué (1 oración clara):** Se separó la vista estructurada (`/buscar/lista`) de la vista de mapa (`/buscar/mapa`) implementando el principio CQS, y se reparó una vulnerabilidad extrema de rendimiento (N+1 Query) en la serialización de suscripciones inyectando memoria por Batch Fetching con UUIDs en el `DirectorioService`.

* **Fecha:** 2026-04-17
* **Módulo/Tarea:** Refactorización Core / Blindaje de Rendimiento y Memoria (JPA + PostGIS)
* **Archivos Tocados:** `PerfilProveedorRepository.java`, `PerfilEmpresaRepository.java`, `DirectorioService.java`
* **Qué y Por Qué (1 oración clara):** Se re-inmplementaron las búsquedas geolocalizadas nativas aplicando una arquitectura de 2 pasos (`SELECT UUID` nativo + `@EntityGraph` JPQL) para erradicar totalmente las N+1 Queries ocultas (Lazy Loading) salvando latencia en alto tráfico, y se inyectó un `Hard Cap` estricto de 50km protegiendo a la JVM de fallos de memoria masivos por sobrecarga de peticiones.

* **Fecha:** 2026-04-28
* **Módulo/Tarea:** Optimización de Ranking y Paginación (Fase de Producción)
* **Archivos Tocados:** `DirectorioController.java`, `DirectorioService.java`, `PerfilProveedorRepository.java`, `PerfilRespuestaDto.java`, `ListadoProfesionales.jsx`
* **Qué y Por Qué (1 oración clara):** Se implementó la paginación del lado del servidor, se optimizó el rendimiento mediante `@EntityGraph` (reducción drástica de latencia al cargar entidades en una sola consulta), se normalizó el filtro de rubros para ignorar la diferencia entre 'ñ' y 'n', y se unificó el ranking (Premium > Distancia).
* **Fecha:** 2026-04-29
* **Módulo/Tarea:** Onboarding Multimedia e Integración Cloudinary (v6.1)
* **Archivos Tocados:** `RegirstroFormWizard.jsx`, `AuthService.java`, `RegistroCompletoSolicitudDto.java`, `Portafolio.java`
* **Qué y Por Qué (1 oración clara):** Se expandió el Wizard de registro para integrar subida directa a Cloudinary (fotos de perfil y portfolio) con persistencia atómica en el backend, garantizando una identidad visual completa desde el alta del usuario.

* **Fecha:** 2026-04-29
* **Módulo/Tarea:** Rediseño Marketplace y Motor de Búsqueda Global (v7.0)
* **Archivos Tocados:** `ListadoProfesionales.jsx`, `DirectorioController.java`, `DirectorioService.java`, `PerfilProveedorRepository.java`, `PerfilRespuestaDto.java`
* **Qué y Por Qué (1 oración clara):** Se implementó un buscador global dinámico (nombre/rubro/localidad) integrado en el backend, se rediseñó la UI del listado eliminando ruidos visuales y se optimizó la paginación con saltos manuales y visualización de fotos de perfil.
