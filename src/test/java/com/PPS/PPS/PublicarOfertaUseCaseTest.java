package com.PPS.PPS;

import com.PPS.PPS.application.dto.request.CrearOfertaSolicitudDto;
import com.PPS.PPS.application.dto.request.PreguntaFiltroSolicitudDto;
import com.PPS.PPS.application.dto.response.OfertaRespuestaDto;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.domain.model.OfertaEmpleo;
import com.PPS.PPS.domain.model.PerfilEmpresa;
import com.PPS.PPS.domain.model.PerfilProveedor;
import com.PPS.PPS.domain.model.Usuario;
import com.PPS.PPS.domain.repository.OfertaEmpleoRepository;
import com.PPS.PPS.domain.repository.PerfilEmpresaRepository;
import com.PPS.PPS.domain.repository.PerfilProveedorRepository;
import com.PPS.PPS.service.PublicarOfertaUseCaseImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicarOfertaUseCaseTest {

    @Mock
    private OfertaEmpleoRepository ofertaRepository;

    @Mock
    private PerfilProveedorRepository proveedorRepository;

    @Mock
    private PerfilEmpresaRepository empresaRepository;

    @InjectMocks
    private PublicarOfertaUseCaseImpl publicarOfertaUseCase;

    private UUID usuarioId;
    private Usuario usuario;
    private PerfilEmpresa empresa;
    private PerfilProveedor proveedor;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        usuario = Usuario.builder()
                .id(usuarioId)
                .nombre("Mariano")
                .apellido("Gomez")
                .email("mariano@example.com")
                .build();

        empresa = PerfilEmpresa.builder()
                .id(UUID.randomUUID())
                .usuario(usuario)
                .razonSocial("Tech Chamba")
                .cuit("20-12345678-9")
                .activo(true)
                .build();

        proveedor = PerfilProveedor.builder()
                .id(UUID.randomUUID())
                .usuario(usuario)
                .dni("12.345.678")
                .activo(true)
                .build();
    }

    @Test
    void publicar_DebeGuardarYRetornarOferta_CuandoPerfilEmpresaEsValido() {
        CrearOfertaSolicitudDto dto = CrearOfertaSolicitudDto.builder()
                .empresaId(empresa.getId())
                .titulo("Desarrollador Spring Boot")
                .descripcion("Buscamos programador backend")
                .modalidad("REMOTO")
                .salarioMin(BigDecimal.valueOf(1000))
                .salarioMax(BigDecimal.valueOf(2000))
                .habilidadesClave(List.of("Java", "Spring"))
                .preguntasFiltro(List.of(
                        PreguntaFiltroSolicitudDto.builder()
                                .pregunta("¿Tiene más de 2 años de experiencia?")
                                .tipoPregunta("SI_NO")
                                .respuestaEsperadaExcluyente("SI")
                                .build()
                ))
                .build();

        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));
        when(ofertaRepository.save(any(OfertaEmpleo.class))).thenAnswer(invocation -> {
            OfertaEmpleo o = invocation.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        OfertaRespuestaDto respuesta = publicarOfertaUseCase.publicar(usuarioId, dto);

        assertNotNull(respuesta);
        assertNotNull(respuesta.getId());
        assertEquals("Desarrollador Spring Boot", respuesta.getTitulo());
        assertEquals(empresa.getId(), respuesta.getEmpresaId());
        assertEquals("Tech Chamba", respuesta.getEmpresaRazonSocial());
        assertEquals(1, respuesta.getPreguntasFiltro().size());
        assertEquals("SI", respuesta.getPreguntasFiltro().get(0).getRespuestaEsperadaExcluyente());
        verify(ofertaRepository, times(1)).save(any(OfertaEmpleo.class));
    }

    @Test
    void publicar_DebeLanzarExcepcion_CuandoNoSeAsociaAPerfil() {
        CrearOfertaSolicitudDto dto = CrearOfertaSolicitudDto.builder()
                .titulo("Título")
                .descripcion("Descripción")
                .modalidad("REMOTO")
                .build();

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                publicarOfertaUseCase.publicar(usuarioId, dto)
        );

        assertEquals("Debe asociar la oferta a un perfil (Proveedor o Empresa).", exception.getMessage());
        verify(ofertaRepository, never()).save(any(OfertaEmpleo.class));
    }

    @Test
    void publicar_DebeLanzarExcepcion_CuandoSeAsociaAAmbosPerfiles() {
        CrearOfertaSolicitudDto dto = CrearOfertaSolicitudDto.builder()
                .empresaId(UUID.randomUUID())
                .proveedorId(UUID.randomUUID())
                .titulo("Título")
                .descripcion("Descripción")
                .modalidad("REMOTO")
                .build();

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                publicarOfertaUseCase.publicar(usuarioId, dto)
        );

        assertEquals("No se puede asociar la oferta a ambos perfiles simultáneamente.", exception.getMessage());
        verify(ofertaRepository, never()).save(any(OfertaEmpleo.class));
    }

    @Test
    void publicar_DebeLanzarExcepcion_CuandoSalarioMinEsMayorQueMax() {
        CrearOfertaSolicitudDto dto = CrearOfertaSolicitudDto.builder()
                .empresaId(empresa.getId())
                .titulo("Título")
                .descripcion("Descripción")
                .modalidad("REMOTO")
                .salarioMin(BigDecimal.valueOf(5000))
                .salarioMax(BigDecimal.valueOf(2000))
                .build();

        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                publicarOfertaUseCase.publicar(usuarioId, dto)
        );

        assertEquals("El salario mínimo no puede ser mayor que el salario máximo.", exception.getMessage());
        verify(ofertaRepository, never()).save(any(OfertaEmpleo.class));
    }

    @Test
    void publicar_DebeLanzarExcepcion_CuandoPreguntaSiNoTieneRespuestaEsperadaInvalida() {
        CrearOfertaSolicitudDto dto = CrearOfertaSolicitudDto.builder()
                .empresaId(empresa.getId())
                .titulo("Título")
                .descripcion("Descripción")
                .modalidad("REMOTO")
                .preguntasFiltro(List.of(
                        PreguntaFiltroSolicitudDto.builder()
                                .pregunta("¿Pregunta?")
                                .tipoPregunta("SI_NO")
                                .respuestaEsperadaExcluyente("TAL_VEZ")
                                .build()
                ))
                .build();

        when(empresaRepository.findById(empresa.getId())).thenReturn(Optional.of(empresa));

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                publicarOfertaUseCase.publicar(usuarioId, dto)
        );

        assertEquals("La respuesta esperada para una pregunta SI_NO debe ser SI o NO.", exception.getMessage());
        verify(ofertaRepository, never()).save(any(OfertaEmpleo.class));
    }

    @Test
    void eliminarLogico_DebeMarcarComoInactiva_CuandoUsuarioEsDueño() {
        UUID ofertaId = UUID.randomUUID();
        OfertaEmpleo oferta = OfertaEmpleo.builder()
                .id(ofertaId)
                .empresa(empresa)
                .titulo("Oferta")
                .descripcion("Desc")
                .modalidad("REMOTO")
                .activa(true)
                .build();

        when(ofertaRepository.findById(ofertaId)).thenReturn(Optional.of(oferta));

        publicarOfertaUseCase.eliminarLogico(usuarioId, ofertaId);

        assertFalse(oferta.isActiva());
        verify(ofertaRepository, times(1)).save(oferta);
    }

    @Test
    void eliminarLogico_DebeLanzarExcepcion_CuandoUsuarioNoEsDueño() {
        UUID ofertaId = UUID.randomUUID();
        UUID otroUsuarioId = UUID.randomUUID();
        OfertaEmpleo oferta = OfertaEmpleo.builder()
                .id(ofertaId)
                .empresa(empresa) // Pertenece a usuarioId
                .titulo("Oferta")
                .descripcion("Desc")
                .modalidad("REMOTO")
                .activa(true)
                .build();

        when(ofertaRepository.findById(ofertaId)).thenReturn(Optional.of(oferta));

        ValidacionNegocioException exception = assertThrows(ValidacionNegocioException.class, () ->
                publicarOfertaUseCase.eliminarLogico(otroUsuarioId, ofertaId)
        );

        assertEquals("No está autorizado a eliminar esta oferta de empleo.", exception.getMessage());
        verify(ofertaRepository, never()).save(any(OfertaEmpleo.class));
    }
}
