package com.PPS.PPS.repository;

import com.PPS.PPS.entity.PerfilProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilProveedorRepository extends JpaRepository<PerfilProveedor, UUID> {

    @Query("SELECT p FROM PerfilProveedor p WHERE p.usuario.id = :usuarioId")
    Optional<PerfilProveedor> findByUsuarioId(@Param("usuarioId") UUID usuarioId);

    /**
     * Busca IDs cercanos aplicando un ranking inicial por Suscripción Premium y Distancia.
     * Permite filtrar por Rubro (nombre del rubro principal o personalizado).
     */
    @Query(value = "SELECT CAST(p.id AS VARCHAR) FROM perfiles_proveedor p " +
                   "LEFT JOIN suscripciones_usuario s ON p.usuario_id = s.usuario_id AND s.estado = 'ACTIVA' " +
                   "LEFT JOIN planes_suscripcion pl ON s.plan_id = pl.id " +
                   "LEFT JOIN rubros r ON p.rubro_principal_id = r.id " +
                   "WHERE ST_DWithin(p.ubicacion, ST_SetSRID(ST_Point(:lon, :lat), 4326), :radioMetros) = true " +
                   "AND (:rubro IS NULL OR r.nombre ILIKE CONCAT('%', :rubro, '%') OR p.rubro_personalizado ILIKE CONCAT('%', :rubro, '%')) " +
                   "ORDER BY (CASE WHEN pl.nombre ILIKE 'Premium' OR pl.nombre ILIKE 'PRO' THEN 0 ELSE 1 END) ASC, " +
                   "ST_Distance(p.ubicacion, ST_SetSRID(ST_Point(:lon, :lat), 4326)) ASC", 
           nativeQuery = true)
    List<UUID> buscarIdsCercanosOrdenados(@Param("lat") double lat, 
                                          @Param("lon") double lon, 
                                          @Param("radioMetros") double radioMetros,
                                          @Param("rubro") String rubro);

    /**
     * Paso 2: Carga las entidades vinculadas en 1 sola consulta para los IDs de la página actual.
     */
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"usuario", "rubroPrincipal"})
    List<PerfilProveedor> findByIdIn(List<UUID> ids);
}
