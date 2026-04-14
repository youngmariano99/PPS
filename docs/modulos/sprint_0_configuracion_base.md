# MÓDULO: sprint_0_configuracion_base (Cimientos y Setup Inicial)

## 1. Objetivo del Módulo
Establecer la columna vertebral del backend en Spring Boot. El objetivo es dejar el servidor listo para conectarse a Supabase (PostgreSQL + PostGIS), documentar automáticamente los futuros endpoints con Swagger, y estandarizar cómo el sistema le responde al frontend cuando ocurre un error.
**Aclaración importante:** En este Sprint NO se programan entidades de negocio ni controladores operativos.

## 2. Tareas Técnicas y Flujo de Trabajo

* **Configuración de Base de Datos (Supabase + PostGIS):**
    * Configurar el archivo `application.yml` (o `application.properties`).
    * Establecer la conexión a la base de datos PostgreSQL.
    * **Crucial:** Configurar el dialecto de Hibernate para que reconozca los tipos de datos espaciales. Utilizar `org.hibernate.spatial.dialect.postgis.PostgisDialect` (o el equivalente compatible con la versión de Hibernate 6+ de Spring Boot 3).
* **Documentación Interactiva (Swagger/OpenAPI):**
    * Implementar `springdoc-openapi-starter-webmvc-ui`.
    * Configurar un `OpenApiConfig` (clase de configuración) que defina el título de la API ("API Plataforma de Servicios y Empleos") y **habilite el esquema de seguridad global mediante JWT (Bearer Token)**, para que desde la UI de Swagger se puedan probar endpoints protegidos.
* **Manejo Global de Excepciones (ControllerAdvice):**
    * Crear una clase `GlobalExceptionHandler` anotada con `@RestControllerAdvice`.
    * Interceptar excepciones comunes como `EntityNotFoundException`, `IllegalArgumentException` y excepciones de validación genéricas.
    * Crear un DTO de respuesta de error estandarizado (ej. `ErrorResponseDto` con campos como `timestamp`, `estado`, `mensaje`, `detalles`).

## 3. Reglas Estrictas para la IA (Generación de Código)
* **Librerías:** Usar estrictamente las dependencias nativas de Spring Boot 3 (Jakarta EE en lugar de Javax).
* **Limpieza de Configuración:** El archivo de propiedades (`application.yml`) debe estar ordenado por dominios (servidor, base de datos, JPA, springdoc). No agregar configuraciones inútiles o que generen ruido.
* **Diseño de Excepciones:** El `GlobalExceptionHandler` debe devolver códigos HTTP coherentes (404 para no encontrado, 400 para malas peticiones, 500 para errores internos). No exponer el "stack trace" crudo de Java al cliente frontend por motivos de seguridad.