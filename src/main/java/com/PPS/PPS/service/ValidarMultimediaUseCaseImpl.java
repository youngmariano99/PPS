package com.PPS.PPS.service;

import com.PPS.PPS.application.usecase.IValidarMultimediaUseCase;
import com.PPS.PPS.application.dto.request.PerfilSolicitudDto;
import com.PPS.PPS.entity.PerfilEmpresa;
import com.PPS.PPS.entity.Portafolio;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.PortafolioRepository;
import com.PPS.PPS.repository.SuscripcionUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ValidarMultimediaUseCaseImpl implements IValidarMultimediaUseCase {

    private final SuscripcionUsuarioRepository suscripcionRepository;
    private final PortafolioRepository portafolioRepository;

    private static final Pattern VIDEO_PATTERN = Pattern.compile(
            "^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be|instagram\\.com|tiktok\\.com|drive\\.google\\.com)/.*$");

    @Override
    public void validarLimitesMultimedia(UUID usuarioId, PerfilSolicitudDto dto) {
        boolean esPremium = suscripcionRepository.findByUsuarioIdAndEstado(Objects.requireNonNull(usuarioId), "ACTIVA")
                .map(s -> s.getPlan().getNombre().equalsIgnoreCase("Premium") || 
                         s.getPlan().getNombre().equalsIgnoreCase("PRO"))
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

    @Override
    public void guardarMultimediaEnPortafolio(PerfilSolicitudDto dto, Usuario u, PerfilEmpresa e) {
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
}


