package com.PPS.PPS.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;
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

    @jakarta.validation.constraints.NotNull(message = "El número es obligatorio")
    private Integer numero;

    @jakarta.validation.constraints.NotNull(message = "El código postal es obligatorio")
    private Integer codigoPostal;

    // Solo para PerfilProveedor
    private String dni;
    // Solo para PerfilEmpresa
    private String razonSocial;
    private String cuit;
    
    // Campos Opcionales
    private String matricula;
    private String cvUrlPdf;

    // Multimedia
    private String fotoPerfilUrl;
    private List<String> fotosPortafolioUrls;
    private List<String> videoLinks;

    private List<String> redesSocialesUrls;
    private String sitioWebUrl;

    private List<String> especialidades;
    private List<String> condicionesServicio;
}

