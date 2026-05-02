package com.PPS.PPS.service;

import com.PPS.PPS.dto.CrearResenaDto;
import com.PPS.PPS.dto.ResenaDetalleDto;
import com.PPS.PPS.entity.IntencionContacto;
import com.PPS.PPS.entity.Resena;
import com.PPS.PPS.exception.RecursoNoEncontradoException;
import com.PPS.PPS.exception.ValidacionNegocioException;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final IntencionContactoRepository intencionContactoRepository;
    private final PerfilProveedorRepository perfilProveedorRepository;
    private final PerfilEmpresaRepository perfilEmpresaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Resena crearResena(CrearResenaDto dto, UUID usuarioAutenticadoId, String ipCliente) {

        // 1. ESCUDO ANTI-FRAUDE (Astroturfing)
        UUID propietarioPerfilUserId = obtenerUserIdDelPropietario(dto);
        
        if (usuarioAutenticadoId.equals(propietarioPerfilUserId)) {
            throw new ValidacionNegocioException("No puedes calificar tu propio perfil profesional.");
        }

        if (resenaRepository.existsByPropietarioIdAndUsuarioId(dto.getPropietarioId(), usuarioAutenticadoId)) {
            throw new ValidacionNegocioException("Ya has dejado una reseña para este perfil anteriormente.");
        }

        Usuario emisor = usuarioRepository.findById(usuarioAutenticadoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario emisor no encontrado."));

        // 2. EVALUACIÓN DUAL (Modelo Amazon + Modelo Prestigio)
        Resena nuevaResena = Resena.builder()
                .propietarioId(dto.getPropietarioId())
                .usuario(emisor)
                .estrellas(dto.getEstrellas())
                .comentario(dto.getComentario())
                .trabajoVerificado(false)
                .build();

        if (dto.getSolicitudServicioId() != null) {
            // Camino A: RESEÑA DE ALTA CONFIANZA (Trabajo Verificado)
            validarEstadoSolicitudRealizada(dto.getSolicitudServicioId());
            nuevaResena.setSolicitudServicioId(dto.getSolicitudServicioId());
            nuevaResena.setTrabajoVerificado(true); 

        } else if (dto.getIntencionContactoId() != null) {
            // Camino B: RESEÑA DE BAJA FRICCIÓN (Lead normal / Contacto Verificado)
            IntencionContacto contacto = intencionContactoRepository.findById(dto.getIntencionContactoId())
                    .orElseThrow(() -> new ValidacionNegocioException("La intención de contacto especificada no existe."));
            
            if (!contacto.getUsuarioInteresado().getId().equals(usuarioAutenticadoId)) {
                throw new ValidacionNegocioException("Solo el usuario que realizó el contacto puede dejar esta reseña verificada.");
            }
            nuevaResena.setIntencionContacto(contacto);
        } else {
            // Camino C: RESEÑA ESTÁNDAR (Modelo No Restrictivo / Link Mágico sin contacto previo)
            log.info("Creando reseña estándar para el perfil: {}", dto.getPropietarioId());
        }

        return resenaRepository.save(nuevaResena);
    }

    @Transactional
    public Resena responderResena(UUID resenaId, UUID proveedorUserId, String respuesta) {
        Resena resena = resenaRepository.findById(resenaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reseña no encontrada."));

        UUID propietarioUserId = null;
        if (resena.getIntencionContacto() != null) {
            if (resena.getIntencionContacto().getProveedorContactado() != null) {
                propietarioUserId = resena.getIntencionContacto().getProveedorContactado().getUsuario().getId();
            } else if (resena.getIntencionContacto().getEmpresaContactada() != null) {
                propietarioUserId = resena.getIntencionContacto().getEmpresaContactada().getUsuario().getId();
            }
        } else {
            // Buscar el usuario dueño del propietarioId
            propietarioUserId = perfilProveedorRepository.findById(resena.getPropietarioId())
                    .map(p -> p.getUsuario().getId())
                    .orElseGet(() -> perfilEmpresaRepository.findById(resena.getPropietarioId())
                            .map(e -> e.getUsuario().getId())
                            .orElse(null));
        }
        
        if (propietarioUserId == null || !propietarioUserId.equals(proveedorUserId)) {
            throw new ValidacionNegocioException("Solo el profesional reseñado puede responder a este comentario.");
        }

        resena.setRespuestaProveedor(respuesta);
        resena.setFechaRespuesta(OffsetDateTime.now());
        return resenaRepository.save(resena);
    }

    @Transactional(readOnly = true)
    public List<ResenaDetalleDto> obtenerResenasPorProveedor(UUID proveedorId) {
        return resenaRepository.findByPropietarioId(proveedorId).stream()
                .map(this::mapToDetalleDto)
                .collect(Collectors.toList());
    }

    private ResenaDetalleDto mapToDetalleDto(Resena r) {
        String nombre = r.getUsuario().getNombre() + " " + r.getUsuario().getApellido();
        UUID intencionId = r.getIntencionContacto() != null ? r.getIntencionContacto().getId() : null;
        return ResenaDetalleDto.builder()
                .id(r.getId())
                .nombreCliente(nombre)
                .estrellas(r.getEstrellas() != null ? r.getEstrellas().doubleValue() : 0.0)
                .comentario(r.getComentario())
                .fecha(r.getFechaCreacion())
                .trabajoVerificado(r.isTrabajoVerificado())
                .respuestaProveedor(r.getRespuestaProveedor())
                .intencionContactoId(intencionId)
                .build();
    }

    private UUID obtenerUserIdDelPropietario(CrearResenaDto dto) {
        if (dto.getIntencionContactoId() != null) {
            IntencionContacto ic = intencionContactoRepository.findById(dto.getIntencionContactoId()).orElse(null);
            if (ic != null) {
                if (ic.getProveedorContactado() != null) return ic.getProveedorContactado().getUsuario().getId();
                if (ic.getEmpresaContactada() != null) return ic.getEmpresaContactada().getUsuario().getId();
            }
        }
        
        // Si no hay intención, buscamos directamente el usuario dueño del perfil
        return perfilProveedorRepository.findById(dto.getPropietarioId())
                .map(p -> p.getUsuario().getId())
                .orElseGet(() -> perfilEmpresaRepository.findById(dto.getPropietarioId())
                        .map(e -> e.getUsuario().getId())
                        .orElse(null));
    }

    private void validarEstadoSolicitudRealizada(UUID solicitudId) {
        // Stub hasta implementar Módulo de Solicitudes
    }
}
