package com.PPS.PPS.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * DTO para la solicitud de creación de una Postulación laboral.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostulacionSolicitudDto {

    private UUID ofertaId;

    private String mensajePresentacion;

    /**
     * Enlace de currículum en PDF (opcionalmente de Google Drive).
     */
    private String cvUrlAdjunto;

    @Builder.Default
    private List<RespuestaCandidatoSolicitudDto> respuestas = new ArrayList<>();
}
