package com.PPS.PPS.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CrearResenaDto {

    private UUID intencionContactoId;
    
    private UUID solicitudServicioId;

    @NotNull(message = "El ID del proveedor evaluado es obligatorio.")
    private UUID propietarioId;

    @NotNull(message = "Debe proporcionar una calificación.")
    @Min(value = 1, message = "La calificación mínima es 1 estrella.")
    @Max(value = 5, message = "La calificación máxima es 5 estrellas.")
    private BigDecimal estrellas;

    private String comentario;
}

