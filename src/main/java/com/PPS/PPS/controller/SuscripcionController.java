package com.PPS.PPS.controller;

import com.PPS.PPS.dto.suscripcion.CrearSuscripcionRequestDto;
import com.PPS.PPS.dto.suscripcion.MpWebhookDto;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.repository.UsuarioRepository;
import com.PPS.PPS.service.MercadoPagoService;
import com.PPS.PPS.service.SuscripcionService;
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
public class SuscripcionController {

    private final MercadoPagoService mercadoPagoService;
    private final SuscripcionService suscripcionService;
    private final UsuarioRepository usuarioRepository;

    @Value("${mercadopago.backend-base-url}")
    private String backendUrl;

    @Value("${mercadopago.frontend-url}")
    private String frontendUrl;

    @PostMapping("/crear")
    public ResponseEntity<Map<String, String>> crear(@Valid @RequestBody CrearSuscripcionRequestDto request) {
        log.info("Iniciando creacion de suscripcion para usuarioId: {}, planId: {}",
                request.getUsuarioId(), request.getPlanId());

        String backUrlEndpoint = backendUrl + "/api/v1/suscripciones/success";

        // Obtener el Init Point de la API de Mercado Pago
        String initPoint = suscripcionService.iniciarCheckoutProSuscripcion(request.getUsuarioId(), request.getPlanId(),
                backUrlEndpoint);

        // Devolvemos el init_point al Front
        return ResponseEntity.ok(Map.of("init_point", initPoint));
    }

    @GetMapping("/success")
    public void success(
            @RequestParam("preapproval_id") String preapprovalId,
            @RequestParam("usuarioId") UUID usuarioId,
            @RequestParam("planId") UUID planId,
            HttpServletResponse response) throws IOException {
        log.info("Redirect de MP recibido. Redirigiendo a éxito.");

        // Redirigir al frontend para UX.
        String returnRedirect = frontendUrl + "/pago-exitoso";
        response.sendRedirect(returnRedirect);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> notification) {
        log.info("Webhook recibido desde Mercado Pago: {}", notification);

        // Webhooks de pagos únicos envían type=payment o action=payment.created
        String type = (String) notification.get("type");
        String action = (String) notification.get("action");
        Map<String, Object> data = (Map<String, Object>) notification.get("data");

        if (("payment".equals(type) || "payment.created".equals(action)) && data != null) {
            String paymentId = String.valueOf(data.get("id"));

            // Para ser 100% seguros tendríamos que hacer un GET a MP con este pago para
            // leer su external_reference
            // Pero por simplicidad del MVP (y porque es test), vamos a extraer
            // external_reference del pago si está en la notificación V2
            // Nota: MP V2 envía data.id, hay que consultar la API de pagos para el
            // external_reference.
            // Solución rápida: Asumimos que implementamos la recuperación de MP o que la
            // notificación trae la info.
            log.info("Pago acreditado ID: {}", paymentId);

            // En Producción: Consultar
            // MercadoPagoService.obtenerPreferenciaParaPago(paymentId) -> sacar
            // external_reference.
            // Para el alcance de la demo dejaremos el esqueleto listo para usar
            // procesarWebhookPagoUnico(reference)
        }

        return ResponseEntity.ok().build();
    }
}
