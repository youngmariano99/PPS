package com.PPS.PPS.domain.model;

import com.PPS.PPS.application.dto.EducacionDto;
import com.PPS.PPS.application.dto.ExperienciaLaboralDto;
import com.PPS.PPS.application.dto.HabilidadDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad que representa el Currículum Nativo de un candidato.
 * Utiliza persistencia relacional híbrida guardando las listas de experiencias,
 * educación y habilidades en formato JSONB.
 */
@Entity
@Table(name = "curriculums_nativos", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumNativo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "titular_profesional")
    private String titularProfesional;

    @Column(name = "sobre_mi", columnDefinition = "TEXT")
    private String sobreMi;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "experiencia_laboral", columnDefinition = "jsonb")
    @Builder.Default
    private List<ExperienciaLaboralDto> experienciaLaboral = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "educacion", columnDefinition = "jsonb")
    @Builder.Default
    private List<EducacionDto> educacion = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "habilidades", columnDefinition = "jsonb")
    @Builder.Default
    private List<HabilidadDto> habilidades = new ArrayList<>();

    @Column(name = "cv_url_pdf")
    private String cvUrlPdf;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "updated_at", updatable = false, insertable = false)
    private OffsetDateTime fechaActualizacion;
}
