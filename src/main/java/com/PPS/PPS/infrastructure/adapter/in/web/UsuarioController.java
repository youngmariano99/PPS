package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.usecase.IConsultarDetallePerfilUseCase;
import com.PPS.PPS.application.dto.UsuarioPerfilDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Gestión de perfiles de usuario y descubrimiento de sesión")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final IConsultarDetallePerfilUseCase consultarDetallePerfilUseCase;

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del usuario actual", description = "Descubre el rol y datos del usuario logueado usando su UUID")
    public ResponseEntity<UsuarioPerfilDto> obtenerMiPerfil(
            @RequestHeader(value = "X-User-Id", required = false) UUID userIdHeader) {
        
        // TODO: En producción, extraer el UUID del Token JWT de Supabase
        // Por ahora, para Framer, permitimos pasar el ID por Header o usar uno de prueba.
        
        if (userIdHeader == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(consultarDetallePerfilUseCase.obtenerPerfilUsuario(userIdHeader));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener perfil por ID")
    public ResponseEntity<UsuarioPerfilDto> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(consultarDetallePerfilUseCase.obtenerPerfilUsuario(id));
    }
}


