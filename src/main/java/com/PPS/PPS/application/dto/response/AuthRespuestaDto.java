package com.PPS.PPS.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para la respuesta de autenticación exitosa.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRespuestaDto {
    private String accessToken;
    private String tokenType;
    private UUID usuarioId;
    private String email;
    private String nombre;
    private String apellido;
    private boolean emailConfirmado;
}

