package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Define los niveles de planes disponibles (Gratis, Premium, etc.)
 * y sus configuraciones.
 */
@Entity
@Table(name = "planes_suscripcion", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanSuscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;

    @Column(name = "precio_mensual", nullable = false)
    private BigDecimal precioMensual;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;
}
