package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.response.PerfilDetalleDto;
import com.PPS.PPS.application.dto.response.UsuarioPerfilDto;

import java.util.UUID;

public interface IConsultarDetallePerfilUseCase {
    PerfilDetalleDto obtenerDetalleProveedor(UUID id, UUID requesterId);
    PerfilDetalleDto obtenerDetalleProveedorPorSlug(String slug, UUID requesterId);
    UsuarioPerfilDto obtenerPerfilUsuario(UUID usuarioId);
}

