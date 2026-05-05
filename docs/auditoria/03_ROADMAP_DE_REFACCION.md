# 03_ROADMAP_DE_REFACCION: Plan de Acción Micro-Progresivo

Este roadmap ha sido rediseñado con una **granularidad extrema** para garantizar una ejecución segura por parte de la IA o de cualquier desarrollador. 

⚠️ **REGLA DE ORO DE EJECUCIÓN:**  
DEBES ejecutar estrictamente **UNA tarea a la vez**. Por cada tarea (checkbox), debes aislar el cambio, asegurarte de que el código compila, revisar que nada se haya roto, y solo entonces pasar a la siguiente. **NUNCA** combines múltiples tareas en una sola iteración de código.

---

## FASE 1: Preparación Estructural e Interfaces (Sin cambios de lógica)
**Objetivo:** Preparar el terreno creando abstracciones (DIP) sin tocar el interior de los métodos ni mover archivos pesados.

- [x] **Tarea 1.1: Crear esqueleto de paquetes Clean Architecture.** 
  Crear los paquetes vacíos: `domain/model`, `domain/repository`, `application/usecase`, `application/dto`, `infrastructure/adapter/in/web`, `infrastructure/adapter/out/persistence`, y `infrastructure/adapter/out/api`. NO mover código existente todavía.
- [x] **Tarea 1.2: Extraer Interfaz de DirectorioService.** 
  Renombrar `DirectorioService` a `DirectorioServiceImpl`. Crear la interfaz `IDirectorioUseCase` en `application/usecase` con las firmas públicas, y hacer que la clase Impl la implemente.
- [x] **Tarea 1.3: Refactorizar Controladores (Directorio).** 
  Actualizar `DirectorioController` y `PerfilController` para que inyecten la interfaz `IDirectorioUseCase` en lugar de la clase concreta. Verificar compilación.
- [x] **Tarea 1.4: Extraer Interfaz de AuthService.** 
  Renombrar `AuthService` a `AuthServiceImpl`. Crear la interfaz `IAuthUseCase` y hacer que la clase Impl la implemente.
- [x] **Tarea 1.5: Refactorizar Controladores (Auth).** 
  Actualizar `AuthController` para inyectar `IAuthUseCase`. Verificar compilación total.

---

## FASE 2: Descomposición de la "Clase Dios" (DirectorioServiceImpl)
**Objetivo:** Vaciar progresivamente `DirectorioServiceImpl` (573 líneas) repartiendo sus métodos en Casos de Uso que cumplan el principio de Responsabilidad Única (SRP).

- [x] **Tarea 2.1: Extraer lógica Espacial.** 
  Crear la interfaz e implementación de `BuscarPerfilesCercanosUseCase`. Mover únicamente los métodos `buscarCercanosLista` y `buscarCercanosMapa`. Actualizar inyecciones en el controlador. Verificar.
- [x] **Tarea 2.2: Extraer lógica de Lectura de Perfiles.** 
  Crear `ConsultarDetallePerfilUseCase`. Mover `obtenerDetalleProveedor` y `obtenerPerfilUsuario`. Actualizar controladores pertinentes. Verificar.
- [x] **Tarea 2.3: Extraer lógica transversal de Multimedia.** 
  Crear `ValidarMultimediaUseCase`. Mover el método privado `validarLimitesMultimedia` y `guardarMultimediaEnPortafolio`. Hacer que el servicio remanente inyecte y use este nuevo caso de uso. Verificar.
- [x] **Tarea 2.4: Extraer lógica de Creación/Actualización.** 
  Crear `GestionarPerfilProfesionalUseCase`. Mover `crearPerfilProveedor`, `crearPerfilEmpresa` y sus actualizaciones. Llegado a este punto, `DirectorioServiceImpl` debería quedar completamente vacío y debe ser eliminado de forma segura.

---

## FASE 3: Descomposición de AuthService y Patrones de Diseño
**Objetivo:** Remover el acoplamiento a APIs externas y eliminar los bloques condicionales (If-Else) masivos.

