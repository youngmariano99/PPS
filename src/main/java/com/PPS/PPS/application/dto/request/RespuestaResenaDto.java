package com.PPS.PPS.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RespuestaResenaDto {
    @NotBlank(message = "La respuesta no puede estar vacía.")
    private String respuesta;
}

