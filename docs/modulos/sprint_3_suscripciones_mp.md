# MÓDULO: sprint_3_suscripciones_mp (Membresías y Flujo de Pago Restringido)

## 1. Objetivo del Módulo
Este documento define la arquitectura definitiva y el flujo de integración de Mercado Pago (API Preapproval / Suscripciones) para gestionar la suscripción premium de proveedores en la Plataforma de Proveedores de Servicios (PPS).

El objetivo principal de esta iteración ha sido asegurar el flujo transaccional. La regla de oro es: **El frontend (Framer) JAMÁS valida pagos; la única fuente de la verdad para activar una suscripción es el Webhook de Mercado Pago recibido en el backend.**

---

## 2. Arquitectura de Integración (Full Stack)

### A. La Base de Datos (PostgreSQL)
Se formalizó la suscripción en dos tablas (`01_MODELO_DE_DATOS.md`):
1. **`planes_suscripcion`**: Contiene el plan "PRO" inyectado al inicio (3000 ARS).
2. **`suscripciones_usuario`**: Entidad pivote. Relaciona al proveedor con el plan. Contiene el estado (`ACTIVA`, `VENCIDA`, etc.), fechas y el fundamental `mp_preferencia_id` que guarda el `preapproval_id` oficial generado por MP.

### B. El Backend (Spring Boot)
Se implementaron tres componentes clave resguardados:
* **MercadoPagoService**: Un cliente REST (`RestTemplate`) que crea la orden de preaprobación y consulta el estado real.
* **Controlador `/crear`**: Recibe `usuarioId` y `planId`, genera el `init_point` y se lo devuelve al Frontend.
* **Controlador `/success`**: Es un endpoint *tonto*. Solo sirve de puente UX. Cuando el usuario vuelve de pagar, atrapa el `preapproval_id`, registra el intento en PostgreSQL con estado **`PENDIENTE`** y redirige ciegamente a la web. **Nunca asume éxito financiero**.
* **Controlador `/webhook`**: Única ruta capaz de escuchar un evento `type=preapproval`, consultar a Mercado Pago su validez (`authorized`), y cambiar localmente el registro PENDIENTE a **`ACTIVA`**. Además incluye lógica mitigadora que marca como `VENCIDA` cualquier suscripción vieja para evitar cobros dobles.

### C. El Frontend (React component en Framer)
Se construyó un componente agnóstico de UI (`BotonSuscripcionPro`) con las siguientes reglas:
1. Lee `usuarioId` directamente de `localStorage` para evitar manipulación de sesión en las queries.
2. Posee lógica de carga (`isLoading` y UI de resguardo).
3. Redirige la ventana al `init_point` tras el fetch, perdiendo control total a favor de Mercado Pago.
4. Requiere absoluta sincronía en el login: El UUID debe ser mapeado correctamente.

---

## 3. Flujo Transaccional Definitivo

1. **Intención:** Proveedor clickea el botón "Suscribirse" (Framer).
2. **Verificación Local:** El componente lee `userData.id` del LocalStorage. Si existe, hace POST al backend.
3. **Generación:** Spring Boot llama a la API externa indicando precio (3000) y return URL (`/success`). Retorna el `init_point`.
4. **Checkout:** Framer usa `window.location.href = init_point` para ceder el control a la pasarela externa.
5. **Aprobación Simulada:** El usuario inserta una Test Card de MP y aprueba.
6. **Redirección de Espera:** MP redirige al usuario al `/success` del Backend. Se asienta registro como `PENDIENTE`.
7. **Redirección Final:** El Backend devuelve al usuario a `framer.com/pago-exitoso`.
8. **The Truth (Asíncrono):** MP efectúa un POST a `/webhook`. El servidor verifica el estado "authorized" y da por habilitada (`ACTIVA`) la suscripción en la Base de Datos.

---

## 4. Configuraciones y Propiedades Críticas
Para que el sistema orqueste correctamente este baile a 3 bandas (Framer, Spring Boot, MP), se definió de forma inamovible el bloque YAML:

```yaml
mercadopago:
  access-token: "TEST-XXXX..." # Token Oficial
  plan-id: "8a02fcc58..."      # Preapproval UUID
  backend-base-url: "https://pps-sk7p.onrender.com"
  frontend-url: "https://overly-mindset-259417.framer.app"
```
*También se habilitaron las excepciones estrictas de CORS en `SecurityConfig` para las rutas webhook.*
