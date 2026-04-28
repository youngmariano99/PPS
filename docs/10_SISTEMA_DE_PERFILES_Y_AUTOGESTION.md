# 10_SISTEMA_DE_PERFILES_Y_AUTOGESTION (V1.0)

Este documento detalla la arquitectura, el diseño y la lógica de implementación del Sistema de Perfiles de PPS, consolidado el 17 de abril de 2024.

## 1. Visión General
El sistema de perfiles de PPS está diseñado para ofrecer una experiencia SaaS premium, dividiendo la identidad en dos roles principales: **Usuario Base** y **Proveedor/Profesional**. El enfoque principal es la **autogestión en tiempo real** y la **protección de sesiones**.

## 2. Identidad y Protección de Sesiones (Anti-Cache)
Para evitar el cruce de cuentas y asegurar que el usuario siempre vea su propia información:
*   **Servicio de Validación**: Se migró de `getSession()` a `getUser()` en el cliente de Supabase. Esto fuerza una validación con el servidor en cada carga, evitando que se muestren datos cacheados de sesiones anteriores.
*   **Limpieza Agresiva (Logout)**: El sistema de cierre de sesión (`LogoutButton` y `AuthNavButton`) realiza una limpieza total del `localStorage` buscando llaves de Supabase y fuerza un `reload()` completo.
*   **Identificación por Header**: El backend utiliza el header `X-User-Id` para identificar al usuario, validado contra el token JWT de Supabase.

## 3. Arquitectura del Backend API
Se implementaron y refinaron los siguientes componentes:

### Endpoints Principales:
*   `GET /api/v1/usuarios/me`: Identificación básica, rol del usuario y fecha de registro.
*   `GET /api/v1/directorio/proveedor/{id}`: Detalle público del profesional (Portafolio, Reseñas, Bio).
*   `PUT /api/v1/perfil/usuario/me`: Actualización de datos personales (Nombre, Apellido, Teléfono).
*   `PUT /api/v1/perfil/proveedor/me`: Actualización de datos profesionales (Bio, Matrícula, Redes Sociales, Dirección).

### Lógica de Negocio (`DirectorioService`):
*   **Mapeo Inteligente**: Resuelve perfiles tanto por `usuario_id` como por `id` interno.
*   **Geocodificación Automática**: Al editar la dirección en el perfil, el sistema re-calcula las coordenadas geográficas (Point) automáticamente para que el proveedor siga figurando correctamente en el mapa.

## 4. Diseño Visual "Mature UI"
Se implementó un lenguaje visual estricto para transmitir profesionalismo y madurez:

*   **Tipografía**: 
    *   Cuerpo: **Inter** (estándar).
    *   Títulos: **Inter Display** con peso **700 (Bold)**. Se evitó el uso de pesos 900 para mantener la elegibilidad y sofisticación.
*   **Subtítulos de Sección**: Diseño en mayúsculas, tamaño reducido (10px-11px), color gris muted (`#94a3b8`) y tracking expandido (2.5px).
*   **Sistema de Botones**: 
    *   **Altura**: Estándar de **38px** para todos los botones de acción principal.
    *   **Border Radius**: **10px** para un look moderno pero no excesivamente redondeado.
    *   **Sombra**: Elevación suave (`0 4px 10px rgba(0,0,0,0.1)`) para dar profundidad premium.

## 5. Sistema de Autogestión (Edición Pro)
El componente `ProviderProfileComplete.jsx` incluye un motor de edición en tiempo real:
*   **Modo Edición**: Un estado interno (`isEditing`) que transforma los labels en inputs.
*   **Redes Sociales**: Soporte nativo para enlaces de **Instagram, Facebook y LinkedIn**.
*   **Validación de Datos**: Los iconos cambian dinámicamente según la disponibilidad de la información.

## 6. Mantenimiento y Roadmap
*   **Tablas Afectadas**: `public.usuarios` y `public.perfiles_proveedor`.
*   **Nuevas Columnas**: `instagram_url`, `facebook_url`, `linkedin_url`, `foto_perfil_url`.
*   **Próximos Pasos**: Implementar la subida de archivos real para el avatar y el portafolio mediante Supabase Storage.

---
**Documentación generada automáticamente por Antigravity AI.**
