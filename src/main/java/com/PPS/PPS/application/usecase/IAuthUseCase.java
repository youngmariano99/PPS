package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.AuthRespuestaDto;
import com.PPS.PPS.application.dto.LoginSolicitudDto;
import com.PPS.PPS.application.dto.RegistroCompletoSolicitudDto;
import com.PPS.PPS.application.dto.RegistroSolicitudDto;

public interface IAuthUseCase {
    AuthRespuestaDto registrar(RegistroSolicitudDto dto);
    AuthRespuestaDto registrarCompleto(RegistroCompletoSolicitudDto dto);
    AuthRespuestaDto login(LoginSolicitudDto dto);
}

