package com.PPS.PPS.service;

import com.PPS.PPS.entity.PlanSuscripcion;
import com.PPS.PPS.entity.SuscripcionUsuario;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.repository.PlanSuscripcionRepository;
import com.PPS.PPS.repository.SuscripcionUsuarioRepository;
import com.PPS.PPS.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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
     * Da la bienvenida provisoria marcando como PENDIENTE.
     */
    @Transactional
    public void registrarSuscripcionPendiente(UUID usuarioId, UUID planId, String preapprovalId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        PlanSuscripcion plan = planSuscripcionRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));

        // Lógica anti-duplicados: Desactivar cualquier suscripcion previa ACTIVA del usuario
        List<SuscripcionUsuario> activas = suscripcionUsuarioRepository.findByUsuarioIdAndEstado(usuarioId, "ACTIVA");
        for (SuscripcionUsuario activa : activas) {
            activa.setEstado("VENCIDA");
            suscripcionUsuarioRepository.save(activa);
        }

        SuscripcionUsuario nuevaSuscripcion = SuscripcionUsuario.builder()
                .usuario(usuario)
                .plan(plan)
                .estado("PENDIENTE") // CRITICO: Solo pendiente en este punto
                .fechaInicio(LocalDateTime.now())
                .fechaFin(LocalDateTime.now().plusMonths(1))
                .mpPreferenciaId(preapprovalId) // Mapea al preapproval_id de MP
                .build();

        suscripcionUsuarioRepository.save(nuevaSuscripcion);
        log.info("Suscripcion marcada como PENDIENTE para usuario: {}", usuarioId);
    }

    /**
     * Metodo del Webhook: La unica fuente de verdad.
     * Actualiza el estado basado puramente en la respuesta de MP.
     */
    @Transactional
    public void procesarWebhook(String preapprovalId) {
        log.info("Procesando webhook para preapprovalId: {}", preapprovalId);

        // 1. Buscamos en BD si conocemos esta suscripcion
        SuscripcionUsuario suscripcion = suscripcionUsuarioRepository.findByMpPreferenciaId(preapprovalId)
                .orElse(null);

        if (suscripcion == null) {
            log.warn("Webhook recibido de un preapproval_id que no existe en nuestra DB: {}", preapprovalId);
            return;
        }

        // 2. Consultar el estado real a MercadoPago (Fuente unica de verdad)
        String estadoRealMp = mercadoPagoService.consultarSuscripcion(preapprovalId);
        log.info("Estado real consultado a MP: {}", estadoRealMp);

        // 3. Mapeo de estados estrictos
        String estadoActualizado;
        switch (estadoRealMp.toLowerCase()) {
            case "authorized":
                estadoActualizado = "ACTIVA";
                break;
            case "paused":
                estadoActualizado = "VENCIDA";
                break;
            case "cancelled":
                estadoActualizado = "CANCELADA";
                break;
            default:
                log.warn("Estado desconocido recibido de MP: {}. No se actualiza.", estadoRealMp);
                return;
        }

        suscripcion.setEstado(estadoActualizado);
        suscripcionUsuarioRepository.save(suscripcion);
        
        log.info("Suscripcion actualizada con exito a {} por webhook.", estadoActualizado);
    }
}
