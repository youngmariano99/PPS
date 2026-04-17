package com.PPS.PPS.controller;

import com.PPS.PPS.dto.PerfilRespuestaDto;
import com.PPS.PPS.service.DirectorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/directorio")
@RequiredArgsConstructor
@Tag(name = "Directorio", description = "Búsqueda geolocalizada de servicios")
public class DirectorioController {

    private final DirectorioService directorioService;

    @GetMapping("/buscar")
    @Operation(summary = "Buscar perfiles cercanos", description = "Filtra proveedores y empresas por radio de distancia (km) desde una coordenada.")
    public ResponseEntity<List<PerfilRespuestaDto>> buscar(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radioKm) {
        return ResponseEntity.ok(directorioService.buscarCercanos(lat, lon, radioKm));
    }

    @GetMapping("/proveedor/{id}")
    @Operation(summary = "Obtener detalle de perfil de proveedor", description = "Retorna el perfil completo incluyendo portfolio y esPremium")
    public ResponseEntity<Object> obtenerDetalle(@PathVariable UUID id) {
        return ResponseEntity.ok(directorioService.obtenerDetalleProveedor(id));
    }
}
