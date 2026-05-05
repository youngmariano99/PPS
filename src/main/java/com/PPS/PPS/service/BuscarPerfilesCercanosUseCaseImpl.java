package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IBuscarPerfilesCercanosUseCase;
import com.PPS.PPS.application.dto.PerfilRespuestaDto;
import com.PPS.PPS.entity.PerfilEmpresa;
import com.PPS.PPS.entity.PerfilProveedor;
import com.PPS.PPS.repository.PerfilEmpresaRepository;
import com.PPS.PPS.repository.PerfilProveedorRepository;
import com.PPS.PPS.repository.ResenaRepository;
import com.PPS.PPS.repository.SuscripcionUsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BuscarPerfilesCercanosUseCaseImpl implements IBuscarPerfilesCercanosUseCase {

    private final PerfilProveedorRepository proveedorRepository;
    private final PerfilEmpresaRepository empresaRepository;
    private final SuscripcionUsuarioRepository suscripcionRepository;
    private final ResenaRepository resenaRepository;
    private final GeometryFactory geometryFactory;

    private static final double MAX_RADIO_METROS = 50000.0;

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<PerfilRespuestaDto> buscarCercanosLista(double lat, double lon,
            double radioKm, String rubro, String q, int page, int size) {
        double radioMetros = radioKm * 1000;
        if (radioMetros > MAX_RADIO_METROS) {
            radioMetros = MAX_RADIO_METROS;
        }

        Point puntoUsuario = geometryFactory.createPoint(new Coordinate(lon, lat));

        String rubroFiltro = (rubro == null || rubro.equalsIgnoreCase("todos")) ? null : rubro;
        List<UUID> idsOrdenados = proveedorRepository.buscarIdsCercanosOrdenados(lat, lon, radioMetros, rubroFiltro, q);

        if (idsOrdenados.isEmpty()) {
            return new org.springframework.data.domain.PageImpl<>(new ArrayList<>(),
                    org.springframework.data.domain.PageRequest.of(page, size), 0);
        }

        int totalElementos = idsOrdenados.size();
        int start = Math.min(page * size, totalElementos);
        int end = Math.min((page + 1) * size, totalElementos);

        if (start >= totalElementos) {
            return new org.springframework.data.domain.PageImpl<>(new ArrayList<>(),
                    org.springframework.data.domain.PageRequest.of(page, size), totalElementos);
        }

        List<UUID> idsPaginaActual = idsOrdenados.subList(start, end);

        List<PerfilProveedor> proveedoresPagina = proveedorRepository.findByIdIn(idsPaginaActual);

        java.util.Map<UUID, PerfilProveedor> mapaProveedores = proveedoresPagina.stream()
                .collect(Collectors.toMap(PerfilProveedor::getId, java.util.function.Function.identity()));

        List<PerfilProveedor> proveedoresOrdenados = idsPaginaActual.stream()
                .map(mapaProveedores::get)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        List<UUID> usuarioIds = proveedoresOrdenados.stream()
                .map(p -> p.getUsuario().getId())
                .collect(Collectors.toList());

        List<UUID> perfilIds = proveedoresOrdenados.stream()
                .map(PerfilProveedor::getId)
                .collect(Collectors.toList());

        java.util.Set<UUID> usuariosPremiumIds = suscripcionRepository
                .findByUsuarioIdInAndEstado(usuarioIds, "ACTIVA").stream()
                .filter(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium") || 
                             s.getPlan().getNombre().equalsIgnoreCase("PRO"))
                .map(s -> s.getUsuario().getId())
                .collect(Collectors.toSet());

        java.util.Map<UUID, Double> promedios = new java.util.HashMap<>();
        java.util.Map<UUID, Integer> conteos = new java.util.HashMap<>();
        
        if (!perfilIds.isEmpty()) {
            List<Object[]> stats = resenaRepository.findAveragesAndCountsByPropietarioIds(perfilIds);
            for (Object[] row : stats) {
                UUID pid = (UUID) row[0];
                Double avg = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                promedios.put(pid, avg);
                conteos.put(pid, count.intValue());
            }
        }

        List<PerfilRespuestaDto> dtoList = proveedoresOrdenados.stream()
                .map(p -> {
                    boolean esPremiumReal = usuariosPremiumIds.contains(p.getUsuario().getId());
                    Double promedioReal = promedios.getOrDefault(p.getId(), 0.0);
                    Integer cantidadReal = conteos.getOrDefault(p.getId(), 0);

                    double distGrados = p.getUbicacion().distance(puntoUsuario);
                    double distancia = distGrados * 111319.9;

                    return PerfilRespuestaDto.builder()
                            .id(p.getId())
                            .slug(p.getSlug())
                            .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                            .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre()
                                    : p.getRubroPersonalizado())
                            .descripcion(p.getDescripcionProfesional())
                            .ciudad(p.getCiudad())
                            .latitud(p.getUbicacion().getY())
                            .longitud(p.getUbicacion().getX())
                            .tipo("PROVEEDOR")
                            .perfilCompleto(p.getFotoPerfilUrl() != null && !p.getFotoPerfilUrl().isEmpty())
                            .promedioEstrellas(promedioReal)
                            .cantidadResenas(cantidadReal)
                            .distanciaMetros((int) distancia)
                            .destacado(esPremiumReal)
                            .fotoPerfilUrl(p.getFotoPerfilUrl())
                            .telefono(p.getUsuario().getTelefono())
                            .especialidades(p.getEspecialidades())
                            .condicionesServicio(p.getCondicionesServicio())
                            .build();
                })
                .sorted((a, b) -> {
                    if (a.isDestacado() != b.isDestacado()) {
                        return a.isDestacado() ? -1 : 1;
                    }
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

        List<UUID> usuarioIds = proveedoresCrudos.stream().map(p -> p.getUsuario().getId()).collect(Collectors.toList());
        List<UUID> perfilIds = proveedoresCrudos.stream().map(PerfilProveedor::getId).collect(Collectors.toList());

        java.util.Set<UUID> usuariosPremiumIds = usuarioIds.isEmpty() ? new java.util.HashSet<>() :
                suscripcionRepository.findByUsuarioIdInAndEstado(usuarioIds, "ACTIVA").stream()
                .filter(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium") || 
                             s.getPlan().getNombre().equalsIgnoreCase("PRO"))
                .map(s -> s.getUsuario().getId())
                .collect(Collectors.toSet());

        java.util.Map<UUID, Double> promedios = new java.util.HashMap<>();
        java.util.Map<UUID, Integer> conteos = new java.util.HashMap<>();
        if (!perfilIds.isEmpty()) {
            List<Object[]> stats = resenaRepository.findAveragesAndCountsByPropietarioIds(perfilIds);
            for (Object[] row : stats) {
                UUID pid = (UUID) row[0];
                promedios.put(pid, row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
                conteos.put(pid, row[2] != null ? ((Number) row[2]).intValue() : 0);
            }
        }

        resultados.addAll(proveedoresCrudos.stream()
                .map(p -> PerfilRespuestaDto.builder()
                        .id(p.getId())
                        .slug(p.getSlug())
                        .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                        .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre()
                                : p.getRubroPersonalizado())
                        .descripcion(p.getDescripcionProfesional())
                        .ciudad(p.getCiudad())
                        .latitud(p.getUbicacion().getY())
                        .longitud(p.getUbicacion().getX())
                        .tipo("PROVEEDOR")
                        .perfilCompleto(p.getFotoPerfilUrl() != null && !p.getFotoPerfilUrl().isEmpty())
                        .promedioEstrellas(promedios.getOrDefault(p.getId(), 0.0))
                        .cantidadResenas(conteos.getOrDefault(p.getId(), 0))
                        .destacado(usuariosPremiumIds.contains(p.getUsuario().getId()))
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
}

