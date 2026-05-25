package com.PPS.PPS.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidad que representa una Pregunta de Filtro (Knockout Question)
 * asociada a una Oferta de Empleo.
 */
@Entity
@Table(name = "preguntas_filtro_oferta", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreguntaFiltroOferta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oferta_id", nullable = false)
    private OfertaEmpleo oferta;

    @Column(nullable = false)
    private String pregunta;

    /**
     * Tipo de pregunta: SI_NO, TEXTO_CORTO.
     */
    @Column(name = "tipo_pregunta", nullable = false)
    private String tipoPregunta;

    /**
     * Respuesta esperada para considerarse compatible.
     * Si no coincide, se marcará con baja prioridad/excluido.
     */
    @Column(name = "respuesta_esperada_excluyente")
    private String respuestaEsperadaExcluyente;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;
}
