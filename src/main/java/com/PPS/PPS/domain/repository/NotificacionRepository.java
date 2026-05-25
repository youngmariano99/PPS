package com.PPS.PPS.domain.repository;

import com.PPS.PPS.domain.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad Notificacion.
 */
@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, UUID> {

    /**
     * Recupera todas las notificaciones de un usuario ordenadas por fecha de creación descendente.
     */
    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(UUID usuarioId);

    /**
     * Recupera las notificaciones no leídas de un usuario ordenadas por fecha de creación descendente.
     */
    List<Notificacion> findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(UUID usuarioId);
}
