package com.PPS.PPS.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * DTO para la respuesta de detalles de una Postulación laboral.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostulacionRespuestaDto {

    private UUID id;

    private UUID ofertaId;

    private String ofertaTitulo;

    private UUID candidatoId;

    private String candidatoNombreCompleto;

    private String candidatoEmail;

    private String mensajePresentacion;

    private String cvUrlAdjunto;

    private String estado;

    private String motivoRechazoCodigo;

    private String feedbackAdicional;

    private boolean esExcluido;

    @Builder.Default
    private List<RespuestaCandidatoRespuestaDto> respuestas = new ArrayList<>();

    private OffsetDateTime fechaCreacion;
}
