package com.PPS.PPS.service;

import com.PPS.PPS.dto.PerfilDetalleDto;
import com.PPS.PPS.dto.PerfilRespuestaDto;
import com.PPS.PPS.dto.PerfilSolicitudDto;
import com.PPS.PPS.dto.ResenaDetalleDto;
import com.PPS.PPS.dto.UsuarioPerfilDto;
import com.PPS.PPS.entity.*;
import com.PPS.PPS.exception.RecursoNoEncontradoException;
import com.PPS.PPS.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.PPS.PPS.application.usecase.IGestionarPerfilProfesionalUseCase;
import com.PPS.PPS.application.usecase.IValidarMultimediaUseCase;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GestionarPerfilProfesionalUseCaseImpl implements IGestionarPerfilProfesionalUseCase {

    private final PerfilProveedorRepository proveedorRepository;
    private final PerfilEmpresaRepository empresaRepository;
    private final RubroRepository rubroRepository;
    private final UsuarioRepository usuarioRepository;
    private final SuscripcionUsuarioRepository suscripcionRepository;
    private final PortafolioRepository portafolioRepository;
    private final ResenaRepository resenaRepository;
    private final GeocodingService geocodingService;
    private final GeometryFactory geometryFactory;
    private final IValidarMultimediaUseCase validarMultimediaUseCase;

    @Transactional
    public PerfilProveedor crearPerfilProveedor(UUID usuarioId, PerfilSolicitudDto dto) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        validarMultimediaUseCase.validarLimitesMultimedia(usuarioId, dto);

        Rubro rubro = null;
        if (dto.getRubroId() != null) {
            rubro = rubroRepository.findById(dto.getRubroId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Rubro no encontrado"));
        } else if (dto.getRubroPersonalizado() == null || dto.getRubroPersonalizado().isBlank()) {
            throw new ValidacionNegocioException("Debe seleccionar un rubro o ingresar uno personalizado.");
        }

        Point punto = obtenerPuntoDesdeDireccion(dto);

        PerfilProveedor perfil = PerfilProveedor.builder()
                .usuario(usuario)
                .rubroPrincipal(rubro)
                .rubroPersonalizado(dto.getRubroPersonalizado())
                .dni(dto.getDni())
                .matricula(dto.getMatricula())
                .cvUrlPdf(dto.getCvUrlPdf())
                .fotoPerfilUrl(dto.getFotoPerfilUrl())
                .descripcionProfesional(dto.getDescripcion())
                .pais(dto.getPais())
                .provincia(dto.getProvincia())
                .ciudad(dto.getCiudad())
                .calle(dto.getCalle())
                .numero(dto.getNumero())
                .codigoPostal(dto.getCodigoPostal())
                .ubicacion(punto)
                .build();

        PerfilProveedor guardado = proveedorRepository.save(perfil);
        validarMultimediaUseCase.guardarMultimediaEnPortafolio(dto, usuario, null);
        return Objects.requireNonNull(guardado);
    }

    @Transactional
    public PerfilEmpresa crearPerfilEmpresa(UUID usuarioId, PerfilSolicitudDto dto) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        validarMultimediaUseCase.validarLimitesMultimedia(usuarioId, dto);

        Rubro rubro = null;
        if (dto.getRubroId() != null) {
            rubro = rubroRepository.findById(dto.getRubroId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Rubro no encontrado"));
        } else if (dto.getRubroPersonalizado() == null || dto.getRubroPersonalizado().isBlank()) {
            throw new ValidacionNegocioException("Debe seleccionar un rubro o ingresar uno personalizado.");
        }

        Point punto = obtenerPuntoDesdeDireccion(dto);

        PerfilEmpresa perfil = PerfilEmpresa.builder()
                .usuario(usuario)
                .rubroPrincipal(rubro)
                .rubroPersonalizado(dto.getRubroPersonalizado())
                .razonSocial(dto.getRazonSocial())
                .cuit(dto.getCuit())
                .descripcionEmpresa(dto.getDescripcion())
                .logoUrl(dto.getFotoPerfilUrl())
                .pais(dto.getPais())
                .provincia(dto.getProvincia())
                .ciudad(dto.getCiudad())
                .calle(dto.getCalle())
                .numero(dto.getNumero())
                .codigoPostal(dto.getCodigoPostal())
                .ubicacion(punto)
                .build();

        PerfilEmpresa guardado = empresaRepository.save(perfil);
        validarMultimediaUseCase.guardarMultimediaEnPortafolio(dto, null, guardado);
        return Objects.requireNonNull(guardado);
    }

    private Point obtenerPuntoDesdeDireccion(PerfilSolicitudDto dto) {
        String direccionFull = String.format("%s %d, %s, %s, %s",
                dto.getCalle(), dto.getNumero(), dto.getCiudad(), dto.getProvincia(), dto.getPais());
        double[] coords = geocodingService.obtenerCoordenadas(direccionFull);
        if (coords == null) {
            throw new ValidacionNegocioException("Geolocalización fallida.");
        }
        return geometryFactory.createPoint(new Coordinate(coords[0], coords[1]));
    }

    @Transactional
    public void actualizarPerfilProveedor(UUID usuarioId, PerfilSolicitudDto dto) {
        log.info("Actualizando perfil profesional para usuario: {}", usuarioId);

        PerfilProveedor perfil = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Perfil profesional no encontrado"));

        // Actualizar datos profesionales
        perfil.setDescripcionProfesional(dto.getDescripcion());
        perfil.setMatricula(dto.getMatricula());
        perfil.setFotoPerfilUrl(dto.getFotoPerfilUrl());
        perfil.setInstagramUrl(dto.getInstagramUrl());
        perfil.setFacebookUrl(dto.getFacebookUrl());
        perfil.setLinkedinUrl(dto.getLinkedinUrl());
        perfil.setEspecialidades(dto.getEspecialidades());
        perfil.setCondicionesServicio(dto.getCondicionesServicio());

        // Siempre actualizar los campos de texto de dirección
        perfil.setCalle(dto.getCalle());
        perfil.setNumero(dto.getNumero());
        perfil.setCiudad(dto.getCiudad());
        perfil.setProvincia(dto.getProvincia());
        perfil.setPais(dto.getPais());
        perfil.setCodigoPostal(dto.getCodigoPostal());

        // Re-geocodificar siempre para asegurar precisión tras los cambios en GeocodingService
        // O al menos si hay cualquier cambio en los campos de ubicación
        perfil.setUbicacion(obtenerPuntoDesdeDireccion(dto));

        // --- SOLUCIÓN AL PROBLEMA 2 ---
        // 1. Validar límites según el plan actual
        validarMultimediaUseCase.validarLimitesMultimedia(usuarioId, dto);

        // 2. Limpiar portafolio anterior para evitar duplicados (Problema 3)
        portafolioRepository.deleteByUsuarioId(usuarioId);

        // 3. Guardar el nuevo portafolio
        validarMultimediaUseCase.guardarMultimediaEnPortafolio(dto, perfil.getUsuario(), null);

        proveedorRepository.save(perfil);
    }

    @Transactional
    public void actualizarUsuario(UUID id, UsuarioPerfilDto dto) {
        log.info("Actualizando datos personales del usuario: {}", id);
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (dto.getNombre() != null)
            usuario.setNombre(dto.getNombre());
        if (dto.getApellido() != null)
            usuario.setApellido(dto.getApellido());
        if (dto.getTelefono() != null)
            usuario.setTelefono(dto.getTelefono());

        usuarioRepository.save(usuario);
    }
    public double[] geocodificarDireccion(String direccion) {
        return geocodingService.obtenerCoordenadas(direccion);
    }
}
