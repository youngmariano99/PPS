# 📘 GUÍA PARA MARIANO: Integración de Suscripciones y Webhook

¡Hola Mariano! Esta guía ha sido expandida para darte un control total sobre el sistema de pagos. Aquí encontrarás no solo qué tablas mirar, sino **cómo funciona por dentro** y cómo puedes extenderlo con total seguridad.

---

## 1. El Corazón del Sistema: La Base de Datos
Las tablas clave que vas a consultar son:

*   **`planes_suscripcion`**: Fuente de verdad de precios. Contiene el nombre (ej. "Plan PRO") y el costo mensual.
*   **`suscripciones_usuario`**: Vincula al usuario con su membresía.
    *   **Estado Crítico:** Un usuario solo es "Premium" si su estado es **`ACTIVA`**.
    *   **Columna `usuario_id`**: UUID del usuario (FK a `usuarios`).
    *   **Ciclo de Vida:** Cuando un usuario paga, se genera un registro `PENDIENTE`. Al confirmarse el pago vía Webhook, pasa a `ACTIVA`.

---

## 2. Flujo de Implementación (Cómo funciona la API)

Nuestra integración usa **Mercado Pago Checkout Pro**. A diferencia de las suscripciones automáticas (que requieren tarjeta de crédito fija), esto permite pagar con cualquier medio (Débito, Crédito, Dinero en cuenta).

### Paso 1: Generación de la Preferencia (`/crear`)
Cuando el usuario hace clic en "Comprar", el Backend:
1. Crea una suscripción local en estado `PENDIENTE`.
2. Llama a Mercado Pago enviando nuestro ID interno como `external_reference`.
3. Devuelve un `init_point` (URL de pago).

### Paso 2: El Webhook (El Único que manda)
Mercado Pago nos avisa mediante un POST a `/api/v1/suscripciones/webhook`.
*   **Seguridad:** El sistema consulta a MP el estado del pago usando el ID recibido. Solo si MP dice `"approved"`, activamos la suscripción.
*   **Vínculo:** Usamos el `external_reference` para saber a qué suscripción de nuestra BD corresponde el dinero.

---

## 3. Dónde meter la lógica de "Check Azul" y "Destacados"

El punto de entrada de cada pago exitoso es el Webhook. He dejado el terreno preparado en el código de Java para que puedas expandirlo:

**Archivo:** `src/main/java/com/PPS/PPS/service/SuscripcionService.java`
**Método:** `procesarWebhookPagoUnico(String suscripcionIdStr)` (Línea 99)

```java
// Dentro de este método, donde dice suscripcion.setEstado("ACTIVA"):
suscripcion.setEstado("ACTIVA");
suscripcionUsuarioRepository.save(suscripcion);

// 🚀 AQUÍ ES DONDE DEBES AGREGAR TU LÓGICA MARIANO:
// 1. Activar el check azul en la tabla perfiles.
// 2. Notificar al usuario vía email (Resend).
// 3. Registrar el evento en el log de auditoría.
```

---

## 4. Referencia Técnica para Implementación

Si necesitas replicar esto en otro módulo o entender el código:

| Componente | Responsabilidad | Archivo Clave |
| :--- | :--- | :--- |
| **Controlador** | Expone `/crear` y `/webhook`. | `SuscripcionController.java` |
| **Lógica de Negocio** | Gestiona estados en BD (PENDIENTE -> ACTIVA). | `SuscripcionService.java` |
| **Cliente API** | Se comunica con los servidores de Mercado Pago. | `MercadoPagoService.java` |

---

## 5. Control de Preguntas (FAQ & Troubleshooting)

Para que estés "bien atento" a posibles fallos:

**P: ¿Qué pasa si el usuario paga pero cierra la ventana antes de volver al sitio?**
*   **R:** No pasa nada. El Webhook corre por detrás (servidor a servidor). El usuario será activado aunque se le corte la luz después de pagar.

**P: ¿Cómo pruebo el flujo sin gastar dinero real?**
*   **R:** Usa las [Tarjetas de Prueba de MP](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards). El sistema está configurado en **Sandbox Mode**, por lo que solo aceptará estas tarjetas.

**P: El Webhook no está activando la cuenta, ¿qué reviso?**
*   1. Mira los logs del Backend: Busca "Webhook recibido".
*   2. Verifica que el `external_reference` en MP coincida con un ID en tu tabla `suscripciones_usuario`.
*   3. Asegúrate de que el túnel (si usas localhost) o la URL en `application.yml` sea pública.

**P: ¿Cómo ordeno a los proveedores para que los Premium salgan primero?**
*   Usa este SQL de referencia en tus repositorios:
```sql
SELECT p.* FROM perfiles_proveedor p
LEFT JOIN suscripciones_usuario s ON p.usuario_id = s.usuario_id 
  AND s.estado = 'ACTIVA' AND s.fecha_fin > NOW()
ORDER BY s.estado DESC, p.created_at DESC;
```

---

## 6. Glosario de Estados
- **`PENDIENTE`**: Intento de pago iniciado. No tiene beneficios.
- **`ACTIVA`**: Pago verificado por MP. Beneficios habilitados.
- **`VENCIDA`**: El tiempo de 30 días expiró o se reemplazó por un plan nuevo.

¡Cualquier duda, revisa `MercadoPagoService.java`, está todo documentado! 🚀✨
