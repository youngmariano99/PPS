package com.PPS.PPS.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una experiencia laboral dentro del Currículum Nativo (JSONB).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienciaLaboralDto {
    private String empresa;
    private String puesto;
    private String fechaInicio;
    private String fechaFin; // Null si es el trabajo actual
    private String descripcion;
}
