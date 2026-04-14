package com.PPS.PPS.controller;

import com.PPS.PPS.dto.AuthRespuestaDto;
import com.PPS.PPS.dto.LoginSolicitudDto;
import com.PPS.PPS.dto.RegistroSolicitudDto;
import com.PPS.PPS.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador para la gestión de identidad y sesiones.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para registro e inicio de sesión integrados con Supabase")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registro")
    @Operation(summary = "Registrar un nuevo usuario", description = "Crea un usuario en Supabase Auth y sincroniza los datos básicos en la BD local.")
    public ResponseEntity<AuthRespuestaDto> registrar(@Valid @RequestBody RegistroSolicitudDto dto) {
        return new ResponseEntity<>(authService.registrar(dto), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Valida credenciales con Supabase y retorna un token JWT válido.")
    public ResponseEntity<AuthRespuestaDto> login(@Valid @RequestBody LoginSolicitudDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
}
