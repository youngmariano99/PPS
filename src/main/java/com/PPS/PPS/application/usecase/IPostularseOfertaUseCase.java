package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.request.PostulacionSolicitudDto;
import com.PPS.PPS.application.dto.response.PostulacionRespuestaDto;

import java.util.List;
import java.util.UUID;

/**
 * Caso de uso para gestionar postulaciones a ofertas de empleo.
 */
public interface IPostularseOfertaUseCase {

    /**
     * Envía una postulación a una oferta de empleo, validando las preguntas excluyentes.
     */
    PostulacionRespuestaDto postularse(UUID usuarioId, PostulacionSolicitudDto dto);

    /**
     * Lista todas las postulaciones realizadas por el candidato actual.
     */
    List<PostulacionRespuestaDto> listarPostulacionesPropias(UUID usuarioId);

    /**
     * Lista todas las postulaciones recibidas para una oferta de empleo específica (Autorizado para el creador).
     */
    List<PostulacionRespuestaDto> listarPostulacionesPorOferta(UUID usuarioId, UUID ofertaId);
}
