package com.PPS.PPS.service;

import com.PPS.PPS.application.dto.response.MpPaymentResponseDto;
import com.PPS.PPS.application.dto.response.MpPreapprovalResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MercadoPagoService {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Crea una Preferencia de Pago en Mercado Pago (Suscripcion Mensual simulada).
     * 
     * @param usuarioId     ID del usuario para tracking.
     * @param email         Correo del usuario.
     * @param backUrl       Endpoint al que retorna (éxito o pendiente).
     * @param preapprovalId El ID de la "suscripcion" pendiente que usaremos como
     *                      reference.
     * @param precio        El precio mensual configurado para el plan.
     * @return El init_point.
     */
    public String crearPreferenciaSuscripcion(String usuarioId, String email, String backUrl, String preapprovalId,
            BigDecimal precio) {
        log.info("Creando Preference en MP para usuario: {}, reference: {}, precio: {}", email, preapprovalId, precio);

        String url = "https://api.mercadopago.com/checkout/preferences";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();

        // 1. Items (Lo que se cobra)
        Map<String, Object> item = new HashMap<>();
        item.put("title", "Suscripción Premium PPS");
        item.put("quantity", 1);
        item.put("unit_price", precio); // Dinámico desde la BD
        item.put("currency_id", "ARS");
        body.put("items", java.util.List.of(item));

        // 2. Payer (Comprador)
        Map<String, Object> payer = new HashMap<>();
        payer.put("email", email);
        body.put("payer", payer);

        // 3. Back URLs & Redirección Automática
        Map<String, String> backUrls = new HashMap<>();
        backUrls.put("success", backUrl);
        backUrls.put("pending", backUrl);
        backUrls.put("failure", backUrl);
        body.put("back_urls", backUrls);
        body.put("auto_return", "approved");

        // 4. Referencia Externa (Crucial para el Webhook)
        body.put("external_reference", preapprovalId);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<MpPreapprovalResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    MpPreapprovalResponseDto.class);

            if (response.getBody() != null) {
                // Preferimos sandbox_init_point para pruebas, si no existe usamos init_point
                String link = response.getBody().getSandbox_init_point();
                if (link == null) {
                    link = response.getBody().getInit_point();
                }
                return link;
            }
            throw new RuntimeException("Respuesta vacía al generar el link de pago");

        } catch (Exception e) {
            log.error("Error al crear la preferencia en MP: {}", e.getMessage(), e);
            throw new RuntimeException("Error en la integracion con MP Checkout", e);
        }
    }

    /**
     * Consulta el estado REAL de una suscripcion usando el ID de la misma.
     * 
     * @param preapprovalId El ID de la pre-aprobacion.
     * @return El estado retornado por MP (ej. "authorized", "paused", "cancelled").
     */
    public String consultarSuscripcion(String preapprovalId) {
        String url = "https://api.mercadopago.com/preapproval/" + preapprovalId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<MpPreapprovalResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    MpPreapprovalResponseDto.class);

            if (response.getBody() != null) {
                return response.getBody().getStatus();
            }
            return "unknown";
        } catch (Exception e) {
            log.error("Error al consultar la suscripcion en MP: {}", e.getMessage(), e);
            return "error";
        }
    }

    /**
     * Consulta el detalle de un pago único para obtener la referencia externa.
     * @param paymentId ID del pago.
     * @return El DTO con el detalle del pago o null si falla.
     */
    public MpPaymentResponseDto consultarPago(String paymentId) {
        log.info("Consultando pago id: {}", paymentId);
        String url = "https://api.mercadopago.com/v1/payments/" + paymentId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<MpPaymentResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    MpPaymentResponseDto.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error al consultar pago {} en MP: {}", paymentId, e.getMessage());
            return null;
        }
    }
}

