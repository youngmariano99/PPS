package com.PPS.PPS.application.usecase;

import com.PPS.PPS.dto.AuthRespuestaDto;
import com.PPS.PPS.dto.LoginSolicitudDto;
import com.PPS.PPS.dto.RegistroCompletoSolicitudDto;
import com.PPS.PPS.dto.RegistroSolicitudDto;

public interface IAuthUseCase {
    AuthRespuestaDto registrar(RegistroSolicitudDto dto);
    AuthRespuestaDto registrarCompleto(RegistroCompletoSolicitudDto dto);
    AuthRespuestaDto login(LoginSolicitudDto dto);
}
