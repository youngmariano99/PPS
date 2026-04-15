package com.PPS.PPS.repository;

import com.PPS.PPS.entity.SuscripcionUsuario;
import com.PPS.PPS.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SuscripcionUsuarioRepository extends JpaRepository<SuscripcionUsuario, UUID> {
    
    /**
     * Busca la suscripción activa actual de un usuario.
     */
    Optional<SuscripcionUsuario> findByUsuarioIdAndEstado(UUID usuarioId, String estado);
}
