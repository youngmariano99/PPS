package com.PPS.PPS.repository;

import com.PPS.PPS.entity.PerfilProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerfilProveedorRepository extends JpaRepository<PerfilProveedor, UUID> {

    /**
     * Busca proveedores dentro de un radio en metros desde un punto dado.
     * Utiliza ST_DWithin de PostGIS para precisión geográfica.
     */
    @Query(value = "SELECT * FROM perfiles_proveedor p " +
                   "WHERE ST_DWithin(p.ubicacion, ST_SetSRID(ST_Point(:lon, :lat), 4326), :radioMetros) = true", 
           nativeQuery = true)
    List<PerfilProveedor> buscarCercanos(@Param("lat") double lat, 
                                        @Param("lon") double lon, 
                                        @Param("radioMetros") double radioMetros);
}
