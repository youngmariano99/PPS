package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * Entidad para gestionar imágenes de Cloudinary y enlaces externos de video.
 */
@Entity
@Table(name = "perfil_multimedia", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MultimediaPerfil {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 1000)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMultimedia tipo;

    /**
     * Orden de visualización en el carrusel del frontend.
     */
    @Column(name = "orden_visualizacion")
    private Integer orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_proveedor_id")
    private PerfilProveedor perfilProveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_empresa_id")
    private PerfilEmpresa perfilEmpresa;
}
