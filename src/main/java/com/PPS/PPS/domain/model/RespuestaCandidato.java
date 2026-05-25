package com.PPS.PPS.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidad que representa la respuesta dada por un candidato a una pregunta de filtro específica.
 */
@Entity
@Table(
    name = "respuestas_candidato", 
    schema = "public",
    uniqueConstraints = @UniqueConstraint(name = "uk_respuesta_unica", columnNames = {"postulacion_id", "pregunta_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaCandidato {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postulacion_id", nullable = false)
    private Postulacion postulacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pregunta_id", nullable = false)
    private PreguntaFiltroOferta pregunta;

    @Column(name = "respuesta_dada", nullable = false, columnDefinition = "TEXT")
    private String respuestaDada;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;
}
