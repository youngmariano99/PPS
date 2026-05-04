package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.PPS.PPS.application.dto.RedSocialDto;
import java.time.OffsetDateTime;
import java.util.UUID;

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rubro_principal_id")
    private Rubro rubroPrincipal;

    @Column(name = "rubro_personalizado")
    private String rubroPersonalizado;

    @Column(nullable = false, unique = true)
    private String dni;

    private String matricula;

    @Column(name = "cv_url_pdf")
    private String cvUrlPdf;

    @Column(name = "foto_perfil_url")
    private String fotoPerfilUrl;

    @Column(name = "descripcion_profesional", nullable = false)
    private String descripcionProfesional;

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "redes_sociales", columnDefinition = "jsonb")
    private java.util.List<RedSocialDto> redesSociales;

    @Column(name = "sitio_web_url")
    private String sitioWebUrl;

    @Column(name = "especialidades", columnDefinition = "text[]")
    private java.util.List<String> especialidades;

    @Column(name = "condiciones_servicio", columnDefinition = "text[]")
    private java.util.List<String> condicionesServicio;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;
}
