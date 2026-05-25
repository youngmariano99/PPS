# Plan de Trabajo: Bolsa de Empleo y Transparencia (Versión 2)

Este documento define la planificación paso a paso para la implementación de la Bolsa de Empleo y el Sistema de Postulaciones en **CHAMBA**. La versión se divide en 4 partes auto-contenidas para asegurar un progreso estable y evitar la saturación de funcionalidades.

---

## 📋 Lista de Control de Progreso

### Parte 1: Ofertas de Empleo y Preguntas de Filtro (Backend & DB Core)
Implementación de la infraestructura de base de datos y endpoints CRUD de las ofertas de trabajo junto con sus preguntas excluyentes.

- [ ] **1.1 Ajuste e Implementación de Esquema SQL**
  - [ ] Crear/Actualizar las tablas `ofertas_empleo` y `preguntas_filtro_oferta` en la base de datos de PostgreSQL (Supabase).
  - [ ] Corregir el constraint de propietario en `ofertas_empleo` (reemplazar la columna inexistente `usuario_id` por `proveedor_id` en el check constraint).
- [ ] **1.2 Dominio y Persistencia (JPA)**
  - [ ] Crear las entidades JPA `OfertaEmpleo` y `PreguntaFiltroOferta`.
  - [ ] Mapear la relación `@OneToMany` bidireccional en cascada entre Oferta y Preguntas.
  - [ ] Crear los repositorios JPA (`OfertaEmpleoRepository` y `PreguntaFiltroOfertaRepository`).
- [ ] **1.3 Capa de Aplicación (Casos de Uso y DTOs)**
  - [ ] Diseñar DTOs de solicitud (`CrearOfertaSolicitudDto`) y respuesta (`OfertaRespuestaDto`).
  - [ ] Implementar el Caso de Uso `PublicarOfertaUseCase` para que las Empresas o Proveedores Destacados puedan publicar.
  - [ ] Implementar el Caso de Uso `ListarOfertasUseCase` con soporte de paginación y filtros.
- [ ] **1.4 Capa de Presentación (REST API)**
  - [ ] Desarrollar `OfertaController` con endpoints:
    - `POST /api/v1/ofertas` (Crear con preguntas en cascada).
    - `GET /api/v1/ofertas` (Listar activas de forma pública).
    - `GET /api/v1/ofertas/propias` (Ver ofertas creadas por el usuario autenticado).
    - `DELETE /api/v1/ofertas/{id}` (Baja lógica).

---

### Parte 2: Currículum Nativo y Postulaciones con Knockout Questions (Lógica de Negocio)
Estructuración del currículum dinámico (JSONB), postulaciones y lógica de triaje/filtro automático para optimizar la selección.

- [ ] **2.1 Implementación del Currículum Nativo (JSONB)**
  - [ ] Crear la tabla y la entidad `CurriculumNativo` con mapeo de columnas `JSONB` para experiencia laboral, educación y habilidades usando `hypersistence-utils`.
  - [ ] Implementar CRUD de Currículum Nativo asociado al perfil del usuario.
- [ ] **2.2 Infraestructura de Postulaciones**
  - [ ] Crear las tablas y entidades para `Postulacion` y `RespuestaCandidato`.
  - [ ] Implementar relaciones y llaves de unicidad (un candidato solo se postula una vez por oferta).
- [ ] **2.3 Lógica de Triaje y Knockout Questions (`PostularseOfertaUseCase`)**
  - [ ] Desarrollar el servicio de postulación: verificar que el candidato responda todas las preguntas asociadas a la oferta.
  - [ ] **Validación Anti-Errores:** Controlar el tipado de respuestas (ej. combos predefinidos para `SI_NO`) en el DTO de entrada.
  - [ ] **Flag de Exclusión/Compatibilidad:** Si el candidato responde de forma incorrecta a una pregunta marcada como `respuesta_esperada_excluyente`, la postulación se guarda con un flag `es_excluido = true` (o prioridad baja) para que la empresa pueda filtrar rápidamente sin eliminar el registro del candidato.
  - [ ] **Validación de URL de Drive:** Comprobar que `cv_url_adjunto` (si es provisto) sea un formato de archivo válido y pertenezca a dominios aprobados como Google Drive (`drive.google.com`) con límite máximo de tamaño lógico (ej. 5MB).

---

### Parte 3: Transiciones de Estado y Sistema Anti-Soft Rejection
Manejo transparente de los estados de la postulación para dar visibilidad al candidato sobre su proceso de selección.

- [ ] **3.1 Cierre del "Agujero Negro" (Estados de Selección)**
  - [ ] Programar la transición automática a `VISTO` al consultar el detalle de una postulación desde el rol de Empresa.
  - [ ] Implementar la validación estricta en el método `descartarPostulacion`: lanzar excepción de negocio (`ValidacionNegocioException`) si el `motivo_rechazo_codigo` es nulo o vacío.
- [ ] **3.2 Sistema de Notificaciones Internas (Eventos)**
  - [ ] Crear un publicador de eventos asíncrono para notificaciones internas (tabla `notificaciones`).
  - [ ] Diseñar el servicio bajo el patrón **Observer / Strategy** para que sea extensible a otros canales futuros (ej. WhatsApp o alertas SMTP secundarias) sin modificar la lógica transaccional core.

---

### Parte 4: Frontend y Experiencia de Usuario (React + Framer)
Desarrollo de las interfaces premium de la bolsa de empleo con previsualizaciones integradas y gestión de candidatos.

- [ ] **4.1 Panel de Ofertas para Candidatos**
  - [ ] Diseñar el listado y buscador de ofertas laborales.
  - [ ] Diseñar la ficha de la oferta y el formulario interactivo de postulación (Wizard con combos para Knockout Questions y carga de link de Google Drive).
- [ ] **4.2 Editor de CV Nativo (Perfil)**
  - [ ] Interfaz multi-sección para agregar, editar y eliminar experiencias y estudios con almacenamiento en formato estructurado JSON.
- [ ] **4.3 Panel de Control para Empresas (Reclutador)**
  - [ ] UI de publicación de ofertas con creador dinámico de preguntas de filtro.
  - [ ] Listado de postulantes de cada oferta, con filtrado rápido de candidatos excluidos (flag de knockout) vs. compatibles.
  - [ ] Detalle del candidato: renderizado del CV Nativo e **iframe integrado para vista previa de PDF de Google Drive**.
  - [ ] Modal de descarte con selección obligatoria del código de motivo.

---

## 🛠️ Convenciones de Desarrollo

1. **Clean Architecture:** Mantener la lógica de negocio en la capa de Aplicación/Casos de uso. Los controladores solo mapean DTOs y llaman a los UseCases.
2. **Nombres de Clases en Español:** Tablas y modelos siguen los nombres de `01_MODELO_DE_DATOS.md`.
3. **Manejo de Errores:** Registrar códigos claros para el frontend en el `ManejadorGlobalExcepciones` (ej. `CODIGO_MOTIVO_REQUERIDO`, `RESPUESTAS_INCOMPLETAS`).
