package com.PPS.PPS.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración de seguridad de la aplicación.
 * Maneja la política de CORS a nivel de filtros de seguridad para soportar
 * peticiones de Framer.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // Utiliza el bean corsConfigurationSource
                .csrf(AbstractHttpConfigurer::disable) // Deshabilitado para APIs REST con JWT
                .authorizeHttpRequests(auth -> auth
                        // Permitir explícitamente todos los preflights de CORS (OPTIONS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Permitir acceso a Swagger y endpoints públicos de auth por ahora
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Por ahora permitimos todo para no bloquear el desarrollo,
                        // pero bajo la supervisión del filtro CORS
                        .anyRequest().permitAll());

        return http.build();
    }

    /**
     * Fuente de configuración de CORS para Spring Security.
     * Define qué dominios, métodos y cabeceras están permitidos.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Brute force: permitir orígenes explícitos y comodines
        configuration.setAllowedOrigins(Arrays.asList(
                "https://overly-mindset-259417.framer.app",
                "https://pps-front.onrender.com",
                "http://localhost:5173",
                "http://localhost:3000",
                "*"
        ));
        
        // Patrones para subdominios
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://*.framer.app",
                "https://*.framer.website",
                "*"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        
        // Cabeceras permitidas
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", 
                "Content-Type", 
                "X-Requested-With", 
                "Accept", 
                "Origin", 
                "Access-Control-Request-Method", 
                "Access-Control-Request-Headers",
                "X-Framer-Preview",
                "Cache-Control"
        ));

        // IMPORTANT: allowCredentials(false) permite el uso de "*" en los orígenes
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
