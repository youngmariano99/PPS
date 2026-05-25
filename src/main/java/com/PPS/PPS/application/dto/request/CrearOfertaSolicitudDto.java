package com.PPS.PPS.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * DTO para la solicitud de creación de una Oferta de Empleo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearOfertaSolicitudDto {

    private UUID proveedorId;

    private UUID empresaId;

    private String titulo;

    private String descripcion;

    /**
     * Modalidad: REMOTO, PRESENCIAL, HIBRIDO.
     */
    private String modalidad;

    private BigDecimal salarioMin;

    private BigDecimal salarioMax;

    @Builder.Default
    private List<String> habilidadesClave = new ArrayList<>();

    @Builder.Default
    private List<PreguntaFiltroSolicitudDto> preguntasFiltro = new ArrayList<>();
}
