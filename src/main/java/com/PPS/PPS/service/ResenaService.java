package com.PPS.PPS.service;

import com.PPS.PPS.dto.CrearResenaDto;
import com.PPS.PPS.entity.IntencionContacto;
import com.PPS.PPS.entity.Resena;
import com.PPS.PPS.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.IntencionContactoRepository;
import com.PPS.PPS.repository.PerfilProveedorRepository;
import com.PPS.PPS.repository.ResenaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final IntencionContactoRepository intencionContactoRepository;

    @Transactional
    public Resena crearResena(CrearResenaDto dto, String ipCliente) {

        // 1. ESCUDO ANTI-FRAUDE (Astroturfing)
        // TODO: Recuperar la IP del Proveedor desde PerfilProveedor o Auth (cuando se
        // implemente el IP tracking al registro)
        String ipVendedor = "127.0.0.1"; // Stub para compilar.

        // Fall back silencioso pero castigador. La DB los auditará.
        if (ipCliente != null && ipCliente.equals(ipVendedor)) {
            throw new ValidacionNegocioException(
                    "Detectamos manipulación de reputación. No puedes reseñar un perfil administrado desde tu misma red o dispositivo.");
        }

        // 2. EVALUACIÓN DUAL (Modelo Amazon)
        Resena nuevaResena = Resena.builder()
                .estrellas(dto.getEstrellas())
                .comentario(dto.getComentario())
                .build();

        if (dto.getSolicitudServicioId() != null) {
            // Camino A: RESEÑA DE ALTA CONFIANZA
            validarEstadoSolicitudRealizada(dto.getSolicitudServicioId());
            nuevaResena.setSolicitudServicioId(dto.getSolicitudServicioId());
            nuevaResena.setTrabajoVerificado(true); // ¡El BADGE frontend!

        } else if (dto.getIntencionContactoId() != null) {
            // Camino B: RESEÑA DE BAJA FRICCIÓN (Lead normal)
            IntencionContacto contacto = intencionContactoRepository.findById(dto.getIntencionContactoId())
                    .orElseThrow(
                            () -> new ValidacionNegocioException("Debe contactar al profesional antes de evaluarlo."));

            nuevaResena.setIntencionContacto(contacto);
            nuevaResena.setTrabajoVerificado(false); // Reseña normal
        } else {
            throw new ValidacionNegocioException("La reseña carece de un origen transaccional válido.");
        }

        return resenaRepository.save(nuevaResena);
    }

    private void validarEstadoSolicitudRealizada(UUID solicitudId) {
        // TODO: Implementar validación contra SolicitudServicioRepository cuando el
        // sprint de Solicitudes inicie.
        // Debe validar que la solicitud esté en estado COMPLETADA o
        // CANCELADA_POST_ACUERDO.
    }
}
