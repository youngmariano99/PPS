package com.PPS.PPS.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PerfilSolicitudDto {
    private UUID rubroId;

    private String rubroPersonalizado;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotBlank(message = "El país es obligatorio")
    private String pais;

    @NotBlank(message = "La provincia es obligatoria")
    private String provincia;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @NotBlank(message = "La calle es obligatoria")
    private String calle;

    @NotNull(message = "El número es obligatorio")
    private Integer numero;

    @NotNull(message = "El código postal es obligatorio")
    private Integer codigoPostal;

    // Solo para PerfilProveedor
    private String dni;
    // Solo para PerfilEmpresa
    private String razonSocial;
    private String cuit;
    
    // Campos Opcionales
    private String matricula;
    private String cvUrlPdf;
}
