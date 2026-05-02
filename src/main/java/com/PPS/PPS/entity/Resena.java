package com.PPS.PPS.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "resenas", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intencion_contacto_id", unique = true)
    private IntencionContacto intencionContacto;

    @Column(name = "solicitud_servicio_id", unique = true)
    private UUID solicitudServicioId;

    @Column(name = "trabajo_verificado", nullable = false)
    private boolean trabajoVerificado;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal estrellas;

    private String comentario;

    @Column(name = "respuesta_proveedor")
    private String respuestaProveedor;

    @Column(name = "fecha_respuesta")
    private OffsetDateTime fechaRespuesta;

    @Column(name = "propietario_id", nullable = false)
    private UUID propietarioId;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;
}
