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

    @GetMapping("/buscar/lista")
    @Operation(summary = "Obtener lista paginada de proveedores", description = "Filtra solo proveedores con paginación y destaca suscriptores activos.")
    public ResponseEntity<org.springframework.data.domain.Page<PerfilRespuestaDto>> buscarLista(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "1") double radioKm,
            @RequestParam(required = false) String rubro,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return ResponseEntity.ok(directorioService.buscarCercanosLista(lat, lon, radioKm, rubro, q, page, size));
    }

    @GetMapping("/buscar/mapa")
    @Operation(summary = "Obtener puntos masivos para el mapa", description = "Filtra proveedores y empresas sin paginar para renderizado masivo en el mapa.")
    public ResponseEntity<List<PerfilRespuestaDto>> buscarMapa(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") double radioKm,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(directorioService.buscarCercanosMapa(lat, lon, radioKm, q));
    }

    @GetMapping("/proveedor/{id}")
    @Operation(summary = "Obtener detalle de perfil de proveedor", description = "Retorna el perfil completo incluyendo portfolio y esPremium")
    public ResponseEntity<Object> obtenerDetalle(
            @PathVariable UUID id,
            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Id", required = false) UUID requesterId) {
        return ResponseEntity.ok(directorioService.obtenerDetalleProveedor(id, requesterId));
    }

    @GetMapping("/geocodificar")
    @Operation(summary = "Validar y geocodificar una dirección", description = "Retorna longitud y latitud si la dirección existe.")
    public ResponseEntity<double[]> geocodificar(@RequestParam String direccion) {
        double[] coords = directorioService.geocodificarDireccion(direccion);
        if (coords == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(coords);
    }
}
