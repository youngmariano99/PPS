package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.usecase.IPostularseOfertaUseCase;
import com.PPS.PPS.application.usecase.IGestionarPostulacionesEmpresaUseCase;
import com.PPS.PPS.application.dto.request.PostulacionSolicitudDto;
import com.PPS.PPS.application.dto.request.DescartarPostulacionSolicitudDto;
import com.PPS.PPS.application.dto.response.PostulacionRespuestaDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar las postulaciones a ofertas laborales.
 */
@RestController
@RequestMapping("/postulaciones")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Postulaciones", description = "Endpoints para la gestión de postulaciones y triaje de candidatos")
public class PostulacionController {

    private final IPostularseOfertaUseCase postularseOfertaUseCase;
    private final IGestionarPostulacionesEmpresaUseCase gestionarPostulacionesEmpresaUseCase;

    @PostMapping
    @Operation(summary = "Postularse a una oferta de empleo", description = "Registra una postulación para el candidato autenticado, validando respuestas a Knockout Questions y CV adjunto.")
    public ResponseEntity<PostulacionRespuestaDto> postularse(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @RequestBody PostulacionSolicitudDto dto) {
        log.info("REST: Postulación recibida para usuarioId: {} a la ofertaId: {}", usuarioId, dto.getOfertaId());
        PostulacionRespuestaDto response = postularseOfertaUseCase.postularse(usuarioId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener mis postulaciones", description = "Retorna el listado de postulaciones realizadas por el candidato logueado.")
    public ResponseEntity<List<PostulacionRespuestaDto>> listarMisPostulaciones(
            @RequestHeader("X-User-Id") UUID usuarioId) {
        log.info("REST: Obteniendo postulaciones propias del usuarioId: {}", usuarioId);
        List<PostulacionRespuestaDto> response = postularseOfertaUseCase.listarPostulacionesPropias(usuarioId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oferta/{ofertaId}")
    @Operation(summary = "Obtener postulantes de una oferta", description = "Retorna el listado de candidatos que se postularon a una oferta de empleo (Solo autorizado para el dueño de la oferta).")
    public ResponseEntity<List<PostulacionRespuestaDto>> listarPostulantesPorOferta(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @PathVariable UUID ofertaId) {
        log.info("REST: Obteniendo postulantes de la ofertaId: {} para usuarioId: {}", ofertaId, usuarioId);
        List<PostulacionRespuestaDto> response = postularseOfertaUseCase.listarPostulacionesPorOferta(usuarioId, ofertaId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de postulación", description = "Retorna el detalle completo de la postulación. Si el estado era ENVIADO, cambia automáticamente a VISTO.")
    public ResponseEntity<PostulacionRespuestaDto> obtenerDetalleParaReclutador(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @PathVariable UUID id) {
        log.info("REST: Consulta de postulaciónId: {} por usuarioId: {}", id, usuarioId);
        PostulacionRespuestaDto response = gestionarPostulacionesEmpresaUseCase.obtenerPostulacionParaReclutador(usuarioId, id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/descartar")
    @Operation(summary = "Descartar postulante", description = "Cambia el estado de la postulación a DESCARTADO. Requiere código de motivo obligatorio.")
    public ResponseEntity<PostulacionRespuestaDto> descartar(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @PathVariable UUID id,
            @RequestBody DescartarPostulacionSolicitudDto dto) {
        log.info("REST: Petición de descarte para postulaciónId: {} por usuarioId: {}", id, usuarioId);
        PostulacionRespuestaDto response = gestionarPostulacionesEmpresaUseCase.descartarPostulacion(usuarioId, id, dto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de postulación manualmente", description = "Actualiza manualmente el estado de la postulación a EN_REVISION o CONTACTADO.")
    public ResponseEntity<PostulacionRespuestaDto> actualizarEstado(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @PathVariable UUID id,
            @RequestParam String nuevoEstado) {
        log.info("REST: Petición de cambio de estado para postulaciónId: {} a {} por usuarioId: {}", id, nuevoEstado, usuarioId);
        PostulacionRespuestaDto response = gestionarPostulacionesEmpresaUseCase.actualizarEstadoManual(usuarioId, id, nuevoEstado);
        return ResponseEntity.ok(response);
    }
}
