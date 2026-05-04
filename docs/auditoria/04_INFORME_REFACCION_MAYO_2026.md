# 04_INFORME_REFACCION_MAYO_2026: Auditoría y Refactorización Profunda

**Fecha de finalización (Pausa Segura):** 04 de Mayo de 2026  
**Estado:** Estable (Build Success)

## 1. El Problema Original (¿Por qué refactorizamos?)

Durante una auditoría arquitectónica profunda del código base, detectamos severas violaciones a los principios **SOLID** y a las reglas de la **Arquitectura Limpia (Clean Architecture)**:

1.  **"Clase Dios" (God Class):** El archivo `DirectorioServiceImpl.java` contaba con casi 600 líneas de código y aglomeraba múltiples responsabilidades totalmente dispares: lógicas espaciales (PostGIS), obtención de perfiles, validación de reglas de negocio para multimedia (Cloudinary) y creación/actualización de entidades. Esto violaba flagrantemente el Principio de Responsabilidad Única (SRP).
2.  **Acoplamiento a Infraestructura Externa:** `AuthServiceImpl.java` realizaba llamadas HTTP directas (`RestClient`) a la API de Supabase Auth, ensuciando la capa de aplicación con detalles de red y parseo de JSON.
3.  **Violación del Principio Abierto/Cerrado (OCP):** En `AuthServiceImpl.java`, el método de registro contenía un bloque `if/else` gigantesco para discernir entre crear un perfil de "PROVEEDOR" o "EMPRESA". Si el día de mañana se agregaba un nuevo tipo de usuario, la clase debía ser modificada obligatoriamente, haciéndola propensa a errores.
4.  **Estructura de Paquetes Plana:** Los DTOs, Excepciones y Controladores estaban mezclados en el nivel raíz del proyecto, sin diferenciar claramente los límites arquitectónicos de Dominio, Aplicación e Infraestructura.

## 2. Acciones Realizadas y Decisiones Tomadas

Para solucionar esta deuda técnica, ejecutamos un plan progresivo dividido en fases para garantizar que el proyecto nunca se rompiera:

### Fase 1: Cimientos y Abstracción (DIP)
-   **Acción:** Se crearon las interfaces `IDirectorioUseCase` e `IAuthUseCase`.
-   **Por qué:** Para aplicar el Principio de Inversión de Dependencias (DIP). Los controladores dejaron de depender de implementaciones concretas y pasaron a depender de contratos (interfaces).

### Fase 2: Muerte de la "Clase Dios"
-   **Acción:** Se fragmentó `DirectorioServiceImpl` en 4 Casos de Uso modulares (`BuscarPerfilesCercanosUseCase`, `ConsultarDetallePerfilUseCase`, `ValidarMultimediaUseCase`, `GestionarPerfilProfesionalUseCase`). Una vez vaciada, la clase original fue eliminada.
-   **Por qué:** Para respetar el SRP. Ahora cada clase hace una sola cosa y tiene una única razón para cambiar. Si falla la búsqueda en el mapa, sabemos exactamente qué archivo revisar sin tocar la lógica de creación de perfiles.

### Fase 3: Patrones de Diseño y Desacople
-   **Acción (Adaptadores):** Se extrajo la lógica HTTP de Supabase a un puerto `ISupabaseAuthPort` y un adaptador `SupabaseAuthAdapter` (en la capa de infraestructura).
-   **Por qué:** Para aislar la regla de negocio de los detalles de HTTP/APIs externas. `AuthServiceImpl` ya no sabe (ni le importa) cómo se comunica el sistema con Supabase.
-   **Acción (Factory Pattern):** Se creó la interfaz `IPerfilFactory` con implementaciones concretas para Proveedores y Empresas, inyectadas como una lista en `AuthServiceImpl`.
-   **Por qué:** Para destruir el `if/else` gigante (OCP). Ahora, el servicio delega la instanciación a la fábrica correspondiente mediante polimorfismo. Si se añade un nuevo rol, solo se crea una nueva clase Factory y el servicio base queda intacto.

### Fase 4 (Parcial): Reestructuración Física
-   **Acción:** Se migraron todos los DTOs de `com.PPS.PPS.dto` a `com.PPS.PPS.application.dto`.
-   **Por qué:** Un DTO es un objeto de transferencia de datos de la capa de Aplicación. Ubicarlo en su paquete correcto aporta claridad semántica al proyecto.

## 3. Conclusión

El proyecto es ahora mucho más robusto, predecible y extensible. La legibilidad del código mejoró exponencialmente, y cualquier desarrollador que ingrese al equipo podrá localizar rápidamente la lógica de negocio basándose en nombres de Casos de Uso claramente definidos.
