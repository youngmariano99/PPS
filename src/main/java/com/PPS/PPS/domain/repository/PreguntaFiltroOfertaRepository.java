package com.PPS.PPS.domain.repository;

import com.PPS.PPS.domain.model.PreguntaFiltroOferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre PreguntaFiltroOferta.
 */
@Repository
public interface PreguntaFiltroOfertaRepository extends JpaRepository<PreguntaFiltroOferta, UUID> {

    /**
     * Recupera las preguntas de filtro asociadas a una oferta específica.
     */
    List<PreguntaFiltroOferta> findByOfertaId(UUID ofertaId);
}
