package com.PPS.PPS.config;

import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración para el manejo de geometrías espaciales (JTS).
 */
@Configuration
public class GeometryConfig {

    /**
     * Factory preparada para SRID 4326 (WGS84), el estándar de GPS/Google Maps.
     */
    @Bean
    public GeometryFactory geometryFactory() {
        return new GeometryFactory(new PrecisionModel(), 4326);
    }
}
