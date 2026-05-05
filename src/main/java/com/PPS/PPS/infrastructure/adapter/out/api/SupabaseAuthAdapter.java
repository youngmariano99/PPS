package com.PPS.PPS.infrastructure.adapter.out.api;

import com.PPS.PPS.application.usecase.ISupabaseAuthPort;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SupabaseAuthAdapter implements ISupabaseAuthPort {

    private final RestClient supabaseRestClient;

    @Override
    public UUID registrar(String email, String password) {
        Map<String, Object> body = Map.of(
                "email", email,
                "password", password);

        Map<String, Object> respuestaSupabase = supabaseRestClient.post()
                .uri("/signup")
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    String errorCuerpo = "Error al registrar en Supabase.";
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> errorMap = mapper.readValue(response.getBody(),
                                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
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
            throw new ValidacionNegocioException("No se pudo extraer el ID. Respuesta de Supabase: " + respuestaSupabase);
        }

        return UUID.fromString(supabaseIdStr);
    }

    @Override
    public Map<String, String> login(String email, String password) {
        Map<String, Object> body = Map.of(
                "email", email,
                "password", password);

        Map<String, Object> respuestaSupabase = supabaseRestClient.post()
                .uri("/token?grant_type=password")
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    String errorCuerpo = "Error de autenticación.";
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<String, Object> errorMap = mapper.readValue(response.getBody(),
                                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
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

        String supabaseIdStr = (String) userMap.get("id");

        Map<String, String> result = new HashMap<>();
        result.put("access_token", accessToken);
        result.put("user_id", supabaseIdStr);

        return result;
    }

    @Override
    public void solicitarRecuperacionPassword(String email) {
        Map<String, Object> body = Map.of("email", email);

        supabaseRestClient.post()
                .uri("/recover")
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new ValidacionNegocioException("Error al solicitar recuperación de contraseña.");
                })
                .toBodilessEntity();
    }

    @Override
    public void actualizarPassword(String nuevaPassword, String accessToken) {
        Map<String, Object> body = Map.of("password", nuevaPassword);

        supabaseRestClient.put()
                .uri("/user")
                .header("Authorization", "Bearer " + accessToken)
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new ValidacionNegocioException("Error al actualizar la contraseña en Supabase.");
                })
                .toBodilessEntity();
    }

    @Override
    public boolean estaEmailConfirmado(String accessToken) {
        try {
            Map<String, Object> response = supabaseRestClient.get()
                    .uri("/user")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, responseError) -> {
                        throw new ValidacionNegocioException("Error al obtener perfil de usuario en Supabase.");
                    })
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.containsKey("email_confirmed_at")) {
                return response.get("email_confirmed_at") != null;
            }
            return false;
        } catch (Exception e) {
            log.error("Error consultando estado de email en Supabase: {}", e.getMessage());
            return false;
        }
    }
}

