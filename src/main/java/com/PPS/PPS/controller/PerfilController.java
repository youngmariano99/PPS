package com.PPS.PPS.controller;

import com.PPS.PPS.dto.PerfilSolicitudDto;
import com.PPS.PPS.service.DirectorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/perfiles")
@RequiredArgsConstructor
@Tag(name = "Perfiles", description = "Gestión de perfiles de Proveedores y Empresas")
@SecurityRequirement(name = "bearerAuth")
public class PerfilController {

    private final DirectorioService directorioService;

    @PostMapping("/proveedor/{usuarioId}")
    @Operation(summary = "Crear perfil de Proveedor")
    public ResponseEntity<Object> crearProveedor(@PathVariable UUID usuarioId, @Valid @RequestBody PerfilSolicitudDto dto) {
        directorioService.crearPerfilProveedor(usuarioId, dto);
        return new ResponseEntity<>(java.util.Map.of(
            "mensaje", "Perfil de proveedor creado con éxito",
            "usuarioId", usuarioId
        ), HttpStatus.CREATED);
    }

    @PostMapping("/empresa/{usuarioId}")
    @Operation(summary = "Crear perfil de Empresa")
    public ResponseEntity<Object> crearEmpresa(@PathVariable UUID usuarioId, @Valid @RequestBody PerfilSolicitudDto dto) {
        directorioService.crearPerfilEmpresa(usuarioId, dto);
        return new ResponseEntity<>(java.util.Map.of(
            "mensaje", "Perfil de empresa creado con éxito",
            "usuarioId", usuarioId
        ), HttpStatus.CREATED);
    }
}
