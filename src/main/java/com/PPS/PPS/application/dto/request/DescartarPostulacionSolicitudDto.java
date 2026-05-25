package com.PPS.PPS.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la solicitud de descarte de un postulante.
 * Exige de forma obligatoria el código de motivo del rechazo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DescartarPostulacionSolicitudDto {

    /**
     * Código obligatorio de rechazo (ej: EXPECTATIVA_SALARIAL, FALTA_EXPERIENCIA).
     */
    private String motivoRechazoCodigo;

    private String feedbackAdicional;
}
