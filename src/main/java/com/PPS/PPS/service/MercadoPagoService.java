package com.PPS.PPS.service;

import com.PPS.PPS.dto.suscripcion.MpPreapprovalResponseDto;
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

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MercadoPagoService {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    @Value("${mercadopago.plan-id}")
    private String planId;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Crea un Preapproval en Mercado Pago.
     * @param email Correo del usuario que paga.
     * @param backUrl La URL del backend a la que MP debe retornar despues de procesar el pago.
     * @return El init_point al que debe redirigir el frontend.
     */
    public String crearSuscripcionPreapproval(String email, String backUrl) {
        log.info("Creando preapproval en Mercado Pago para: {}, planId: {}, backUrl: {}", email, planId, backUrl);

        String url = "https://api.mercadopago.com/preapproval";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("preapproval_plan_id", planId);
        body.put("payer_email", email);
        body.put("back_url", backUrl);
        body.put("reason", "PPS Premium Suscripcion");

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<MpPreapprovalResponseDto> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    MpPreapprovalResponseDto.class
            );

            if (response.getBody() != null) {
                return response.getBody().getInit_point();
            }
            throw new RuntimeException("Respuesta vacía de Mercado Pago al crear suscripción");

        } catch (Exception e) {
            log.error("Error al crear la suscripción en MP: {}", e.getMessage(), e);
            throw new RuntimeException("Error en la integracion con Mercado Pago", e);
        }
    }

    /**
     * Consulta el estado REAL de una suscripcion usando el ID de la misma.
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
                    MpPreapprovalResponseDto.class
            );

            if (response.getBody() != null) {
                return response.getBody().getStatus();
            }
            return "unknown";
        } catch (Exception e) {
            log.error("Error al consultar la suscripcion en MP: {}", e.getMessage(), e);
            return "error";
        }
    }
}
