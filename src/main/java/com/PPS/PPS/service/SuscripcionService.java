package com.PPS.PPS.service;

import com.PPS.PPS.entity.PlanSuscripcion;
import com.PPS.PPS.entity.SuscripcionUsuario;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.exception.RecursoNoEncontradoException;
import com.PPS.PPS.repository.PlanSuscripcionRepository;
import com.PPS.PPS.repository.SuscripcionUsuarioRepository;
import com.PPS.PPS.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuscripcionService {

    private final SuscripcionUsuarioRepository suscripcionUsuarioRepository;
    private final PlanSuscripcionRepository planSuscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final MercadoPagoService mercadoPagoService;

    /**
     * Crea una suscripción directa (usualmente para pruebas o flujos internos).
     */
    @Transactional
    public SuscripcionUsuario suscribirUsuario(UUID usuarioId, UUID planId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
                
        PlanSuscripcion plan = planSuscripcionRepository.findById(planId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado"));

        // Desactivar cualquier suscripcion previa ACTIVA
        suscripcionUsuarioRepository.findByUsuarioIdAndEstado(usuarioId, "ACTIVA")
                .ifPresent(activa -> {
                    activa.setEstado("VENCIDA");
                    suscripcionUsuarioRepository.save(activa);
                });

        SuscripcionUsuario nuevaSuscripcion = SuscripcionUsuario.builder()
                .usuario(usuario)
                .plan(plan)
                .estado("ACTIVA")
                .fechaInicio(LocalDateTime.now())
                .fechaFin(LocalDateTime.now().plusMonths(1))
                .build();

        return suscripcionUsuarioRepository.save(nuevaSuscripcion);
    }

    /**
     * Da la bienvenida provisoria marcando como PENDIENTE (Flujo Mercado Pago).
     */
    @Transactional
    public void registrarSuscripcionPendiente(UUID usuarioId, UUID planId, String preapprovalId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
                
        PlanSuscripcion plan = planSuscripcionRepository.findById(planId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado"));

        suscripcionUsuarioRepository.findByUsuarioIdAndEstado(usuarioId, "ACTIVA")
                .ifPresent(activa -> {
                    activa.setEstado("VENCIDA");
                    suscripcionUsuarioRepository.save(activa);
                });

        SuscripcionUsuario nuevaSuscripcion = SuscripcionUsuario.builder()
                .usuario(usuario)
                .plan(plan)
                .estado("PENDIENTE")
                .fechaInicio(LocalDateTime.now())
                .fechaFin(LocalDateTime.now().plusMonths(1))
                .mpPreferenciaId(preapprovalId)
                .build();

        suscripcionUsuarioRepository.save(nuevaSuscripcion);
    }

    @Transactional
    public void procesarWebhook(String preapprovalId) {
        log.info("Procesando webhook para preapprovalId: {}", preapprovalId);

        SuscripcionUsuario suscripcion = suscripcionUsuarioRepository.findByMpPreferenciaId(preapprovalId)
                .orElse(null);

        if (suscripcion == null) {
            log.warn("Webhook recibido de un preapproval_id que no existe: {}", preapprovalId);
            return;
        }

        String estadoRealMp = mercadoPagoService.consultarSuscripcion(preapprovalId);
        String estadoActualizado;

        switch (estadoRealMp.toLowerCase()) {
            case "authorized": estadoActualizado = "ACTIVA"; break;
            case "paused": estadoActualizado = "VENCIDA"; break;
            case "cancelled": estadoActualizado = "CANCELADA"; break;
            default: return;
        }

        suscripcion.setEstado(estadoActualizado);
        suscripcionUsuarioRepository.save(suscripcion);
    }
}
