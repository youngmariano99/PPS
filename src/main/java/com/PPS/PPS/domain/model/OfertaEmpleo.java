package com.PPS.PPS.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa una Oferta de Empleo en el sistema.
 * Puede ser publicada tanto por Empresas como por Proveedores.
 * Implementa borrado lógico mediante la columna 'activa'.
 */
@Entity
@Table(name = "ofertas_empleo", schema = "public")
@SQLDelete(sql = "UPDATE public.ofertas_empleo SET activa = false WHERE id = ?")
@SQLRestriction("activa = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfertaEmpleo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private PerfilProveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private PerfilEmpresa empresa;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    /**
     * Modalidad de trabajo: REMOTO, PRESENCIAL, HIBRIDO.
     */
    @Column(nullable = false)
    private String modalidad;

    @Column(name = "salario_min")
    private BigDecimal salarioMin;

    @Column(name = "salario_max")
    private BigDecimal salarioMax;

    @Column(name = "habilidades_clave", columnDefinition = "text[]")
    private List<String> habilidadesClave;

    @Builder.Default
    @Column(nullable = false)
    private boolean activa = true;

    @OneToMany(mappedBy = "oferta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PreguntaFiltroOferta> preguntasFiltro = new ArrayList<>();

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;

    /**
     * Helper para agregar preguntas manteniendo la consistencia bidireccional.
     */
    public void agregarPregunta(PreguntaFiltroOferta pregunta) {
        preguntasFiltro.add(pregunta);
        pregunta.setOferta(this);
    }
}
