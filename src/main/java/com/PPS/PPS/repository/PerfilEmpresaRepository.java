package com.PPS.PPS.repository;

import com.PPS.PPS.entity.PerfilEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilEmpresaRepository extends JpaRepository<PerfilEmpresa, UUID> {

    @Query("SELECT e FROM PerfilEmpresa e WHERE e.usuario.id = :usuarioId")
    Optional<PerfilEmpresa> findByUsuarioId(@Param("usuarioId") UUID usuarioId);

    /**
     * Paso 1: Busca IDs usando PostGIS puro para performance.
     */
    @Query(value = "SELECT CAST(p.id AS VARCHAR) FROM perfiles_empresa p " +
                   "WHERE ST_DWithin(p.ubicacion, ST_SetSRID(ST_Point(:lon, :lat), 4326), :radioMetros) = true", 
           nativeQuery = true)
    List<UUID> buscarIdsCercanos(@Param("lat") double lat, 
                                 @Param("lon") double lon, 
                                 @Param("radioMetros") double radioMetros);

    /**
     * Paso 2: Carga las entidades vinculadas en 1 sola consulta (LEFT JOIN FETCH automático).
     */
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"usuario", "rubroPrincipal"})
    List<PerfilEmpresa> findByIdIn(List<UUID> ids);
}
