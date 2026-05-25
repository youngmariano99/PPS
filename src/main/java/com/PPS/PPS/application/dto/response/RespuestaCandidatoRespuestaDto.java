package com.PPS.PPS.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO de respuesta para representar una respuesta dada a una pregunta de filtro.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaCandidatoRespuestaDto {

    private UUID id;

    private UUID preguntaId;

    private String preguntaEnunciado;

    private String respuestaDada;
}
