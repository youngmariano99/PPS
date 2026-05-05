# 🎓 Guion de Defensa Técnica: Arquitectura de API REST
**Proyecto:** CHAMBA - Marketplace de Servicios PPS
**Materia:** Programación IV (2026)
**Rol:** Desarrollador / Alumno

Este documento sirve como guion y estructura de soporte para la defensa del examen final. Está diseñado para demostrar solvencia técnica y el cumplimiento de los estándares exigidos por la cátedra.

---

## 📽️ SECCIÓN 1: INTRODUCCIÓN A LA API Y ARQUITECTURA
### 🗣️ Explicación para el Profesor:
"Buenos días/tardes. Para el desarrollo del backend de **CHAMBA**, hemos optado por una arquitectura de **N-Capas** basada en **Spring Boot 3**. Mi objetivo principal fue separar la lógica de infraestructura de la lógica de negocio.

Nuestra API sigue fielmente el estilo arquitectónico **RESTful**. En la capa de controladores, utilizamos la anotación `@RestController`, lo que nos permite manejar respuestas en formato JSON de manera nativa. Como pueden observar en mis controladores, hemos respetado la convención de usar **sustantivos en plural** para los recursos (ejemplo: `/api/v1/perfiles`, `/api/v1/rubros`), cumpliendo así con las buenas prácticas de diseño de APIs exigidas."

### 💻 Bloque de Código de Referencia:
```java
@RestController
@RequestMapping("/resenas")
@RequiredArgsConstructor
@Tag(name = "Reseñas", description = "Sistema de reputación y feedback de usuarios")
public class ResenaController {
    // ...
}
```
> [!TIP]
> **Análisis Técnico:**
> * **@RestController**: Combina `@Controller` y `@ResponseBody`. Indica que la clase maneja peticiones web y que los resultados se convierten automáticamente a JSON.
> * **@RequestMapping**: Define la ruta base (`/resenas`). Usamos sustantivos en plural para seguir el estándar RESTful.
> * **@RequiredArgsConstructor**: Genera un constructor para los campos `final`, permitiendo la **Inyección de Dependencias** por constructor, que es la forma más segura y recomendada por Spring.

---

## 📽️ SECCIÓN 2: SEGURIDAD Y BUENAS PRÁCTICAS - EL USO DE DTOs
### 🗣️ Explicación para el Profesor:
"Un punto fundamental de nuestra implementación es que **las Entidades JPA (@Entity) nunca abandonan la capa de servicio**. Todo el intercambio de información con el cliente se realiza mediante **DTOs (Data Transfer Objects)**.

Esta decisión técnica se basa en tres pilares:
1.  **Seguridad:** Al no exponer la entidad directamente, evitamos filtrar campos internos como contraseñas, estados de auditoría o IDs sensibles.
2.  **Integridad del JSON:** Evitamos el error común de recursividad infinita (Circular Reference) al serializar relaciones bidireccionales de la base de datos.
3.  **Contrato Estable:** Si el esquema de nuestra base de datos cambia, el DTO se mantiene igual, por lo que el frontend (Framer/React) no sufre roturas. Es lo que llamamos 'desacoplamiento'."

### 💻 Bloque de Código de Referencia:
```java
@GetMapping
public ResponseEntity<List<RubroDto>> listarRubros() {
    List<RubroDto> rubros = rubroRepository.findAll().stream()
            .map(r -> RubroDto.builder()
                    .id(r.getId())
                    .nombre(r.getNombre())
                    .descripcion(r.getDescripcion())
                    .activa(r.isActiva())
                    .build())
            .collect(Collectors.toList());
    return ResponseEntity.ok(rubros);
}
```
> [!TIP]
> **Análisis Técnico:**
> * **Patrón DTO:** Convertimos la entidad `Rubro` en un `RubroDto`. Esto desacopla la base de datos de la vista.
> * **Java Streams:** Usamos `.stream().map()` para transformar la colección de forma funcional y declarativa.
> * **Builder Pattern**: Usamos el método `.builder()` de Lombok para instanciar el DTO de forma limpia y legible.

---

