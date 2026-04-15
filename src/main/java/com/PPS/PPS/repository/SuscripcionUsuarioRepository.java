package com.PPS.PPS.repository;

import com.PPS.PPS.entity.SuscripcionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SuscripcionUsuarioRepository extends JpaRepository<SuscripcionUsuario, UUID> {
    
    /**
     * Busca la suscripción activa actual de un usuario.
     */
    Optional<SuscripcionUsuario> findByUsuarioIdAndEstado(UUID usuarioId, String estado);

    /**
     * Busca una suscripción por su identificador de preferencia de Mercado Pago.
     * Requerido para procesar Webhooks.
     */
    Optional<SuscripcionUsuario> findByMpPreferenciaId(String mpPreferenciaId);
}
