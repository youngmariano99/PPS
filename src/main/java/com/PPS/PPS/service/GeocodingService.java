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
        // Eliminamos el fallback simplificado que causaba errores de ubicación (ej: mandaba a CABA)
        // Es preferible ser estrictos con la dirección completa proporcionada.
        return ejecutarBusqueda(direccion);
    }

    private double[] ejecutarBusqueda(String direccion) {
        if (direccion == null || direccion.trim().isEmpty()) return null;
        
        log.info("Geocodificando: {}", direccion);
        try {
            // Evitar duplicar "Argentina" si ya viene en la dirección
            String queryFinal = direccion.toLowerCase().contains("argentina") 
                ? direccion 
                : direccion + ", Argentina";

            List<Map<String, Object>> resultados = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", queryFinal)
                            .queryParam("format", "json")
                            .queryParam("limit", 1)
                            .queryParam("addressdetails", 1)
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            if (resultados != null && !resultados.isEmpty()) {
                Map<String, Object> topResult = resultados.get(0);
                double lat = Double.parseDouble(topResult.get("lat").toString());
                double lon = Double.parseDouble(topResult.get("lon").toString());
                log.info("Ubicación encontrada: {}, {}", lat, lon);
                return new double[]{lon, lat};
            }
        } catch (Exception e) {
            log.error("Error al buscar: {}", e.getMessage());
        }
        return null;
    }
}
