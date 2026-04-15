package com.PPS.PPS.service;

import com.PPS.PPS.dto.AuthRespuestaDto;
import com.PPS.PPS.dto.LoginSolicitudDto;
import com.PPS.PPS.dto.RegistroSolicitudDto;
import com.PPS.PPS.entity.Usuario;
import com.PPS.PPS.exception.ValidacionNegocioException;
import com.PPS.PPS.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
                "password", dto.getPassword()
        );

        Map<String, Object> respuestaSupabase = supabaseRestClient.post()
                .uri("/signup")
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    String errorCuerpo = "Error al registrar en Supabase.";
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> errorMap = mapper.readValue(response.getBody(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
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
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (respuestaSupabase == null || !respuestaSupabase.containsKey("id")) {
            throw new ValidacionNegocioException("No se pudo obtener el ID del usuario desde Supabase.");
        }

        UUID supabaseId = UUID.fromString((String) respuestaSupabase.get("id"));

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
     * Autentica un usuario contra Supabase y devuelve el token JWT.
     */
    public AuthRespuestaDto login(LoginSolicitudDto dto) {
        log.info("Intento de login para usuario: {}", dto.getEmail());

        Map<String, Object> body = Map.of(
                "email", dto.getEmail(),
                "password", dto.getPassword()
        );

        Map<String, Object> respuestaSupabase = supabaseRestClient.post()
                .uri("/token?grant_type=password")
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    String errorCuerpo = "Error de autenticación.";
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> errorMap = mapper.readValue(response.getBody(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
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
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

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
                .orElseThrow(() -> new ValidacionNegocioException("Usuario autenticado en Supabase pero no registrado en la base de datos local."));

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
