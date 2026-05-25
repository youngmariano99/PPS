package com.PPS.PPS.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para enviar la respuesta a una pregunta de filtro específica en la postulación.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaCandidatoSolicitudDto {

    private UUID preguntaId;

    private String respuestaDada;
}
