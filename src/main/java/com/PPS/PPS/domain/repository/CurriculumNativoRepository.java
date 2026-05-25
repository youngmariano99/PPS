package com.PPS.PPS.domain.repository;

import com.PPS.PPS.domain.model.CurriculumNativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad CurriculumNativo.
 */
@Repository
public interface CurriculumNativoRepository extends JpaRepository<CurriculumNativo, UUID> {

    /**
     * Recupera el currículum nativo de un usuario por su ID.
     */
    Optional<CurriculumNativo> findByUsuarioId(UUID usuarioId);
}
