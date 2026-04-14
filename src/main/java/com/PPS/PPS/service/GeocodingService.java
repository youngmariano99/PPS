package com.PPS.PPS.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Servicio encargado de la geocodificación (Dirección -> Coordenadas) usando Nominatim (OSM).
 */
@Service
@Slf4j
public class GeocodingService {

    private final RestClient restClient;

    public GeocodingService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "PlataformaServiciosPPS/1.0 (pps-project)")
                .build();
    }

    /**
     * Obtiene coordenadas a partir de una dirección.
     * Retorna una lista con [Longitud, Latitud] o null si no encuentra nada.
     */
    public double[] obtenerCoordenadas(String direccion) {
        log.info("Geocodificando dirección: {}", direccion);

        try {
            List<Map<String, Object>> resultados = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", direccion)
                            .queryParam("format", "json")
                            .queryParam("limit", 1)
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            if (resultados != null && !resultados.isEmpty()) {
                Map<String, Object> topResult = resultados.get(0);
                double lat = Double.parseDouble(topResult.get("lat").toString());
                double lon = Double.parseDouble(topResult.get("lon").toString());
                return new double[]{lon, lat}; // Orden [Longitud, Latitud] para JTS
            }
        } catch (Exception e) {
            log.error("Error al geocodificar dirección: {}", e.getMessage());
        }
        return null;
    }
}
