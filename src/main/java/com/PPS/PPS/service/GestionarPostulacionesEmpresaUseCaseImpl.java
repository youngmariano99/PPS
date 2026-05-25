package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IGestionarPostulacionesEmpresaUseCase;
import com.PPS.PPS.application.dto.request.DescartarPostulacionSolicitudDto;
import com.PPS.PPS.application.dto.response.PostulacionRespuestaDto;
import com.PPS.PPS.application.dto.response.RespuestaCandidatoRespuestaDto;
import com.PPS.PPS.application.event.PostulacionEstadoChangeEvent;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.domain.model.OfertaEmpleo;
import com.PPS.PPS.domain.model.Postulacion;
import com.PPS.PPS.domain.repository.PostulacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación concreta del caso de uso para gestionar postulaciones recibidas.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GestionarPostulacionesEmpresaUseCaseImpl implements IGestionarPostulacionesEmpresaUseCase {

    private final PostulacionRepository postulacionRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public PostulacionRespuestaDto obtenerPostulacionParaReclutador(UUID usuarioReclutadorId, UUID postulacionId) {
        log.info("Reclutador {} consulta detalle de postulación {}", usuarioReclutadorId, postulacionId);

        Postulacion postulacion = postulacionRepository.findById(postulacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Postulación no encontrada."));

        validarAutorizacionReclutador(usuarioReclutadorId, postulacion.getOferta());

        // Transición implícita: si está en ENVIADO, cambia a VISTO
        if (postulacion.getEstado().equalsIgnoreCase("ENVIADO")) {
            log.info("Transición implícita automática: cambiando postulación {} de ENVIADO a VISTO", postulacionId);
            postulacion.setEstado("VISTO");
            postulacion = postulacionRepository.save(postulacion);

            // Disparar evento de cambio de estado
            eventPublisher.publishEvent(PostulacionEstadoChangeEvent.builder()
                    .destinatarioId(postulacion.getCandidato().getId())
                    .postulacionId(postulacion.getId())
                    .ofertaId(postulacion.getOferta().getId())
                    .ofertaTitulo(postulacion.getOferta().getTitulo())
                    .nuevoEstado("VISTO")
                    .build());
        }

        return mapearADto(postulacion);
    }

    @Override
    @Transactional
    public PostulacionRespuestaDto descartarPostulacion(UUID usuarioReclutadorId, UUID postulacionId, DescartarPostulacionSolicitudDto dto) {
        log.info("Reclutador {} intenta descartar postulación {}", usuarioReclutadorId, postulacionId);

        // Validación Anti-Soft Rejection
        if (dto.getMotivoRechazoCodigo() == null || dto.getMotivoRechazoCodigo().trim().isEmpty()) {
            throw new ValidacionNegocioException("El código de motivo de rechazo es obligatorio para descartar un postulante.");
        }

        Postulacion postulacion = postulacionRepository.findById(postulacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Postulación no encontrada."));

        validarAutorizacionReclutador(usuarioReclutadorId, postulacion.getOferta());

        postulacion.setEstado("DESCARTADO");
        postulacion.setMotivoRechazoCodigo(dto.getMotivoRechazoCodigo().trim());
        postulacion.setFeedbackAdicional(dto.getFeedbackAdicional() != null ? dto.getFeedbackAdicional().trim() : null);

        postulacion = postulacionRepository.save(postulacion);
        log.info("Postulación {} descartada exitosamente con motivo: {}", postulacionId, dto.getMotivoRechazoCodigo());

        // Disparar evento de cambio de estado
        eventPublisher.publishEvent(PostulacionEstadoChangeEvent.builder()
                .destinatarioId(postulacion.getCandidato().getId())
                .postulacionId(postulacion.getId())
                .ofertaId(postulacion.getOferta().getId())
                .ofertaTitulo(postulacion.getOferta().getTitulo())
                .nuevoEstado("DESCARTADO")
                .motivoRechazoCodigo(postulacion.getMotivoRechazoCodigo())
                .build());

        return mapearADto(postulacion);
    }

    @Override
    @Transactional
    public PostulacionRespuestaDto actualizarEstadoManual(UUID usuarioReclutadorId, UUID postulacionId, String nuevoEstado) {
        log.info("Reclutador {} intenta cambiar estado de postulación {} a {}", usuarioReclutadorId, postulacionId, nuevoEstado);

        // Validar que el nuevo estado sea válido
        List<String> estadosValidos = List.of("EN_REVISION", "CONTACTADO", "VISTO");
        if (nuevoEstado == null || !estadosValidos.contains(nuevoEstado.toUpperCase().trim())) {
            throw new ValidacionNegocioException("Estado no permitido para actualización manual.");
        }

        Postulacion postulacion = postulacionRepository.findById(postulacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Postulación no encontrada."));

        validarAutorizacionReclutador(usuarioReclutadorId, postulacion.getOferta());

        String estadoNormalizado = nuevoEstado.toUpperCase().trim();
        postulacion.setEstado(estadoNormalizado);
        postulacion = postulacionRepository.save(postulacion);

        // Disparar evento de cambio de estado
        eventPublisher.publishEvent(PostulacionEstadoChangeEvent.builder()
                .destinatarioId(postulacion.getCandidato().getId())
                .postulacionId(postulacion.getId())
                .ofertaId(postulacion.getOferta().getId())
                .ofertaTitulo(postulacion.getOferta().getTitulo())
                .nuevoEstado(estadoNormalizado)
                .build());

        return mapearADto(postulacion);
    }

    private void validarAutorizacionReclutador(UUID usuarioReclutadorId, OfertaEmpleo oferta) {
        UUID dueñoId = null;
        if (oferta.getProveedor() != null) {
            dueñoId = oferta.getProveedor().getUsuario().getId();
        } else if (oferta.getEmpresa() != null) {
            dueñoId = oferta.getEmpresa().getUsuario().getId();
        }

        if (dueñoId == null || !dueñoId.equals(usuarioReclutadorId)) {
            throw new ValidacionNegocioException("No está autorizado a gestionar postulaciones para esta oferta.");
        }
    }

    private PostulacionRespuestaDto mapearADto(Postulacion p) {
        List<RespuestaCandidatoRespuestaDto> respuestas = p.getRespuestas().stream()
                .map(r -> RespuestaCandidatoRespuestaDto.builder()
                        .id(r.getId())
                        .preguntaId(r.getPregunta().getId())
                        .preguntaEnunciado(r.getPregunta().getPregunta())
                        .respuestaDada(r.getRespuestaDada())
                        .build())
                .collect(Collectors.toList());

        return PostulacionRespuestaDto.builder()
                .id(p.getId())
                .ofertaId(p.getOferta().getId())
                .ofertaTitulo(p.getOferta().getTitulo())
                .candidatoId(p.getCandidato().getId())
                .candidatoNombreCompleto(p.getCandidato().getNombre() + " " + p.getCandidato().getApellido())
                .candidatoEmail(p.getCandidato().getEmail())
                .mensajePresentacion(p.getMensajePresentacion())
                .cvUrlAdjunto(p.getCvUrlAdjunto())
                .estado(p.getEstado())
                .motivoRechazoCodigo(p.getMotivoRechazoCodigo())
                .feedbackAdicional(p.getFeedbackAdicional())
                .esExcluido(p.isEsExcluido())
                .respuestas(respuestas)
                .fechaCreacion(p.getFechaCreacion())
                .build();
    }
}
