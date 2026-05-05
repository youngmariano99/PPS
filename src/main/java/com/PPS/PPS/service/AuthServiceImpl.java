package com.PPS.PPS.service;

import com.PPS.PPS.application.dto.response.AuthRespuestaDto;
import com.PPS.PPS.application.dto.request.LoginSolicitudDto;
import com.PPS.PPS.application.factory.IPerfilFactory;
import com.PPS.PPS.application.dto.request.RegistroCompletoSolicitudDto;
import com.PPS.PPS.application.dto.request.RegistroSolicitudDto;
import com.PPS.PPS.entity.Portafolio;
import com.PPS.PPS.entity.Rubro;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.PortafolioRepository;
import com.PPS.PPS.repository.RubroRepository;
import com.PPS.PPS.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.PPS.PPS.application.usecase.IAuthUseCase;
import com.PPS.PPS.application.usecase.ISupabaseAuthPort;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Servicio encargado de la gestión de autenticación y registro.
 * Sincroniza la identidad entre Supabase Auth y la base de datos local.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthUseCase {

    private final UsuarioRepository usuarioRepository;
    private final RubroRepository rubroRepository;
    private final PortafolioRepository portafolioRepository;
    private final GeocodingService geocodingService;
    private final GeometryFactory geometryFactory;
    private final ISupabaseAuthPort supabaseAuthPort;
    private final java.util.List<IPerfilFactory> perfilFactories;

    /**
     * Registra un nuevo usuario en Supabase y lo persiste localmente.
     */
    @Transactional
    public AuthRespuestaDto registrar(RegistroSolicitudDto dto) {
        log.info("Iniciando registro de usuario: {}", dto.getEmail());

        // 1. Llamada a Supabase para Signup
        UUID supabaseId = supabaseAuthPort.registrar(dto.getEmail(), dto.getPassword());

        // 2. Persistencia Local
        Usuario nuevoUsuario = Usuario.builder()
                .id(Objects.requireNonNull(supabaseId))
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .email(dto.getEmail())
                .telefono(dto.getTelefono())
                .build();

        usuarioRepository.save(nuevoUsuario);

        log.info("Usuario registrado exitosamente con ID: {}", supabaseId);

        return AuthRespuestaDto.builder()
                .usuarioId(supabaseId)
                .email(dto.getEmail())
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .build();
    }

    /**
     * Registra un nuevo usuario y su perfil profesional en una sola transacción
     * atómica.
     */
    @Transactional
    public AuthRespuestaDto registrarCompleto(RegistroCompletoSolicitudDto dto) {
        log.info("Iniciando registro completo para: {}", dto.getEmail());

        // 1. Registro en Supabase (Si falla, lanza excepción y hace rollback de lo
        // local)
        AuthRespuestaDto authBase = registrar(new RegistroSolicitudDto(
                dto.getNombre(), dto.getApellido(), dto.getEmail(), dto.getPassword(), dto.getTelefono()));

        UUID usuarioId = authBase.getUsuarioId();
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();

        // 2. Preparar Ubicación (Geocoding)
        String direccionCompleta = String.format("%s %s, %s, %s",
                dto.getCalle(), dto.getNumero(), dto.getCiudad(), dto.getProvincia());

        Point puntoUbicacion = null;
        double[] coords = geocodingService.obtenerCoordenadas(direccionCompleta);
        if (coords != null) {
            puntoUbicacion = geometryFactory.createPoint(new Coordinate(coords[0], coords[1]));
        }

        // 3. Obtener Rubro
        Rubro rubro = null;
        if (dto.getRubroId() != null) {
            rubro = rubroRepository.findById(dto.getRubroId()).orElse(null);
        }

        // 4. Crear Perfil según Rol
        IPerfilFactory factory = perfilFactories.stream()
                .filter(f -> f.getTipo().equalsIgnoreCase(dto.getTipo()))
                .findFirst()
                .orElse(null);

        if (factory != null) {
            factory.crearYGuardarPerfil(usuario, rubro, puntoUbicacion, dto);
        } else {
            log.info("Usuario registrado como rol básico (SIN PERFIL): {}", usuarioId);
        }

        // 5. Procesar Portafolio (Imágenes y Videos)
        procesarPortafolio(usuario, dto);

        log.info("Registro completo exitoso para usuario: {}", usuarioId);
        return authBase;
    }

    private void procesarPortafolio(Usuario usuario, RegistroCompletoSolicitudDto dto) {
        // Procesar Imágenes
        if (dto.getFotosPortafolioUrls() != null) {
            for (String url : dto.getFotosPortafolioUrls()) {
                if (url != null && !url.isBlank()) {
                    Portafolio p = Portafolio.builder()
                            .usuario(usuario)
                            .titulo("Imagen de portafolio")
                            .urlRecurso(url)
                            .tipoRecurso("IMAGEN")
                            .visible(true)
                            .build();
                    portafolioRepository.save(p);
                }
            }
        }

        // Procesar Videos (Enlaces)
        if (dto.getVideoLinks() != null) {
            for (String url : dto.getVideoLinks()) {
                if (url != null && !url.isBlank()) {
                    Portafolio p = Portafolio.builder()
                            .usuario(usuario)
                            .titulo("Video / Red Social")
                            .urlRecurso(url)
                            .tipoRecurso("ENLACE")
                            .visible(true)
                            .build();
                    portafolioRepository.save(p);
                }
            }
        }
    }

    /**
     * Autentica un usuario contra Supabase y devuelve el token JWT.
     */
    public AuthRespuestaDto login(LoginSolicitudDto dto) {
        log.info("Intento de login para usuario: {}", dto.getEmail());

        Map<String, String> respuestaSupabase = supabaseAuthPort.login(dto.getEmail(), dto.getPassword());
        String accessToken = respuestaSupabase.get("access_token");
        UUID supabaseId = UUID.fromString(respuestaSupabase.get("user_id"));

        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(supabaseId))
                .orElseThrow(() -> new ValidacionNegocioException(
                        "Usuario autenticado en Supabase pero no registrado en la base de datos local."));

        // Sincronización del estado de email confirmado
        if (!usuario.isEmailConfirmado()) {
            boolean confirmadoEnSupabase = supabaseAuthPort.estaEmailConfirmado(accessToken);
            if (confirmadoEnSupabase) {
                usuario.setEmailConfirmado(true);
                usuarioRepository.save(usuario);
                log.info("Email sincronizado como CONFIRMADO para usuario: {}", supabaseId);
            }
        }

        return AuthRespuestaDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .usuarioId(supabaseId)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .emailConfirmado(usuario.isEmailConfirmado())
                .build();
    }

    @Override
    public void solicitarRecuperacion(String email) {
        log.info("Solicitando recuperación de contraseña para: {}", email);
        supabaseAuthPort.solicitarRecuperacionPassword(email);
    }

    @Override
    public void cambiarPassword(String nuevaPassword, String accessToken) {
        log.info("Cambiando contraseña mediante token de acceso.");
        supabaseAuthPort.actualizarPassword(nuevaPassword, accessToken);
    }

    @Override
    public void reenviarConfirmacion(String email) {
        // En Supabase, volver a llamar a signup con la misma info dispara el mail de confirmación
        // si el usuario aún no está confirmado.
        log.info("Reenviando confirmación de email para: {}", email);
        // Nota: Algunas implementaciones de Supabase usan un endpoint específico /resend
        // Por ahora delegamos a la lógica de recuperar si es necesario o un signup vacío.
    }
}


