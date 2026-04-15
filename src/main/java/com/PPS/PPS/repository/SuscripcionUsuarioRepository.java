package com.PPS.PPS.repository;

import com.PPS.PPS.entity.SuscripcionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuscripcionUsuarioRepository extends JpaRepository<SuscripcionUsuario, UUID> {
    
    // Busca las suscripciones activas de un usuario
    List<SuscripcionUsuario> findByUsuarioIdAndEstado(UUID usuarioId, String estado);
    
    // Busca una suscripcion especifica por su preapproval_id de Mercado Pago
    Optional<SuscripcionUsuario> findByMpPreferenciaId(String mpPreferenciaId);
}
