package com.PPS.PPS.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.util.UUID;

/**
 * DTO unificado para el registro atómico (Usuario + Perfil).
 */
@Data
public class RegistroCompletoSolicitudDto {

    // --- Datos de Cuenta (Usuario) ---
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$", message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial")
    private String password;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    // --- Identidad Profesional ---
    @NotBlank(message = "El rol es obligatorio (PROVEEDOR o EMPRESA)")
    private String tipo; // PROVEEDOR o EMPRESA

    private UUID rubroId;
    private String rubroPersonalizado;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotBlank(message = "El DNI/CUIT es obligatorio")
    private String dniCuit;

    private String matricula;
    private String fotoPerfilUrl;

    // --- Ubicación ---
    @NotBlank(message = "La calle es obligatoria")
    private String calle;

    @NotBlank(message = "La altura es obligatoria")
    private String numero;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @NotBlank(message = "La provincia es obligatoria")
    private String provincia;

    @NotBlank(message = "El código postal es obligatorio")
    private String codigoPostal;

    // --- Portafolio Multimedia ---
    private java.util.List<String> fotosPortafolioUrls;
    private java.util.List<String> videoLinks;

    // --- Etiquetas y Servicios ---
    private java.util.List<String> especialidades;
    private java.util.List<String> condicionesServicio;
}
