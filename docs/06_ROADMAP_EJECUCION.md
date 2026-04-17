# 07_ROADMAP_EJECUCION: Guía de Sprints y Contexto

## 1. Objetivo del Documento
Este documento define el orden cronológico estricto de desarrollo para el Proyecto Final Integrador, priorizando la consolidación del Marketplace de Servicios (Geolocalización) antes de escalar a la Bolsa de Empleos. Para evitar la degradación de contexto de la IA, **CADA SPRINT debe ejecutarse enfocándose únicamente en sus objetivos**, inyectando los archivos referenciados en `05_FLUJO_DE_TRABAJO_IA.md`.

---

## FASE 1: MARKETPLACE DE SERVICIOS Y GEOLOCALIZACIÓN

### SPRINT 0: Cimientos y Configuración Base (Prioridad Alta)
**Objetivo:** Dejar el backend de Spring Boot listo para recibir peticiones, documentado y conectado a la base de datos, sin programar todavía la lógica de negocio.
* **Tareas para la IA:**
  1. **Conexión a Supabase:** Configurar `application.yml` o `application.properties` con las credenciales de PostgreSQL.
  2. **Configuración Espacial:** Asegurar que el dialecto de Hibernate soporte PostGIS (`org.hibernate.spatial.dialect.postgis.PostgisDialect`).
  3. **Swagger / OpenAPI:** Configurar `springdoc-openapi-starter-webmvc-ui` para que la documentación de la API esté disponible (ej. en `/swagger-ui.html`) y soporte inyección de token JWT globalmente.
  4. **Manejo de Errores Global:** Crear un `@ControllerAdvice` (GlobalExceptionHandler) para atrapar excepciones y devolver JSONs limpios.

### SPRINT 1: Seguridad, Autenticación y Usuarios
**Objetivo:** Implementar el registro y login integrándose con Supabase Auth, y crear el registro en la tabla pública `usuarios`.
* **Tareas para la IA:**
  1. Crear Entidad `Usuario`, Repository y Service.
  2. Crear endpoints de Registro y Login (`AuthController`).
  3. Integrar la validación con Supabase Auth y guardar el UUID localmente.
  4. Crear el contrato API en el Frontend (`/api/authApi.js`).

### SPRINT 2: Perfiles Públicos, Servicios y Mapa (El Núcleo)
**Objetivo:** Levantar el directorio de profesionales y empresas para que sean visibles en el mapa de geolocalización.
* **Tareas para la IA:**
  1. Crear Entidades para `perfiles_proveedor`, `perfiles_empresa`, `rubros` y `portafolios`.
  2. Implementar el flujo de Geocoding (Nominatim) para convertir direcciones en puntos `GEOGRAPHY(Point, 4326)`.
  3. Desarrollar el endpoint principal de búsqueda utilizando `ST_DWithin` para filtrar proveedores por distancia en kilómetros.
  4. Crear el contrato API en el Frontend (`/api/directorioApi.js`).

### SPRINT 3: Interacciones, Reseñas y Anti-Fraude
**Objetivo:** Cerrar el circuito de servicios permitiendo a los clientes contactar y calificar a los proveedores de forma segura.
* **Tareas para la IA:**
  1. Crear Entidades para `intenciones_contacto`, `resenas` y `reportes_resenas`.
  2. Implementar el manejo de la excepción del Trigger de 24hs (`COOLDOWN_RESENA`) devolviendo un error HTTP 429 o 400.
  3. Implementar el "Derecho a Réplica" (actualización de `respuesta_proveedor`).
  4. Crear el contrato API en el Frontend (`/api/interaccionesApi.js`).

---

## FASE 2: BOLSA DE EMPLEO Y POSTULACIONES

### SPRINT 4: Currículum Nativo e Híbrido
**Objetivo:** Preparar a los usuarios para buscar empleo permitiéndoles cargar sus datos estructurados y PDFs.
* **Tareas para la IA:**
  1. Crear la entidad `curriculums_nativos` manejando el tipo JSONB en Hibernate para la experiencia y educación.
  2. Implementar endpoints de subida de archivos delegando a Supabase Storage para el `cv_url_pdf`.
  3. Crear el contrato API en el Frontend (`/api/curriculumsApi.js`).

### SPRINT 5: Ofertas de Empleo y Filtros Estructurados
**Objetivo:** Que las empresas y proveedores puedan publicar trabajos con requerimientos y preguntas excluyentes.
* **Tareas para la IA:**
  1. Crear Entidades y CRUD para `ofertas_empleo` y `preguntas_filtro_oferta`.
  2. Asegurar la validación de los campos obligatorios (modalidad, título, salarios opcionales).
  3. Crear el contrato API en el Frontend (`/api/ofertasApi.js`).

### SPRINT 6: Postulaciones, Triaje y "Agujero Negro"
**Objetivo:** El motor de matching laboral. Los candidatos se postulan y las empresas los evalúan con transparencia obligatoria.
* **Tareas para la IA:**
  1. Crear Entidades para `postulaciones` y `respuestas_candidato`.
  2. Implementar la validación obligatoria de las respuestas de filtro al momento de postularse.
  3. Implementar el flujo de "Rechazo Suave" (Soft Rejection) exigiendo un `motivo_rechazo_codigo` al cambiar el estado a `DESCARTADO`.
  4. Crear el contrato API en el Frontend (`/api/postulacionesApi.js`).

### SPRINT 7: Sistema de Notificaciones
**Objetivo:** Avisar a los usuarios de la actividad en su cuenta de forma asíncrona.
* **Tareas para la IA:**
  1. Crear Entidades para `alertas_empleo` y `notificaciones`.
  2. Inyectar la creación de notificaciones en los servicios anteriores (ej. alertar cuando una postulación es vista).
  3. Crear el contrato API en el Frontend (`/api/notificacionesApi.js`).

---

## MÓDULOS FUTUROS (Backlog de Escalamiento)

### Evolución del Sistema de Reputación (Trabajos Completados)
**Objetivo:** Utilizar el ciclo de vida real de una solicitud de servicio (específicamente el estado "COMPLETO") como un factor de mayor peso en el Algoritmo de Ranking de perfiles, recompensando con posicionamiento orgánico a quienes cierran el trato dentro de la plataforma.
* **Beneficios Estratégicos:**
  1. **Incentivo de Transacción:** Motiva a que los proveedores busquen empujar y completar el flujo formal de estados del sistema para ganar visibilidad gratuita.
  2. **Auditoría Transparente:** Distinción clara entre leads generados y trabajos reales ejecutados.
  3. **Resolución de Conflictos:** En caso de fricciones, la auditoría sobre la trazabilidad del estado hace más fácil la investigación preventiva y legal.
  4. **Consolidación de las Reseñas:** Hace que las reseñas sean inobjetables y cobren muchísimo más valor al ir atadas a un servicio exitoso.
  5. **Métrica Pública (Social Proof):** Habilita la posibilidad de mostrar métricas duras de trazabilidad en el portafolio (Ej. "150 trabajos completados registrados").