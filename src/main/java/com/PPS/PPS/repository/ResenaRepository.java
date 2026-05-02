package com.PPS.PPS.repository;

import com.PPS.PPS.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, UUID> {
    boolean existsByPropietarioIdAndUsuarioId(UUID propietarioId, UUID usuarioId);

    @Query("SELECT r FROM Resena r WHERE r.propietarioId = :id ORDER BY r.fechaCreacion DESC")
    List<Resena> findByPropietarioId(@Param("id") UUID id);
}
