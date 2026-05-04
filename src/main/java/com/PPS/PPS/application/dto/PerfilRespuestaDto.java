package com.PPS.PPS.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PerfilRespuestaDto {
    @com.fasterxml.jackson.annotation.JsonProperty("id")
    private UUID id;
    @com.fasterxml.jackson.annotation.JsonProperty("nombrePublico")
    private String nombrePublico;
    @com.fasterxml.jackson.annotation.JsonProperty("rubro")
    private String rubro;
    @com.fasterxml.jackson.annotation.JsonProperty("descripcion")
    private String descripcion;
    @com.fasterxml.jackson.annotation.JsonProperty("ciudad")
    private String ciudad;
    @com.fasterxml.jackson.annotation.JsonProperty("latitud")
    private double latitud;
    @com.fasterxml.jackson.annotation.JsonProperty("longitud")
    private double longitud;
    @com.fasterxml.jackson.annotation.JsonProperty("tipo")
    private String tipo;
    @com.fasterxml.jackson.annotation.JsonProperty("perfilCompleto")
    private boolean perfilCompleto;
    @com.fasterxml.jackson.annotation.JsonProperty("promedioEstrellas")
    private double promedioEstrellas;
    @com.fasterxml.jackson.annotation.JsonProperty("cantidadResenas")
    private int cantidadResenas;
    @com.fasterxml.jackson.annotation.JsonProperty("distanciaMetros")
    private Integer distanciaMetros;
    @com.fasterxml.jackson.annotation.JsonProperty("destacado")
    private boolean destacado;
    @com.fasterxml.jackson.annotation.JsonProperty("fotoPerfilUrl")
    private String fotoPerfilUrl;
    @com.fasterxml.jackson.annotation.JsonProperty("telefono")
    private String telefono;

    private java.util.List<String> especialidades;
    private java.util.List<String> condicionesServicio;
}

