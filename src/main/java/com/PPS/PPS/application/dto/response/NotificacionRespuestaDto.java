package com.PPS.PPS.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para representar las notificaciones enviadas a un usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacionRespuestaDto {

    private UUID id;

    private String tipoNotificacion;

    private String mensaje;

    private UUID entidadReferenciaId;

    private boolean leida;

    private OffsetDateTime fechaCreacion;
}
