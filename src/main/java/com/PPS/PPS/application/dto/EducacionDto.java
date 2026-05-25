package com.PPS.PPS.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una formación académica dentro del Currículum Nativo (JSONB).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducacionDto {
    private String institucion;
    private String titulo;
    private String fechaInicio;
    private String fechaFin; // Null si está en curso
    private boolean completado;
}
