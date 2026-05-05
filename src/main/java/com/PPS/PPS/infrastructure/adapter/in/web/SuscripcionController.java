package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.dto.request.CrearSuscripcionRequestDto;
import com.PPS.PPS.repository.UsuarioRepository;
import com.PPS.PPS.service.MercadoPagoService;
import com.PPS.PPS.service.SuscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/suscripciones")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Suscripciones", description = "Gestión de pagos y membresías con Mercado Pago")
public class SuscripcionController {

    private final MercadoPagoService mercadoPagoService;
    private final SuscripcionService suscripcionService;

    @Value("${mercadopago.backend-base-url}")
    private String backendUrl;

    @Value("${mercadopago.frontend-url}")
    private String frontendUrl;

    @PostMapping("/crear")
    @Operation(summary = "Crear preferencia de pago", description = "Genera un init_point de Mercado Pago para iniciar el flujo de suscripción Premium.")
    public ResponseEntity<Map<String, String>> crear(@Valid @RequestBody CrearSuscripcionRequestDto request) {
        log.info("Iniciando creacion de suscripcion para usuarioId: {}, planId: {}",
                request.getUsuarioId(), request.getPlanId());

        // Construir la URL de éxito pasando los datos necesarios como query params
        String backUrlEndpoint = String.format("%s/api/v1/suscripciones/success?usuarioId=%s&planId=%s",
                backendUrl, request.getUsuarioId(), request.getPlanId());

        // Obtener el Init Point de la API de Mercado Pago
        String initPoint = suscripcionService.iniciarCheckoutProSuscripcion(request.getUsuarioId(), request.getPlanId(),
                backUrlEndpoint);

        // Devolvemos el init_point al Front
        return ResponseEntity.ok(Map.of("init_point", initPoint));
    }

    @GetMapping("/success")
    @Operation(summary = "Retorno de éxito", description = "Endpoint de retorno tras un pago exitoso. Redirige al frontend.")
    public void success(
            @RequestParam(value = "preapproval_id", required = false) String preapprovalId,
            @RequestParam(value = "payment_id", required = false) String paymentId,
            @RequestParam(value = "usuarioId", required = false) UUID usuarioId,
            @RequestParam(value = "planId", required = false) UUID planId,
            HttpServletResponse response) throws IOException {
        log.info("Redirect de MP recibido. Redirigiendo a éxito en Framer.");

        // Redirigir al frontend para UX.
        // Si tienes la página 'pago-exitoso' en Framer, irá ahí. Si no existe, irá a la
        // home.
        String returnRedirect = frontendUrl + "/pago-exitoso";
        response.sendRedirect(returnRedirect);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Webhook de Mercado Pago", description = "Recibe notificaciones asíncronas de pagos para activar suscripciones en segundo plano.")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> notification) {
        log.info("Webhook recibido desde Mercado Pago: {}", notification);

        // Notificaciones V2: vienen con action y data.id
        String type = (String) notification.get("type");
        String action = (String) notification.get("action");
        Map<String, Object> data = (Map<String, Object>) notification.get("data");

        if (("payment".equals(type) || "payment.created".equals(action)) && data != null) {
            String paymentId = String.valueOf(data.get("id"));
            log.info("Procesando pago ID: {}", paymentId);

            com.PPS.PPS.application.dto.response.MpPaymentResponseDto pago = mercadoPagoService
                    .consultarPago(paymentId);

            if (pago != null && "approved".equals(pago.getStatus())) {
                String reference = pago.getExternalReference();
                if (reference != null) {
                    log.info("Pago aprobado para suscripcion interna: {}. Activando...", reference);
                    suscripcionService.procesarWebhookPagoUnico(reference);
                }
            } else {
                log.info("El pago {} no está aprobado o no se pudo consultar. Status: {}",
                        paymentId, (pago != null ? pago.getStatus() : "null"));
            }
        }

        return ResponseEntity.ok().build();
    }
}
