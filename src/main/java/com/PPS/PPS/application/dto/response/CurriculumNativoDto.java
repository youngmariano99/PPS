package com.PPS.PPS.application.dto.response;

import com.PPS.PPS.application.dto.EducacionDto;
import com.PPS.PPS.application.dto.ExperienciaLaboralDto;
import com.PPS.PPS.application.dto.HabilidadDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO para la transferencia de datos de un Currículum Nativo (JSONB).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumNativoDto {

    private String titularProfesional;

    private String sobreMi;

    @Builder.Default
    private List<ExperienciaLaboralDto> experienciaLaboral = new ArrayList<>();

    @Builder.Default
    private List<EducacionDto> educacion = new ArrayList<>();

    @Builder.Default
    private List<HabilidadDto> habilidades = new ArrayList<>();

    private String cvUrlPdf;
}
