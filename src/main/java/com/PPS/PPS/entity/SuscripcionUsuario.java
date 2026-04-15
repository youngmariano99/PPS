package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Gestiona la relación entre el usuario y su plan activo.
 */
@Entity
@Table(name = "suscripciones_usuario", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuscripcionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanSuscripcion plan;

    /**
     * Estados permitidos: ACTIVA, VENCIDA, CANCELADA, PENDIENTE.
     */
    @Column(nullable = false)
    @Builder.Default
    private String estado = "ACTIVA";

    @Column(name = "fecha_inicio", nullable = false)
    @Builder.Default
    private OffsetDateTime fechaInicio = OffsetDateTime.now();

    @Column(name = "fecha_fin", nullable = false)
    private OffsetDateTime fechaFin;

    @Column(name = "mp_preferencia_id")
    private String mpPreferenciaId;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;
}
