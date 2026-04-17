package com.PPS.PPS.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilDetalleDto {
    private UUID id;
    private String nombrePublico;
    private String rubro;
    private String descripcion;
    private String fotoPerfilUrl;
    private String ciudad;
    private String provincia;
    private List<String> fotosPortafolio;
    private List<String> videoLinks;
    private String telefono;
    private String matricula;
    private String direccion;
    private String instagramUrl;
    private String facebookUrl;
    private String linkedinUrl;
    private boolean esPremium;
}
