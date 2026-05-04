package com.PPS.PPS.domain.exception;

/**
 * Excepción lanzada cuando un recurso solicitado no existe en la base de datos.
 * Se mapea generalmente a un error HTTP 404.
 */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}

