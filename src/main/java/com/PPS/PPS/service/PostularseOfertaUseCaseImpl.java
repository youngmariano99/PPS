package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IPostularseOfertaUseCase;
import com.PPS.PPS.application.dto.request.PostulacionSolicitudDto;
import com.PPS.PPS.application.dto.request.RespuestaCandidatoSolicitudDto;
import com.PPS.PPS.application.dto.response.PostulacionRespuestaDto;
import com.PPS.PPS.application.dto.response.RespuestaCandidatoRespuestaDto;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.domain.model.*;
import com.PPS.PPS.domain.repository.OfertaEmpleoRepository;
import com.PPS.PPS.domain.repository.PostulacionRepository;
import com.PPS.PPS.domain.repository.PreguntaFiltroOfertaRepository;
import com.PPS.PPS.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Servicio que implementa la lógica para postularse a ofertas laborales y evaluar knockout questions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostularseOfertaUseCaseImpl implements IPostularseOfertaUseCase {

    private final PostulacionRepository postulacionRepository;
    private final OfertaEmpleoRepository ofertaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PreguntaFiltroOfertaRepository preguntaRepository;

    private static final Pattern DRIVE_PATTERN = Pattern.compile(
            "^(https?://)?(www\\.)?(drive\\.google\\.com)/.*$");

    @Override
    @Transactional
    public PostulacionRespuestaDto postularse(UUID usuarioId, PostulacionSolicitudDto dto) {
        log.info("Iniciando postulación del usuarioId: {} a la ofertaId: {}", usuarioId, dto.getOfertaId());

        // 1. Validaciones de existencia y estado
        Usuario candidato = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario candidato no encontrado."));

        OfertaEmpleo oferta = ofertaRepository.findById(dto.getOfertaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Oferta de empleo no encontrada."));

        if (!oferta.isActiva()) {
            throw new ValidacionNegocioException("No se puede postular a una oferta de empleo inactiva.");
        }

        // 2. Control de unicidad de postulación
        if (postulacionRepository.existsByOfertaIdAndCandidatoId(dto.getOfertaId(), usuarioId)) {
            throw new ValidacionNegocioException("Ya te has postulado a esta oferta de empleo.");
        }

        // 3. Validación de URL de Google Drive si es provista
        if (dto.getCvUrlAdjunto() != null && !dto.getCvUrlAdjunto().trim().isEmpty()) {
            String url = dto.getCvUrlAdjunto().trim();
            if (!DRIVE_PATTERN.matcher(url).matches()) {
                throw new ValidacionNegocioException("El currículum adjunto debe ser un enlace válido de Google Drive.");
            }
        }

        // 4. Obtener preguntas de filtro requeridas
        List<PreguntaFiltroOferta> preguntasRequeridas = preguntaRepository.findByOfertaId(dto.getOfertaId());
        List<RespuestaCandidatoSolicitudDto> respuestasEnviadas = dto.getRespuestas() != null ? 
                dto.getRespuestas() : new ArrayList<>();

        // 5. Validar respuestas completas
        Map<UUID, RespuestaCandidatoSolicitudDto> mapaRespuestas = respuestasEnviadas.stream()
                .filter(r -> r.getPreguntaId() != null)
                .collect(Collectors.toMap(
                        RespuestaCandidatoSolicitudDto::getPreguntaId,
                        r -> r,
                        (r1, r2) -> r1 // En caso de duplicados en la petición, nos quedamos con el primero
                ));

        boolean esExcluido = false;
        List<RespuestaCandidato> respuestasEntidades = new ArrayList<>();

        for (PreguntaFiltroOferta pregunta : preguntasRequeridas) {
            RespuestaCandidatoSolicitudDto respDto = mapaRespuestas.get(pregunta.getId());
            if (respDto == null || respDto.getRespuestaDada() == null || respDto.getRespuestaDada().trim().isEmpty()) {
                throw new ValidacionNegocioException("Debe responder a todas las preguntas de filtro.");
            }

            String respuestaDada = respDto.getRespuestaDada().trim();

            // Normalización y validación anti-errores para tipo SI_NO
            if (pregunta.getTipoPregunta().equals("SI_NO")) {
                String normalizada = respuestaDada.toUpperCase();
                if (!normalizada.equals("SI") && !normalizada.equals("NO") && !normalizada.equals("SÍ")) {
                    throw new ValidacionNegocioException("La respuesta dada para la pregunta SI_NO debe ser SI o NO.");
                }
                respuestaDada = normalizada.equals("SÍ") ? "SI" : normalizada;
            }

            // Evaluar Knockout Criteria
            if (pregunta.getRespuestaEsperadaExcluyente() != null) {
                String esperada = pregunta.getRespuestaEsperadaExcluyente().trim();
                // Si es SI_NO, comparamos sin importar mayúsculas. Si es TEXTO_CORTO, comparamos ignorando mayúsculas y acentos.
                if (pregunta.getTipoPregunta().equals("SI_NO")) {
                    if (!esperada.equalsIgnoreCase(respuestaDada)) {
                        esExcluido = true;
                    }
                } else {
                    // Para texto corto, una comparación tolerante case-insensitive
                    if (!esperada.equalsIgnoreCase(respuestaDada)) {
                        esExcluido = true;
                    }
                }
            }

            RespuestaCandidato respuesta = RespuestaCandidato.builder()
                    .pregunta(pregunta)
                    .respuestaDada(respuestaDada)
                    .build();

            respuestasEntidades.add(respuesta);
        }

        // 6. Persistir Postulación
        Postulacion postulacion = Postulacion.builder()
                .oferta(oferta)
                .candidato(candidato)
                .mensajePresentacion(dto.getMensajePresentacion() != null ? dto.getMensajePresentacion().trim() : null)
                .cvUrlAdjunto(dto.getCvUrlAdjunto() != null ? dto.getCvUrlAdjunto().trim() : null)
                .estado("ENVIADO")
                .esExcluido(esExcluido)
                .build();

        // Asociar en cascada
        for (RespuestaCandidato resp : respuestasEntidades) {
            postulacion.agregarRespuesta(resp);
        }

        Postulacion guardada = postulacionRepository.save(postulacion);
        log.info("Postulación guardada exitosamente con id: {}. Excluido por knockout: {}", guardada.getId(), esExcluido);

        return mapearADto(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostulacionRespuestaDto> listarPostulacionesPropias(UUID usuarioId) {
        log.info("Listando postulaciones del candidato usuarioId: {}", usuarioId);
        List<Postulacion> postulaciones = postulacionRepository.findByCandidatoId(usuarioId);
        return postulaciones.stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostulacionRespuestaDto> listarPostulacionesPorOferta(UUID usuarioId, UUID ofertaId) {
        log.info("Listando postulaciones de la ofertaId: {} para reclutador usuarioId: {}", ofertaId, usuarioId);

        OfertaEmpleo oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Oferta de empleo no encontrada."));

        // Validar que el usuario sea el dueño de la oferta (empresa o proveedor creador)
        UUID dueñoId = null;
        if (oferta.getProveedor() != null) {
            dueñoId = oferta.getProveedor().getUsuario().getId();
        } else if (oferta.getEmpresa() != null) {
            dueñoId = oferta.getEmpresa().getUsuario().getId();
        }

        if (dueñoId == null || !dueñoId.equals(usuarioId)) {
            throw new ValidacionNegocioException("No está autorizado a ver las postulaciones de esta oferta.");
        }

        List<Postulacion> postulaciones = postulacionRepository.findByOfertaId(ofertaId);
        return postulaciones.stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
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
