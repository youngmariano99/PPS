package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.PerfilDetalleDto;
import com.PPS.PPS.application.dto.UsuarioPerfilDto;

import java.util.UUID;

public interface IConsultarDetallePerfilUseCase {
    PerfilDetalleDto obtenerDetalleProveedor(UUID id, UUID requesterId);
    UsuarioPerfilDto obtenerPerfilUsuario(UUID usuarioId);
}

