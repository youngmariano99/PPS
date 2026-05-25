package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.request.DescartarPostulacionSolicitudDto;
import com.PPS.PPS.application.dto.response.PostulacionRespuestaDto;

import java.util.UUID;

/**
 * Caso de uso para gestionar postulaciones recibidas desde el rol de Empresa/Reclutador.
 * Implementa el cierre del "agujero negro" y transiciones de estado implícitas.
 */
public interface IGestionarPostulacionesEmpresaUseCase {

    /**
     * Obtiene el detalle de una postulación recibida. 
     * Si la postulación estaba en estado ENVIADO, cambia implícita y automáticamente a VISTO.
     */
    PostulacionRespuestaDto obtenerPostulacionParaReclutador(UUID usuarioReclutadorId, UUID postulacionId);

    /**
     * Descarta un postulante, exigiendo obligatoriamente un código de motivo.
     * Cambia el estado a DESCARTADO y dispara el evento de notificación.
     */
    PostulacionRespuestaDto descartarPostulacion(UUID usuarioReclutadorId, UUID postulacionId, DescartarPostulacionSolicitudDto dto);

    /**
     * Actualiza manualmente el estado de la postulación (ej. EN_REVISION, CONTACTADO).
     * Dispara el evento de notificación para el candidato.
     */
    PostulacionRespuestaDto actualizarEstadoManual(UUID usuarioReclutadorId, UUID postulacionId, String nuevoEstado);
}