## 📽️ SECCIÓN 3: ENDPOINTS CRUD Y MANEJO DE ESTADOS HTTP
### 🗣️ Explicación para el Profesor:
"Hemos mapeado las operaciones de negocio a los verbos HTTP correspondientes, asegurándonos de que cada acción retorne el código de estado semántico adecuado utilizando `ResponseEntity`."

#### 🟢 CREATE (@PostMapping)
"Para la creación de recursos, usamos `@PostMapping`. Los datos se reciben en el cuerpo de la petición mediante `@RequestBody`. Si la operación es exitosa, devolvemos un **201 Created**, indicando que el recurso se ha generado correctamente en el servidor."
```java
@PostMapping
public ResponseEntity<ResenaDetalleDto> crear(
        @RequestHeader("X-User-Id") UUID usuarioId,
        @Valid @RequestBody CrearResenaDto dto,
        HttpServletRequest request) {
    String ip = request.getRemoteAddr();
    return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.crearResena(dto, usuarioId, ip));
}
```
> [!TIP]
> **Análisis Técnico:**
> * **@Valid**: Activa la validación de Jakarta Bean Validation (asegura que el DTO cumpla con restricciones como `@NotBlank`).
> * **@RequestBody**: Mapea el JSON recibido en el cuerpo del mensaje a nuestro objeto Java.
> * **201 Created**: Usamos `HttpStatus.CREATED` para indicar éxito semántico en la creación de un recurso.

#### 🔵 READ (@GetMapping)
"Para obtener información, usamos `@GetMapping`. Implementamos tanto listas generales como búsquedas por identificador único usando `@PathVariable`. Si el recurso no existe, nuestro sistema de manejo global de excepciones captura el error y devuelve un **404 Not Found** en lugar de un error genérico."
```java
@GetMapping("/{id}")
public ResponseEntity<UsuarioPerfilDto> obtenerPorId(@PathVariable UUID id) {
    // Si el service no lo encuentra, lanza RecursoNoEncontradoException (404)
    return ResponseEntity.ok(consultarDetallePerfilUseCase.obtenerPerfilUsuario(id));
}
```
> [!TIP]
> **Análisis Técnico:**
> * **@PathVariable**: Extrae el ID directamente de la URL (ej: `/usuarios/f47ac...`).
> * **404 Not Found**: Si el ID no existe, el Service lanza una excepción personalizada que capturamos en el `GlobalExceptionHandler` para devolver el código 404 de forma prolija.

#### 🟡 UPDATE (@PutMapping)
"Las actualizaciones se gestionan con `@PutMapping`. Esto representa una sustitución completa o actualización del recurso existente, garantizando la idempotencia de la operación."
```java
@PutMapping("/proveedor/me")
public ResponseEntity<Void> actualizarMiPerfilProfesional(
        @RequestHeader("X-User-Id") UUID usuarioId,
        @RequestBody PerfilSolicitudDto dto) {
    gestionarPerfilProfesionalUseCase.actualizarPerfilProveedor(usuarioId, dto);
    return ResponseEntity.ok().build();
}
```
> [!TIP]
> **Análisis Técnico:**
> * **@PutMapping**: Verbo estándar para actualizaciones completas.
> * **Idempotencia**: Garantizamos que múltiples llamadas iguales produzcan el mismo resultado final.

#### 🔴 DELETE (@DeleteMapping - Soft Delete)
"Un diferencial técnico de mi proyecto es la implementación del **Borrado Lógico (Soft Delete)**. En lugar de ejecutar un `DELETE` físico que rompería la integridad referencial, interceptamos la operación con Hibernate para cambiar el estado del campo `activo` a `false`. Al finalizar, devolvemos un **204 No Content**, indicando éxito sin contenido de respuesta."
```java
// Implementación representativa en UsuarioController
@DeleteMapping("/me")
public ResponseEntity<Void> eliminarMiCuenta(@RequestHeader("X-User-Id") UUID userId) {
    // La magia ocurre en la Entidad con @SQLDelete(sql = "UPDATE ... SET activo = false")
    usuarioRepository.deleteById(userId); 
    return ResponseEntity.noContent().build();
}
```
> [!TIP]
> **Análisis Técnico:**
> * **Soft Delete**: Usamos `deleteById` de Spring Data JPA, pero Hibernate lo intercepta (gracias a `@SQLDelete` en la clase `@Entity`) y ejecuta un `UPDATE` en su lugar.
> * **204 No Content**: Respuesta estándar para eliminaciones exitosas donde no se requiere devolver datos adicionales.

