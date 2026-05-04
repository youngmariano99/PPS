package com.PPS.PPS.service;

import com.PPS.PPS.entity.PlanSuscripcion;
import com.PPS.PPS.entity.SuscripcionUsuario;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
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
     * Inicia el proceso de suscripción delegada a Checkout Pro.
     * Crea un registro PENDIENTE y pide a MP el init_point.
     */
    @Transactional
    public String iniciarCheckoutProSuscripcion(UUID usuarioId, UUID planId, String backUrlBase) {
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
                .mpPreferenciaId(null) // No guardamos preference_id, dependemos de external_reference
                .build();

        suscripcionUsuarioRepository.save(nuevaSuscripcion);

        // Usamos nuestro ID interno como reference para MP
        String internalReference = nuevaSuscripcion.getId().toString();
        
        return mercadoPagoService.crearPreferenciaSuscripcion(
                usuarioId.toString(), 
                usuario.getEmail(), 
                backUrlBase, 
                internalReference,
                plan.getPrecioMensual()
        );
    }

    @Transactional
    public void procesarWebhookPagoUnico(String suscripcionIdStr) {
        log.info("Procesando webhook de pago para suscripcion interna ID: {}", suscripcionIdStr);

        UUID suscripcionId;
        try {
            suscripcionId = UUID.fromString(suscripcionIdStr);
        } catch (IllegalArgumentException e) {
            log.warn("Suscripción ID inválido recibido en Webhook: {}", suscripcionIdStr);
            return;
        }

        SuscripcionUsuario suscripcion = suscripcionUsuarioRepository.findById(suscripcionId)
                .orElse(null);

        if (suscripcion == null) {
            log.warn("Webhook cobrado pero no existe suscripcion local: {}", suscripcionId);
            return;
        }

        // Si llegó el pago, lo marcamos activo (Checkout Pro garantiza aprobacion para disparar esto si validamos)
        suscripcion.setEstado("ACTIVA");
        suscripcionUsuarioRepository.save(suscripcion);
    }
}

