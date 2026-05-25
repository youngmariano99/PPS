package com.PPS.PPS;

import com.PPS.PPS.application.dto.EducacionDto;
import com.PPS.PPS.application.dto.ExperienciaLaboralDto;
import com.PPS.PPS.application.dto.HabilidadDto;
import com.PPS.PPS.application.dto.request.PostulacionSolicitudDto;
import com.PPS.PPS.application.dto.request.RespuestaCandidatoSolicitudDto;
import com.PPS.PPS.application.dto.response.CurriculumNativoDto;
import com.PPS.PPS.application.dto.response.PostulacionRespuestaDto;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.domain.model.*;
import com.PPS.PPS.domain.repository.CurriculumNativoRepository;
import com.PPS.PPS.domain.repository.OfertaEmpleoRepository;
import com.PPS.PPS.domain.repository.PostulacionRepository;
import com.PPS.PPS.domain.repository.PreguntaFiltroOfertaRepository;
import com.PPS.PPS.domain.repository.UsuarioRepository;
import com.PPS.PPS.service.GestionarCurriculumUseCaseImpl;
import com.PPS.PPS.service.PostularseOfertaUseCaseImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostularseOfertaUseCaseTest {

    @Mock
    private PostulacionRepository postulacionRepository;

    @Mock
    private OfertaEmpleoRepository ofertaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PreguntaFiltroOfertaRepository preguntaRepository;

    @Mock
    private CurriculumNativoRepository cvRepository;

    @InjectMocks
    private PostularseOfertaUseCaseImpl postularseUseCase;

    @InjectMocks
    private GestionarCurriculumUseCaseImpl gestionarCurriculumUseCase;

    private UUID usuarioId;
    private Usuario candidato;
    private OfertaEmpleo oferta;
    private PreguntaFiltroOferta preguntaSiNo;
    private PreguntaFiltroOferta preguntaTexto;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        candidato = Usuario.builder()
                .id(usuarioId)
                .nombre("Juan")
                .apellido("Pérez")
                .email("juan.perez@example.com")
                .build();

        oferta = OfertaEmpleo.builder()
                .id(UUID.randomUUID())
                .titulo("Frontend Dev")
                .descripcion("Buscamos dev React")
                .modalidad("REMOTO")
                .activa(true)
                .build();

        preguntaSiNo = PreguntaFiltroOferta.builder()
                .id(UUID.randomUUID())
                .oferta(oferta)
                .pregunta("¿Sabe React?")
                .tipoPregunta("SI_NO")
                .respuestaEsperadaExcluyente("SI")
                .build();

        preguntaTexto = PreguntaFiltroOferta.builder()
                .id(UUID.randomUUID())
                .oferta(oferta)
                .pregunta("¿Años de experiencia?")
                .tipoPregunta("TEXTO_CORTO")
                .respuestaEsperadaExcluyente("3")
                .build();
    }

    @Test
    void postularse_DebeGuardarYRetornarPostulacionCompatible_CuandoPreguntasFiltroCoinciden() {
        PostulacionSolicitudDto dto = PostulacionSolicitudDto.builder()
                .ofertaId(oferta.getId())
                .mensajePresentacion("Hola, me interesa")
                .cvUrlAdjunto("https://drive.google.com/file/d/12345/view")
                .respuestas(List.of(
                        RespuestaCandidatoSolicitudDto.builder()
                                .preguntaId(preguntaSiNo.getId())
                                .respuestaDada("SÍ") // Validación anti-errores acento
                                .build(),
                        RespuestaCandidatoSolicitudDto.builder()
                                .preguntaId(preguntaTexto.getId())
                                .respuestaDada("3")
                                .build()
                ))
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(candidato));
        when(ofertaRepository.findById(oferta.getId())).thenReturn(Optional.of(oferta));
        when(postulacionRepository.existsByOfertaIdAndCandidatoId(oferta.getId(), usuarioId)).thenReturn(false);
        when(preguntaRepository.findByOfertaId(oferta.getId())).thenReturn(List.of(preguntaSiNo, preguntaTexto));
        when(postulacionRepository.save(any(Postulacion.class))).thenAnswer(invocation -> {
            Postulacion p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            // Simular carga de IDs en respuestas
            p.getRespuestas().forEach(r -> r.setId(UUID.randomUUID()));
            return p;
        });

        PostulacionRespuestaDto respuesta = postularseUseCase.postularse(usuarioId, dto);

        assertNotNull(respuesta);
        assertNotNull(respuesta.getId());
        assertFalse(respuesta.isEsExcluido()); // Compatible!
        assertEquals("ENVIADO", respuesta.getEstado());
        assertEquals("Juan Pérez", respuesta.getCandidatoNombreCompleto());
        assertEquals(2, respuesta.getRespuestas().size());
        verify(postulacionRepository, times(1)).save(any(Postulacion.class));
    }

    @Test
    void postularse_DebeMarcarComoExcluido_CuandoAlgunaPreguntaNoCoincide() {
        PostulacionSolicitudDto dto = PostulacionSolicitudDto.builder()
                .ofertaId(oferta.getId())
                .respuestas(List.of(
                        RespuestaCandidatoSolicitudDto.builder()
                                .preguntaId(preguntaSiNo.getId())
                                .respuestaDada("NO") // Incompatible
                                .build(),
                        RespuestaCandidatoSolicitudDto.builder()
                                .preguntaId(preguntaTexto.getId())
                                .respuestaDada("3")
                                .build()
                ))
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(candidato));
        when(ofertaRepository.findById(oferta.getId())).thenReturn(Optional.of(oferta));
        when(postulacionRepository.existsByOfertaIdAndCandidatoId(oferta.getId(), usuarioId)).thenReturn(false);
        when(preguntaRepository.findByOfertaId(oferta.getId())).thenReturn(List.of(preguntaSiNo, preguntaTexto));
        when(postulacionRepository.save(any(Postulacion.class))).thenAnswer(invocation -> {
            Postulacion p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        PostulacionRespuestaDto respuesta = postularseUseCase.postularse(usuarioId, dto);

        assertNotNull(respuesta);
        assertTrue(respuesta.isEsExcluido()); // Excluido!
        verify(postulacionRepository, times(1)).save(any(Postulacion.class));
    }

    @Test
    void postularse_DebeLanzarExcepcion_CuandoFaltanRespuestas() {
        PostulacionSolicitudDto dto = PostulacionSolicitudDto.builder()
                .ofertaId(oferta.getId())
                .respuestas(List.of(
                        RespuestaCandidatoSolicitudDto.builder()
                                .preguntaId(preguntaSiNo.getId())
                                .respuestaDada("SI")
                                .build()
                        // Falta respuesta a la segunda pregunta
                ))
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(candidato));
        when(ofertaRepository.findById(oferta.getId())).thenReturn(Optional.of(oferta));
        when(preguntaRepository.findByOfertaId(oferta.getId())).thenReturn(List.of(preguntaSiNo, preguntaTexto));

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                postularseUseCase.postularse(usuarioId, dto)
        );

        assertEquals("Debe responder a todas las preguntas de filtro.", exception.getMessage());
        verify(postulacionRepository, never()).save(any(Postulacion.class));
    }

    @Test
    void postularse_DebeLanzarExcepcion_CuandoLinkGoogleDriveInvalido() {
        PostulacionSolicitudDto dto = PostulacionSolicitudDto.builder()
                .ofertaId(oferta.getId())
                .cvUrlAdjunto("https://otro-sitio.com/mi-cv.pdf")
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(candidato));
        when(ofertaRepository.findById(oferta.getId())).thenReturn(Optional.of(oferta));

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                postularseUseCase.postularse(usuarioId, dto)
        );

        assertEquals("El currículum adjunto debe ser un enlace válido de Google Drive.", exception.getMessage());
        verify(postulacionRepository, never()).save(any(Postulacion.class));
    }

    @Test
    void postularse_DebeLanzarExcepcion_CuandoYaSePostulo() {
        PostulacionSolicitudDto dto = PostulacionSolicitudDto.builder()
                .ofertaId(oferta.getId())
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(candidato));
        when(ofertaRepository.findById(oferta.getId())).thenReturn(Optional.of(oferta));
        when(postulacionRepository.existsByOfertaIdAndCandidatoId(oferta.getId(), usuarioId)).thenReturn(true);

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                postularseUseCase.postularse(usuarioId, dto)
        );

        assertEquals("Ya te has postulado a esta oferta de empleo.", exception.getMessage());
        verify(postulacionRepository, never()).save(any(Postulacion.class));
    }

    @Test
    void obtenerCurriculum_DebeRetornarPlantillaVacia_CuandoCVNoExiste() {
        when(cvRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());

        CurriculumNativoDto respuesta = gestionarCurriculumUseCase.obtenerPorUsuario(usuarioId);

        assertNotNull(respuesta);
        assertTrue(respuesta.getExperienciaLaboral().isEmpty());
        assertTrue(respuesta.getEducacion().isEmpty());
        assertTrue(respuesta.getHabilidades().isEmpty());
        assertNull(respuesta.getTitularProfesional());
    }

    @Test
    void guardarCurriculum_DebeGuardarExitosamente() {
        CurriculumNativoDto dto = CurriculumNativoDto.builder()
                .titularProfesional("Java Dev")
                .sobreMi("Soy proactivo")
                .experienciaLaboral(List.of(
                        ExperienciaLaboralDto.builder()
                                .empresa("Globant")
                                .puesto("SSr Dev")
                                .fechaInicio("2024-01-01")
                                .descripcion("Desarrollo Java")
                                .build()
                ))
                .educacion(List.of(
                        EducacionDto.builder()
                                .institucion("UTN")
                                .titulo("Ingeniero")
                                .fechaInicio("2018-03-01")
                                .completado(true)
                                .build()
                ))
                .habilidades(List.of(
                        HabilidadDto.builder()
                                .nombre("Spring Boot")
                                .nivel("Avanzado")
                                .build()
                ))
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(candidato));
        when(cvRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());
        when(cvRepository.save(any(CurriculumNativo.class))).thenAnswer(invocation -> {
            CurriculumNativo c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CurriculumNativoDto guardado = gestionarCurriculumUseCase.guardarOActualizar(usuarioId, dto);

        assertNotNull(guardado);
        assertEquals("Java Dev", guardado.getTitularProfesional());
        assertEquals(1, guardado.getExperienciaLaboral().size());
        assertEquals("Globant", guardado.getExperienciaLaboral().get(0).getEmpresa());
        assertEquals(1, guardado.getEducacion().size());
        assertEquals("UTN", guardado.getEducacion().get(0).getInstitucion());
        assertEquals(1, guardado.getHabilidades().size());
        assertEquals("Spring Boot", guardado.getHabilidades().get(0).getNombre());
        verify(cvRepository, times(1)).save(any(CurriculumNativo.class));
    }
}
