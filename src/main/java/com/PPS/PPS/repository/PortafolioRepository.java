package com.PPS.PPS.repository;

import com.PPS.PPS.entity.Portafolio;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface PortafolioRepository extends JpaRepository<Portafolio, UUID> {
    
    /**
     * Obtiene los recursos visibles de un usuario ordenados por fecha descendente.
     */
    @Query("SELECT p FROM Portafolio p WHERE p.usuario.id = :usuarioId AND p.visible = true ORDER BY p.fechaCreacion DESC")
    List<Portafolio> findVisibleByUsuarioId(UUID usuarioId, Pageable pageable);

    /**
     * Obtiene los recursos visibles de una empresa ordenados por fecha descendente.
     */
    @Query("SELECT p FROM Portafolio p WHERE p.empresa.id = :empresaId AND p.visible = true ORDER BY p.fechaCreacion DESC")
    List<Portafolio> findVisibleByEmpresaId(UUID empresaId, Pageable pageable);
    
    /**
     * Obtiene todos los recursos sin filtrar para el panel de edición del usuario.
     */
    List<Portafolio> findAllByUsuarioIdOrderByFechaCreacionDesc(UUID usuarioId);
    List<Portafolio> findAllByEmpresaIdOrderByFechaCreacionDesc(UUID empresaId);

    void deleteByUsuarioId(UUID usuarioId);
    void deleteByEmpresaId(UUID empresaId);
}
