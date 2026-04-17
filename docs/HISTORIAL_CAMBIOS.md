# HISTORIAL DE CAMBIOS

* **Fecha:** 2026-04-14
* **MÃ³dulo/Tarea:** Sprint 0 / ConfiguraciÃ³n Base (Cimientos y Setup Inicial)
* **Archivos Tocados:** `pom.xml`, `application.yml`, `OpenApiConfig.java`, `ErrorRespuestaDto.java`, `ManejadorGlobalExcepciones.java`, `RecursoNoEncontradoException.java`, `ValidacionNegocioException.java`
* **QuÃ© y Por QuÃ© (1 oraciÃ³n clara):** Se estableciÃ³ la base del proyecto configurando PostGIS, Swagger con JWT y un manejador global de excepciones para estandarizar las respuestas del backend.

* **Fecha:** 2026-04-14
* **MÃ³dulo/Tarea:** Sprint 1 / Seguridad y Usuarios (AutenticaciÃ³n y Perfiles Base)
* **Archivos Tocados:** `application.yml`, `Usuario.java`, `UsuarioRepository.java`, `AuthService.java`, `AuthController.java`, `RegistroSolicitudDto.java`, `LoginSolicitudDto.java`, `AuthRespuestaDto.java`, `authApi.js`
* **QuÃ© y Por QuÃ© (1 oraciÃ³n clara):** Se implementÃ³ el flujo de registro y login integrando Supabase Auth (GoTrue) y sincronizando el UUID con la base de datos local, junto con sus contratos API para el frontend.

* **Fecha:** 2026-04-14
* **MÃ³dulo/Tarea:** Mantenimiento / EstabilizaciÃ³n de Arquitectura Backend
* **Archivos Tocados:** `pom.xml`, `application.yml`
* **QuÃ© y Por QuÃ© (1 oraciÃ³n clara):** Se migrÃ³ a Spring Boot 3.4.4 y se corrigieron nombres de starters oficiales para resolver conflictos de dependencias (Hibernate 6) y asegurar la compatibilidad con el ecosistema de Supabase y PostGIS.

* **Fecha:** 2026-04-14
* **MÃ³dulo/Tarea:** Debugging / RefactorizaciÃ³n de AuthService (Login)
* **Archivos Tocados:** `AuthService.java`
* **QuÃ© y Por QuÃ© (1 oraciÃ³n clara):** Se corrigiÃ³ un error 500 (NPE) mediante validaciones de nulidad en la respuesta de Supabase y se subsanÃ³ un error de compilaciÃ³n en el manejador de estados de RestClient, mejorando la transparencia de los mensajes de error para el usuario final.

* **Fecha:** 2026-04-14
* **MÃ³dulo/Tarea:** Sprint 2 / Directorio y GeolocalizaciÃ³n (Core Marketplace)
* **Archivos Tocados:** `GeometryConfig.java`, `Rubro.java`, `PerfilProveedor.java`, `PerfilEmpresa.java`, `GeocodingService.java`, `DirectorioService.java`, `PerfilController.java`, `DirectorioController.java`, `directorioApi.js`
* **QuÃ© y Por QuÃ© (1 oraciÃ³n clara):** Se implementÃ³ el motor de geoposicionamiento integrando PostGIS y Nominatim, permitiendo la creaciÃ³n de perfiles con coordenadas reales y la bÃºsqueda de servicios por radio de cercanÃ­a.

* **Fecha:** 2026-04-14
* **MÃ³dulo/Tarea:** Debugging / EstabilizaciÃ³n de Registro y CORS
* **Archivos Tocados:** `AuthService.java`, `RestClientConfig.java`, `FormularioLogin.jsx`, `FormularioRegistro.jsx`, `FormularioPerfilEmpresa.jsx`, `FormularioPerfilProveedor.jsx`, `BuscadorMapa.jsx`
* **QuÃ© y Por QuÃ© (1 oraciÃ³n clara):** Se resolviÃ³ el error 422 en el registro al robustecer la extracciÃ³n del ID de Supabase (soportando anidaciÃ³n en "user") y se eliminaron bloqueos de CORS mediante URLs absolutas y cabeceras de autorizaciÃ³n Bearer.

* **Fecha:** 2026-04-15
* **MÃ³dulo/Tarea:** Sprint 3 / MembresÃ­as y Suscripciones (Fase de DiseÃ±o MP)
* **Archivos Tocados:** `docs/modulos/sprint_3_suscripciones_mp.md`
* **QuÃ© y Por QuÃ© (1 oraciÃ³n clara):** Se documentÃ³ el flujo transaccional inicial y la arquitectura de integraciÃ³n con el Sandbox de Mercado Pago para permitir perfiles destacados en la plataforma.

* **Fecha:** 2026-04-15
* **Mï¿½dulo/Tarea:** Sprint 3 / Persistencia de Suscripciones
* **Archivos Tocados:** `01_MODELO_DE_DATOS.md`, `docs/modulos/sprint_3_suscripciones_mp.md`
* **Quï¿½ y Por Quï¿½ (1 oraciï¿½n clara):** Se crearon las tablas `planes_suscripcion` y `suscripciones_usuario` para la persistencia de Mercado Pago.


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
