# 📘 GUÍA PARA MARIANO: Integración de Suscripciones y Webhook

¡Hola Mariano! Esta guía resume cómo funciona el módulo de Mercado Pago para que puedas integrarlo con el resto de la plataforma (checks azules, perfiles destacados, prioridad en búsqueda, etc.).

---

## 1. El Corazón del Sistema: La Base de Datos
Las tablas clave que vas a consultar son:

*   **`planes_suscripcion`**: Aquí están los precios y nombres de los planes (ej. Plan PRO).
*   **`suscripciones_usuario`**: Es la tabla que vincula a un usuario con un plan.
    *   **Estado Crítico:** Solo debes considerar un usuario como "Premium" si su estado es **`ACTIVA`**.
    *   **Columna `usuario_id`**: Es el UUID del usuario (FK a la tabla `usuarios`).

---

## 2. Dónde meter la lógica de "Check Azul" y "Destacados"

El punto de entrada de cada pago exitoso es el Webhook. He dejado el terreno preparado en el código de Java para que puedas expandirlo:

**Archivo:** `src/main/java/com/PPS/PPS/service/SuscripcionService.java`
**Método:** `procesarWebhookPagoUnico(String suscripcionIdStr)` (Línea 99)

```java
// Dentro de este método, donde dice suscripcion.setEstado("ACTIVA"):
suscripcion.setEstado("ACTIVA");
suscripcionUsuarioRepository.save(suscripcion);

// 🚀 AQUÍ ES DONDE DEBES AGREGAR TU LÓGICA MARIANO:
// Ej: perfilService.activarBeneficiosPremium(suscripcion.getUsuario().getId());
```

---

## 3. Guía de Endpoints (API)

Si necesitas llamar a estas funciones desde el Frontend o extenderlas:

| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/v1/suscripciones/crear` | `POST` | Recibe `{usuarioId, planId}` y devuelve el `init_point` (link de pago). |
| `/api/v1/suscripciones/webhook` | `POST` | Lo llama Mercado Pago automáticamente. Valida el pago y activa al usuario. |
| `/api/v1/suscripciones/success` | `GET` | Endpoint de retorno tras pagar. Redirige al usuario de vuelta a Framer. |

---

## 4. Consideraciones de Seguridad y Testing

### El Hook "Sandbox"
Para probar, estamos usando el subdominio de **Sandbox** de Mercado Pago. Esto significa que **siempre** debes usar las tarjetas de prueba oficiales (de esas que empiezan con 4509 o 4444).

### Prioridad en Búsquedas
Cuando hagas la query para mostrar la lista de proveedores, podés usar un **`LEFT JOIN`** con la tabla de suscripciones:

```sql
-- Idea para Mariano: Ordenar por activos primero
SELECT p.* FROM perfiles_proveedor p
LEFT JOIN suscripciones_usuario s ON p.usuario_id = s.usuario_id 
  AND s.estado = 'ACTIVA' AND s.fecha_fin > NOW()
ORDER BY s.estado DESC, p.created_at DESC;
```

---

## 5. Glosario de Estados
- **`PENDIENTE`**: El usuario hizo click pero aún no terminó el pago o el Webhook no llegó.
- **`ACTIVA`**: Pago verificado. Tiene acceso total.
- **`VENCIDA`**: Se acabó el tiempo o compró un plan nuevo (el sistema viejo se marca como vencido automáticamente).

¡Cualquier duda, el código en `MercadoPagoService` y `SuscripcionService` está súper comentado! 🚀✨
