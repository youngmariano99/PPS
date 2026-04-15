package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidad unificada para Galería de Portafolio, Documentos y Enlaces de Video.
 * Soporta "Graceful Downgrade": se mantienen todos los recursos pero se limita la visibilidad.
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private PerfilEmpresa empresa;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "url_recurso", nullable = false)
    private String urlRecurso;

    /**
     * Valores: IMAGEN, DOCUMENTO, ENLACE
     */
    @Column(name = "tipo_recurso", nullable = false)
    private String tipoRecurso;

    /**
     * Controla si el recurso se muestra públicamente. 
     * En planes gratuitos se limita la cantidad de registros con visible = true.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean visible = true;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;
}
