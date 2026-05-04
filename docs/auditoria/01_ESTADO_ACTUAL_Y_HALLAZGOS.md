# 01_ESTADO_ACTUAL_Y_HALLAZGOS: Diagnóstico Arquitectónico

## 1. Visión General
El proyecto actualmente sigue un patrón arquitectónico de **Monolito Estratificado (Layered Architecture)** tradicional de Spring Boot (Controller, Service, Repository, Entity, DTO). Aunque es funcional, **no cumple estrictamente con los preceptos de Arquitectura Limpia (Clean Architecture)** dictaminados en nuestras reglas globales, evidenciando alto acoplamiento y violaciones a los principios SOLID.

## 2. Evaluación de Clean Architecture
**Estado: Incumplido.** 
Existe una falta de independencia total entre las capas:
- **Acoplamiento de Dominio a Infraestructura:** Las clases en el paquete `entity` (nuestro dominio actual) están fuertemente acopladas a JPA y Spring Data (`@Entity`, `@Table`, `@Id`). El núcleo de negocio sabe cómo persiste la información.
- **Servicios Dependientes de Herramientas:** Los Casos de Uso (actualmente en `service`) inyectan e invocan directamente interfaces que extienden de `JpaRepository` y clientes externos como `RestClient` de Supabase, en lugar de depender de puertos (interfaces puras de dominio).

## 3. Principios SOLID

### 🔴 Violaciones Críticas al Principio de Responsabilidad Única (SRP)
Se detectaron "Clases Dios" (God Classes) que superan el límite establecido de 350-400 líneas, concentrando múltiples responsabilidades:

1. **`DirectorioService.java` (573 líneas):**
   - **Cuello de botella principal.** Orquesta la creación de perfiles Proveedor y Empresa.
   - Aplica validaciones de reglas de negocio cruzadas (Límites multimedia, validación de Dominios Regex).
   - Realiza geocodificación llamando a servicios externos.
   - Construye respuestas complejas manejando la lógica de paginación de forma manual e instanciando DTOs (Mapeo explícito de Entidad a DTO dentro de la lógica de negocio).
   - Realiza llamadas a repositorios para extraer métricas agrupadas (`Promedios` de reseñas).

2. **`AuthService.java` (316 líneas):**
   - Mezcla lógica de infraestructura (Peticiones HTTP vía `RestClient` hacia Supabase).
   - Orquesta lógica de creación de múltiples entidades complejas (Usuario, Rubros, Portafolios, Perfiles).
   - Define el rol y perfil a crear utilizando condicionales tipo *hardcode*.

### 🔴 Violaciones al Principio de Inversión de Dependencias (DIP) y Segregación (ISP)
- **Falta de Abstracciones:** El paquete `controller` inyecta directamente implementaciones concretas (ej. `AuthService`, `DirectorioService`) en lugar de depender de interfaces que representen casos de uso (`IAuthUseCase`, `IRegistroUseCase`).
- Al no tener interfaces, es casi imposible realizar pruebas unitarias aisladas sin levantar todo el contexto de Spring (Mocking complejo).

## 4. Patrones de Diseño (Anti-Código Espagueti)
**Estado: Escaso uso, lógica fuertemente procedimental.**

- **Ausencia de Patrones Creacionales (Factory):** 
  En `AuthService.registrarCompleto()`, la creación del perfil (`PerfilProveedor` vs `PerfilEmpresa`) se hace mediante un bloque `if-else` directo basado en el string "PROVEEDOR" o "EMPRESA". Esto dificulta agregar nuevos tipos de perfiles en el futuro. **Solución:** Implementar un `PerfilFactory`.
  
- **Ausencia de Patrones Estructurales (Decorator/Proxy):**
  Las validaciones sobre "límites multimedia" basados en el plan Premium están integradas *en crudo* en métodos como `crearPerfilProveedor` dentro de `DirectorioService.validarLimitesMultimedia()`. Esto debería estar aislado como un validación transversal.

- **Ausencia de Patrones de Comportamiento (Strategy):**
  Los flujos que dependen del tipo de suscripción o roles específicos generan bifurcaciones lógicas dentro de las rutinas de consulta (ej. aplicar prioridades en listas de directorios), incrementando la complejidad ciclomática del código.
