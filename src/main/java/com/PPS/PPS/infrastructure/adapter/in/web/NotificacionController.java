package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.dto.response.NotificacionRespuestaDto;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.domain.model.Notificacion;
import com.PPS.PPS.domain.repository.NotificacionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST para gestionar las notificaciones internas de los usuarios.
 */
@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notificaciones", description = "Endpoints para la lectura y gestión de alertas del usuario")
public class NotificacionController {

    private final NotificacionRepository notificacionRepository;

    @GetMapping("/me")
    @Operation(summary = "Obtener notificaciones del usuario", description = "Retorna el listado de notificaciones del usuario actual, con opción de filtrar solo por no leídas.")
    public ResponseEntity<List<NotificacionRespuestaDto>> obtenerMisNotificaciones(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @RequestParam(defaultValue = "false") boolean soloNoLeidas) {
        log.info("REST: Consultando notificaciones para usuarioId: {}, soloNoLeidas: {}", usuarioId, soloNoLeidas);

        List<Notificacion> notificaciones;
        if (soloNoLeidas) {
            notificaciones = notificacionRepository.findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(usuarioId);
        } else {
            notificaciones = notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
        }

        List<NotificacionRespuestaDto> response = notificaciones.stream()
                .map(n -> NotificacionRespuestaDto.builder()
                        .id(n.getId())
                        .tipoNotificacion(n.getTipoNotificacion())
                        .mensaje(n.getMensaje())
                        .entidadReferenciaId(n.getEntidadReferenciaId())
                        .leida(n.isLeida())
                        .fechaCreacion(n.getFechaCreacion())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/leer")
    @Operation(summary = "Marcar notificación como leída", description = "Establece el estado de una notificación como leída para el usuario autenticado.")
    public ResponseEntity<Void> marcarComoLeida(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @PathVariable UUID id) {
        log.info("REST: Marcando notificaciónId: {} como leída para usuarioId: {}", id, usuarioId);

        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificación no encontrada."));

        if (!notificacion.getUsuario().getId().equals(usuarioId)) {
            throw new ValidacionNegocioException("No está autorizado a modificar esta notificación.");
        }

        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);

        return ResponseEntity.ok().build();
    }
}
