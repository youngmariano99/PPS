package com.PPS.PPS.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PerfilRespuestaDto {
    private UUID id;
    private String nombrePublico; // Razon Social o Nombre+Apellido
    private String rubro;
    private String descripcion;
    private String ciudad;
    private double latitud;
    private double longitud;
    private String tipo; // PROVEEDOR o EMPRESA
}
