# GUÍA TÉCNICA: Inicio de Sesión y Registro con Google OAuth (Sprint 5)

## 1. Objetivo
Habilitar la autenticación híbrida (tradicional y Google OAuth) en la plataforma CHAMBA, permitiendo el ingreso y registro directo de usuarios. Si un usuario nuevo se registra mediante Google, debe completar los datos obligatorios de su perfil a través de una versión simplificada del Wizard de Registro, persistiendo su información en la base de datos PostgreSQL local de forma atómica sin re-crear su cuenta en Supabase.

---

## 2. Paso a Paso para la Implementación (Backend)

### Tarea A: Endpoint de Sincronización OAuth (`/auth/oauth-sync`)
**Archivo:** `src/main/java/com/PPS/PPS/infrastructure/adapter/in/web/AuthController.java` y `src/main/java/com/PPS/PPS/service/AuthServiceImpl.java`

1.  **Definición del Endpoint:**
    *   Método: `POST /auth/oauth-sync`
    *   Header obligatorio: `X-User-Id` (UUID del usuario proveniente de Supabase).
2.  **Lógica del Servicio:**
    *   Buscar en `usuarioRepository` por el UUID.
    *   **Si existe:** Retornar `200 OK` con un `AuthRespuestaDto` conteniendo los datos locales del usuario (`usuarioId`, `nombre`, `email`, `apellido`).
    *   **Si NO existe:** Retornar `404 Not Found` indicando que el usuario debe completar el Wizard de registro local.

### Tarea B: Endpoint de Registro OAuth (`/auth/registro-oauth`)
**Archivo:** `src/main/java/com/PPS/PPS/infrastructure/adapter/in/web/AuthController.java` y `src/main/java/com/PPS/PPS/service/AuthServiceImpl.java`

1.  **Definición del Endpoint:**
    *   Método: `POST /auth/registro-oauth`
    *   Header obligatorio: `X-User-Id` (UUID)
    *   Body: `RegistroCompletoSolicitudDto` (sin requerir contraseña)
2.  **Lógica del Servicio:**
    *   Crear directamente el objeto `Usuario` en la base de datos relacional usando el UUID del Header, marcándolo como `emailConfirmado = true`.
    *   Geocodificar la dirección de la misma manera que en `registro-completo`.
    *   Invocar la fábrica de perfiles adecuada (`PROVEEDOR`, `EMPRESA`, `CLIENTE`) según la selección del usuario.
    *   Guardar portafolios e imágenes correspondientes.
    *   **Diferencia clave:** Este endpoint **NO** llama a `supabaseAuthPort.registrar()` porque el usuario ya fue creado por Google en Supabase.

---

## 3. Paso a Paso para la Implementación (Frontend)

### Tarea C: Conectar Google en el Login
**Archivo:** `front/src/components/framer/Auth/FormularioLogin.jsx`

1.  **Función de Autenticación de Supabase:**
    *   Implementar `handleGoogleLogin` usando `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + "/login" } })`.
2.  **Escucha de Callback:**
    *   Al montar el componente, verificar si hay sesión de Supabase.
    *   Si hay sesión activa, enviar petición a `/auth/oauth-sync`.
        *   Si devuelve 200, guardar en `localStorage` y redirigir al Dashboard.
        *   Si devuelve 404, guardar los datos de Google en `localStorage` (`oauth_user`) y redirigir a `/registro-general?oauth=true`.

### Tarea D: Adaptar el Registro Wizard
**Archivo:** `front/src/components/framer/Auth/RegistroFormWizardChamba.jsx`

1.  **Detección de Flujo OAuth:**
    *   Detectar si la URL contiene `?oauth=true`.
    *   De ser así, cargar datos de `oauth_user` del `localStorage` e inicializar el formulario.
2.  **Omitir Contraseñas (Paso 2):**
    *   Si es flujo OAuth, ocultar la solicitud de contraseña y confirmación de contraseña, y deshabilitar la edición del email (ya validado).
3.  **Registro Diferenciado en Submit:**
    *   Al finalizar, si es flujo OAuth, hacer el POST a `/auth/registro-oauth` en lugar de `/auth/registro-completo`, enviando el header `X-User-Id` correspondiente.

---

## 4. Consistencia y Tolerancia a Fallos (Estrategia Autocorrectiva)
Dado que en OAuth la autenticación en Supabase sucede *antes* de que el usuario complete el Wizard:
1.  **Rollback en DB Local:** El endpoint `/auth/registro-oauth` debe estar anotado con `@Transactional`. Si la geocodificación o creación de perfiles falla, PostgreSQL hace un rollback completo, quedando libre de registros huérfanos.
2.  **Auto-recuperación:** Si un usuario con sesión en Supabase pero sin registro local inicia sesión, el endpoint `/auth/oauth-sync` responderá `404 Not Found`. El frontend detectará esto y lo redirigirá inmediatamente al Wizard para que complete su registro. De este modo, la consistencia se auto-corrige de forma transparente para el usuario.

