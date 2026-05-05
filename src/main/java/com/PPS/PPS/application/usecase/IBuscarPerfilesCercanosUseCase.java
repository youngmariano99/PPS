package com.PPS.PPS.application.usecase;

import com.PPS.PPS.application.dto.response.PerfilRespuestaDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IBuscarPerfilesCercanosUseCase {
    Page<PerfilRespuestaDto> buscarCercanosLista(double lat, double lon, double radioKm, String rubro, String q, int page, int size);
    List<PerfilRespuestaDto> buscarCercanosMapa(double lat, double lon, double radioKm, String q);
}

