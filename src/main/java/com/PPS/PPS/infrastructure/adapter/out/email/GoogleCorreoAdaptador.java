package com.PPS.PPS.infrastructure.adapter.out.email;

import com.PPS.PPS.application.port.IMailPort;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * Adaptador de infraestructura para el envío de correos utilizando el servidor SMTP de Google.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleCorreoAdaptador implements IMailPort {

    private final JavaMailSender gestorCorreos;

    @Value("${spring.mail.username}")
    private String remitente;

    @Override
    public void enviarEmail(String destinatario, String asunto, String contenido) {
        try {
            MimeMessage mensaje = gestorCorreos.createMimeMessage();
            MimeMessageHelper ayudante = new MimeMessageHelper(mensaje, true, "UTF-8");

            ayudante.setFrom(remitente);
            ayudante.setTo(destinatario);
            ayudante.setSubject(asunto);
            ayudante.setText(contenido, true); // true indica que es contenido HTML

            gestorCorreos.send(mensaje);
            log.info("Correo enviado exitosamente a: {}", destinatario);

        } catch (MessagingException e) {
            log.error("Error al construir el correo para {}: {}", destinatario, e.getMessage());
        } catch (Exception e) {
            log.error("Fallo inesperado al enviar correo a {}: {}", destinatario, e.getMessage());
        }
    }
}
