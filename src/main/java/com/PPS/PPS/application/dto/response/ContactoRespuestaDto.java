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
public class ContactoRespuestaDto {
    private UUID contactoId;
    private String telefonoRevelado;
    private String calleRevelada;
    private String numeroRevelado;
}

