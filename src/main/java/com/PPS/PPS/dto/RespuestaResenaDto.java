package com.PPS.PPS.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RespuestaResenaDto {
    @NotBlank(message = "La respuesta no puede estar vacía.")
    private String respuesta;
}
