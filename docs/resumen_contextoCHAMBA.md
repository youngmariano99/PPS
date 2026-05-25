# Resumen de Contexto del Proyecto: CHAMBA

Este documento consolida el estado técnico, la arquitectura y los módulos implementados hasta la fecha en el proyecto **CHAMBA** (Marketplace de Servicios y Bolsa de Empleo), sirviendo como alineación previa al inicio de la **Versión 2 (Bolsa de Empleo y Transparencia)**.

---

## 1. Visión y Propósito del Proyecto
**CHAMBA** es una plataforma diseñada para unir oferta y demanda de servicios locales y empleo formal bajo dos pilares:
1. **Fricción Cero:** Minimizar los obstáculos de uso tanto para clientes como para profesionales/empresas.
2. **Geolocalización en Tiempo Real:** Uso nativo de coordenadas espaciales reales para búsquedas precisas de cercanía, evitando texto plano de direcciones.

---

## 2. Arquitectura de Software (Reglas Innegociables)
El backend está estructurado siguiendo estrictamente los principios de **Clean Architecture** y **SOLID**:
- **Desacoplamiento Estricto:** División clara en capas: **Dominio** (Modelos y Repositorios), **Aplicación** (Casos de Uso, DTOs y Puertos), **Infraestructura** (Controladores, Adaptadores y Configuraciones).
- **Código en Español:** El dominio de negocio (tablas, variables, métodos, clases y DTOs) está programado en **Español Latinoamericano** (ej. `PerfilProveedor`, `obtenerProveedoresCercanos()`), excepto palabras reservadas, convenciones globales (`Id`, `Url`, `JWT`) y sufijos del framework (`Controller`, `Service`, `Repository`, `UseCase`).
- **Casos de Uso de Responsabilidad Única (SRP):** Eliminación de "Clases Dios" (como el antiguo `DirectorioService`) dividiéndolas en clases atómicas con un único caso de uso (`BuscarPerfilesCercanosUseCase`, `GestionarPerfilProfesionalUseCase`, etc.).
- **Patrones de Diseño Aplicados:**
  - **Abstract Factory (`IPerfilFactory`):** Utilizado para instanciar polimórficamente los perfiles (Proveedor vs. Empresa) durante el registro, respetando el principio Open-Closed (OCP).
  - **Ports & Adapters (Hexagonal):** Aislamiento de integraciones externas (ej. `SupabaseAuthAdapter` para Supabase, `GeocodingService` para Nominatim) para proteger el core de la aplicación.
  - **CQS (Command Query Separation):** Separación de la lectura rápida (mapa sin paginación) de la lectura estructurada (lista paginada).

---

## 3. Stack Tecnológico

### Backend Core
- **Lenguaje:** Java 21.
- **Framework:** Spring Boot 3.4.4.
- **Base de Datos:** PostgreSQL con extensión espacial **PostGIS** (alojada en Supabase).
- **Persistencia:** Spring Data JPA + Hibernate Spatial + Hypersistence Utils (para mapeo de tipos JSONB nativos).
- **Seguridad:** Supabase Auth (GoTrue) + Spring Security (Filtro JWT) + Google OAuth (Sprint 5).
- **Notificaciones/Recuperación:** Gmail SMTP asíncrono.
- **Multimedia:** Cloudinary (subida de imágenes con cropping de coordenadas en URL).
- **Pasarela de Pagos:** SDK de Mercado Pago (Sandbox).
- **Documentación:** Swagger / OpenAPI 3.0.

### Frontend
- **Framework:** React.
- **Diseño & Animación:** Framer (Code Components) + CSS Vanilla premium (Glassmorphism).
- **Mapas:** Pigeon Maps (Leaflet) alimentados por OpenStreetMap.

---

## 4. Módulos y Funcionalidades Implementadas

### A. Seguridad, Identidad y Onboarding
- **Registro Atómico (Todo o Nada):** Creación simultánea y transaccional (`@Transactional`) de Usuario y Perfil para evitar datos huérfanos si una operación intermedia falla.
- **Wizard de Registro Premium:** UI interactiva en Framer de 4 pasos con persistencia de progreso y validaciones Regex de contraseñas.
- **OAuth Google & Gmail SMTP:** Flujo de registro híbrido directo con Google, verificación de email y recuperación de contraseña asíncrona mediante token en URL.

