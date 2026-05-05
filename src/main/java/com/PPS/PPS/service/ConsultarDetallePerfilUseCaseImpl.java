package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IConsultarDetallePerfilUseCase;
import com.PPS.PPS.application.dto.PerfilDetalleDto;
import com.PPS.PPS.application.dto.ResenaDetalleDto;
import com.PPS.PPS.application.dto.UsuarioPerfilDto;
import com.PPS.PPS.entity.PerfilProveedor;
import com.PPS.PPS.entity.Portafolio;
import com.PPS.PPS.entity.Resena;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultarDetallePerfilUseCaseImpl implements IConsultarDetallePerfilUseCase {

    private final PerfilProveedorRepository proveedorRepository;
    private final PerfilEmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SuscripcionUsuarioRepository suscripcionRepository;
    private final PortafolioRepository portafolioRepository;
    private final ResenaRepository resenaRepository;

    public PerfilDetalleDto obtenerDetalleProveedor(UUID id, UUID requesterId) {
        log.info("Obteniendo detalle de proveedor para ID: {}", id);

        PerfilProveedor p = proveedorRepository.findByUsuarioId(id)
                .orElseGet(() -> proveedorRepository.findById(id)
                        .orElseThrow(() -> {
                            log.error("Proveedor no encontrado para ID: {}", id);
                            return new RecursoNoEncontradoException("Proveedor no encontrado");
                        }));

        return mapearADetalleDto(p, requesterId);
    }

    @Override
    public PerfilDetalleDto obtenerDetalleProveedorPorSlug(String slug, UUID requesterId) {
        log.info("Obteniendo detalle de proveedor para Slug: {}", slug);
        PerfilProveedor p = proveedorRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.error("Proveedor no encontrado para Slug: {}", slug);
                    return new RecursoNoEncontradoException("Proveedor no encontrado");
                });
        return mapearADetalleDto(p, requesterId);
    }

    private PerfilDetalleDto mapearADetalleDto(PerfilProveedor p, UUID requesterId) {
        boolean esPremium = suscripcionRepository.findByUsuarioIdAndEstado(p.getUsuario().getId(), "ACTIVA")
                .map(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium") || 
                         s.getPlan().getNombre().equalsIgnoreCase("PRO"))
                .orElse(false);

        List<Portafolio> multimedia;
        if (esPremium) {
            multimedia = portafolioRepository.findAllByUsuarioIdOrderByFechaCreacionDesc(p.getUsuario().getId());
        } else {
            multimedia = portafolioRepository.findVisibleByUsuarioId(p.getUsuario().getId(),
                    org.springframework.data.domain.PageRequest.of(0, 5));
        }

        // --- CARGA DE RESEÑAS REALES (Basado en PropietarioID) ---
        List<Resena> resenasEntity = resenaRepository.findByPropietarioId(p.getId());
        List<ResenaDetalleDto> resenasMapped = resenasEntity.stream()
                .map(r -> ResenaDetalleDto.builder()
                        .id(r.getId())
                        .nombreCliente(r.getUsuario().getNombre() + " " + r.getUsuario().getApellido())
                        .estrellas(r.getEstrellas().doubleValue())
                        .comentario(r.getComentario())
                        .fecha(r.getFechaCreacion())
                        .trabajoVerificado(r.isTrabajoVerificado())
                        .respuestaProveedor(r.getRespuestaProveedor())
                        .build())
                .collect(Collectors.toList());

        Double promedio = resenasMapped.isEmpty() ? 0.0 : 
                resenasMapped.stream().mapToDouble(ResenaDetalleDto::getEstrellas).average().orElse(0.0);

        boolean isOwner = requesterId != null && requesterId.equals(p.getUsuario().getId());

        return PerfilDetalleDto.builder()
                .id(p.getId())
                .nombrePublico(p.getUsuario().getNombre() + " " + p.getUsuario().getApellido())
                .rubro(p.getRubroPrincipal() != null ? p.getRubroPrincipal().getNombre() : p.getRubroPersonalizado())
                .descripcion(p.getDescripcionProfesional())
                .fotoPerfilUrl(p.getFotoPerfilUrl())
                .matricula(p.getMatricula())
                .telefono(isOwner ? p.getUsuario().getTelefono() : "•••• •••• •••")
                .email(p.getUsuario().getEmail())
                .pais(p.getPais())
                .provincia(p.getProvincia())
                .ciudad(p.getCiudad())
                .direccion(isOwner ? (p.getCalle() + " " + p.getNumero()) : "Dirección Oculta")
                .calle(isOwner ? p.getCalle() : "Oculto")
                .numero(isOwner ? p.getNumero() : 0)
                .codigoPostal(isOwner ? p.getCodigoPostal() : 0)
                .redesSociales(p.getRedesSociales() != null ? p.getRedesSociales() : new ArrayList<>())
                .sitioWebUrl(p.getSitioWebUrl())
                .esPremium(esPremium)
                .especialidades(p.getEspecialidades() != null ? p.getEspecialidades() : new ArrayList<>())
                .condicionesServicio(p.getCondicionesServicio() != null ? p.getCondicionesServicio() : new ArrayList<>())
                .resenas(resenasMapped)
                .promedioEstrellas(promedio)
                .totalResenas(resenasMapped.size())
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

        boolean isPremium = suscripcionRepository.findByUsuarioIdAndEstado(usuarioId, "ACTIVA")
                .map(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium") || 
                         s.getPlan().getNombre().equalsIgnoreCase("PRO"))
                .orElse(false);

        return UsuarioPerfilDto.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(rol)
                .telefono(usuario.getTelefono())
                .fechaRegistro(usuario.getFechaCreacion() != null ? usuario.getFechaCreacion().toString() : "Reciente")
                .isPremium(isPremium)
                .build();
    }
}


