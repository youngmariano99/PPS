# RESUMEN DEL PROYECTO: ESTADO ACTUAL Y MÓDULOS APLICADOS

Este documento proporciona una visión consolidada de la arquitectura, los módulos implementados y el progreso técnico hasta la fecha (**2026-05-02**).

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

### Módulo B: Seguridad e Identidad (Sprint 1)
- **Registro Atómico (Todo o Nada):** Implementación de un flujo transaccional que crea Usuario y Perfil en una sola operación, evitando estados inconsistentes.
- **Wizard de Onboarding Premium:** Interfaz de 4 pasos con validación en tiempo real, persistencia de progreso y estética Glassmorphism.
- **Seguridad de Contraseñas:** Validador de fortaleza de contraseña integrado en UI y forzado por Regex en el Backend (mínimo 8 caracteres, mayúscula, número y símbolo).
- **Mapeo de Errores Intuitivo:** Traducción de errores técnicos a lenguaje natural (Español Arg) para una UX empática.

### Módulo C: Directorio y Geolocalización (Sprint 2 - Core)
- **Motor Espacial:** Búsquedas por radio de cercanía utilizando `ST_DWithin` (SRID 4326).
- **Geocoding Integrado:** Uso de **Nominatim** para convertir direcciones en coordenadas `Point` de JTS al guardar perfiles.
- **Refactorización CQS (Command Query Separation):**
    - `/buscar/lista`: Vista paginada de alto rendimiento. Implementa una arquitectura de 2 pasos: primero se filtran y ordenan los IDs mediante SQL nativo (PostGIS) y luego se cargan las entidades completas con `@EntityGraph`.
    - `/buscar/mapa`: Vista masiva optimizada para renderizado rápido de puntos, sin paginación.
- **Ranking Geográfico Premium:** Algoritmo híbrido que prioriza explícitamente planes 'PRO' y 'Premium'.
- **Paginación del Lado del Servidor:** Integración de `Pageable` para manejo masivo de registros.
- **Blindaje de Rendimiento (EntityGraph):** Eliminación de latencia mediante la carga de `Usuario` y `Rubro` en una sola consulta SQL, evitando el problema de N+1 queries.
- **Motor de Búsqueda Tolerante:** Normalización automática de caracteres especiales (ej: `ñ` vs `n`) en el filtrado por rubro para mejorar la experiencia de búsqueda.
- **Hard Cap de Seguridad:** Límite estricto de 50km en búsquedas para prevenir ataques DoS por carga de memoria.

### Módulo D: Suscripciones y Monetización (Sprint 3)
- **Mercado Pago SDK:** Integración con Sandbox para planes Pro/Premium.
- **Webhook Engine:** Sincronización asíncrona de estados de pago como fuente única de verdad.
- **Control de Acceso:** Lógica de negocio para perfiles destacados y límites multimedia según el plan.

### Módulo E: Multimedia y Portafolio (Sprint 4)
- **Cloudinary Integration:** Gestión de imágenes y recursos multimedia en la nube.
- **Validación de Límites:** Restricción estricta de fotos (5 para Gratis, 20 para Premium) y validación de dominios de video (YouTube, TikTok, Instagram, Google Drive).
- **Graceful Downgrade:** Los recursos se mantienen en DB pero se filtran en la respuesta de la API basándose en la suscripción activa.

### Módulo F: Sistema de Reseñas y Reputación (Prestige V2 - Implementado)
- **Modelo de Prestigio Único:** Un usuario solo puede reseñar una vez a cada profesional, consolidando una reputación real y evitando el inflado artificial de métricas.
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

### Módulo G: Privacidad y Seguridad de Datos (Implementado)
- **Ofuscación Server-Side:** Protección de datos sensibles (Teléfono y Dirección Exacta) mediante enmascaramiento en el servidor.
- **Secure Reveal Mechanic:** Los datos reales solo se transmiten al cliente tras un evento de registro de intención de contacto, garantizando que cada acceso a información privada sea trazable y legítimo.
- **Blindaje contra Scraping:** El diseño impide que bots o usuarios malintencionados recolecten datos masivos mediante la inspección del DOM o el tráfico de red inicial.

---

## 3. Lo que hemos hecho hasta ahora (Resumen Técnico)

1.  **Arquitectura Limpia y Desacople:** Estructuración estricta en capas (Dominio, Aplicación, Infraestructura). Eliminación de "Clases Dios" transformándolas en Casos de Uso de Responsabilidad Única (SRP), y uso intensivo del Patrón Factory y Ports/Adapters para aislar dependencias externas (Supabase).
2.  **Lógica en Español:** Todo el dominio de negocio (`Rubro`, `PerfilProveedor`, `BuscarPerfilesCercanosUseCase`) está codificado en Español Latinoamericano.
3.  **Optimización Extrema:** Implementación de un `Hard Cap` de 50km en búsquedas y arquitectura de paginación eficiente que reduce el tráfico de red y el consumo de memoria.
4.  **UI/UX Premium en Framer:** Desarrollo de componentes reactivos con soporte para grilla dinámica (2-3 columnas), modo compacto profesional, fondos transparentes y filtros sincronizados con el backend.
5.  **Persistencia Robusta:** Esquema de base de datos que soporta perfiles duales (Empresas y Proveedores) compartiendo una base de geolocalización común y gestión estricta de planes de suscripción.

---

## 4. Próximos Pasos (Roadmap Inmediato)

1.  **Módulo H: Bolsa de Empleo:** Implementación de Ofertas de Trabajo con "Knockout Questions" (Preguntas de Filtro).
2.  **Módulo I: Postulaciones:** Sistema de envío de currículums nativos (JSONB) y gestión de estados.
3.  **Sistema de Notificaciones:** Alertas push/email sobre cambios en el estado de las postulaciones.

---
> [!NOTE]
> Este archivo ha sido generado automáticamente para sincronizar el estado del proyecto entre el equipo de desarrollo y los stakeholders.
