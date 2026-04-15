# HISTORIAL DE CAMBIOS

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
* **M�dulo/Tarea:** Sprint 3 / Persistencia de Suscripciones
* **Archivos Tocados:** `01_MODELO_DE_DATOS.md`, `docs/modulos/sprint_3_suscripciones_mp.md`
* **Qu� y Por Qu� (1 oraci�n clara):** Se crearon las tablas `planes_suscripcion` y `suscripciones_usuario` para la persistencia de Mercado Pago.

