package com.PPS.PPS.controller;

import com.PPS.PPS.entity.Rubro;
import com.PPS.PPS.repository.RubroRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador para la gestión de rubros de servicios.
 * Proporciona el listado maestro para los selectores del frontend.
 */
@RestController
@RequestMapping("/rubros")
@RequiredArgsConstructor
@Tag(name = "Rubros", description = "Endpoints para el catálogo de categorías/rubros")
public class RubroController {

    private final RubroRepository rubroRepository;

    @GetMapping
    @Operation(summary = "Obtener todos los rubros activos", description = "Lista los rubros precargados en el sistema para usar en dropdowns.")
    public ResponseEntity<List<Rubro>> listarRubros() {
        // En un futuro podríamos filtrar por rubros activos
        return ResponseEntity.ok(rubroRepository.findAll());
    }
}
