package com.PPS.PPS.application.port;

import java.util.Map;

/**
 * Puerto para el envío de correos electrónicos.
 */
public interface IMailPort {
    /**
     * Envía un correo electrónico simple.
     * @param to Destinatario
     * @param subject Asunto
     * @param content Contenido (HTML o texto)
     */
    void enviarEmail(String to, String subject, String content);
}
