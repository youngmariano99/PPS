package com.PPS.PPS.application.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Evento publicado tras el cambio de estado de una postulación laboral.
 */
@Getter
@AllArgsConstructor
@Builder
public class PostulacionEstadoChangeEvent {
    private final UUID destinatarioId;
    private final UUID postulacionId;
    private final UUID ofertaId;
    private final String ofertaTitulo;
    private final String nuevoEstado;
    private final String motivoRechazoCodigo;
}
