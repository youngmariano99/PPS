package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.dto.AuthRespuestaDto;
import com.PPS.PPS.application.dto.LoginSolicitudDto;
import com.PPS.PPS.application.dto.RegistroCompletoSolicitudDto;
import com.PPS.PPS.application.dto.RegistroSolicitudDto;
import com.PPS.PPS.application.usecase.IAuthUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@Tag(name = "Autenticación", description = "Endpoints para registro y login de usuarios")
public class AuthController {

    private final IAuthUseCase authUseCase;

    @Operation(summary = "Registro de nuevo usuario")
    @PostMapping("/registro")
    public ResponseEntity<AuthRespuestaDto> registrar(@Valid @RequestBody RegistroSolicitudDto solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authUseCase.registrar(solicitud));
    }

    @Operation(summary = "Registro completo (Usuario + Perfil) Atómico")
    @PostMapping("/registro-completo")
    public ResponseEntity<AuthRespuestaDto> registrarCompleto(@Valid @RequestBody RegistroCompletoSolicitudDto solicitud) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authUseCase.registrarCompleto(solicitud));
    }

    @Operation(summary = "Inicio de sesión")
    @PostMapping("/login")
    public ResponseEntity<AuthRespuestaDto> login(@Valid @RequestBody LoginSolicitudDto solicitud) {
        return ResponseEntity.ok(authUseCase.login(solicitud));
    }
}


