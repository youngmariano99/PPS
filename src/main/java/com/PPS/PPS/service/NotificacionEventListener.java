package com.PPS.PPS.service;

import com.PPS.PPS.application.event.PostulacionEstadoChangeEvent;
import com.PPS.PPS.domain.model.Notificacion;
import com.PPS.PPS.domain.model.Usuario;
import com.PPS.PPS.domain.repository.NotificacionRepository;
import com.PPS.PPS.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listener de eventos del dominio de negocio.
 * Se encarga de procesar los cambios de estado de postulaciones y crear
 * notificaciones internas asociadas.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificacionEventListener {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    @EventListener
    public void handlePostulacionEstadoChange(PostulacionEstadoChangeEvent event) {
        log.info("Procesando evento de cambio de estado de postulación para el usuario: {}", event.getDestinatarioId());

        Usuario candidato = usuarioRepository.findById(event.getDestinatarioId())
                .orElse(null);

        if (candidato == null) {
            log.warn("Usuario destinatario {} no encontrado. Ignorando notificación.", event.getDestinatarioId());
            return;
        }

        // Construir mensaje descriptivo en base al estado y motivo de rechazo
        String mensajeText;
        if (event.getNuevoEstado().equalsIgnoreCase("VISTO")) {
            mensajeText = String.format("Tu postulación para la oferta '%s' ha sido leída.", event.getOfertaTitulo());
        } else if (event.getNuevoEstado().equalsIgnoreCase("DESCARTADO")) {
            mensajeText = String.format("Tu postulación para la oferta '%s' ha sido descartada. Motivo: %s.", 
                    event.getOfertaTitulo(), event.getMotivoRechazoCodigo());
        } else {
            mensajeText = String.format("Tu postulación para la oferta '%s' ha cambiado al estado: %s.", 
                    event.getOfertaTitulo(), event.getNuevoEstado());
        }

        Notificacion notificacion = Notificacion.builder()
                .usuario(candidato)
                .tipoNotificacion("CAMBIO_ESTADO_POSTULACION")
                .mensaje(mensajeText)
                .entidadReferenciaId(event.getPostulacionId())
                .build();

        notificacionRepository.save(notificacion);
        log.info("Notificación guardada en base de datos para usuarioId: {}", candidato.getId());
    }
}
