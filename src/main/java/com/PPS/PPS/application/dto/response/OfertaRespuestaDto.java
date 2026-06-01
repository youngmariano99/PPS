package com.PPS.PPS.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * DTO para la respuesta de detalles de una Oferta de Empleo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfertaRespuestaDto {

    private UUID id;

    private String titulo;

    private String descripcion;

    private String logoEmpresa;

    private String modalidad;

    private BigDecimal salarioMin;

    private BigDecimal salarioMax;

    @Builder.Default
    private List<String> habilidadesClave = new ArrayList<>();

    @Builder.Default
    private List<PreguntaFiltroRespuestaDto> preguntasFiltro = new ArrayList<>();

    private boolean activa;

    private UUID proveedorId;

    private String proveedorNombre;

    private UUID empresaId;

    private String empresaRazonSocial;

    private OffsetDateTime fechaCreacion;
}
