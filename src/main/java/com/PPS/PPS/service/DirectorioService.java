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
import lombok.extern.slf4j.Slf4j;
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

    private static final double MAX_RADIO_METROS = 50000.0;

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
    public org.springframework.data.domain.Page<PerfilRespuestaDto> buscarCercanosLista(double lat, double lon,
            double radioKm, String rubro, String q, int page, int size) {
        double radioMetros = radioKm * 1000;
        if (radioMetros > MAX_RADIO_METROS) {
            radioMetros = MAX_RADIO_METROS;
        }

        Point puntoUsuario = geometryFactory.createPoint(new Coordinate(lon, lat));

        // 1. Obtener todos los IDs cercanos ya ordenados por SQL (Premium > Distancia)
        // Si rubro es "todos", pasamos null para que no filtre por rubro
        String rubroFiltro = (rubro == null || rubro.equalsIgnoreCase("todos")) ? null : rubro;
        List<UUID> idsOrdenados = proveedorRepository.buscarIdsCercanosOrdenados(lat, lon, radioMetros, rubroFiltro, q);

        if (idsOrdenados.isEmpty()) {
            return new org.springframework.data.domain.PageImpl<>(new ArrayList<>(),
                    org.springframework.data.domain.PageRequest.of(page, size), 0);
        }

        // 2. Aplicar paginación a los IDs (esto es ultra eficiente)
        int totalElementos = idsOrdenados.size();
        int start = Math.min(page * size, totalElementos);
        int end = Math.min((page + 1) * size, totalElementos);

        if (start >= totalElementos) {
            return new org.springframework.data.domain.PageImpl<>(new ArrayList<>(),
                    org.springframework.data.domain.PageRequest.of(page, size), totalElementos);
        }

        List<UUID> idsPaginaActual = idsOrdenados.subList(start, end);

        // 3. Solo traemos las entidades completas de los 8 (o el 'size') IDs de la
        // página actual
        List<PerfilProveedor> proveedoresPagina = proveedorRepository.findByIdIn(idsPaginaActual);

        // Volver a ordenar proveedoresPagina para que coincida con el orden de
        // idsPaginaActual (findByIdIn no garantiza orden)
        java.util.Map<UUID, PerfilProveedor> mapaProveedores = proveedoresPagina.stream()
                .collect(Collectors.toMap(PerfilProveedor::getId, java.util.function.Function.identity()));

        List<PerfilProveedor> proveedoresOrdenados = idsPaginaActual.stream()
                .map(mapaProveedores::get)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        // 4. Batch Fetching de suscripciones solo para los de la página
        List<UUID> usuarioIds = proveedoresOrdenados.stream()
                .map(p -> p.getUsuario().getId())
                .collect(Collectors.toList());

        java.util.Set<UUID> usuariosPremiumIds = suscripcionRepository
                .findByUsuarioIdInAndEstado(usuarioIds, "ACTIVA").stream()
                .filter(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium") || 
                             s.getPlan().getNombre().equalsIgnoreCase("PRO"))
                .map(s -> s.getUsuario().getId())
                .collect(Collectors.toSet());

        // 5. Mapear a DTO
        List<PerfilRespuestaDto> dtoList = proveedoresOrdenados.stream()
                .map(p -> {
                    boolean esPremiumReal = usuariosPremiumIds.contains(p.getUsuario().getId());

                    // Calculamos la distancia en metros de forma más robusta
                    double distGrados = p.getUbicacion().distance(puntoUsuario);
                    double distancia = distGrados * 111319.9;

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
                            .promedioEstrellas(0.0)
                            .cantidadResenas(0)
                            .distanciaMetros((int) distancia)
                            .destacado(esPremiumReal)
                            .fotoPerfilUrl(p.getFotoPerfilUrl())
                            .especialidades(p.getEspecialidades())
                            .condicionesServicio(p.getCondicionesServicio())
                            .build();
                })
                .sorted((a, b) -> {
                    // Ranking: Premium (true) antes que no Premium (false)
                    if (a.isDestacado() != b.isDestacado()) {
                        return a.isDestacado() ? -1 : 1;
                    }
                    // Si ambos son iguales en premium, desempatar por distancia
                    int distA = a.getDistanciaMetros() != null ? a.getDistanciaMetros() : 999999;
                    int distB = b.getDistanciaMetros() != null ? b.getDistanciaMetros() : 999999;
                    return Integer.compare(distA, distB);
                })
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(
                dtoList,
                org.springframework.data.domain.PageRequest.of(page, size),
                totalElementos);
    }

    @Transactional(readOnly = true)
    public List<PerfilRespuestaDto> buscarCercanosMapa(double lat, double lon, double radioKm, String q) {
        double radioMetros = radioKm * 1000;
        if (radioMetros > MAX_RADIO_METROS) {
            radioMetros = MAX_RADIO_METROS;
        }
        List<PerfilRespuestaDto> resultados = new ArrayList<>();

        List<UUID> proveedorIds = proveedorRepository.buscarIdsCercanosOrdenados(lat, lon, radioMetros, null, q);
        List<PerfilProveedor> proveedoresCrudos = proveedorIds.isEmpty() ? new ArrayList<>()
                : proveedorRepository.findByIdIn(proveedorIds);

        resultados.addAll(proveedoresCrudos.stream()
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
                        .fotoPerfilUrl(p.getFotoPerfilUrl())
                        .especialidades(p.getEspecialidades())
                        .condicionesServicio(p.getCondicionesServicio())
                        .build())
                .collect(Collectors.toList()));

        List<UUID> empresaIds = empresaRepository.buscarIdsCercanosOrdenados(lat, lon, radioMetros);
        List<PerfilEmpresa> empresasCrudas = empresaIds.isEmpty() ? new ArrayList<>()
                : empresaRepository.findByIdIn(empresaIds);

        resultados.addAll(empresasCrudas.stream()
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
                        .fotoPerfilUrl(e.getLogoUrl())
                        .build())
                .collect(Collectors.toList()));

        return resultados;
    }

    public PerfilDetalleDto obtenerDetalleProveedor(UUID id) {
        log.info("Obteniendo detalle de proveedor para ID: {}", id);

        // Buscamos primero por usuario_id (el ID de Supabase que suele mandar el front)
        // Si no, buscamos por el ID propio del perfil (PK)
        PerfilProveedor p = proveedorRepository.findByUsuarioId(id)
                .orElseGet(() -> proveedorRepository.findById(id)
                        .orElseThrow(() -> {
                            log.error("Proveedor no encontrado para ID: {}", id);
                            return new RecursoNoEncontradoException("Proveedor no encontrado");
                        }));

        boolean esPremium = suscripcionRepository.findByUsuarioIdAndEstado(p.getUsuario().getId(), "ACTIVA")
                .map(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium"))
                .orElse(false);

        List<Portafolio> multimedia;
        if (esPremium) {
            multimedia = portafolioRepository.findAllByUsuarioIdOrderByFechaCreacionDesc(p.getUsuario().getId());
        } else {
            multimedia = portafolioRepository.findVisibleByUsuarioId(p.getUsuario().getId(),
                    org.springframework.data.domain.PageRequest.of(0, 5));
        }

        return PerfilDetalleDto.builder()
                .id(p.getId())
                .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre() : p.getRubroPersonalizado())
                .descripcion(p.getDescripcionProfesional())
                .fotoPerfilUrl(p.getFotoPerfilUrl())
                .ciudad(p.getCiudad())
                .provincia(p.getProvincia())
                .telefono(p.getUsuario().getTelefono())
                .matricula(p.getMatricula())
                .direccion(p.getCalle() + " " + p.getNumero())
                .instagramUrl(p.getInstagramUrl())
                .facebookUrl(p.getFacebookUrl())
                .linkedinUrl(p.getLinkedinUrl())
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
        log.info("Descubriendo perfil para usuario ID: {}", usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> {
                    log.error("Usuario con ID {} no encontrado en base de datos local", usuarioId);
                    return new RecursoNoEncontradoException("Usuario no encontrado");
                });

        boolean esProveedor = proveedorRepository.findByUsuarioId(usuarioId).isPresent();
        boolean esEmpresa = empresaRepository.findByUsuarioId(usuarioId).isPresent();

        String rol = esProveedor ? "PROVEEDOR" : (esEmpresa ? "EMPRESA" : "USUARIO");
        log.info("Usuario {} identificado con rol: {}", usuarioId, rol);

        return UsuarioPerfilDto.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(rol)
                .telefono(usuario.getTelefono())
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

        // Si hay cambio de dirección, re-geocodificar
        if (!perfil.getCalle().equals(dto.getCalle()) || !perfil.getNumero().equals(dto.getNumero()) ||
                !perfil.getCiudad().equals(dto.getCiudad())) {
            perfil.setCalle(dto.getCalle());
            perfil.setNumero(dto.getNumero());
            perfil.setCiudad(dto.getCiudad());
            perfil.setProvincia(dto.getProvincia());
            perfil.setPais(dto.getPais());
            perfil.setUbicacion(obtenerPuntoDesdeDireccion(dto));
        }

        // --- SOLUCIÓN AL PROBLEMA 2 ---
        // 1. Validar límites según el plan actual
        validarLimitesMultimedia(usuarioId, dto);

        // 2. Limpiar portafolio anterior para evitar duplicados (Problema 3)
        portafolioRepository.deleteByUsuarioId(usuarioId);

        // 3. Guardar el nuevo portafolio
        guardarMultimediaEnPortafolio(dto, perfil.getUsuario(), null);

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
}
