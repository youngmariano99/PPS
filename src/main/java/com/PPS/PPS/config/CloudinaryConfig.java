package com.PPS.PPS.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuración para el cliente de Cloudinary.
 * Este Bean expone el SDK de Cloudinary instanciado y listo para ser
 * inyectado mediante @Autowired en los servicios correspondientes,
 * asegurando de que las credenciales no estén harcodeadas.
 */
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @Value("${cloudinary.api_key}")
    private String apiKey;

    @Value("${cloudinary.api_secret}")
    private String apiSecret;

    /**
     * Crea un Bean de Cloudinary configurado con propiedades inyectadas desde el entorno.
     * 
     * @return una instancia de Cloudinary lista para operar.
     */
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }
}
