package com.PPS.PPS.domain.exception;

/**
 * Excepción lanzada cuando una operación viola una regla de negocio.
 * Se mapea generalmente a un error HTTP 400.
 */
public class ValidacionNegocioException extends RuntimeException {
    public ValidacionNegocioException(String mensaje) {
        super(mensaje);
    }
}

