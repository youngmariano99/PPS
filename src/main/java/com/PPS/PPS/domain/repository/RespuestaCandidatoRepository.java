package com.PPS.PPS.domain.repository;

import com.PPS.PPS.domain.model.RespuestaCandidato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad RespuestaCandidato.
 */
@Repository
public interface RespuestaCandidatoRepository extends JpaRepository<RespuestaCandidato, UUID> {

    /**
     * Recupera las respuestas dadas a las preguntas de filtro asociadas a una postulación.
     */
    List<RespuestaCandidato> findByPostulacionId(UUID postulacionId);
}
