package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "intenciones_contacto", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntencionContacto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_interesado_id", nullable = false)
    private Usuario usuarioInteresado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_contactado_id")
    private PerfilProveedor proveedorContactado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_contactada_id")
    private PerfilEmpresa empresaContactada;

    @Column(name = "direccion_ip")
    private String direccionIp;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;
}
