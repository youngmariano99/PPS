package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "perfiles_empresa", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rubro_principal_id")
    private Rubro rubroPrincipal;

    @Column(name = "rubro_personalizado")
    private String rubroPersonalizado;

    @Column(name = "razon_social", nullable = false)
    private String razonSocial;

    @Column(nullable = false, unique = true)
    private String cuit;

    @Column(name = "descripcion_empresa", nullable = false)
    private String descripcionEmpresa;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(nullable = false)
    private String pais;

    @Column(nullable = false)
    private String provincia;

    @Column(nullable = false)
    private String ciudad;

    @Column(nullable = false)
    private String calle;

    @Column(nullable = false)
    private Integer numero;

    @Column(name = "codigo_postal", nullable = false)
    private Integer codigoPostal;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point ubicacion;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;
}
