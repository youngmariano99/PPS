package com.PPS.PPS.dto.suscripcion;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class CrearSuscripcionRequestDto {
    @NotNull(message = "El ID del usuario es obligatorio")
    private UUID usuarioId;

    @NotNull(message = "El ID del plan es obligatorio")
    private UUID planId;
}
