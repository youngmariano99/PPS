package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.usecase.IPublicarOfertaUseCase;
import com.PPS.PPS.application.usecase.IListarOfertasUseCase;
import com.PPS.PPS.application.dto.request.CrearOfertaSolicitudDto;
import com.PPS.PPS.application.dto.response.OfertaRespuestaDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar Ofertas de Empleo y Preguntas de Filtro asociadas.
 */
@RestController
@RequestMapping("/ofertas")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Ofertas de Empleo", description = "Endpoints para la publicación y visualización de ofertas laborales")
public class OfertaController {

    private final IPublicarOfertaUseCase publicarOfertaUseCase;
    private final IListarOfertasUseCase listarOfertasUseCase;

    @PostMapping
    @Operation(summary = "Publicar una oferta de empleo", description = "Permite a una Empresa o Proveedor registrar una oferta con preguntas excluyentes.")
    public ResponseEntity<OfertaRespuestaDto> publicar(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @RequestBody CrearOfertaSolicitudDto dto) {
        log.info("REST: Petición de publicación recibida para usuarioId: {}", usuarioId);
        OfertaRespuestaDto respuesta = publicarOfertaUseCase.publicar(usuarioId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping
    @Operation(summary = "Listar ofertas activas", description = "Retorna una página con las ofertas de empleo que se encuentran activas en el sistema.")
    public ResponseEntity<Page<OfertaRespuestaDto>> listarActivas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST: Petición de listar ofertas activas recibida. Page: {}, Size: {}", page, size);
        Page<OfertaRespuestaDto> respuesta = listarOfertasUseCase.listarActivas(PageRequest.of(page, size));
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/propias")
    @Operation(summary = "Listar ofertas propias", description = "Retorna todas las ofertas creadas por el usuario autenticado (Proveedor o Empresa).")
    public ResponseEntity<List<OfertaRespuestaDto>> listarPropias(
            @RequestHeader("X-User-Id") UUID usuarioId) {
        log.info("REST: Petición de listar ofertas propias recibida para usuarioId: {}", usuarioId);
        List<OfertaRespuestaDto> respuesta = listarOfertasUseCase.listarPropias(usuarioId);
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminación lógica de una oferta", description = "Deshabilita una oferta de empleo activa (cambiando su estado interna a inactiva).")
    public ResponseEntity<Void> eliminar(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @PathVariable UUID id) {
        log.info("REST: Petición de eliminación lógica recibida para ofertaId: {} por usuarioId: {}", id, usuarioId);
        publicarOfertaUseCase.eliminarLogico(usuarioId, id);
        return ResponseEntity.noContent().build();
    }
}
