package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidad unificada para Galería de Portafolio, Documentos y Enlaces de Video.
 */
@Entity
@Table(name = "portafolios", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portafolio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Relación con Usuario (para Proveedores individuales)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Relación con Empresa (para entidades corporativas)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private PerfilEmpresa empresa;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "url_recurso", nullable = false)
    private String urlRecurso;

    /**
     * Valores: IMAGEN, DOCUMENTO, ENLACE (para videos)
     */
    @Column(name = "tipo_recurso", nullable = false)
    private String tipoRecurso;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;
}
