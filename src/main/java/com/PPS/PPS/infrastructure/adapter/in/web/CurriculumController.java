package com.PPS.PPS.infrastructure.adapter.in.web;

import com.PPS.PPS.application.usecase.IGestionarCurriculumUseCase;
import com.PPS.PPS.application.dto.response.CurriculumNativoDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controlador REST para la gestión del Currículum Nativo (JSONB) del usuario autenticado.
 */
@RestController
@RequestMapping("/curriculums")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Currículums", description = "Endpoints para la gestión del currículum dinámico (JSONB) del candidato")
public class CurriculumController {

    private final IGestionarCurriculumUseCase gestionarCurriculumUseCase;

    @GetMapping("/me")
    @Operation(summary = "Obtener el currículum propio", description = "Retorna el currículum nativo (JSONB) del usuario autenticado. Si no posee uno, retorna una plantilla vacía.")
    public ResponseEntity<CurriculumNativoDto> obtenerMiCurriculum(
            @RequestHeader("X-User-Id") UUID usuarioId) {
        log.info("REST: Obteniendo currículum propio para usuarioId: {}", usuarioId);
        CurriculumNativoDto response = gestionarCurriculumUseCase.obtenerPorUsuario(usuarioId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar el currículum propio", description = "Guarda o actualiza las listas de experiencia, educación, habilidades y CV adjunto del usuario logueado.")
    public ResponseEntity<CurriculumNativoDto> actualizarMiCurriculum(
            @RequestHeader("X-User-Id") UUID usuarioId,
            @RequestBody CurriculumNativoDto dto) {
        log.info("REST: Actualizando currículum propio para usuarioId: {}", usuarioId);
        CurriculumNativoDto response = gestionarCurriculumUseCase.guardarOActualizar(usuarioId, dto);
        return ResponseEntity.ok(response);
    }
}
