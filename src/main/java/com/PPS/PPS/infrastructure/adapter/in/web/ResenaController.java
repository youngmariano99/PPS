package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.dto.request.CrearResenaDto;
import com.PPS.PPS.application.dto.response.ResenaDetalleDto;
import com.PPS.PPS.application.dto.request.RespuestaResenaDto;
import com.PPS.PPS.service.ResenaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/resenas")
@RequiredArgsConstructor
@Tag(name = "Reseñas", description = "Sistema de reputación y feedback de usuarios")
public class ResenaController {

    private final ResenaService resenaService;

    @PostMapping
    @Operation(summary = "Crear una nueva reseña", description = "Permite calificar a un proveedor tras un contacto o trabajo verificado.")
    public ResponseEntity<ResenaDetalleDto> crear(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @Valid @RequestBody CrearResenaDto dto,
            HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.crearResena(dto, usuarioId, ip));
    }

    @PutMapping("/{id}/respuesta")
    @Operation(summary = "Responder a una reseña", description = "Permite al profesional responder públicamente a un comentario (Derecho a Réplica).")
    public ResponseEntity<ResenaDetalleDto> responder(
            @RequestHeader("X-User-Id") UUID proveedorUserId,
            @PathVariable UUID id,
            @Valid @RequestBody RespuestaResenaDto dto) {
        return ResponseEntity.ok(resenaService.responderResena(id, proveedorUserId, dto.getRespuesta()));
    }

    @GetMapping("/proveedor/{id}")
    @Operation(summary = "Listar reseñas de un proveedor", description = "Retorna todas las reseñas públicas de un perfil específico.")
    public ResponseEntity<List<ResenaDetalleDto>> listarPorProveedor(@PathVariable UUID id) {
        return ResponseEntity.ok(resenaService.obtenerResenasPorProveedor(id));
    }
}


