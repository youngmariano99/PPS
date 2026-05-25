package com.PPS.PPS.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa la postulación de un candidato a una oferta de empleo.
 */
@Entity
@Table(
    name = "postulaciones", 
    schema = "public",
    uniqueConstraints = @UniqueConstraint(name = "uk_postulacion_unica", columnNames = {"oferta_id", "usuario_candidato_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Postulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oferta_id", nullable = false)
    private OfertaEmpleo oferta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_candidato_id", nullable = false)
    private Usuario candidato;

    @Column(name = "mensaje_presentacion", columnDefinition = "TEXT")
    private String mensajePresentacion;

    @Column(name = "cv_url_adjunto")
    private String cvUrlAdjunto;

    /**
     * Estados: ENVIADO, VISTO, EN_REVISION, CONTACTADO, DESCARTADO.
     */
    @Builder.Default
    @Column(nullable = false)
    private String estado = "ENVIADO";

    @Column(name = "motivo_rechazo_codigo")
    private String motivoRechazoCodigo;

    @Column(name = "feedback_adicional", columnDefinition = "TEXT")
    private String feedbackAdicional;

    @Builder.Default
    @Column(name = "es_excluido", nullable = false)
    private boolean esExcluido = false;

    @OneToMany(mappedBy = "postulacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RespuestaCandidato> respuestas = new ArrayList<>();

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;

    /**
     * Helper para agregar respuestas manteniendo la consistencia bidireccional.
     */
    public void agregarRespuesta(RespuestaCandidato respuesta) {
        respuestas.add(respuesta);
        respuesta.setPostulacion(this);
    }
}
