package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IGestionarCurriculumUseCase;
import com.PPS.PPS.application.dto.response.CurriculumNativoDto;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.model.CurriculumNativo;
import com.PPS.PPS.domain.model.Usuario;
import com.PPS.PPS.domain.repository.CurriculumNativoRepository;
import com.PPS.PPS.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

/**
 * Servicio que implementa la lógica para gestionar el Currículum Nativo (JSONB).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GestionarCurriculumUseCaseImpl implements IGestionarCurriculumUseCase {

    private final CurriculumNativoRepository cvRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public CurriculumNativoDto obtenerPorUsuario(UUID usuarioId) {
        log.info("Obteniendo Currículum Nativo para usuarioId: {}", usuarioId);
        return cvRepository.findByUsuarioId(usuarioId)
                .map(this::mapearADto)
                .orElseGet(() -> {
                    log.info("No se encontró CV para el usuarioId: {}. Retornando plantilla vacía.", usuarioId);
                    return CurriculumNativoDto.builder()
                            .experienciaLaboral(new ArrayList<>())
                            .educacion(new ArrayList<>())
                            .habilidades(new ArrayList<>())
                            .build();
                });
    }

    @Override
    @Transactional
    public CurriculumNativoDto guardarOActualizar(UUID usuarioId, CurriculumNativoDto dto) {
        log.info("Guardando/Actualizando Currículum Nativo para usuarioId: {}", usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

        CurriculumNativo cv = cvRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> CurriculumNativo.builder().usuario(usuario).build());

        cv.setTitularProfesional(dto.getTitularProfesional() != null ? dto.getTitularProfesional().trim() : null);
        cv.setSobreMi(dto.getSobreMi() != null ? dto.getSobreMi().trim() : null);
        cv.setExperienciaLaboral(dto.getExperienciaLaboral() != null ? dto.getExperienciaLaboral() : new ArrayList<>());
        cv.setEducacion(dto.getEducacion() != null ? dto.getEducacion() : new ArrayList<>());
        cv.setHabilidades(dto.getHabilidades() != null ? dto.getHabilidades() : new ArrayList<>());
        cv.setCvUrlPdf(dto.getCvUrlPdf() != null ? dto.getCvUrlPdf().trim() : null);

        CurriculumNativo guardado = cvRepository.save(cv);
        log.info("Currículum Nativo guardado exitosamente con id: {}", guardado.getId());

        return mapearADto(guardado);
    }

    private CurriculumNativoDto mapearADto(CurriculumNativo cv) {
        return CurriculumNativoDto.builder()
                .titularProfesional(cv.getTitularProfesional())
                .sobreMi(cv.getSobreMi())
                .experienciaLaboral(cv.getExperienciaLaboral())
                .educacion(cv.getEducacion())
                .habilidades(cv.getHabilidades())
                .cvUrlPdf(cv.getCvUrlPdf())
                .build();
    }
}
