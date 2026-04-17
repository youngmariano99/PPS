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

@RestController
@RequestMapping("/directorio")
@RequiredArgsConstructor
@Tag(name = "Directorio", description = "Búsqueda geolocalizada de servicios")
public class DirectorioController {

    private final DirectorioService directorioService;

    @GetMapping("/buscar/lista")
    @Operation(summary = "Obtener lista paginada de proveedores", description = "Filtra solo proveedores con paginación y destaca suscriptores activos.")
    public ResponseEntity<org.springframework.data.domain.Page<PerfilRespuestaDto>> buscarLista(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "1") double radioKm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(directorioService.buscarCercanosLista(lat, lon, radioKm, page, size));
    }

    @GetMapping("/buscar/mapa")
    @Operation(summary = "Obtener puntos masivos para el mapa", description = "Filtra proveedores y empresas sin paginar para renderizado masivo en el mapa.")
    public ResponseEntity<List<PerfilRespuestaDto>> buscarMapa(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radioKm) {
        return ResponseEntity.ok(directorioService.buscarCercanosMapa(lat, lon, radioKm));
    }
}
