package com.PPS.PPS;

import com.PPS.PPS.application.dto.request.DescartarPostulacionSolicitudDto;
import com.PPS.PPS.application.dto.response.PostulacionRespuestaDto;
import com.PPS.PPS.application.event.PostulacionEstadoChangeEvent;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.domain.model.*;
import com.PPS.PPS.domain.repository.NotificacionRepository;
import com.PPS.PPS.domain.repository.PostulacionRepository;
import com.PPS.PPS.domain.repository.UsuarioRepository;
import com.PPS.PPS.service.GestionarPostulacionesEmpresaUseCaseImpl;
import com.PPS.PPS.service.NotificacionEventListener;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GestionarPostulacionesEmpresaUseCaseTest {

    @Mock
    private PostulacionRepository postulacionRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private GestionarPostulacionesEmpresaUseCaseImpl gestionarPostulacionesUseCase;

    @InjectMocks
    private NotificacionEventListener notificacionEventListener;

    private UUID reclutadorId;
    private Usuario reclutador;
    private Usuario candidato;
    private PerfilEmpresa empresa;
    private OfertaEmpleo oferta;
    private Postulacion postulacion;

    @BeforeEach
    void setUp() {
        reclutadorId = UUID.randomUUID();
        reclutador = Usuario.builder()
                .id(reclutadorId)
                .nombre("Mariano")
                .apellido("Gomez")
                .build();

        candidato = Usuario.builder()
                .id(UUID.randomUUID())
                .nombre("Juan")
                .apellido("Pérez")
                .email("juan@example.com")
                .build();

        empresa = PerfilEmpresa.builder()
                .id(UUID.randomUUID())
                .usuario(reclutador)
                .razonSocial("Tech Corp")
                .build();

        oferta = OfertaEmpleo.builder()
                .id(UUID.randomUUID())
                .empresa(empresa)
                .titulo("Java Dev")
                .activa(true)
                .build();

        postulacion = Postulacion.builder()
                .id(UUID.randomUUID())
                .oferta(oferta)
                .candidato(candidato)
                .estado("ENVIADO")
                .build();
    }

    @Test
    void obtenerPostulacionParaReclutador_DebeCambiarEstadoAVisto_CuandoEstaEnviado() {
        when(postulacionRepository.findById(postulacion.getId())).thenReturn(Optional.of(postulacion));
        when(postulacionRepository.save(any(Postulacion.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PostulacionRespuestaDto respuesta = gestionarPostulacionesUseCase.obtenerPostulacionParaReclutador(reclutadorId, postulacion.getId());

        assertNotNull(respuesta);
        assertEquals("VISTO", respuesta.getEstado());
        verify(postulacionRepository, times(1)).save(postulacion);
        verify(eventPublisher, times(1)).publishEvent(any(PostulacionEstadoChangeEvent.class));
    }

    @Test
    void obtenerPostulacionParaReclutador_NoDebeCambiarEstado_CuandoYaEstaVisto() {
        postulacion.setEstado("VISTO");
        when(postulacionRepository.findById(postulacion.getId())).thenReturn(Optional.of(postulacion));

        PostulacionRespuestaDto respuesta = gestionarPostulacionesUseCase.obtenerPostulacionParaReclutador(reclutadorId, postulacion.getId());

        assertNotNull(respuesta);
        assertEquals("VISTO", respuesta.getEstado());
        verify(postulacionRepository, never()).save(any(Postulacion.class));
        verify(eventPublisher, never()).publishEvent(any(PostulacionEstadoChangeEvent.class));
    }

    @Test
    void obtenerPostulacionParaReclutador_DebeLanzarExcepcion_CuandoUsuarioNoEsDueño() {
        UUID otroUsuarioId = UUID.randomUUID();
        when(postulacionRepository.findById(postulacion.getId())).thenReturn(Optional.of(postulacion));

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                gestionarPostulacionesUseCase.obtenerPostulacionParaReclutador(otroUsuarioId, postulacion.getId())
        );

        assertEquals("No está autorizado a gestionar postulaciones para esta oferta.", exception.getMessage());
        verify(postulacionRepository, never()).save(any(Postulacion.class));
    }

    @Test
    void descartarPostulacion_DebeCambiarEstadoADescartadoYAsignarMotivo_CuandoDatosSonValidos() {
        DescartarPostulacionSolicitudDto dto = DescartarPostulacionSolicitudDto.builder()
                .motivoRechazoCodigo("EXPECTATIVA_SALARIAL")
                .feedbackAdicional("Salario pretendido fuera de rango")
                .build();

        when(postulacionRepository.findById(postulacion.getId())).thenReturn(Optional.of(postulacion));
        when(postulacionRepository.save(any(Postulacion.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PostulacionRespuestaDto respuesta = gestionarPostulacionesUseCase.descartarPostulacion(reclutadorId, postulacion.getId(), dto);

        assertNotNull(respuesta);
        assertEquals("DESCARTADO", respuesta.getEstado());
        assertEquals("EXPECTATIVA_SALARIAL", respuesta.getMotivoRechazoCodigo());
        assertEquals("Salario pretendido fuera de rango", respuesta.getFeedbackAdicional());
        verify(postulacionRepository, times(1)).save(postulacion);
        verify(eventPublisher, times(1)).publishEvent(any(PostulacionEstadoChangeEvent.class));
    }

    @Test
    void descartarPostulacion_DebeLanzarExcepcion_CuandoMotivoEsNulo() {
        DescartarPostulacionSolicitudDto dto = DescartarPostulacionSolicitudDto.builder()
                .motivoRechazoCodigo("")
                .build();

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                gestionarPostulacionesUseCase.descartarPostulacion(reclutadorId, postulacion.getId(), dto)
        );

        assertEquals("El código de motivo de rechazo es obligatorio para descartar un postulante.", exception.getMessage());
        verify(postulacionRepository, never()).save(any(Postulacion.class));
    }

    @Test
    void handlePostulacionEstadoChange_DebeRegistrarNotificacionFisica_CuandoCambiaEstado() {
        PostulacionEstadoChangeEvent event = PostulacionEstadoChangeEvent.builder()
                .destinatarioId(candidato.getId())
                .postulacionId(postulacion.getId())
                .ofertaId(oferta.getId())
                .ofertaTitulo("Java Dev")
                .nuevoEstado("DESCARTADO")
                .motivoRechazoCodigo("EXPECTATIVA_SALARIAL")
                .build();

        when(usuarioRepository.findById(candidato.getId())).thenReturn(Optional.of(candidato));

        notificacionEventListener.handlePostulacionEstadoChange(event);

        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository, times(1)).save(captor.capture());

        Notificacion notifGuardada = captor.getValue();
        assertNotNull(notifGuardada);
        assertEquals(candidato.getId(), notifGuardada.getUsuario().getId());
        assertEquals("CAMBIO_ESTADO_POSTULACION", notifGuardada.getTipoNotificacion());
        assertTrue(notifGuardada.getMensaje().contains("Java Dev"));
        assertTrue(notifGuardada.getMensaje().contains("EXPECTATIVA_SALARIAL"));
        assertFalse(notifGuardada.isLeida());
    }
}