---

## 📽️ SECCIÓN 4: DOCUMENTACIÓN Y VALIDACIÓN (HITO OBLIGATORIO)
### 🗣️ Explicación para el Profesor:
"Para finalizar la exposición de la capa de control, quiero destacar que el proyecto está 100% documentado bajo el estándar de la industria. Integramos **Swagger (OpenAPI 3)**, lo que genera una interfaz web interactiva donde cualquier desarrollador puede explorar y probar los endpoints sin leer una línea de código.

Además, toda la lógica de los controladores fue validada con **Jakarta Bean Validation** (usando `@Valid`, `@NotBlank`, etc.) y probada mediante una colección de **Postman**, asegurando que cada endpoint se comporte exactamente como el contrato API lo define."

---

## 📽️ SECCIÓN 5: DECISIONES ARQUITECTÓNICAS Y ESCALABILIDAD
### 🗣️ Explicación para el Profesor:
"Como cierre de esta defensa, quiero presentar las decisiones de ingeniería que garantizan que esta plataforma no sea solo un prototipo, sino un sistema escalable y resiliente. Hemos documentado 11 puntos clave que definen nuestra arquitectura:

1. **Clean Architecture y SRP:** Dividimos los servicios en **Casos de Uso** específicos. Esto evita las 'Clases Dios' y permite que cada componente tenga una única responsabilidad, facilitando el mantenimiento y el testing.
2. **Patrón Factory para Perfiles:** Usamos el patrón **Abstract Factory** para la creación de perfiles. Esto nos permite cumplir con el principio **Open-Closed (OCP)**, pudiendo agregar nuevos tipos de usuarios sin tocar el código core de autenticación.
3. **Persistencia Híbrida (JSONB):** Para datos altamente variables como Redes Sociales y Currículums, usamos columnas **JSONB** de PostgreSQL. Esto nos da la flexibilidad de NoSQL con la robustez de una base de datos relacional.
4. **Optimización de Multimedia (Cropping):** Integramos coordenadas de recorte desde el cliente para que Cloudinary entregue imágenes pre-procesadas, optimizando el ancho de banda y la estética del frontend.
5. **Resiliencia ante Fallos Externos:** Aislamos las llamadas a APIs de terceros (como la geolocalización de Nominatim) en bloques `try-catch`. Si un servicio externo falla, la aplicación sigue funcionando con los últimos datos conocidos.
6. **Búsqueda Diferida (Server-Side Filtering):** Diseñamos el mapa para realizar filtrados en el servidor. Evitamos saturar la RAM del cliente enviando miles de puntos innecesarios; solo enviamos lo que el usuario realmente busca.
7. **Integridad Atómica (@Transactional):** El registro de usuarios es una operación **'Todo o Nada'**. Si cualquier paso falla, se realiza un *rollback* completo, evitando datos huérfanos o cuentas corruptas.
8. **Arquitectura CQS y Erradicación de N+1 Query:** Separamos las consultas de lectura pesadas de las escrituras. Optimizamos las búsquedas espaciales en PostGIS usando `@EntityGraph` para cargar relaciones en un solo salto a memoria, reduciendo drásticamente la latencia.
9. **Blindaje de Privacidad:** Implementamos ofuscación de datos sensibles en el servidor. Los datos de contacto solo se liberan si existe una 'Intención de Contacto' registrada, protegiendo a nuestros profesionales del spam.
10. **Normalización Inteligente:** Mantuvimos la **3ra Forma Normal** para datos transaccionales críticos, mientras usamos esquemas documentales para lo descriptivo, logrando un equilibrio perfecto entre rigor y agilidad.
11. **Suscripciones Reactivas (Webhooks):** La activación de membresías Premium es asíncrona y depende exclusivamente de los webhooks oficiales de **Mercado Pago**, eliminando la posibilidad de fraudes o fallos por pérdida de conexión en el frontend."

