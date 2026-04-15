package com.PPS.PPS.service;

import com.PPS.PPS.dto.PerfilRespuestaDto;
import com.PPS.PPS.dto.PerfilSolicitudDto;
import com.PPS.PPS.entity.PerfilEmpresa;
import com.PPS.PPS.entity.PerfilProveedor;
import com.PPS.PPS.entity.Rubro;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.exception.RecursoNoEncontradoException;
import com.PPS.PPS.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.PerfilEmpresaRepository;
import com.PPS.PPS.repository.PerfilProveedorRepository;
import com.PPS.PPS.repository.RubroRepository;
import com.PPS.PPS.repository.UsuarioRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DirectorioService {

        private final PerfilProveedorRepository proveedorRepository;
        private final PerfilEmpresaRepository empresaRepository;
        private final RubroRepository rubroRepository;
        private final UsuarioRepository usuarioRepository;
        private final GeocodingService geocodingService;
        private final GeometryFactory geometryFactory;

        @Transactional
        public PerfilProveedor crearPerfilProveedor(UUID usuarioId, PerfilSolicitudDto dto) {
                Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(usuarioId))
                                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

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
                                .descripcionProfesional(dto.getDescripcion())
                                .pais(dto.getPais())
                                .provincia(dto.getProvincia())
                                .ciudad(dto.getCiudad())
                                .calle(dto.getCalle())
                                .numero(dto.getNumero())
                                .codigoPostal(dto.getCodigoPostal())
                                .ubicacion(punto)
                                .build();

                return proveedorRepository.save(perfil);
        }

        @Transactional
        public PerfilEmpresa crearPerfilEmpresa(UUID usuarioId, PerfilSolicitudDto dto) {
                Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(usuarioId))
                                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

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
                                .pais(dto.getPais())
                                .provincia(dto.getProvincia())
                                .ciudad(dto.getCiudad())
                                .calle(dto.getCalle())
                                .numero(dto.getNumero())
                                .codigoPostal(dto.getCodigoPostal())
                                .ubicacion(punto)
                                .build();

                return empresaRepository.save(perfil);
        }

        public List<PerfilRespuestaDto> buscarCercanos(double lat, double lon, double radioKm) {
                double radioMetros = radioKm * 1000;

                List<PerfilRespuestaDto> resultados = new ArrayList<>();

                // Buscar Proveedores
                resultados.addAll(proveedorRepository.buscarCercanos(lat, lon, radioMetros).stream()
                                .map(p -> PerfilRespuestaDto.builder()
                                                .id(p.getId())
                                                .nombrePublico(p.getUsuario().getNombre() + " "
                                                                + p.getUsuario().getApellido())
                                                .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre()
                                                                : p.getRubroPersonalizado())
                                                .descripcion(p.getDescripcionProfesional())
                                                .ciudad(p.getCiudad())
                                                .latitud(p.getUbicacion().getY())
                                                .longitud(p.getUbicacion().getX())
                                                .tipo("PROVEEDOR")
                                                .build())
                                .collect(Collectors.toList()));

                // Buscar Empresas
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
                                                .build())
                                .collect(Collectors.toList()));

                return resultados;
        }

        private Point obtenerPuntoDesdeDireccion(PerfilSolicitudDto dto) {
                String direccionFull = String.format("%s ,%d, %s, %s, %s",
                                dto.getCalle(), dto.getNumero(), dto.getCiudad(), dto.getProvincia(), dto.getPais());

                double[] coords = geocodingService.obtenerCoordenadas(direccionFull);

                if (coords == null) {
                        throw new ValidacionNegocioException(
                                        "No se pudo geolocalizar la dirección provista. Verifique los datos.");
                }

                return geometryFactory.createPoint(new Coordinate(coords[0], coords[1])); // Longitud, Latitud
        }
}
