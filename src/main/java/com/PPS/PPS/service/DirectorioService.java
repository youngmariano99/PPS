package com.PPS.PPS.service;

import com.PPS.PPS.dto.PerfilDetalleDto;
import com.PPS.PPS.dto.PerfilRespuestaDto;
import com.PPS.PPS.dto.PerfilSolicitudDto;
import com.PPS.PPS.dto.UsuarioPerfilDto;
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
    private final PortafolioRepository portafolioRepository;
    private final GeocodingService geocodingService;
    private final GeometryFactory geometryFactory;

    private static final Pattern VIDEO_PATTERN = Pattern.compile(
            "^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be|instagram\\.com|tiktok\\.com|drive\\.google\\.com)/.*$");

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
        guardarMultimediaEnPortafolio(dto, usuario, null);
        return Objects.requireNonNull(guardado);
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
        guardarMultimediaEnPortafolio(dto, null, guardado);
        return Objects.requireNonNull(guardado);
    }

    private void validarLimitesMultimedia(UUID usuarioId, PerfilSolicitudDto dto) {
        boolean esPremium = suscripcionRepository.findByUsuarioIdAndEstado(Objects.requireNonNull(usuarioId), "ACTIVA")
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
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<PerfilRespuestaDto> buscarCercanosLista(double lat, double lon, double radioKm, int page, int size) {
        double radioMetros = radioKm * 1000;
        List<PerfilRespuestaDto> resultados = new ArrayList<>();

        resultados.addAll(proveedorRepository.buscarCercanos(lat, lon, radioMetros).stream()
                .map(p -> {
                    boolean tieneSuscripcionActiva = suscripcionRepository
                            .findByUsuarioIdAndEstado(p.getUsuario().getId(), "ACTIVA").isPresent();

                    return PerfilRespuestaDto.builder()
                        .id(p.getId())
                        .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                        .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre()
                                : p.getRubroPersonalizado())
                        .descripcion(p.getDescripcionProfesional())
                        .ciudad(p.getCiudad())
                        .latitud(p.getUbicacion().getY())
                        .longitud(p.getUbicacion().getX())
                        .tipo("PROVEEDOR")
                        .perfilCompleto(p.getFotoPerfilUrl() != null && !p.getFotoPerfilUrl().isEmpty())
                        .promedioEstrellas(0.0) // TODO: Mapear cuando ResenaRepository esté disponible
                        .cantidadResenas(0) // TODO: Mapear cuando ResenaRepository esté disponible
                        .destacado(tieneSuscripcionActiva)
                        .build();
                })
                .collect(Collectors.toList()));

        // Las Empresas quedan omitidas temporalmente ("solo traiga proveedores")

        java.util.Comparator<PerfilRespuestaDto> rankingCriterio = java.util.Comparator
                .comparing(PerfilRespuestaDto::isDestacado).reversed()
                .thenComparing(PerfilRespuestaDto::isPerfilCompleto).reversed()
                .thenComparing(java.util.Comparator.comparingDouble(PerfilRespuestaDto::getPromedioEstrellas).reversed())
                .thenComparing(java.util.Comparator.comparingInt(PerfilRespuestaDto::getCantidadResenas).reversed());

        List<PerfilRespuestaDto> sortedResultados = resultados.stream()
                .sorted(rankingCriterio)
                .collect(Collectors.toList());

        // Paginación en Memoria
        int start = Math.min(page * size, sortedResultados.size());
        int end = Math.min((page + 1) * size, sortedResultados.size());
        List<PerfilRespuestaDto> paginatedList = sortedResultados.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(
                paginatedList, 
                org.springframework.data.domain.PageRequest.of(page, size), 
                sortedResultados.size()
        );
    }

    @Transactional(readOnly = true)
    public List<PerfilRespuestaDto> buscarCercanosMapa(double lat, double lon, double radioKm) {
        double radioMetros = radioKm * 1000;
        List<PerfilRespuestaDto> resultados = new ArrayList<>();

        resultados.addAll(proveedorRepository.buscarCercanos(lat, lon, radioMetros).stream()
                .map(p -> PerfilRespuestaDto.builder()
                        .id(p.getId())
                        .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                        .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre()
                                : p.getRubroPersonalizado())
                        .descripcion(p.getDescripcionProfesional())
                        .ciudad(p.getCiudad())
                        .latitud(p.getUbicacion().getY())
                        .longitud(p.getUbicacion().getX())
                        .tipo("PROVEEDOR")
                        .perfilCompleto(p.getFotoPerfilUrl() != null && !p.getFotoPerfilUrl().isEmpty())
                        .promedioEstrellas(0.0) 
                        .cantidadResenas(0) 
                        .destacado(false) // Optimizado para mapa masivo
                        .build())
                .collect(Collectors.toList()));

        resultados.addAll(empresaRepository.buscarCercanos(lat, lon, radioMetros).stream()
                .map(e -> PerfilRespuestaDto.builder()
                        .id(e.getId())
                        .nombrePublico(e.getRazonSocial())
                        .rubro(e.getRubroPrincipal() != null ? e.getRubroPrincipal().getNombre()
                                : e.getRubroPersonalizado())
                        .descripcion(e.getDescripcionEmpresa())
                        .ciudad(e.getCiudad())
                        .latitud(e.getUbicacion().getY())
                        .longitud(e.getUbicacion().getX())
                        .tipo("EMPRESA")
                        .perfilCompleto(e.getLogoUrl() != null && !e.getLogoUrl().isEmpty())
                        .promedioEstrellas(0.0)
                        .cantidadResenas(0)
                        .destacado(false)
                        .build())
                .collect(Collectors.toList()));

        return resultados;
    }

    public PerfilDetalleDto obtenerDetalleProveedor(UUID id) {
        PerfilProveedor p = proveedorRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor no encontrado"));
        
        boolean esPremium = suscripcionRepository.findByUsuarioIdAndEstado(p.getUsuario().getId(), "ACTIVA")
                .map(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium"))
                .orElse(false);

        List<Portafolio> multimedia;
        if (esPremium) {
            multimedia = portafolioRepository.findAllByUsuarioIdOrderByFechaCreacionDesc(p.getUsuario().getId());
        } else {
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

    public UsuarioPerfilDto obtenerPerfilUsuario(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        boolean esProveedor = proveedorRepository.findByUsuarioId(usuarioId).isPresent();
        boolean esEmpresa = empresaRepository.findByUsuarioId(usuarioId).isPresent();

        return UsuarioPerfilDto.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(esProveedor ? "PROVEEDOR" : (esEmpresa ? "EMPRESA" : "USUARIO"))
                .fechaRegistro(usuario.getFechaCreacion() != null ? usuario.getFechaCreacion().toString() : "Reciente")
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
