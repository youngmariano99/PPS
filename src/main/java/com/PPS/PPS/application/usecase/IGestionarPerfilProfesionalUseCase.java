package com.PPS.PPS.application.usecase;

import com.PPS.PPS.dto.PerfilSolicitudDto;
import com.PPS.PPS.dto.UsuarioPerfilDto;
import com.PPS.PPS.entity.PerfilEmpresa;
import com.PPS.PPS.entity.PerfilProveedor;

import java.util.UUID;

public interface IGestionarPerfilProfesionalUseCase {
    PerfilProveedor crearPerfilProveedor(UUID usuarioId, PerfilSolicitudDto dto);
    PerfilEmpresa crearPerfilEmpresa(UUID usuarioId, PerfilSolicitudDto dto);
    void actualizarPerfilProveedor(UUID usuarioId, PerfilSolicitudDto dto);
    void actualizarUsuario(UUID id, UsuarioPerfilDto dto);
    double[] geocodificarDireccion(String direccion);
}
