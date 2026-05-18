package com.PPS.PPS.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContextoPerfilDto {
    private UUID idPerfil;
    private String tipo; // "PROVEEDOR", "EMPRESA"
    private String nombreContexto;
    private String fotoUrl;
    private String slug;
}
