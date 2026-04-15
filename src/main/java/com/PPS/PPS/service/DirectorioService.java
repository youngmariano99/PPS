package com.PPS.PPS.service;

import com.PPS.PPS.dto.PerfilDetalleDto;
import com.PPS.PPS.dto.PerfilRespuestaDto;
import com.PPS.PPS.dto.PerfilSolicitudDto;
import com.PPS.PPS.entity.*;
import com.PPS.PPS.exception.RecursoNoEncontradoException;
import com.PPS.PPS.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.*;
import lombok.RequiredArgsConstructor;
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
public class DirectorioService {

    private final PerfilProveedorRepository proveedorRepository;
    private final PerfilEmpresaRepository empresaRepository;
    private final RubroRepository rubroRepository;
    private final UsuarioRepository usuarioRepository;
    private final SuscripcionUsuarioRepository suscripcionRepository;
    private final PortafolioRepository portafolioRepository; // Inyectado
    private final GeocodingService geocodingService;
    private final GeometryFactory geometryFactory;

    private static final Pattern VIDEO_PATTERN = Pattern.compile(
        "^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be|instagram\\.com|tiktok\\.com|drive\\.google\\.com)/.*$"
    );

    @Transactional
    public PerfilProveedor crearPerfilProveedor(UUID usuarioId, PerfilSolicitudDto dto) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        validarLimitesMultimedia(usuarioId, dto);

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
                .fotoPerfilUrl(dto.getFotoPerfilUrl()) // Foto Perfil Directa
                .descripcionProfesional(dto.getDescripcion())
                .pais(dto.getPais())
                .provincia(dto.getProvincia())
                .ciudad(dto.getCiudad())
                .calle(dto.getCalle())
                .numero(dto.getNumero())
                .codigoPostal(dto.getCodigoPostal())
                .ubicacion(punto)
                .build();

