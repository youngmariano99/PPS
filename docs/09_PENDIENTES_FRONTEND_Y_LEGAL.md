# 09_PENDIENTES_FRONTEND_Y_LEGAL: Registro de Tareas de Interfaz y Legales

Este documento es el registro maestro para las tareas que, por dependencias de arquitectura o priorización, se implementarán más adelante en Framer o a nivel Legal/TOCs, pero que ya forman parte del core estratégico definido en Backend.

## 1. Legal y Términos de Uso
* **Cláusula de Recolección de IP:** Es crítico actualizar la política de privacidad y los Términos de Uso para incluir que el sistema realiza un "IP Tracking" transversal (al registrarse y al interactuar/contactar). **Motivo publico:** "Por prevención de fraude, trazabilidad y seguridad integral de nuestra plataforma". Esto nos cubre legalmente frente al escudo Anti-Astroturfing.

## 2. UX/UI - Reseñas Duales (Modelo Amazon)
* **✅ Trabajo Verificado:** El backend proveerá un campo booleano `trabajoVerificado` en la response de la reseña. Si es `true`, el Frontend en Framer DEBE renderizar un badge/insignia destacada ("✅ Trabajo Verificado" o "✅ Contratación Confirmada") al lado del nombre del cliente.
* **Educación Visual:** Es necesario agregar tooltips o pequeñas notas visuales para educar al usuario de que las reseñas con este badge provienen de una solicitud de servicio transaccionada internamente y tienen el grado máximo de confianza.

## 3. UX/UI - Contacto Ofuscado y Fricción Cero
* **Ofuscación Estratégica:** En los perfiles públicos de Proveedores y Empresas, el número de teléfono o WhatsApp debe mostrarse truncado/ofuscado por defecto (Ej: `+54 9 2922 45-****`).
* **Trigger de Revelación:** El Frontend alojará un botón "Ver Contacto". Al hacer clic, ocurren dos cosas simultáneamente:
  1. Se revela visualmente el número completo.
  2. Se despacha una petición al backend (silenciosa) para registrar la `IntencionContacto`, enviando implícitamente la huella/IP del cliente.
* **Propósito:** Esta técnica no bloquea al usuario (no le obliga a llenar un flujo pesado) pero nos permite alimentar nuestra métrica de leads generados y controlar el Anti-Spam / Cooldown.
