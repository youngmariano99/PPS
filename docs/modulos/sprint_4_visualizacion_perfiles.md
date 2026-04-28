# GUÍA TÉCNICA: Visualización de Perfiles de Terceros (Sprint 4)

## 1. Objetivo
Permitir que los usuarios puedan ver perfiles de otros profesionales (Proveedores) o usuarios base desde el buscador, diferenciando entre la vista de "Dueño" (Editable) y la vista de "Visitante" (Solo Lectura).

---

## 2. Paso a Paso para la Implementación (Frontend)

### Tarea A: Activar Navegación en el Listado
**Archivo:** `front/src/components/framer/ListadoProfesionales.jsx`

1.  **Añadir Propiedad de URL:** En `addPropertyControls`, agregar `providerProfileUrl` (ej: `https://.../perfiles-prov`).
2.  **Lógica de Click:** En el botón "Ver Perfil" (línea ~352), añadir:
    ```javascript
    onClick={() => {
        window.location.href = `${props.providerProfileUrl}?id=${prof.id}`;
    }}
    ```

### Tarea B: Carga Dinámica en Perfil Profesional
**Archivo:** `front/src/components/framer/Profiles/ProviderProfileComplete.jsx`

1.  **Detectar ID Externo:** Al inicio de `discoverAndFetch`, leer el parámetro `id` de la URL:
    ```javascript
    const params = new URLSearchParams(window.location.search);
    const externalId = params.get("id");
    ```
2.  **Priorizar Fetch:** 
    *   Si existe `externalId`, usar ese para el fetch: `fetch(`${apiUrl}/directorio/proveedor/${externalId}`, ...)`
    *   Si NO existe, seguir usando `user.id` del usuario logueado.
3.  **Desactivar Edición (Modo Visitante):**
    *   Comparar el ID del perfil cargado con el ID del usuario logueado.
    *   Si no es el dueño, ocultar el botón `<Edit3 />` y forzar `isEditing` a `false`.

### Tarea C: Carga Dinámica en Perfil Usuario Base
**Archivo:** `front/src/components/framer/Profiles/UserProfileComplete.jsx`

1.  **Detectar ID Externo:** Similar a la Tarea B, leer `?id=` de la URL.
2.  **Fetch Específico:** Cambiar el endpoint de `/usuarios/me` a `/usuarios/${targetId}`.
3.  **Ocultar Secciones Privadas:**
    *   Si no es el dueño, ocultar los bloques de "Mi Actividad" y el botón de "Ser Profesional".

---

## 3. Consideraciones del Backend
*   Los endpoints ya existen en el controlador:
    *   `GET /api/v1/directorio/proveedor/{id}` (Para ver el perfil profesional completo).
    *   `GET /api/v1/usuarios/{id}` (Para ver el perfil base).
*   El backend ya maneja el UUID de Supabase como ID válido para estas consultas.

---

## 4. Instrucciones para Framer
1.  Actualizar los componentes en Framer con el código ajustado.
2.  Configurar las URLs de las páginas en el panel derecho de propiedades (Canvas) para que la navegación entre Listado -> Perfil funcione correctamente.