        perfil = proveedorRepository.save(perfil);
        guardarMultimediaEnPortafolio(dto, usuario, null); // Guardar galería
        return perfil;
    }

    @Transactional
    public PerfilEmpresa crearPerfilEmpresa(UUID usuarioId, PerfilSolicitudDto dto) {
        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        validarLimitesMultimedia(usuarioId, dto);

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
                .logoUrl(dto.getFotoPerfilUrl()) // Logo Directo
                .pais(dto.getPais())
                .provincia(dto.getProvincia())
                .ciudad(dto.getCiudad())
                .calle(dto.getCalle())
                .numero(dto.getNumero())
                .codigoPostal(dto.getCodigoPostal())
                .ubicacion(punto)
                .build();

        perfil = empresaRepository.save(perfil);
        guardarMultimediaEnPortafolio(dto, null, perfil); // Guardar galería
        return perfil;
    }

    private void validarLimitesMultimedia(UUID usuarioId, PerfilSolicitudDto dto) {
        boolean esPremium = suscripcionRepository.findByUsuarioIdAndEstado(usuarioId, "ACTIVA")
                .map(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium"))
                .orElse(false);

        int limiteFotos = esPremium ? 20 : 5;
        
        if (dto.getFotosPortafolioUrls() != null && dto.getFotosPortafolioUrls().size() > limiteFotos) {
            throw new ValidacionNegocioException("Ha superado el límite de fotos permitido (" + limiteFotos + ").");
        }

        if (dto.getVideoLinks() != null) {
            if (dto.getVideoLinks().size() > 3) {
                throw new ValidacionNegocioException("Solo se permiten un máximo de 3 enlaces de video.");
            }
            for (String link : dto.getVideoLinks()) {
                if (!VIDEO_PATTERN.matcher(link).matches()) {
                    throw new ValidacionNegocioException("Dominio de video no permitido.");
                }
            }
        }
    }

    private void guardarMultimediaEnPortafolio(PerfilSolicitudDto dto, Usuario u, PerfilEmpresa e) {
        List<Portafolio> items = new ArrayList<>();

        // Galería de Imágenes
        if (dto.getFotosPortafolioUrls() != null) {
            for (String url : dto.getFotosPortafolioUrls()) {
                items.add(Portafolio.builder()
                        .usuario(u)
                        .empresa(e)
                        .titulo("Imagen de Portafolio")
                        .urlRecurso(url)
                        .tipoRecurso("IMAGEN")
                        .build());
            }
        }

        // Links de Video
        if (dto.getVideoLinks() != null) {
            for (String url : dto.getVideoLinks()) {
                items.add(Portafolio.builder()
                        .usuario(u)
                        .empresa(e)
                        .titulo("Video de Presentación")
                        .urlRecurso(url)
                        .tipoRecurso("ENLACE")
                        .build());
            }
        }

        if (!items.isEmpty()) {
            portafolioRepository.saveAll(items);
        }
    }

    public List<PerfilRespuestaDto> buscarCercanos(double lat, double lon, double radioKm) {
        double radioMetros = radioKm * 1000;
        List<PerfilRespuestaDto> resultados = new ArrayList<>();

        resultados.addAll(proveedorRepository.buscarCercanos(lat, lon, radioMetros).stream()
                .map(p -> PerfilRespuestaDto.builder()
                        .id(p.getId())
                        .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                        .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre() : p.getRubroPersonalizado())
                        .descripcion(p.getDescripcionProfesional())
                        .ciudad(p.getCiudad())
                        .latitud(p.getUbicacion().getY())
                        .longitud(p.getUbicacion().getX())
                        .tipo("PROVEEDOR")
                        .build())
                .collect(Collectors.toList()));

        resultados.addAll(empresaRepository.buscarCercanos(lat, lon, radioMetros).stream()
                .map(e -> PerfilRespuestaDto.builder()
                        .id(e.getId())
                        .nombrePublico(e.getRazonSocial())
                        .rubro(e.getRubroPrincipal() != null ? e.getRubroPrincipal().getNombre() : e.getRubroPersonalizado())
                        .descripcion(e.getDescripcionEmpresa())
                        .ciudad(e.getCiudad())
                        .latitud(e.getUbicacion().getY())
                        .longitud(e.getUbicacion().getX())
                        .tipo("EMPRESA")
                        .build())
                .collect(Collectors.toList()));

        return resultados;
    }

    public PerfilDetalleDto obtenerDetalleProveedor(UUID id) {
        PerfilProveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor no encontrado"));
        
        boolean esPremium = suscripcionRepository.findByUsuarioIdAndEstado(p.getUsuario().getId(), "ACTIVA")
                .map(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium"))
                .orElse(false);

        List<Portafolio> multimedia;
        if (esPremium) {
            multimedia = portafolioRepository.findAllByUsuarioIdOrderByFechaCreacionDesc(p.getUsuario().getId());
        } else {
            // Si es gratis, solo traemos las 5 visibles más recientes
            multimedia = portafolioRepository.findVisibleByUsuarioId(p.getUsuario().getId(), org.springframework.data.domain.PageRequest.of(0, 5));
        }

        return PerfilDetalleDto.builder()
                .id(p.getId())
                .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre() : p.getRubroPersonalizado())
                .descripcion(p.getDescripcionProfesional())
                .fotoPerfilUrl(p.getFotoPerfilUrl())
                .ciudad(p.getCiudad())
                .provincia(p.getProvincia())
                .esPremium(esPremium)
                .fotosPortafolio(multimedia.stream()
                        .filter(m -> m.getTipoRecurso().equals("IMAGEN"))
                        .map(Portafolio::getUrlRecurso)
                        .collect(Collectors.toList()))
                .videoLinks(multimedia.stream()
                        .filter(m -> m.getTipoRecurso().equals("ENLACE"))
                        .map(Portafolio::getUrlRecurso)
                        .collect(Collectors.toList()))
                .build();
    }

    private Point obtenerPuntoDesdeDireccion(PerfilSolicitudDto dto) {
        String direccionFull = String.format("%s ,%d, %s, %s, %s",
                dto.getCalle(), dto.getNumero(), dto.getCiudad(), dto.getProvincia(), dto.getPais());
        double[] coords = geocodingService.obtenerCoordenadas(direccionFull);
        if (coords == null) {
            throw new ValidacionNegocioException("Geolocalización fallida.");
        }
        return geometryFactory.createPoint(new Coordinate(coords[0], coords[1]));
    }
}
