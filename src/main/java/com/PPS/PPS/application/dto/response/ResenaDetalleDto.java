package com.PPS.PPS.application.dto.response;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResenaDetalleDto {
    private UUID id;
    private String nombreCliente;
    private Double estrellas;
    private String comentario;
    private OffsetDateTime fecha;
    private boolean trabajoVerificado;
    private String respuestaProveedor;
    private UUID intencionContactoId;
}

