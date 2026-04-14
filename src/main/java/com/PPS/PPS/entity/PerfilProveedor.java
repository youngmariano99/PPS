package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Perfil público de un proveedor de servicios independiente.
 */
@Entity
@Table(name = "perfiles_proveedor", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilProveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "rubro_principal_id")
    private Rubro rubroPrincipal;

    private String rubroPersonalizado;

    @Column(nullable = false, unique = true)
    private String dni;

    private String matricula;

    @Column(name = "descripcion_profesional", nullable = false, columnDefinition = "TEXT")
    private String descripcionProfesional;

    @Column(name = "cv_url_pdf")
    private String cvUrlPdf;

    // Campos de dirección
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

    /**
     * Ubicación geográfica (Lon/Lat) mapeada para PostGIS.
     */
    @Column(columnDefinition = "geography(Point, 4326)")
    private Point ubicacion;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;
}
