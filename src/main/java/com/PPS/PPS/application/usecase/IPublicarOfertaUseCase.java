package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.request.CrearOfertaSolicitudDto;
import com.PPS.PPS.application.dto.response.OfertaRespuestaDto;

import java.util.UUID;

/**
 * Caso de uso para la publicación y eliminación lógica de Ofertas de Empleo.
 */
public interface IPublicarOfertaUseCase {

    /**
     * Registra una nueva oferta de empleo con sus preguntas de filtro.
     * Valida permisos e integridad de los datos.
     */
    OfertaRespuestaDto publicar(UUID usuarioId, CrearOfertaSolicitudDto dto);

    /**
     * Realiza un borrado lógico (cambiando el flag activa a false) de la oferta.
     */
    void eliminarLogico(UUID usuarioId, UUID ofertaId);
}
