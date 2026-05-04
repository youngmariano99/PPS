package com.PPS.PPS.application.factory;

import com.PPS.PPS.dto.RegistroCompletoSolicitudDto;
import com.PPS.PPS.entity.Rubro;
import com.PPS.PPS.entity.Usuario;
import org.locationtech.jts.geom.Point;

public interface IPerfilFactory {
    void crearYGuardarPerfil(Usuario usuario, Rubro rubro, Point puntoUbicacion, RegistroCompletoSolicitudDto dto);
    String getTipo();
}
