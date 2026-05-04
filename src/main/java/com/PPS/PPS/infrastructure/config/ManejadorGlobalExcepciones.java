package com.PPS.PPS.infrastructure.config;

import com.PPS.PPS.domain.exception.RecursoNoEncontradoException;
import com.PPS.PPS.domain.exception.ValidacionNegocioException;
import com.PPS.PPS.application.dto.ErrorRespuestaDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import org.springframework.dao.DataIntegrityViolationException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Interceptor global de excepciones para estandarizar las respuestas de error.
 * Captura excepciones técnicas y de negocio, devolviendo un ErrorRespuestaDto.
 */
@RestControllerAdvice
public class ManejadorGlobalExcepciones {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarRecursoNoEncontrado(RecursoNoEncontradoException ex, WebRequest request) {
        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.NOT_FOUND.value())
                .mensaje(ex.getMessage())
                .detalles(request.getDescription(false))
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ValidacionNegocioException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarValidacionNegocio(ValidacionNegocioException ex, WebRequest request) {
        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.BAD_REQUEST.value())
                .mensaje(ex.getMessage())
                .detalles(request.getDescription(false))
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarValidacionArgumentos(MethodArgumentNotValidException ex, WebRequest request) {
        String detalles = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.BAD_REQUEST.value())
                .mensaje("Error de validación en los campos enviados.")
                .detalles(detalles)
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorRespuestaDto> manejarViolacionIntegridad(DataIntegrityViolationException ex, WebRequest request) {
        String mensaje = "Error de integridad de datos.";
        HttpStatus status = HttpStatus.CONFLICT;

        if (ex.getRootCause() != null && ex.getRootCause().getMessage().contains("COOLDOWN_RESENA")) {
            mensaje = "Espera 24 horas para volver a calificar a este profesional.";
            status = HttpStatus.TOO_MANY_REQUESTS;
        }

        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(status.value())
                .mensaje(mensaje)
                .detalles(request.getDescription(false))
                .build();
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRespuestaDto> manejarExcepcionGlobal(Exception ex, WebRequest request) {
        ErrorRespuestaDto error = ErrorRespuestaDto.builder()
                .marcaDeTiempo(LocalDateTime.now())
                .estado(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .mensaje("Ha ocurrido un error inesperado en el servidor.")
                .detalles(ex.getMessage()) // En producción, evitar exponer detalles sensibles.
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