---

## 📽️ SECCIÓN 6: INTEGRACIONES EXTERNAS Y SEGURIDAD
### 🗣️ Explicación para el Profesor:
"Finalmente, la robustez de nuestro ecosistema se apoya en integraciones estratégicas y un enfoque de 'Seguridad por Diseño':

1. **Supabase (Auth & DB):** Elegimos Supabase como nuestro proveedor de identidad y persistencia. La ventaja clave es que delegamos la seguridad de las credenciales a un experto, mientras nosotros sincronizamos los **UUIDs** de Supabase con nuestra base de datos local de PostgreSQL para mantener la integridad de los perfiles.
   *   **Cómo nos comunicamos:** Usamos un `SupabaseAuthAdapter` que utiliza el nuevo `RestClient` de Spring Boot para delegar el registro.
```java
// SupabaseAuthAdapter.java
public UUID registrar(String email, String password) {
    Map<String, Object> body = Map.of("email", email, "password", password);
    Map<String, Object> respuesta = supabaseRestClient.post()
            .uri("/signup")
            .body(body)
            .retrieve()
            .body(new ParameterizedTypeReference<Map<String, Object>>() {});
    return UUID.fromString((String) respuesta.get("id"));
}
```
2. **Cloudinary (Multimedia):** Para el manejo de imágenes, optamos por Cloudinary. Esto nos permite:
   *   **Optimización Automática:** El servidor no procesa imágenes pesadas; Cloudinary las entrega optimizadas según el dispositivo.
   *   **Decisión sobre Videos:** Decidimos **no permitir la subida directa de videos** para proteger el ancho de banda y reducir costos de almacenamiento. En su lugar, fomentamos que los profesionales vinculen sus redes sociales, lo cual mejora el SEO y la visibilidad externa del trabajador.
   *   **¿Por qué no guardarlo en la BD?:** Las bases de datos relacionales no están diseñadas para almacenar archivos binarios pesados (BLOBs). Guardar fotos en la BD aumentaría drásticamente el tamaño de los backups, ralentizaría las consultas y dificultaría la escalabilidad. Usar un CDN como Cloudinary es el estándar de la industria.
3. **Seguridad de Acceso (Password Policy):** No permitimos contraseñas débiles. Implementamos una política de complejidad que exige **caracteres especiales, números y mayúsculas**.
   *   **Validación en el Frontend (React):**
```javascript
const passChecks = {
    min: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
}
```
   *   **Validación en el Backend (Java):** Usamos Bean Validation con una expresión regular (Regex) para asegurar que se cumpla la política antes de intentar el registro en Supabase.
```java
@Pattern(
    regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$", 
    message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial"
)
private String password;
```

---

## 📽️ SECCIÓN 7: PRÓXIMOS PASOS Y OPTIMIZACIÓN SEO (SLUGS)
### 🗣️ Explicación para el Profesor:
"Como última mejora estratégica, estamos migrando nuestro sistema de URLs de identificadores crudos (**UUIDs**) a **Slugs Amigables**. 

En lugar de que un perfil se vea como `/proveedor/550e8400...`, ahora se verá como `/proveedor/mariano-perez-gasista`. Esto no solo mejora la experiencia del usuario al compartir enlaces, sino que es una **mejora crítica de SEO**, permitiendo que los motores de búsqueda como Google indexen los perfiles por el nombre del profesional y su oficio.

Implementamos un generador de Slugs en el backend que normaliza el texto (quita acentos, convierte a minúsculas) y maneja automáticamente las colisiones de nombres agregando sufijos numéricos."

---

## 💡 NOTAS PARA EL EXAMEN:
1.  **Mantenimiento de Transacciones:** Si te preguntan, menciona que los servicios usan `@Transactional` para asegurar que el guardado en la base de datos sea atómico.
2.  **Manejo de Errores:** Menciona que usas `@RestControllerAdvice` para capturar errores de validación y devolver mensajes amigables al usuario.
3.  **Seguridad:** Comenta que Swagger está configurado para permitir el acceso a la documentación pero los endpoints reales están protegidos.
