package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Representa las categorías de servicios o rubros laborales.
 */
@Entity
@Table(name = "rubros", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rubro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private boolean activa = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime fechaActualizacion;
}
