package com.PPS.PPS.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración general de la aplicación Web.
 * La gestión de CORS se ha movido a SecurityConfig para un manejo centralizado de filtros.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Aquí puedes añadir configuraciones de Interceptores o ViewControllers en el futuro
}
