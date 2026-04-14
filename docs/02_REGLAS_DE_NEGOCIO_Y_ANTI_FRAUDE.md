# 02_REGLAS_DE_NEGOCIO_Y_ANTI_FRAUDE: Lógica Core del Marketplace

## 1. Objetivo del Documento
Este archivo define el "Por Qué" y el "Cómo" de las reglas de negocio más críticas de la plataforma. La IA DEBE consultar este documento antes de implementar controladores o servicios relacionados con reseñas, postulaciones laborales o interacciones entre usuarios para garantizar que la lógica empresarial y las protecciones anti-fraude se apliquen correctamente.

## 2. Sistema Anti-Spam y Reseñas (Fricción Cero vs. Seguridad)
La plataforma equilibra una experiencia de usuario fluida con una seguridad estricta contra bots y ataques de reputación.

* **Contactos Ilimitados (UX):** Crear una `intencion_contacto` (hacer clic en "Contactar" para ver un teléfono/WhatsApp) NO tiene restricciones de tiempo. Si el usuario cierra la pestaña por error, puede volver a contactar sin fricción.
* **El Cooldown de 24hs (Seguridad):** La creación de una reseña está protegida a nivel de base de datos por el Trigger `validar_cooldown_resena()`. 
* **Regla para la IA:** En el Backend (Spring Boot), al capturar la excepción SQL lanzada por este trigger (`COOLDOWN_RESENA`), el `ResenaService` debe atraparla y lanzar una excepción de negocio personalizada (`CooldownException`) para que el controlador devuelva un HTTP 429 (Too Many Requests) o 400 (Bad Request) con un mensaje amigable al frontend.

## 3. Moderación y Derecho a Réplica
El sistema no otorga poder absoluto ni al cliente ni al proveedor.
* **Inmutabilidad del Cliente:** Una vez que un cliente publica una reseña, no puede editarla (para evitar extorsiones).
* **Derecho a Réplica:** El proveedor evaluado no puede borrar la reseña, pero TIENE el derecho a responderla públicamente una única vez actualizando el campo `respuesta_proveedor`.
* **Sistema de Reportes:** Si el proveedor considera que la reseña es fraudulenta (ej. no hubo servicio real), usa la tabla `reportes_resenas`.
* **Regla para la IA:** El endpoint de creación de reportes debe exigir obligatoriamente un `motivo` y permitir opcionalmente una `evidencia_url` (ej. captura de pantalla alojada en Supabase Storage).

## 4. Cierre del "Agujero Negro" (Transparencia en Postulaciones)
El mayor problema del mercado laboral actual es la incertidumbre del candidato. El sistema obliga a las empresas a ser transparentes mediante las transiciones de estado en la tabla `postulaciones`.

* **Transición Automática a VISTO:** Cuando el endpoint de "Obtener Perfil de Candidato" es consumido por una Empresa que tiene una postulación pendiente de ese usuario, el sistema DEBE actualizar automáticamente el estado de la postulación de `ENVIADO` a `VISTO` (si no lo estaba ya).
* **El Rechazo Suave (Soft Rejection):** Está estrictamente PROHIBIDO pasar una postulación al estado `DESCARTADO` sin proveer un motivo. 
* **Regla para la IA:** El método en Spring Boot para descartar un candidato (`rechazarPostulacion`) debe recibir obligatoriamente un `motivo_rechazo_codigo` (ej. "EXPECTATIVA_SALARIAL", "FALTA_EXPERIENCIA") para dar retroalimentación real al postulante.

## 5. El Currículum Híbrido y Preguntas de Filtro (Knockout Questions)
Para maximizar la eficiencia en el proceso de reclutamiento:

* **CV Nativo vs. Adjunto:** El sistema prioriza la información estructurada en `curriculums_nativos` (JSONB) para que las empresas puedan filtrar rápido. Sin embargo, permite subir un PDF específico para la oferta en `cv_url_adjunto` dentro de la postulación.
* **Knockout Questions (Filtro Rápido):** Las ofertas pueden tener preguntas excluyentes (`preguntas_filtro_oferta`). 
* **Regla para la IA:** El `PostulacionService` DEBE verificar que, si la oferta tiene preguntas de filtro configuradas, el candidato haya enviado el array de `respuestas_candidato` correspondiente ANTES de guardar la postulación. Si las respuestas no coinciden con la `respuesta_esperada_excluyente`, la postulación puede ser marcada automáticamente con un flag interno o estado de baja prioridad.

## 6. Algoritmo de Ranking y Geolocalización (PostGIS)
El orden en que se muestran los proveedores en el buscador no es al azar.
* **Distancia Real:** El primer filtro siempre es espacial. La IA debe usar Hibernate Spatial y consultas como `ST_DWithin` para traer perfiles dentro de un radio en kilómetros basado en la ubicación (`GEOGRAPHY(Point, 4326)`).
* **Ponderación de Relevancia:** Una vez filtrados por distancia, el orden (ORDER BY) debe considerar:
  1. Promedio de estrellas en `resenas`.
  2. Cantidad total de reseñas (para desempatar o premiar trayectoria).
  3. Perfil completo (si tiene portafolio o no).s