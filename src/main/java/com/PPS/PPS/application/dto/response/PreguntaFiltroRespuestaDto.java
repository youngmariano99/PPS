package com.PPS.PPS.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para la respuesta de detalles de una Pregunta de Filtro.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreguntaFiltroRespuestaDto {

    private UUID id;

    private String pregunta;

    private String tipoPregunta;

    private String respuestaEsperadaExcluyente;
}
