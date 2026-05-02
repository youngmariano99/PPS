package com.PPS.PPS.service;

import com.PPS.PPS.entity.IntencionContacto;
import com.PPS.PPS.entity.PerfilEmpresa;
import com.PPS.PPS.entity.PerfilProveedor;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.exception.RecursoNoEncontradoException;
import com.PPS.PPS.repository.IntencionContactoRepository;
import com.PPS.PPS.repository.PerfilEmpresaRepository;
import com.PPS.PPS.repository.PerfilProveedorRepository;
import com.PPS.PPS.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IntencionContactoService {

    private final IntencionContactoRepository intencionContactoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilProveedorRepository perfilProveedorRepository;
    private final PerfilEmpresaRepository perfilEmpresaRepository;

    @Transactional
    public UUID registrarContacto(UUID interesadoId, UUID destinoId, String ip) {
        Usuario interesado = usuarioRepository.findById(interesadoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario interesado no encontrado."));

        IntencionContacto.IntencionContactoBuilder builder = IntencionContacto.builder()
                .usuarioInteresado(interesado)
                .direccionIp(ip);

        // Intentar buscar como proveedor primero, luego como empresa
        PerfilProveedor proveedor = perfilProveedorRepository.findById(destinoId).orElse(null);
        if (proveedor != null) {
            builder.proveedorContactado(proveedor);
        } else {
            PerfilEmpresa empresa = perfilEmpresaRepository.findById(destinoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("El destino del contacto no existe."));
            builder.empresaContactada(empresa);
        }

        IntencionContacto guardado = intencionContactoRepository.save(builder.build());
        return guardado.getId();
    }
}
