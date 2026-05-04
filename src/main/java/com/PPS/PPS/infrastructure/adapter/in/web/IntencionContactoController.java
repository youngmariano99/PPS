package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.dto.ContactoSolicitudDto;
import com.PPS.PPS.service.IntencionContactoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/contactos")
@RequiredArgsConstructor
@Tag(name = "Contactos", description = "Gestión de intenciones de contacto y leads")
public class IntencionContactoController {

    private final IntencionContactoService intencionContactoService;

    @PostMapping
    @Operation(summary = "Registrar intención de contacto", description = "Registra que un usuario está interesado en contactar a un proveedor o empresa.")
    public ResponseEntity<com.PPS.PPS.application.dto.ContactoRespuestaDto> registrarContacto(
            @RequestHeader("X-User-Id") UUID interesadoId,
            @Valid @RequestBody ContactoSolicitudDto dto,
            HttpServletRequest request) {
        
        String ip = request.getRemoteAddr();
        return ResponseEntity.ok(intencionContactoService.registrarContacto(interesadoId, dto.getDestinoId(), ip));
    }
}


