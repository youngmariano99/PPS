# MÓDULO: sprint_3_suscripciones_mp (Membresías y Flujo de Pago)

## 1. Objetivo del Módulo
Este documento define la arquitectura y el flujo de integración de Mercado Pago (en modo Sandbox/Prueba) para gestionar la suscripción premium de proveedores en la Plataforma de Proveedores de Servicios (PPS). Se detalla la fase inicial diseñada para la presentación (flujo funcional con backend y frontend interactuando).

---

## 2. Integración con Mercado Pago: Arquitectura y Explicación

Para lograr un sistema de pagos funcional sin complicar excesivamente la arquitectura durante una presentación, dividimos la interacción en tres actores: **Frontend (React)**, **Backend (Spring Boot)** y la **API de Mercado Pago**.

### ¿Cómo interactúa cada factor?
1. **Iniciativa (Frontend):** El usuario hace clic en "Suscribirse" enviando su identificador.
2. **Creación de Preferencia (Backend):** Nuestro servidor se comunica en privado con Mercado Pago mediante credenciales (Test Access Token). Le dice: *"Créame una intención de cobro por $15,000 para este servicio"*.
3. **El Puente (Checkout Pro):** Mercado Pago responde con una URL segura (`init_point`). El backend se la pasa al frontend, y el navegador del usuario viaja a la pasarela de MP.
4. **Validación (Sandbox):** El usuario ingresa una "Test Card" (tarjeta de prueba provista por Mercado Pago para simular aprobaciones).
5. **Retorno y Confirmación:** Al finalizar, MP redirige al usuario a una URL de éxito definida en nuestra app (ej. `/pago-exitoso?status=approved`). El Frontend detecta este `status` en la URL y le notifica al Backend para que cambie el estado del usuario de "básico" a "premium".

---

## 3. Flujo Paso a Paso y Datos Mínimos

### El Flujo Simulativo (Fase 1: En Memoria para Demo)
En la fase de presentación inmediata, implementamos el flujo usando Mocking (guardando el estado en memoria en Spring Boot):

* **POST `/api/v1/suscripciones/checkout`**: 
  * *Entrada:* `userId`
  * *Acción:* Crea preferencia en MP. 
  * *Salida:* `init_point` (URL).
* **El Pago:** El usuario usa la Pasarela Web de MP.
* **POST `/api/v1/suscripciones/confirmar`**: 
  * *Entrada:* `userId`, `status="approved"`
  * *Acción:* Ejecuta `usuariosPremium.put(userId, true)` en la memoria RAM del servidor.
* **Impacto en Pantalla:** El endpoint de de búsqueda geolocalizada pregunta si el usuario es premium en ese mapa en memoria y adjunta un badge dorado.

### Datos Mínimos Viajando:
```json
{
  "planName": "PPS Premium - Suscripción Mensual",
  "monthlyPrice": 15000.00,
  "userId": "uuid-del-proveedor"
}
```

---

## 4. Persistencia Definitiva (Escalable y Relacional)

Para soportar futuras funcionalidades (múltiples planes o historiales de facturación), la estructura de la base de datos ha abandonado el modelo simulado y ahora gestiona la suscripción en dos tablas clave en PostgreSQL (Ver `01_MODELO_DE_DATOS.md`):

1. **`planes_suscripcion`:** 
   * Guarda el plan "PPS Premium" con su precio (`15000.00`).
   * *Ejemplo:* `id`, `nombre`, `precio_mensual`.
2. **`suscripciones_usuario`:** 
   * Conecta al `usuario_id` con el `plan_id`. 
   * Determina si está `'ACTIVA'` y guarda el `mp_preferencia_id` que usamos para mapear que el cobro pertenece a ese ticket exacto.
   * Maneja el periodo mediante `fecha_inicio` y `fecha_fin`.

**Actualización Tras Pago (Backend Real):**
Cuando Mercado Pago llama a la confirmación exitosa (`/api/v1/suscripciones/confirmar` vía Webhook):
1. El backend crea una fila en `suscripciones_usuario`.
2. Settea `estado = 'ACTIVA'`.
3. Settea `fecha_inicio = NOW()` y `fecha_fin = NOW() + 1 MES`.
4. El endpoint de geolocalización ahora hace un `JOIN` rápido con esta tabla para saber quién tiene `fecha_fin > NOW()` y destacar su perfil.

---

## 5. Historial de Cambios (Módulo Suscripciones)

*   **[2026-04-15] - Diseño Inicial de Suscripciones (Fase Demo):** Se definió el flujo síncrono de redirección a Checkout Pro de Mercado Pago. Se estableció el modelo de estado en memoria para probar interacciones.
*   **[2026-04-15] - Persistencia Relacional:** Se reemplazó el modelo "en memoria" y los enfoques simplistas por tablas aisladas (`planes_suscripcion` y `suscripciones_usuario`) en la Base de Datos para asegurar la escalabilidad del sistema de monetización.
