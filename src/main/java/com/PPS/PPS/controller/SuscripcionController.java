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
@RequestMapping("/api/v1/suscripciones")
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

        // Buscar el usuario para obtener su email, no confiar del frontend
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Construir backUrl. Este endpoint se llamara desde el navegador
        String backUrlEndpoint = backendUrl + "/api/v1/suscripciones/success"
                + "?usuarioId=" + request.getUsuarioId() 
                + "&planId=" + request.getPlanId();

        // Obtener el Init Point de la API de Mercado Pago
        String initPoint = mercadoPagoService.crearSuscripcionPreapproval(usuario.getEmail(), backUrlEndpoint);

        // Devolvemos el init_point al Front
        return ResponseEntity.ok(Map.of("init_point", initPoint));
    }

    @GetMapping("/success")
    public void success(
            @RequestParam("preapproval_id") String preapprovalId,
            @RequestParam("usuarioId") UUID usuarioId,
            @RequestParam("planId") UUID planId,
            HttpServletResponse response) throws IOException {
        
        log.info("Redirect de MP recibido. preapproval_id: {}, usuarioId: {}", preapprovalId, usuarioId);

        // Guardar estado PENDIENTE, no activar nada.
        suscripcionService.registrarSuscripcionPendiente(usuarioId, planId, preapprovalId);

        // Redirigir al frontend para UX.
        String returnRedirect = frontendUrl + "/pago-exitoso";
        response.sendRedirect(returnRedirect);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody MpWebhookDto notification) {
        log.info("Webhook recibido desde Mercado Pago: {}", notification.getType());

        // Importante: Asegurar procesar preapproval
        if ("preapproval".equals(notification.getType()) && notification.getData() != null) {
            String preapprovalId = notification.getData().getId();
            
            // Delegar la consulta asincrona para ser la unica fuente de verdad de la "Activacion"
            suscripcionService.procesarWebhook(preapprovalId);
        }

        return ResponseEntity.ok().build();
    }
}
