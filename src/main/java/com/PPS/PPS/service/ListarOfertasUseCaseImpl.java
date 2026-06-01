package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IListarOfertasUseCase;
import com.PPS.PPS.application.dto.response.OfertaRespuestaDto;
import com.PPS.PPS.application.dto.response.PreguntaFiltroRespuestaDto;
import com.PPS.PPS.domain.model.OfertaEmpleo;
import com.PPS.PPS.domain.repository.OfertaEmpleoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación del caso de uso para listar ofertas de empleo.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ListarOfertasUseCaseImpl implements IListarOfertasUseCase {

    private final OfertaEmpleoRepository ofertaRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<OfertaRespuestaDto> listarActivas(Pageable pageable) {
        log.info("Listando ofertas de empleo activas con paginación: {}", pageable);
        // Gracias a @SQLRestriction("activa = true") en OfertaEmpleo,
        // findAll automáticamente filtra las ofertas inactivas.
        Page<OfertaEmpleo> ofertas = ofertaRepository.findAll(pageable);
        return ofertas.map(this::mapearADto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfertaRespuestaDto> listarPropias(UUID usuarioId) {
        log.info("Buscando ofertas de empleo creadas por usuarioId: {}", usuarioId);
        List<OfertaEmpleo> propias = ofertaRepository.findByProveedorUsuarioIdOrEmpresaUsuarioId(usuarioId, usuarioId);
        return propias.stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OfertaRespuestaDto obtenerPorId(UUID id) {
        log.info("Obteniendo detalles de la ofertaId: {}", id);
        OfertaEmpleo o = ofertaRepository.findById(id)
                .orElseThrow(() -> new com.PPS.PPS.domain.exception.RecursoNoEncontradoException("Oferta de empleo no encontrada."));
        return mapearADto(o);
    }


    private OfertaRespuestaDto mapearADto(OfertaEmpleo o) {
        List<PreguntaFiltroRespuestaDto> preguntas = o.getPreguntasFiltro().stream()
                .map(p -> PreguntaFiltroRespuestaDto.builder()
                        .id(p.getId())
                        .pregunta(p.getPregunta())
                        .tipoPregunta(p.getTipoPregunta())
                        .respuestaEsperadaExcluyente(p.getRespuestaEsperadaExcluyente())
                        .build())
                .collect(Collectors.toList());

        return OfertaRespuestaDto.builder()
                .id(o.getId())
                .titulo(o.getTitulo())
                .descripcion(o.getDescripcion())
                .modalidad(o.getModalidad())
                .salarioMin(o.getSalarioMin())
                .salarioMax(o.getSalarioMax())
                .habilidadesClave(o.getHabilidadesClave())
                .preguntasFiltro(preguntas)
                .activa(o.isActiva())
                .proveedorId(o.getProveedor() != null ? o.getProveedor().getId() : null)
                .proveedorNombre(o.getProveedor() != null ? 
                        o.getProveedor().getUsuario().getNombre() + " " + o.getProveedor().getUsuario().getApellido() : null)
                .empresaId(o.getEmpresa() != null ? o.getEmpresa().getId() : null)
                .empresaRazonSocial(o.getEmpresa() != null ? o.getEmpresa().getRazonSocial() : null)
                .fechaCreacion(o.getFechaCreacion())
                .build();
    }
}
