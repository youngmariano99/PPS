package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.response.OfertaRespuestaDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Caso de uso para listar Ofertas de Empleo (activas y propias).
 */
public interface IListarOfertasUseCase {

    /**
     * Lista todas las ofertas de empleo activas con paginación.
     */
    Page<OfertaRespuestaDto> listarActivas(Pageable pageable);

    /**
     * Lista todas las ofertas de empleo publicadas por el usuario actual.
     */
    List<OfertaRespuestaDto> listarPropias(UUID usuarioId);
}
