# MÓDULO: sprint_3_suscripciones_mp (Membresías y Flujo de Pago de Baja Fricción)

## 1. Objetivo del Módulo
Este documento define la arquitectura definitiva y el flujo de integración de Mercado Pago utilizando **Checkout Pro** (API de Preferencias) para gestionar el acceso premium de los proveedores en la Plataforma de Proveedores de Servicios (PPS).

Originalmente planteado bajo la API de "Suscripciones" (`/preapproval`), el módulo evolucionó hacia **Checkout Pro** para garantizar la seguridad del flujo sin necesidad de implementar formularios nativos de tarjetas (Tokenization), permitiendo que Mercado Pago gestione la confianza y la interfaz de pago.

---

## 2. Arquitectura de Integración (Full Stack)

### A. La Base de Datos (PostgreSQL)
Se formalizó la suscripción en dos tablas (`01_MODELO_DE_DATOS.md`):
1. **`planes_suscripcion`**: Fuente de verdad para los precios. Contiene el plan "PRO" con su `precio_mensual` (ej. 3000 ARS).
2. **`suscripciones_usuario`**: Entidad de tracking. Relaciona al proveedor con el plan y rastrea el ciclo de vida del pago mediante el UUID local.

### B. El Backend (Spring Boot)
Se implementaron componentes robustos que eliminan valores hardcodeados:
* **MercadoPagoService**: Cliente REST que genera la "Preferencia de Pago". Inyecta dinámicamente el precio obtenido de la BD y utiliza el campo `external_reference` para vincular el pago de MP con el ID de suscripción de nuestra base de datos.
* **Controlador `/crear`**: Recibe la intención de compra, consulta el plan en la BD, genera el link de pago (`init_point`) y lo devuelve al frontend.
* **Controlador `/webhook`**: Única fuente de verdad para la activación. Escucha notificaciones de tipo `payment` y marca la suscripción como **`ACTIVA`** solo cuando el dinero está acreditado.

### C. El Frontend (Framer)
Componente nativo en React que:
1. Lee la sesión del proveedor de `localStorage`.
2. Llama al backend una única vez para obtener el link de redirección.
3. Delega el control total a Mercado Pago mediante `window.location.href`.

---

## 3. Flujo Transaccional "Checkout Pro"

1. **Intención:** El proveedor clickea en "Obtener Plan PRO".
2. **Petición Segura:** El componente envía `usuarioId` y `planId` al backend.
3. **Generación de Preferencia:** 
   - El backend busca el precio actual del plan en la BD.
   - Crea un registro con estado `PENDIENTE`.
   - Llama a Mercado Pago enviando el precio y el ID interno como `external_reference`.
4. **Pago en Pasarela:** El usuario completa el pago en la interfaz oficial de Mercado Pago (Interfaz azul).
5. **Confirmación (Webhook):** Mercado Pago notifica al backend. El sistema identifica al usuario mediante la referencia externa y activa el servicio por 30 días.

---

## 4. Configuraciones Críticas
El bloque de propiedades en `application.yml` se simplificó para eliminar dependencias de planes externos de MP:

```yaml
mercadopago:
  access-token: "TEST-XXXX..." # Token del vendedor
  backend-base-url: "https://pps-sk7p.onrender.com"
  frontend-url: "https://overly-mindset-259417.framer.app"
```

> [!IMPORTANT]
> **Seguridad:** El backend ya no requiere la propiedad `plan-id` de Mercado Pago. Todo el control de precios y productos reside ahora en nuestra base de datos PostgreSQL, garantizando independencia total de la plataforma de pagos.
