package com.PPS.PPS.application.usecase;

import com.PPS.PPS.dto.PerfilDetalleDto;
import com.PPS.PPS.dto.UsuarioPerfilDto;

import java.util.UUID;

public interface IConsultarDetallePerfilUseCase {
    PerfilDetalleDto obtenerDetalleProveedor(UUID id, UUID requesterId);
    UsuarioPerfilDto obtenerPerfilUsuario(UUID usuarioId);
}