### B. Directorio y Geolocalización (Core Marketplace)
- **Motor Espacial:** Búsquedas por radio en metros mediante `ST_DWithin` sobre la curvatura de la Tierra (SRID 4326).
- **Geocoding Tolerante a Fallos:** Conversión automática de direcciones textuales a coordenadas (`Point` de JTS) consumiendo la API de Nominatim. Si falla Nominatim, se captura el error y se guarda el perfil con coordenadas previas sin interrumpir la experiencia.
- **Blindaje contra Consultas N+1:** Implementación de consultas en 2 pasos (primero se traen los UUIDs espaciales y luego se cargan las entidades completas y relaciones usando `@EntityGraph`).
- **Hard Cap de Seguridad:** Límite estricto de 50km en búsquedas espaciales para proteger la JVM contra desbordamientos de memoria.

### C. Sistema de Reseñas y Reputación (Prestige V2)
- **Modelo de Prestigio Único:** Límite de **una única reseña** por usuario para cada profesional (`unique_resena_usuario_propietario` en BD), evitando el inflado de reputación.
- **Cooldown de 24hs:** Trigger de base de datos (`validar_cooldown_resena`) que impide registrar una segunda reseña al mismo perfil en un día por parte del mismo usuario (Error HTTP 429).
- **Ranking Dinámico en Cascada:**
  1. *Suscripción:* Los perfiles Premium Activos siempre encabezan los resultados.
  2. *Proximidad:* Menor distancia real al usuario.
  3. *Calidad:* Promedio de estrellas en reseñas.
  4. *Presencia Visual:* Perfiles con foto de avatar.
  5. *Volumen:* Mayor cantidad de reseñas en total.

### D. Privacidad y Seguridad (Secure Reveal)
- **Ofuscación Server-Side:** Teléfono y dirección exacta se enmascaran en el backend.
- **Revelado Seguro:** El cliente real solo recibe los datos completos tras registrar una `intencion_contacto` mediante JWT, blindando la información contra scrapers y bots.

### E. Monetización y Multimedia
- **Mercado Pago Sandbox:** Planes Pro/Premium y procesamiento asíncrono de suscripciones mediante Webhooks autenticados por firma HMAC.
- **Graceful Downgrade (Cloudinary):** Si un profesional Premium (límite de 20 fotos en portafolio) vuelve al plan Gratuito (límite de 5), sus fotos no se borran de la base de datos; simplemente, la API restringe dinámicamente la visualización a las primeras 5.

---

## 5. Próxima Etapa: Versión 2 (Bolsa de Empleo y Transparencia)
Esta fase implementará las funcionalidades de reclutamiento bajo tres tablas del esquema que ya han sido diseñadas pero no codificadas a nivel de backend:

1. **Gestión de Ofertas (`ofertas_empleo`):** Publicación por parte de Empresas y Proveedores con modalidad (Remoto/Híbrido/Presencial), rango salarial y habilidades requeridas.
2. **Preguntas Excluyentes (Knockout Questions):**
   - Tabla `preguntas_filtro_oferta` (Si/No o Texto Corto) y respuestas esperadas.
   - Validación obligatoria en `PostulacionService`: rechazo automático (400 Bad Request) si el candidato no responde, y asignación de prioridad baja o auto-descarte si las respuestas no coinciden con la excluyente.
3. **Currículum Híbrido (`curriculums_nativos`):**
   - Experiencia y educación almacenados en un campo dinámico `JSONB` de PostgreSQL.
   - Posibilidad de adjuntar un PDF opcional (`cv_url_adjunto`) que sobrescribe temporalmente el CV para esa postulación sin alterar los datos maestros del usuario.
4. **Anti Soft-Rejection (Cierre del "Agujero Negro"):**
   - Transición automática del estado de la postulación de `ENVIADO` a `VISTO` en cuanto la empresa consume el detalle del candidato.
   - Bloqueo a nivel transaccional que impide que una postulación pase a `DESCARTADO` sin proveer un `motivo_rechazo_codigo` obligatorio, proporcionando feedback real al postulante.
