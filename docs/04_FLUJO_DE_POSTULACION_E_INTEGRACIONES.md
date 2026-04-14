# 04_FLUJO_DE_POSTULACION_E_INTEGRACIONES: Casos de Uso Críticos

## 1. Objetivo del Documento
Este documento define los algoritmos y flujos de integración exactos para los módulos más complejos del sistema. La IA DEBE seguir estos pasos lógicos al implementar los Servicios (Application Layer) en Spring Boot para garantizar la integridad de los datos y la experiencia del usuario.

## 2. Flujo 1: Geolocalización (PostGIS + OpenStreetMap)
El sistema no guarda direcciones de texto simples para las búsquedas, sino puntos geográficos matemáticos.

* **Paso a Paso de la Integración:**
  1. **Geocoding (Nominatim):** Cuando el Proveedor/Empresa carga o actualiza su dirección (`calle`, `numero`, `ciudad`, `provincia`), el backend o frontend debe consumir la API gratuita de OpenStreetMap (Nominatim) para convertir ese texto en una `Latitud` y `Longitud`.
  2. **Persistencia (Spring Boot):** El servicio Java recibe esas coordenadas y utiliza la librería JTS (`org.locationtech.jts.geom.Point`) y la factoría geométrica con SRID 4326 para crear el objeto espacial.
  3. **Guardado:** Se persiste en la columna `ubicacion GEOGRAPHY` de la base de datos a través de Hibernate Spatial.
* **Regla para la IA (Búsquedas):** Para el endpoint de "Buscar Proveedores Cercanos", el `Repository` DEBE utilizar consultas espaciales nativas o JPQL con funciones de PostGIS como `ST_DWithin` para calcular distancias en metros reales sobre la curvatura terrestre.

## 3. Flujo 2: El Currículum Híbrido
El candidato tiene dos formas de presentar sus datos al postularse a una oferta.

* **Lógica del Servicio (`PostulacionService`):**
  1. El sistema debe priorizar el `curriculum_nativo` (el JSONB asociado a su perfil de usuario) como fuente principal de verdad.
  2. Al crear la Postulación, si el DTO de entrada incluye un archivo en `cv_url_adjunto`, este PDF debe asociarse a esta postulación específica como un "Override" (sobrescritura manual), pero no debe borrar el JSONB del usuario.
* **Regla para la IA:** El DTO de respuesta para la Empresa debe empaquetar de forma transparente tanto los datos del JSONB parseados como el enlace al PDF (si existe), para que el frontend decida cómo renderizarlos.

## 4. Flujo 3: Preguntas de Filtro (Knockout Questions)
Es el mecanismo principal para descartar perfiles no calificados antes de que el reclutador los lea.

* **Lógica Transaccional (Obligatoria):**
  1. Cuando un usuario intenta postularse a una `oferta_id`, el `PostulacionService` DEBE consultar primero la tabla `preguntas_filtro_oferta`.
  2. Si la oferta tiene preguntas activas, el DTO entrante de la postulación DEBE contener un array con las respuestas exactas (`respuestas_candidato`). Si faltan respuestas, se debe lanzar una excepción de negocio (`400 Bad Request`).
  3. **Auto-Descarte (Triaje):** Si la pregunta tenía configurada una `respuesta_esperada_excluyente` y el candidato respondió otra cosa, el sistema permite guardar la postulación, pero puede marcarla internamente con un flag de baja prioridad para el algoritmo de ordenamiento de la empresa.

## 5. Flujo 4: Transiciones de Estado y "Agujero Negro"
Implementación estricta de la trazabilidad para la paz mental del candidato.

* **Patrón de Comportamiento Sugerido:** Utilizar el patrón **State** o validaciones estrictas en el servicio para evitar que una postulación salte de `ENVIADO` a `CONTACTADO` sin pasar por los estados intermedios lógicos.
* **Transición Implícita (VISTO):** * La IA debe programar un mecanismo (puede ser un aspecto `@Around` o lógica en el controlador) donde, al momento de que la Empresa solicita el endpoint `GET /postulaciones/{id}`, el estado de esa postulación cambie automáticamente a `VISTO` y se actualice el `updated_at`.
* **Transición Explícita (Rechazo Suave):**
  * La acción de descartar un candidato es un método crítico: `descartarPostulacion(UUID postulacionId, String motivoCodigo)`. 
  * Si el `motivoCodigo` es nulo o vacío al intentar pasar al estado `DESCARTADO`, la IA debe lanzar una `IllegalArgumentException` inmediatamente. La trazabilidad es innegociable.