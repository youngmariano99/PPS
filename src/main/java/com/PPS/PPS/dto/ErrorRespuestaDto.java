package com.PPS.PPS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO estandarizado para enviar respuestas de error consistentes al frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorRespuestaDto {
    private LocalDateTime marcaDeTiempo;
    private Integer estado;
    private String mensaje;
    private String detalles;
}
