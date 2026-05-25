package com.PPS.PPS.infrastructure.config;

import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.application.dto.response.ErrorRespuestaDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import org.springframework.dao.DataIntegrityViolationException;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Interceptor global de excepciones para estandarizar las respuestas de error.
 * Captura excepciones técnicas y de negocio, devolviendo un ErrorRespuestaDto.
 * Registra logs detallados en la consola e inyecta códigos de rastreo (Trace IDs).
 */
@RestControllerAdvice
@Slf4j
public class ManejadorGlobalExcepciones {

    private String generarCodigoRastreo(String prefijo) {
        return prefijo + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarRecursoNoEncontrado(RecursoNoEncontradoException ex, WebRequest request) {
        String codigoRastreo = generarCodigoRastreo("ERR-NOTFOUND");
        log.warn("[{}] Recurso no encontrado en {}: {}", codigoRastreo, request.getDescription(false), ex.getMessage());

        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.NOT_FOUND.value())
                .mensaje(ex.getMessage())
                .detalles(request.getDescription(false))
                .codigoRastreo(codigoRastreo)
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ValidacionNegocioException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarValidacionNegocio(ValidacionNegocioException ex, WebRequest request) {
        String codigoRastreo = generarCodigoRastreo("ERR-NEGOCIO");
        log.warn("[{}] Advertencia de regla de negocio en {}: {}", codigoRastreo, request.getDescription(false), ex.getMessage());

        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.BAD_REQUEST.value())
                .mensaje(ex.getMessage())
                .detalles(request.getDescription(false))
                .codigoRastreo(codigoRastreo)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarValidacionArgumentos(MethodArgumentNotValidException ex, WebRequest request) {
        String codigoRastreo = generarCodigoRastreo("ERR-VALIDACION");
        String detalles = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.warn("[{}] Error de validación de argumentos en {}: {}", codigoRastreo, request.getDescription(false), detalles);

        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.BAD_REQUEST.value())
                .mensaje("Error de validación en los campos enviados.")
                .detalles(detalles)
                .codigoRastreo(codigoRastreo)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarViolacionIntegridad(DataIntegrityViolationException ex, WebRequest request) {
        String codigoRastreo = generarCodigoRastreo("ERR-INTEGRIDAD");
        log.error("[{}] Violación de integridad de datos en {}: {}", codigoRastreo, request.getDescription(false), ex.getMessage(), ex);

        String mensaje = "Error de integridad de datos.";
        HttpStatus status = HttpStatus.CONFLICT;

        if (ex.getRootCause() != null) {
            String rootMsg = ex.getRootCause().getMessage();
            if (rootMsg.contains("COOLDOWN_RESENA")) {
                mensaje = "Espera 24 horas para volver a calificar a este profesional.";
                status = HttpStatus.TOO_MANY_REQUESTS;
            } else if (rootMsg.contains("usuarios_email_key")) {
                mensaje = "El correo electrónico ingresado ya se encuentra registrado.";
            } else if (rootMsg.contains("perfiles_empresa_cuit_key")) {
                mensaje = "El CUIT ingresado ya se encuentra registrado para otra empresa.";
            } else if (rootMsg.contains("perfiles_proveedor_dni_key")) {
                mensaje = "El DNI ingresado ya se encuentra registrado para otro profesional.";
            }
        }

        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(status.value())
                .mensaje(mensaje)
                .detalles(ex.getRootCause() != null ? ex.getRootCause().getMessage() : request.getDescription(false))
                .codigoRastreo(codigoRastreo)
                .build();
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRespuestaDto> manejarExcepcionGlobal(Exception ex, WebRequest request) {
        String codigoRastreo = generarCodigoRastreo("ERR-SISTEMA");
        log.error("[{}] Error inesperado en el servidor en {}: {}", codigoRastreo, request.getDescription(false), ex.getMessage(), ex);

        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .mensaje("Ha ocurrido un error inesperado en el servidor.")
                .detalles(ex.getMessage()) // En producción, evitar exponer detalles sensibles.
                .codigoRastreo(codigoRastreo)
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
