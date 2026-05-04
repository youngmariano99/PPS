# 02_REGLAS_DE_NEGOCIO_Y_ANTI_FRAUDE: Lógica Core del Marketplace

## 1. Objetivo del Documento
Este archivo define el "Por Qué" y el "Cómo" de las reglas de negocio más críticas de la plataforma. La IA DEBE consultar este documento antes de implementar controladores o servicios relacionados con reseñas, postulaciones laborales o interacciones entre usuarios para garantizar que la lógica empresarial y las protecciones anti-fraude se apliquen correctamente.

## 2. Sistema Anti-Spam y Reseñas (Fricción Cero vs. Seguridad)
La plataforma equilibra una experiencia de usuario fluida con una seguridad estricta contra bots y ataques de reputación.

* **Contactos Ilimitados (UX):** Crear una `intencion_contacto` (hacer clic en "Contactar" para ver un teléfono/WhatsApp) NO tiene restricciones de tiempo. Si el usuario cierra la pestaña por error, puede volver a contactar sin fricción.
* **El Cooldown de 24hs (Seguridad):** La creación de una reseña está protegida a nivel de base de datos por el Trigger `validar_cooldown_resena()`. 
* **Regla para la IA:** En el Backend (Spring Boot), al capturar la excepción SQL lanzada por este trigger (`COOLDOWN_RESENA`), el `ResenaService` debe atraparla y lanzar una excepción de negocio personalizada (`CooldownException`) para que el controlador devuelva un HTTP 429 (Too Many Requests) o 400 (Bad Request) con un mensaje amigable al frontend.

## 3. Sistema de Prestigio y Reseñas (Modelo Prestige V2)
El sistema ha evolucionado de un modelo basado en transacciones a uno basado en el **Prestigio del Vínculo**. El objetivo es construir una reputación sólida y evitar el spam de reseñas.

* **Regla de Unicidad (Prestige):** Un usuario solo puede dejar **una única reseña** por proveedor/empresa en toda la historia del vínculo. No se permite reseñar múltiples veces al mismo profesional para "inflar" su ranking.
    *   *Implementación:* Restricción UNIQUE en la base de datos entre `usuario_id` y `propietario_id`.
* **Reseñas Duales y Verificación:**
    *   **Reseña de Contacto:** Se origina tras una intención de contacto registrada. Incluye el badge "Contacto Verificado".
    *   **Trabajo Verificado:** Se origina tras una contratación formal en la plataforma. Tiene el mayor peso visual y en el algoritmo de ranking.
* **Inmutabilidad:** Una vez publicada, la reseña no puede ser editada por el cliente para evitar extorsiones o cambios de opinión por presión del profesional.
* **Derecho a Réplica:** El profesional tiene derecho a responder públicamente una única vez.
* **Escudo Anti-Fraude (Bloqueo IP):** El sistema bloquea intentos de auto-reseña comparando la IP del emisor con la del receptor.

## 4. Protección de Datos Sensibles (Privacidad por Diseño)
Para proteger la integridad de los profesionales y evitar el scraping masivo de datos, el sistema aplica una política estricta de visibilidad:

* **Ofuscación Server-Side:** El número de teléfono y la dirección exacta (calle y número) se ofuscan en el servidor antes de enviar la respuesta al cliente si el consultante no es el dueño del perfil.
* **Mecanismo de Revelación (Secure Reveal):** Los datos sensibles solo se transmiten de forma real y completa DESPUÉS de que el usuario realiza una acción de "Lead" (clic en Contactar). 
* **Trazabilidad:** Cada vez que un dato sensible es revelado, queda registrado como una `intencion_contacto`, permitiendo al profesional saber quién y cuándo consultó su información privada.

## 5. Cierre del "Agujero Negro" (Transparencia en Postulaciones)
El mayor problema del mercado laboral actual es la incertidumbre del candidato. El sistema obliga a las empresas a ser transparentes mediante las transiciones de estado en la tabla `postulaciones`.

