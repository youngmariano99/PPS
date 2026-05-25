package com.PPS.PPS.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la solicitud de creación de una Pregunta de Filtro (Knockout Question).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreguntaFiltroSolicitudDto {

    private String pregunta;

    /**
     * Tipo de pregunta: SI_NO, TEXTO_CORTO.
     */
    private String tipoPregunta;

    /**
     * Respuesta esperada para considerarse compatible (ej: "SI" o "NO" para SI_NO, o valor específico).
     */
    private String respuestaEsperadaExcluyente;
}
