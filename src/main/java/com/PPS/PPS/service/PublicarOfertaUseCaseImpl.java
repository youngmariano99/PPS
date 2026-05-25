package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IPublicarOfertaUseCase;
import com.PPS.PPS.application.dto.request.CrearOfertaSolicitudDto;
import com.PPS.PPS.application.dto.request.PreguntaFiltroSolicitudDto;
import com.PPS.PPS.application.dto.response.OfertaRespuestaDto;
import com.PPS.PPS.application.dto.response.PreguntaFiltroRespuestaDto;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.domain.model.OfertaEmpleo;
import com.PPS.PPS.domain.model.PerfilEmpresa;
import com.PPS.PPS.domain.model.PerfilProveedor;
import com.PPS.PPS.domain.model.PreguntaFiltroOferta;
import com.PPS.PPS.domain.repository.OfertaEmpleoRepository;
import com.PPS.PPS.domain.repository.PerfilEmpresaRepository;
import com.PPS.PPS.domain.repository.PerfilProveedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación concreta del caso de uso para publicar y eliminar ofertas de empleo.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PublicarOfertaUseCaseImpl implements IPublicarOfertaUseCase {

    private final OfertaEmpleoRepository ofertaRepository;
    private final PerfilProveedorRepository proveedorRepository;
    private final PerfilEmpresaRepository empresaRepository;

    @Override
    @Transactional
    public OfertaRespuestaDto publicar(UUID usuarioId, CrearOfertaSolicitudDto dto) {
        log.info("Iniciando publicación de oferta para usuarioId: {}", usuarioId);

        // 1. Validaciones de asociación de perfil
        if (dto.getProveedorId() == null && dto.getEmpresaId() == null) {
            throw new ValidacionNegocioException("Debe asociar la oferta a un perfil (Proveedor o Empresa).");
        }
        if (dto.getProveedorId() != null && dto.getEmpresaId() != null) {
            throw new ValidacionNegocioException("No se puede asociar la oferta a ambos perfiles simultáneamente.");
        }

        PerfilProveedor proveedor = null;
        PerfilEmpresa empresa = null;

        if (dto.getProveedorId() != null) {
            proveedor = proveedorRepository.findById(dto.getProveedorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Perfil de proveedor no encontrado."));
            if (!proveedor.getUsuario().getId().equals(usuarioId)) {
                throw new ValidacionNegocioException("No está autorizado a publicar bajo este perfil de proveedor.");
            }
        } else {
            empresa = empresaRepository.findById(dto.getEmpresaId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Perfil de empresa no encontrado."));
            if (!empresa.getUsuario().getId().equals(usuarioId)) {
                throw new ValidacionNegocioException("No está autorizado a publicar bajo este perfil de empresa.");
            }
        }

        // 2. Validaciones básicas de campos
        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new ValidacionNegocioException("El título de la oferta es obligatorio.");
        }
        if (dto.getDescripcion() == null || dto.getDescripcion().trim().isEmpty()) {
            throw new ValidacionNegocioException("La descripción de la oferta es obligatoria.");
        }

        // 3. Validación de modalidad
        String mod = dto.getModalidad();
        if (mod == null || (!mod.equals("REMOTO") && !mod.equals("PRESENCIAL") && !mod.equals("HIBRIDO"))) {
            throw new ValidacionNegocioException("La modalidad debe ser REMOTO, PRESENCIAL o HIBRIDO.");
        }

        // 4. Validación de salarios
        BigDecimal min = dto.getSalarioMin();
        BigDecimal max = dto.getSalarioMax();
        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new ValidacionNegocioException("El salario mínimo no puede ser mayor que el salario máximo.");
        }

        // 5. Instanciar la oferta
        OfertaEmpleo oferta = OfertaEmpleo.builder()
                .proveedor(proveedor)
                .empresa(empresa)
                .titulo(dto.getTitulo().trim())
                .descripcion(dto.getDescripcion().trim())
                .modalidad(mod)
                .salarioMin(min)
                .salarioMax(max)
                .habilidadesClave(dto.getHabilidadesClave())
                .build();

        // 6. Procesar y validar preguntas excluyentes
        if (dto.getPreguntasFiltro() != null) {
            for (PreguntaFiltroSolicitudDto pregDto : dto.getPreguntasFiltro()) {
                if (pregDto.getPregunta() == null || pregDto.getPregunta().trim().isEmpty()) {
                    throw new ValidacionNegocioException("La pregunta de filtro no puede estar vacía.");
                }

                String tipo = pregDto.getTipoPregunta();
                if (tipo == null || (!tipo.equals("SI_NO") && !tipo.equals("TEXTO_CORTO"))) {
                    throw new ValidacionNegocioException("El tipo de pregunta debe ser SI_NO o TEXTO_CORTO.");
                }

                // Validación anti-errores para SI_NO
                if (tipo.equals("SI_NO") && pregDto.getRespuestaEsperadaExcluyente() != null) {
                    String resp = pregDto.getRespuestaEsperadaExcluyente().trim().toUpperCase();
                    if (!resp.equals("SI") && !resp.equals("NO") && !resp.equals("SÍ")) {
                        throw new ValidacionNegocioException("La respuesta esperada para una pregunta SI_NO debe ser SI o NO.");
                    }
                    // Normalizamos a SI o NO
                    pregDto.setRespuestaEsperadaExcluyente(resp.equals("SÍ") ? "SI" : resp);
                }

                PreguntaFiltroOferta pregunta = PreguntaFiltroOferta.builder()
                        .pregunta(pregDto.getPregunta().trim())
                        .tipoPregunta(tipo)
                        .respuestaEsperadaExcluyente(pregDto.getRespuestaEsperadaExcluyente() != null ? 
                                pregDto.getRespuestaEsperadaExcluyente().trim() : null)
                        .build();

                oferta.agregarPregunta(pregunta);
            }
        }

        OfertaEmpleo guardada = ofertaRepository.save(oferta);
        log.info("Oferta guardada exitosamente con id: {}", guardada.getId());

        return mapearADto(guardada);
    }

    @Override
    @Transactional
    public void eliminarLogico(UUID usuarioId, UUID ofertaId) {
        log.info("Iniciando eliminación lógica de ofertaId: {} por usuarioId: {}", ofertaId, usuarioId);

        OfertaEmpleo oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Oferta de empleo no encontrada."));

        // Validar que el usuario autenticado sea el dueño
        UUID dueñoId = null;
        if (oferta.getProveedor() != null) {
            dueñoId = oferta.getProveedor().getUsuario().getId();
        } else if (oferta.getEmpresa() != null) {
            dueñoId = oferta.getEmpresa().getUsuario().getId();
        }

        if (dueñoId == null || !dueñoId.equals(usuarioId)) {
            throw new ValidacionNegocioException("No está autorizado a eliminar esta oferta de empleo.");
        }

        // Borrado lógico manually setting active flag to false (which is safe and explicit)
        oferta.setActiva(false);
        ofertaRepository.save(oferta);
        log.info("OfertaId: {} deshabilitada (activa = false)", ofertaId);
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
