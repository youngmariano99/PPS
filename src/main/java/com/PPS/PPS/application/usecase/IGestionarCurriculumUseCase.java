package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.response.CurriculumNativoDto;

import java.util.UUID;

/**
 * Caso de uso para la gestión (CRUD) del Currículum Nativo (JSONB) del candidato.
 */
public interface IGestionarCurriculumUseCase {

    /**
     * Obtiene el currículum nativo asociado al usuario indicado.
     */
    CurriculumNativoDto obtenerPorUsuario(UUID usuarioId);

    /**
     * Guarda o actualiza el currículum nativo del usuario actual.
     */
    CurriculumNativoDto guardarOActualizar(UUID usuarioId, CurriculumNativoDto dto);
}
