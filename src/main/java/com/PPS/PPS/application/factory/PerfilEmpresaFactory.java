package com.PPS.PPS.application.factory;

import com.PPS.PPS.dto.RegistroCompletoSolicitudDto;
import com.PPS.PPS.entity.PerfilEmpresa;
import com.PPS.PPS.entity.Rubro;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.repository.PerfilEmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PerfilEmpresaFactory implements IPerfilFactory {

    private final PerfilEmpresaRepository perfilEmpresaRepository;

    @Override
    public void crearYGuardarPerfil(Usuario usuario, Rubro rubro, Point puntoUbicacion, RegistroCompletoSolicitudDto dto) {
        PerfilEmpresa perfil = PerfilEmpresa.builder()
                .usuario(usuario)
                .rubroPrincipal(rubro)
                .rubroPersonalizado(dto.getRubroPersonalizado())
                .descripcionEmpresa(dto.getDescripcion())
                .razonSocial(dto.getNombre())
                .cuit(dto.getDniCuit())
                .logoUrl(dto.getFotoPerfilUrl())
                .pais(dto.getPais())
                .provincia(dto.getProvincia())
                .ciudad(dto.getCiudad())
                .calle(dto.getCalle())
                .numero(Integer.parseInt(dto.getNumero()))
                .codigoPostal(Integer.parseInt(dto.getCodigoPostal()))
                .ubicacion(puntoUbicacion)
                .build();
        perfilEmpresaRepository.save(perfil);
    }

    @Override
    public String getTipo() {
        return "EMPRESA";
    }
}
