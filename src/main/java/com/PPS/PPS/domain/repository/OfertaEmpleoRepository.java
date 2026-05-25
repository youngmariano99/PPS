package com.PPS.PPS.domain.repository;

import com.PPS.PPS.domain.model.OfertaEmpleo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para realizar operaciones de persistencia sobre OfertaEmpleo.
 */
@Repository
public interface OfertaEmpleoRepository extends JpaRepository<OfertaEmpleo, UUID> {

    /**
     * Recupera todas las ofertas activas paginadas, cargando en cascada las preguntas.
     */
    @EntityGraph(attributePaths = {"preguntasFiltro", "empresa", "proveedor"})
    Page<OfertaEmpleo> findAll(Pageable pageable);

    /**
     * Encuentra todas las ofertas asociadas al usuario, ya sea bajo su perfil
     * de proveedor o bajo alguno de sus perfiles de empresa.
     */
    @EntityGraph(attributePaths = {"preguntasFiltro", "empresa", "proveedor"})
    List<OfertaEmpleo> findByProveedorUsuarioIdOrEmpresaUsuarioId(UUID proveedorUsuarioId, UUID empresaUsuarioId);
}