- [x] **Tarea 3.1: Aislar llamadas HTTP a Supabase.**
  Crear `SupabaseAuthAdapter` (en `infrastructure/adapter/out/api`). Mover el código que usa `RestClient` para login/signup. `AuthServiceImpl` solo debe llamar a este adaptador, sin conocer detalles HTTP. Verificar.
- [x] **Tarea 3.2: Patrón Factory para Perfiles (Preparación).**
  Crear la interfaz `IPerfilFactory` y las implementaciones `PerfilProveedorFactory` y `PerfilEmpresaFactory`. Estas deben recibir los DTOs y construir las entidades, encapsulando la lógica de mapeo.
- [x] **Tarea 3.3: Implementar Factory en Auth.**
  En `AuthServiceImpl.registrarCompleto()`, reemplazar el bloque `if ("PROVEEDOR") ... else if ("EMPRESA")` gigante inyectando un Factory Provider que decida qué Factory usar según el string de tipo. Verificar el flujo de registro.

---

## FASE 4: Reorganización de Infraestructura (Clean Architecture Definitiva)
**Objetivo:** Mover los archivos a su lugar definitivo en la nueva estructura. *Nota: Hacerlo estrictamente paso a paso.*

- [x] **Tarea 4.1: Migrar DTOs.**
  Mover el contenido de `com.PPS.PPS.dto` hacia `application/dto`. Actualizar todos los imports (Ctrl+Shift+O o refactor automático del IDE). Confirmar compilación.
- [x] **Tarea 4.2: Migrar Controladores.**
  Mover el contenido de `com.PPS.PPS.controller` hacia `infrastructure/adapter/in/web`. Actualizar imports y verificar.
- [x] **Tarea 4.3: Aislar Excepciones.**
  Mover excepciones de negocio a `domain/exception` y `GlobalExceptionHandler` a `infrastructure/config`.
- [ ] **Tarea 4.4: Desacople de Repositorios (Nivel Avanzado).**
  Crear interfaces puras en `domain/repository`. Mover las interfaces que extienden `JpaRepository` a `infrastructure/adapter/out/persistence/repository`. Crear clases adaptadoras que implementen la interfaz de dominio usando el JpaRepository. *Solo avanzar si se domina este patrón de Adaptadores de Persistencia.*

---

> **Nota de Progreso (Mayo 2026):**  
> La refactorización ha sido pausada de forma segura tras completar la Fase 3 y la Tarea 4.1. El código se encuentra estable, compila correctamente y gran parte de la deuda técnica central ha sido saneada.  
> Los pasos restantes de la Fase 4 (Migración de Controladores, Excepciones y Repositorios) se retomarán en una iteración futura para terminar de afianzar la arquitectura limpia.

---

## FASE 5: Optimización de Rendimiento y Búsqueda Diferida
**Objetivo:** Optimizar las consultas a la base de datos y la carga de red en componentes de alta demanda como el Mapa de Proveedores, implementando Server-Side Filtering en lugar de Client-Side Filtering masivo.

- [ ] **Tarea 5.1: Actualizar Endpoint Espacial (Backend).**
  Modificar el endpoint `/directorio/buscar/mapa` y su caso de uso para que acepte un parámetro opcional de `rubro`, permitiendo filtrar desde la base de datos de PostgreSQL.
- [ ] **Tarea 5.2: Refactorizar MapaProveedoresEmpresasChamba (Frontend).**
  Implementar la "Búsqueda Diferida". El mapa debe iniciar bloqueado/borroso y SOLO ejecutar la búsqueda al backend (`buscarServicios()`) cuando el usuario seleccione explícitamente una etiqueta (pill) de rubro.
- [ ] **Tarea 5.3: Revisión de ListadoProfesionalesChamba (Mantenimiento).**
  *Nota Arquitectónica:* A diferencia del Mapa, el componente `ListadoProfesionalesChamba` **YA** se encuentra optimizado porque utiliza paginación nativa desde el servidor (`page`, `size`) para el endpoint `/directorio/buscar/lista`. Descargar la primera página de 8 elementos de "Todos" tiene un impacto ínfimo (aprox 50ms) y es excelente para mostrar recomendaciones iniciales. No requiere Búsqueda Diferida estricta como el mapa.
