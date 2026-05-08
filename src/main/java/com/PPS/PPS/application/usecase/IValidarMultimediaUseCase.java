package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.request.PerfilSolicitudDto;
import com.PPS.PPS.domain.model.PerfilEmpresa;
import com.PPS.PPS.domain.model.Usuario;

import java.util.UUID;

public interface IValidarMultimediaUseCase {
    void validarLimitesMultimedia(UUID usuarioId, PerfilSolicitudDto dto);
    void guardarMultimediaEnPortafolio(PerfilSolicitudDto dto, Usuario u, PerfilEmpresa e);
}

