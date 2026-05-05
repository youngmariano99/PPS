package com.PPS.PPS.application.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;
import com.PPS.PPS.application.dto.RedSocialDto;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilDetalleDto {
    private UUID id;
    private UUID usuarioId;
    private String nombrePublico;
    private String rubro;
    private String descripcion;
    private String fotoPerfilUrl;
    private String ciudad;
    private String provincia;
    private List<String> fotosPortafolio;
    private List<String> videoLinks;
    private String telefono;
    private String email;
    private String matricula;
    private String direccion;
    private String calle;
    private Integer numero;
    private Integer codigoPostal;
    private String pais;
    private List<RedSocialDto> redesSociales;
    private String sitioWebUrl;
    private boolean esPremium;
    private java.util.List<String> especialidades;
    private java.util.List<String> condicionesServicio;
    private java.util.List<ResenaDetalleDto> resenas;
    private Double promedioEstrellas;
    private Integer totalResenas;
}

