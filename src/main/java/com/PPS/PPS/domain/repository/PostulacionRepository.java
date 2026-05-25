package com.PPS.PPS.domain.repository;

import com.PPS.PPS.domain.model.Postulacion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad Postulacion.
 */
@Repository
public interface PostulacionRepository extends JpaRepository<Postulacion, UUID> {

    /**
     * Verifica si el candidato ya se postuló a la oferta indicada.
     */
    boolean existsByOfertaIdAndCandidatoId(UUID ofertaId, UUID candidatoId);

    /**
     * Obtiene una postulación por ID con relaciones cargadas.
     */
    @EntityGraph(attributePaths = {"oferta", "candidato", "respuestas"})
    Optional<Postulacion> findById(UUID id);

    /**
     * Recupera las postulaciones realizadas por un candidato específico.
     */
    @EntityGraph(attributePaths = {"oferta", "candidato"})
    List<Postulacion> findByCandidatoId(UUID candidatoId);

    /**
     * Recupera las postulaciones recibidas para una oferta específica.
     */
    @EntityGraph(attributePaths = {"candidato", "respuestas"})
    List<Postulacion> findByOfertaId(UUID ofertaId);
}
