package com.PPS.PPS.service;

import com.PPS.PPS.dto.AuthRespuestaDto;
import com.PPS.PPS.dto.LoginSolicitudDto;
import com.PPS.PPS.dto.RegistroCompletoSolicitudDto;
import com.PPS.PPS.dto.RegistroSolicitudDto;
import com.PPS.PPS.entity.PerfilEmpresa;
import com.PPS.PPS.entity.PerfilProveedor;
import com.PPS.PPS.entity.Portafolio;
import com.PPS.PPS.entity.Rubro;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.PerfilEmpresaRepository;
import com.PPS.PPS.repository.PerfilProveedorRepository;
import com.PPS.PPS.repository.PortafolioRepository;
import com.PPS.PPS.repository.RubroRepository;
import com.PPS.PPS.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

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
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilProveedorRepository perfilProveedorRepository;
    private final PerfilEmpresaRepository perfilEmpresaRepository;
    private final RubroRepository rubroRepository;
    private final PortafolioRepository portafolioRepository;
    private final GeocodingService geocodingService;
    private final GeometryFactory geometryFactory;
    private final RestClient supabaseRestClient;

    /**
     * Registra un nuevo usuario en Supabase y lo persiste localmente.
     */
    @Transactional
    public AuthRespuestaDto registrar(RegistroSolicitudDto dto) {
        log.info("Iniciando registro de usuario: {}", dto.getEmail());

        // 1. Llamada a Supabase para Signup
        Map<String, Object> body = Map.of(
                "email", dto.getEmail(),
                "password", dto.getPassword());

        Map<String, Object> respuestaSupabase = supabaseRestClient.post()
                .uri("/signup")
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    String errorCuerpo = "Error al registrar en Supabase.";
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> errorMap = mapper.readValue(response.getBody(),
                                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {
                                });
                        if (errorMap != null && errorMap.containsKey("msg")) {
                            errorCuerpo = (String) errorMap.get("msg");
                        } else if (errorMap != null && errorMap.containsKey("error_description")) {
                            errorCuerpo = (String) errorMap.get("error_description");
                        }
                    } catch (Exception e) {
                        errorCuerpo = response.getStatusText();
                    }
                    throw new ValidacionNegocioException("Supabase Auth: " + errorCuerpo);
                })
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });

        if (respuestaSupabase == null) {
            throw new ValidacionNegocioException("La respuesta de Supabase es nula.");
        }

        String supabaseIdStr = null;

        if (respuestaSupabase.containsKey("id")) {
            supabaseIdStr = (String) respuestaSupabase.get("id");
        } else if (respuestaSupabase.containsKey("user")) {
            Map<String, Object> userObj = (Map<String, Object>) respuestaSupabase.get("user");
            if (userObj != null && userObj.containsKey("id")) {
                supabaseIdStr = (String) userObj.get("id");
            }
        }

        if (supabaseIdStr == null) {
            throw new ValidacionNegocioException(
                    "No se pudo extraer el ID. Respuesta de Supabase: " + respuestaSupabase);
        }

        UUID supabaseId = UUID.fromString(supabaseIdStr);

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
        String direccionCompleta = String.format("%s %s, %s, %s, Argentina",
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
        if ("PROVEEDOR".equalsIgnoreCase(dto.getTipo())) {
            PerfilProveedor perfil = PerfilProveedor.builder()
                    .usuario(usuario)
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
                    .especialidades(dto.getEspecialidades())
                    .condicionesServicio(dto.getCondicionesServicio())
                    .build();
            perfilProveedorRepository.save(perfil);
        } else if ("EMPRESA".equalsIgnoreCase(dto.getTipo())) {
            PerfilEmpresa perfil = PerfilEmpresa.builder()
                    .usuario(usuario)
                    .rubroPrincipal(rubro)
                    .rubroPersonalizado(dto.getRubroPersonalizado())
                    .descripcionEmpresa(dto.getDescripcion())
                    .razonSocial(dto.getNombre()) // En empresas el nombre suele ser la razón social
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

        Map<String, Object> body = Map.of(
                "email", dto.getEmail(),
                "password", dto.getPassword());

        Map<String, Object> respuestaSupabase = supabaseRestClient.post()
                .uri("/token?grant_type=password")
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    String errorCuerpo = "Error de autenticación.";
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> errorMap = mapper.readValue(response.getBody(),
                                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {
                                });
                        if (errorMap != null && errorMap.containsKey("error_description")) {
                            errorCuerpo = (String) errorMap.get("error_description");
                        } else if (errorMap != null && errorMap.containsKey("msg")) {
                            errorCuerpo = (String) errorMap.get("msg");
                        }
                    } catch (Exception e) {
                        errorCuerpo = response.getStatusText();
                    }
                    throw new ValidacionNegocioException("Supabase Auth: " + errorCuerpo);
                })
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });

        if (respuestaSupabase == null || !respuestaSupabase.containsKey("access_token")) {
            throw new ValidacionNegocioException("Error en la respuesta de autenticación de Supabase.");
        }

        // Recuperar info del usuario local
        String accessToken = (String) respuestaSupabase.get("access_token");

        Object userObj = respuestaSupabase.get("user");
        if (!(userObj instanceof Map)) {
            log.error("Respuesta de Supabase inválida: el campo 'user' no es un objeto. Recibido: {}", userObj);
            throw new ValidacionNegocioException("La respuesta de autenticación es incompleta o inválida.");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> userMap = (Map<String, Object>) userObj;

        if (!userMap.containsKey("id")) {
            throw new ValidacionNegocioException("No se encontró el identificador del usuario en la sesión.");
        }

        UUID supabaseId = UUID.fromString((String) userMap.get("id"));

        Usuario usuario = usuarioRepository.findById(Objects.requireNonNull(supabaseId))
                .orElseThrow(() -> new ValidacionNegocioException(
                        "Usuario autenticado en Supabase pero no registrado en la base de datos local."));

        return AuthRespuestaDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .usuarioId(supabaseId)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .build();
    }
}
