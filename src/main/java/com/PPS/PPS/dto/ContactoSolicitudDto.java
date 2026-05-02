package com.PPS.PPS.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ContactoSolicitudDto {
    @NotNull(message = "El ID del destinatario es obligatorio.")
    private UUID destinoId;
}