* **Transición Automática a VISTO:** Cuando el endpoint de "Obtener Perfil de Candidato" es consumido por una Empresa que tiene una postulación pendiente de ese usuario, el sistema DEBE actualizar automáticamente el estado de la postulación de `ENVIADO` a `VISTO` (si no lo estaba ya).
* **El Rechazo Suave (Soft Rejection):** Está estrictamente PROHIBIDO pasar una postulación al estado `DESCARTADO` sin proveer un motivo. 
* **Regla para la IA:** El método en Spring Boot para descartar un candidato (`rechazarPostulacion`) debe recibir obligatoriamente un `motivo_rechazo_codigo` (ej. "EXPECTATIVA_SALARIAL", "FALTA_EXPERIENCIA") para dar retroalimentación real al postulante.

## 6. El Currículum Híbrido y Preguntas de Filtro (Knockout Questions)
Para maximizar la eficiencia en el proceso de reclutamiento:

* **CV Nativo vs. Adjunto:** El sistema prioriza la información estructurada en `curriculums_nativos` (JSONB) para que las empresas puedan filtrar rápido. Sin embargo, permite subir un PDF específico para la oferta en `cv_url_adjunto` dentro de la postulación.
* **Knockout Questions (Filtro Rápido):** Las ofertas pueden tener preguntas excluyentes (`preguntas_filtro_oferta`). 
* **Regla para la IA:** El `PostulacionService` DEBE verificar que, si la oferta tiene preguntas de filtro configuradas, el candidato haya enviado el array de `respuestas_candidato` correspondiente ANTES de guardar la postulación. Si las respuestas no coinciden con la `respuesta_esperada_excluyente`, la postulación puede ser marcada automáticamente con un flag interno o estado de baja prioridad.

## 7. Algoritmo de Ranking y Geolocalización (PostGIS)
El orden en que se muestran los proveedores en el buscador no es al azar.
* **Distancia Real:** El primer filtro siempre es espacial. La IA debe usar Hibernate Spatial y consultas como `ST_DWithin` para traer perfiles dentro de un radio en kilómetros basado en la ubicación (`GEOGRAPHY(Point, 4326)`).
* **Ponderación de Relevancia (Cascada de 5 Niveles):** Una vez filtrados por distancia, el orden (`ORDER BY` nativo + Sort Java) aplica estrictamente este orden:
  1.  **Suscripción Premium (Excluyente):** Los usuarios con plan 'Premium' ACTIVO siempre encabezan la lista, sin importar la distancia (dentro del radio).
  2.  **Proximidad:** El sistema prioriza al profesional más cercano ante igual categoría de suscripción.
  3.  **Calidad (Promedio de Estrellas):** Reputación basada en reseñas verificadas.
  4.  **Confianza Visual (isPerfilCompleto):** Perfiles con foto sobre los anónimos.
  5.  **Cantidad de Reseñas:** Volumen de trabajo verificado (desempate final).

## 8. Gestión Multimedia y Límites por Suscripción
La plataforma monetiza mediante la visibilidad y capacidad de portafolio, protegiendo al mismo tiempo el almacenamiento del servidor y el esfuerzo del usuario.

* **Suscripción como Única Fuente de Verdad:** Está estrictamente PROHIBIDO usar flags estáticos en la tabla de usuarios. El sistema DEBE consultar en tiempo real la tabla `suscripciones_usuario` filtrando por `estado = 'ACTIVA'`.
* **Preservación de Datos (Graceful Downgrade):** Si un usuario Premium cancela su plan, sus recursos (hasta 20) NO se eliminan. Se mantienen en la base de datos para facilitar el regreso al plan de pago.
* **Límites de Visibilidad Pública (S4 - Validado):** 
    * **Premium:** Se muestran todas las fotos cargadas (límite 20).
    * **Gratuito:** Solo se muestran **5 fotos** del portafolio.
* **Validación de Dominios de Video:** Solo se permiten enlaces de YouTube, TikTok, Instagram y Google Drive (validado por `VIDEO_PATTERN` en el Service).
* **Regla para la IA:** El `DirectorioService` es el responsable de aplicar estos filtros de visibilidad en las consultas públicas.