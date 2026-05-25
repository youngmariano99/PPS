package com.PPS.PPS.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa una habilidad o competencia dentro del Currículum Nativo (JSONB).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabilidadDto {
    private String nombre;
    private String nivel; // Ej: Principiante, Intermedio, Avanzado, Experto, o años de exp
}
