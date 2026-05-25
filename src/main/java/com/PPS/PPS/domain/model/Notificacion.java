package com.PPS.PPS.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidad que representa una notificación para el usuario en el sistema.
 */
@Entity
@Table(name = "notificaciones", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /**
     * Tipos válidos: CAMBIO_ESTADO_POSTULACION, NUEVA_OFERTA_COMPATIBLE, 
     * NUEVA_RESENA, NUEVO_MENSAJE, REPORTE_RESUELTO.
     */
    @Column(name = "tipo_notificacion", nullable = false)
    private String tipoNotificacion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "entidad_referencia_id")
    private UUID entidadReferenciaId;

    @Builder.Default
    @Column(nullable = false)
    private boolean leida = false;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;
}
