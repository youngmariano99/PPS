# MÓDULO: sprint_1_seguridad_y_usuarios (Autenticación y Perfiles Base)

## 1. Objetivo del Módulo
Implementar el sistema de identidad de la plataforma delegando la seguridad criptográfica (JWT) a **Supabase Auth**. El objetivo es que los usuarios puedan registrarse e iniciar sesión, garantizando que el `UUID` generado por Supabase se guarde en nuestra tabla local `usuarios` de PostgreSQL para poder vincularlo posteriormente con sus perfiles, servicios y postulaciones.

## 2. Tareas Técnicas y Flujo de Trabajo

* **Capa de Dominio (Entidad y Repositorio):**
  * Crear la entidad `Usuario` mapeada a la tabla `usuarios` (con campos `id`, `nombre`, `apellido`, `email`, `telefono`).
  * El `id` de esta entidad DEBE ser un `UUID` y no se auto-genera en Java (no usar `@GeneratedValue`), ya que el ID debe provenir de Supabase.
  * Crear `UsuarioRepository` extendiendo de `JpaRepository`.

* **Capa de Integración y Servicios (Supabase Auth):**
  * Crear un servicio (ej. `AuthService`) que se comunique con la API de Supabase (GoTrue) para registrar y autenticar usuarios.
  * **Flujo de Registro:** 1. Recibe un DTO con email, contraseña, nombre, apellido y teléfono.
    2. Envía email y contraseña a Supabase Auth.
    3. Si Supabase responde OK, captura el `UUID` del usuario creado.
    4. Guarda en la base de datos local (tabla `usuarios`) el nuevo registro usando ese `UUID` exacto.
  * **Flujo de Login:**
    1. Envía email y contraseña a Supabase.
    2. Devuelve al frontend el token JWT (access_token) provisto por Supabase.

* **Capa de Presentación (Controllers):**
  * Crear `AuthController` con los endpoints:
    * `POST /api/v1/auth/registro`
    * `POST /api/v1/auth/login`

* **Sincronización de Contratos API (Frontend):**
  * Generar el archivo `/front/src/api/authApi.js` exportando las funciones `registrarUsuario` y `loginUsuario`.

## 3. Reglas Estrictas para la IA (Generación de Código)
* **Prohibido reinventar la rueda:** NO implementar librerías como `jjwt` para generar o firmar tokens manualmente. Supabase es el único emisor válido de tokens.
* **Transaccionalidad:** El método de registro debe estar anotado con `@Transactional` (si aplica) o manejar una lógica de compensación: si el guardado en la base de datos local falla, el usuario creado en Supabase quedará huérfano, por lo que el manejo de errores debe ser claro.
* **Validación de Datos:** Los DTOs de entrada (ej. `RegistroRequestDto`) deben utilizar validaciones de Jakarta (ej. `@NotBlank`, `@Email`, `@Size` para la contraseña).