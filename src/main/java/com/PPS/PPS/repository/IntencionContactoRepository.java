package com.PPS.PPS.repository;

import com.PPS.PPS.entity.IntencionContacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.UUID;

@Repository
public interface IntencionContactoRepository extends JpaRepository<IntencionContacto, UUID> {

    @Query("SELECT COUNT(ic) FROM IntencionContacto ic WHERE ic.proveedorContactado.id = :proveedorId AND ic.fechaCreacion >= :fechaInicio")
    long contarLeadsPorProveedor(UUID proveedorId, OffsetDateTime fechaInicio);

    @Query("SELECT COUNT(ic) FROM IntencionContacto ic WHERE ic.empresaContactada.id = :empresaId AND ic.fechaCreacion >= :fechaInicio")
    long contarLeadsPorEmpresa(UUID empresaId, OffsetDateTime fechaInicio);

    java.util.Optional<IntencionContacto> findFirstByUsuarioInteresadoIdAndProveedorContactadoIdOrderByFechaCreacionDesc(UUID interesadoId, UUID proveedorId);
    java.util.Optional<IntencionContacto> findFirstByUsuarioInteresadoIdAndEmpresaContactadaIdOrderByFechaCreacionDesc(UUID interesadoId, UUID empresaId);
}
