package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.response.AuthRespuestaDto;
import com.PPS.PPS.application.dto.request.LoginSolicitudDto;
import com.PPS.PPS.application.dto.request.RegistroCompletoSolicitudDto;
import com.PPS.PPS.application.dto.request.RegistroSolicitudDto;

public interface IAuthUseCase {
    AuthRespuestaDto registrar(RegistroSolicitudDto dto);
    AuthRespuestaDto registrarCompleto(RegistroCompletoSolicitudDto dto);
    AuthRespuestaDto login(LoginSolicitudDto dto);
    void solicitarRecuperacion(String email);
    void cambiarPassword(String nuevaPassword, String accessToken);
    void reenviarConfirmacion(String email);
}

