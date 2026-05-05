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
public class UsuarioPerfilDto {
    private UUID id;
    private String nombre;
    private String apellido;
    private String email;
    private String rol; // USUARIO, PROVEEDOR, EMPRESA
    private String telefono;
    private String fechaRegistro;
    private boolean isPremium;
}

