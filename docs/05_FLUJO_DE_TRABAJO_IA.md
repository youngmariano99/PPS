# 05_FLUJO_DE_TRABAJO_IA: Procedimiento Operativo Estricto

## OBJETIVO Y USO DEL ARCHIVO
Este documento es el **PUNTO DE ENTRADA ÚNICO**. Cada vez que el usuario inicie una petición para construir, editar o refactorizar código en este proyecto de Java/Spring Boot o React (referenciando este archivo, ej: `@05_FLUJO_DE_TRABAJO_IA.md`), la IA DEBE ejecutar este algoritmo exacto.

## 🛑 REGLA SUPREMA: PROHIBIDO INVENTAR (Anti-Alucinaciones)
Todo lo que la IA genere DEBE tener un respaldo en la documentación provista o en las instrucciones del usuario. 
* **Falta de Contexto:** Si un requerimiento es ambiguo, si no se encuentran los archivos pertinentes referenciados, o si el esquema de base de datos no coincide con lo pedido: **LA IA SE DETIENE INMEDIATAMENTE**.
* NO asumas decisiones de negocio. NO inventes código de relleno para que "compile".
* **Acción Requerida:** La IA debe devolver EXCLUSIVAMENTE una plantilla llamada `CUESTIONARIO_DUDAS.md` con preguntas claras para que el usuario la llene. Solo se avanzará cuando el usuario resuelva esas dudas.

---

## PASO 1: Ingestión de Contexto (OBLIGATORIO)
Antes de proponer una sola línea de código, la IA debe leer en silencio y asimilar la arquitectura.
* **Siempre:** Leer `00_CONTEXTO_GLOBAL.md` y `01_MODELO_DE_DATOS.md`.
* **Según el Dominio:** Leer `02_REGLAS_DE_NEGOCIO_Y_ANTI_FRAUDE.md` o `04_FLUJO_DE_POSTULACION_E_INTEGRACIONES.md` si la tarea involucra reseñas, postulaciones o geolocalización.
* **Si la tarea toca APIs/Endpoints:** Leer `07_ARQUITECTURA_FRONTEND_Y_API.md`.
* **Validación:** Si la IA detecta que la petición del usuario contradice estos documentos (ej. pide usar lógica espagueti en un controlador en lugar de un Patrón Strategy), DEBE advertir al usuario sobre la violación arquitectónica antes de proceder.

## PASO 2: Planificación Arquitectónica
La IA NO DEBE escupir cientos de líneas de código de una vez. Antes de programar, debe presentar un plan breve:
1. Enumerar qué capas (Controller, Service, Repository, DTO, Entity) o componentes de React va a tocar.
2. **Definición de Patrones:** Confirmar explícitamente qué Patrón de Diseño (Factory, Strategy, Decorator, Proxy, State) va a utilizar si la lógica incluye condicionales complejos o instanciación de objetos pesados. NUNCA crear métodos controladores de flujo masivos (if/else o switch).
3. **Control de Cambios SQL:** Si la tarea implica cambios en la base de datos:
    * Toda modificación a tablas existentes DEBE reflejarse de dos formas en `01_MODELO_DE_DATOS.md`:
        1. Actualizar el bloque `CREATE TABLE` original.
        2. Añadir el bloque `ALTER TABLE` correspondiente en la sección de "Historial de Migraciones (Scripts de Actualización)" al final del script SQL.

## PASO 3: Ejecución Estricta (Reglas de Código en Java/React)
* **Modularidad:** Respetar el límite de ~350 a 400 líneas por archivo. Si un `Service` o `Component` crece, dividir responsabilidades en componentes más pequeños.
* **Nomenclatura (Español Latinoamericano):** Mantener los nombres de tablas, variables, clases, métodos y DTOs en español, EXACTAMENTE como figuran en el `01_MODELO_DE_DATOS.md`. Solo se mantienen en inglés las palabras reservadas, convenciones globales (`Id`, `Url`) y sufijos arquitectónicos (`Controller`, `Service`, `Repository`, `Hook`).
* **Documentación (Javadoc):** Incluir comentarios claros y en español en cada clase, interfaz y método complejo, explicando qué hace, qué recibe y qué retorna.

## PASO 4: Generación Visual (Code Components para Framer)
Si el módulo desarrollado tiene un impacto visual directo para el usuario (formularios, listados, tarjetas de perfil, indicadores), la IA debe proceder de forma autónoma:
* **Branding:** Aplicar estrictamente los colores y tipografía definidos en `08_BRANDING_FRONT.md`.
* **Propiedades de Diseño:** Exponer parámetros mediante `addPropertyControls` para que el usuario de Framer pueda personalizar el componente (colores, bordes, URL del API) sin tocar el código.
* **Sincronización:** El componente debe estar preparado para conectarse al backend vía `apiUrl` y manejar el JWT de Supabase si la acción es protegida.

## PASO 5: Sincronización de Contratos API
* Si se creó, modificó o eliminó un `Controller` (Endpoint), generar el código JavaScript equivalente en `/front/src/api/`.

## PASO 6: Micro-Documentación Posterior (El Registro)
* Actualizar el archivo `HISTORIAL_CAMBIOS.md` utilizando el formato estricto de 4 líneas.