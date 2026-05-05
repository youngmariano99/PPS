package com.PPS.PPS.application.usecase;

import java.util.Map;
import java.util.UUID;

public interface ISupabaseAuthPort {
    UUID registrar(String email, String password);
    Map<String, String> login(String email, String password);
    void solicitarRecuperacionPassword(String email);
    void actualizarPassword(String nuevaPassword, String accessToken);
    boolean estaEmailConfirmado(String accessToken);
}
