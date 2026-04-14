package com.PPS.PPS.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Configuración del cliente HTTP RestClient para integraciones externas.
 */
@Configuration
public class RestClientConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    @Bean
    public RestClient supabaseRestClient() {
        return RestClient.builder()
                .baseUrl(supabaseUrl + "/auth/v1")
                .defaultHeader("apikey", supabaseAnonKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
