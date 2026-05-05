package com.PPS.PPS.application.factory;

import com.PPS.PPS.application.dto.RegistroCompletoSolicitudDto;
import com.PPS.PPS.entity.PerfilProveedor;
import com.PPS.PPS.entity.Rubro;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.repository.PerfilProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PerfilProveedorFactory implements IPerfilFactory {

    private final PerfilProveedorRepository perfilProveedorRepository;

    @Override
    public void crearYGuardarPerfil(Usuario usuario, Rubro rubro, Point puntoUbicacion, RegistroCompletoSolicitudDto dto) {
        String baseSlug = com.PPS.PPS.util.SlugUtils.makeSlug(
                usuario.getNombre(), 
                usuario.getApellido(), 
                rubro != null ? rubro.getNombre() : dto.getRubroPersonalizado()
        );
        String slug = baseSlug;
        int count = 1;
        while (perfilProveedorRepository.findBySlug(slug).isPresent()) {
            count++;
            slug = baseSlug + "-" + count;
        }

        PerfilProveedor perfil = PerfilProveedor.builder()
                .usuario(usuario)
                .slug(slug)
                .rubroPrincipal(rubro)
                .rubroPersonalizado(dto.getRubroPersonalizado())
                .descripcionProfesional(dto.getDescripcion())
                .dni(dto.getDniCuit())
                .matricula(dto.getMatricula())
                .fotoPerfilUrl(dto.getFotoPerfilUrl())
                .pais(dto.getPais())
                .provincia(dto.getProvincia())
                .ciudad(dto.getCiudad())
                .calle(dto.getCalle())
                .numero(Integer.parseInt(dto.getNumero()))
                .codigoPostal(Integer.parseInt(dto.getCodigoPostal()))
                .ubicacion(puntoUbicacion)
                .redesSociales(com.PPS.PPS.application.dto.RedSocialDto.procesarUrls(dto.getRedesSocialesUrls()))
                .sitioWebUrl(dto.getSitioWebUrl())
                .especialidades(dto.getEspecialidades())
                .condicionesServicio(dto.getCondicionesServicio())
                .build();
        perfilProveedorRepository.save(perfil);
    }

    @Override
    public String getTipo() {
        return "PROVEEDOR";
    }
}

