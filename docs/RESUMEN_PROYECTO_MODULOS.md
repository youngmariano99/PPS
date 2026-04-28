# RESUMEN DEL PROYECTO: ESTADO ACTUAL Y MÓDULOS APLICADOS

Este documento proporciona una visión consolidada de la arquitectura, los módulos implementados y el progreso técnico hasta la fecha (**2026-04-28**).

---

## 1. Visión General y Stack Tecnológico

El proyecto es una plataforma de **Marketplace de Servicios y Bolsa de Empleo** diseñada bajo los principios de **Fricción Cero** y **Geolocalización en Tiempo Real**.

### Backend Core:
- **Lenguaje:** Java 21.
- **Framework:** Spring Boot 3.4.4.
- **Base de Datos:** PostgreSQL con extensión **PostGIS** (Alojada en Supabase).
- **Seguridad:** Supabase Auth (GoTrue) + Integración con JWT.
- **Documentación:** Swagger / OpenAPI 3.

### Frontend:
- **Framework:** React.
- **Componentes:** Framer (Code Components) + CSS Vanilla de alto nivel estético.
- **Mapas:** Pigeon Maps (Leaflet) alimentado por OpenStreetMap.

---

## 2. Módulos Aplicados e Implementados

### Módulo A: Cimientos y Arquitectura (Sprint 0)
- **Configuración PostGIS:** Dialectos espaciales para Hibernate.
- **Manejo Global de Excepciones:** Estandarización de respuestas de error.
- **Documentación API:** Acceso vía `/swagger-ui.html` con soporte para Bearer Token.

### Módulo B: Seguridad y Usuarios (Sprint 1)
- **Sincronización Dual:** El registro se delega a Supabase y se sincroniza automáticamente con la base de datos local mediante UUIDs.
- **Perfiles Base:** Definición de la entidad `Usuario` como eje central del sistema.

### Módulo C: Directorio y Geolocalización (Sprint 2 - Core)
- **Motor Espacial:** Búsquedas por radio de cercanía utilizando `ST_DWithin` (SRID 4326).
- **Geocoding Integrado:** Uso de **Nominatim** para convertir direcciones en coordenadas `Point` de JTS al guardar perfiles.
- **Refactorización CQS (Command Query Separation):**
    - `/buscar/lista`: Vista paginada de alto rendimiento. Implementa una arquitectura de 2 pasos: primero se filtran y ordenan los IDs mediante SQL nativo (PostGIS) y luego se cargan las entidades completas con `@EntityGraph`.
    - `/buscar/mapa`: Vista masiva optimizada para renderizado rápido de puntos, sin paginación.
- **Ranking Geográfico Premium:** Implementación de un algoritmo de ranking híbrido (SQL + Java) que prioriza explícitamente el plan **Premium**, seguido por la distancia geográfica y reputación.
- **Paginación del Lado del Servidor:** Integración completa de `Pageable` para manejar miles de registros sin degradación de rendimiento en el frontend.
- **Blindaje de Rendimiento:** Eliminación de vulnerabilidades **N+1 Query** mediante Batch Fetching de suscripciones y consultas nativas de IDs seguidas de `@EntityGraph`.
- **Hard Cap de Seguridad:** Límite estricto de 50km en búsquedas para prevenir ataques DoS por carga de memoria.

### Módulo D: Suscripciones y Monetización (Sprint 3)
- **Mercado Pago SDK:** Integración con Sandbox para planes Pro/Premium.
- **Webhook Engine:** Sincronización asíncrona de estados de pago como fuente única de verdad.
- **Control de Acceso:** Lógica de negocio para perfiles destacados y límites multimedia según el plan.

### Módulo E: Multimedia y Portafolio (Sprint 4)
- **Cloudinary Integration:** Gestión de imágenes y recursos multimedia en la nube.
- **Validación de Límites:** Restricción estricta de fotos (5 para Gratis, 20 para Premium) y validación de dominios de video (YouTube, TikTok, Instagram, Google Drive).
- **Graceful Downgrade:** Los recursos se mantienen en DB pero se filtran en la respuesta de la API basándose en la suscripción activa.

### Módulo F: Sistema de Reseñas y Reputación (Sprint 5 - Implementado)
- **Evaluación Dual:** Soporte para reseñas por "Intención de Contacto" (Baja Fricción) y "Trabajo Verificado" (Alta Confianza).
- **Escudo Anti-Fraude:**
    - Validación de IP para evitar auto-reseñas (Astroturfing).
    - **Cooldown de 24hs:** Trigger de base de datos (`validar_cooldown_resena`) que impide múltiples reseñas al mismo proveedor en un día por el mismo usuario.
- **Ranking Dinámico (Los 5 Jueces):** El sistema ordena a los profesionales basándose en una prioridad en cascada:
    1.  **Suscripción (Boost Comercial):** Los usuarios Premium siempre encabezan la lista.
    2.  **Calidad (Promedio de Estrellas):** La reputación es el factor de calidad principal.
    3.  **Proximidad:** Ante igual calidad, se prioriza al profesional más cercano al usuario.
    4.  **Presencia Visual:** Los perfiles con foto tienen prioridad sobre los anónimos.
    5.  **Popularidad (Volumen):** El número total de reseñas actúa como desempate final.

---

## 3. Lo que hemos hecho hasta ahora (Resumen Técnico)

1.  **Arquitectura Limpia:** Estructuración de paquetes siguiendo principios SOLID y Clean Architecture.
2.  **Lógica en Español:** Todo el dominio de negocio (`Rubro`, `PerfilProveedor`, `DirectorioService`) está codificado en Español Latinoamericano.
3.  **Optimización Extrema:** Implementación de un `Hard Cap` de 50km en búsquedas y arquitectura de paginación eficiente que reduce el tráfico de red y el consumo de memoria.
4.  **UI/UX Premium en Framer:** Desarrollo de componentes reactivos con soporte para grilla dinámica (2-3 columnas), modo compacto profesional, fondos transparentes y filtros sincronizados con el backend.
5.  **Persistencia Robusta:** Esquema de base de datos que soporta perfiles duales (Empresas y Proveedores) compartiendo una base de geolocalización común y gestión estricta de planes de suscripción.

---

## 4. Próximos Pasos (Roadmap Inmediato)

1.  **Módulo G: Bolsa de Empleo:** Implementación de Ofertas de Trabajo con "Knockout Questions" (Preguntas de Filtro).
2.  **Módulo H: Postulaciones:** Sistema de envío de currículums nativos (JSONB) y gestión de estados.
3.  **Sistema de Notificaciones:** Alertas push/email sobre cambios en el estado de las postulaciones.

---
> [!NOTE]
> Este archivo ha sido generado automáticamente para sincronizar el estado del proyecto entre el equipo de desarrollo y los stakeholders.
