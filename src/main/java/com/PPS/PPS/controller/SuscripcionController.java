package com.PPS.PPS.controller;

import com.PPS.PPS.entity.SuscripcionUsuario;
import com.PPS.PPS.service.SuscripcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suscripciones")
@RequiredArgsConstructor
public class SuscripcionController {

    private final SuscripcionService suscripcionService;

    @PostMapping("/{usuarioId}/suscribir/{planId}")
    public ResponseEntity<SuscripcionUsuario> suscribir(
            @PathVariable UUID usuarioId, 
            @PathVariable UUID planId) {
        return ResponseEntity.ok(suscripcionService.suscribirUsuario(
                Objects.requireNonNull(usuarioId), 
                Objects.requireNonNull(planId)));
    }
}
