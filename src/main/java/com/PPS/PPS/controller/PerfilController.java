package com.PPS.PPS.controller;

import com.PPS.PPS.dto.PerfilSolicitudDto;
import com.PPS.PPS.dto.UsuarioPerfilDto;
import com.PPS.PPS.service.DirectorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/perfil")
@RequiredArgsConstructor
@Tag(name = "Perfil", description = "Gestión del perfil del usuario logueado")
public class PerfilController {

    private final DirectorioService directorioService;

    @GetMapping("/me")
    @Operation(summary = "Obtener datos del usuario actual", description = "Detecta el rol y devuelve los datos del usuario logueado.")
    public ResponseEntity<UsuarioPerfilDto> obtenerMiPerfil(@RequestHeader("X-User-Id") UUID usuarioId) {
        return ResponseEntity.ok(directorioService.obtenerPerfilUsuario(usuarioId));
    }

    @PutMapping("/usuario/me")
    @Operation(summary = "Actualizar datos personales", description = "Permite al usuario cambiar su nombre, apellido o teléfono.")
    public ResponseEntity<Void> actualizarMisDatos(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @RequestBody UsuarioPerfilDto dto) {
        directorioService.actualizarUsuario(usuarioId, dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/proveedor/me")
    @Operation(summary = "Actualizar perfil profesional", description = "Permite al proveedor cambiar su descripción, matrícula, dirección y redes sociales.")
    public ResponseEntity<Void> actualizarMiPerfilProfesional(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @RequestBody PerfilSolicitudDto dto) {
        directorioService.actualizarPerfilProveedor(usuarioId, dto);
        return ResponseEntity.ok().build();
    }
}
