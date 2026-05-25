import { fetchConAuth } from '../utils/apiBase';

/**
 * Obtiene el listado de candidatos que se postularon a una oferta de empleo.
 * Solo autorizado para el creador de la oferta.
 */
export const obtenerPostulacionesPorOferta = async (ofertaId) => {
  return await fetchConAuth(`/postulaciones/oferta/${ofertaId}`, {
    method: 'GET'
  });
};

/**
 * Obtiene el detalle completo de una postulación.
 * Si el estado actual es 'ENVIADO', el backend lo cambiará automáticamente a 'VISTO'.
 */
export const obtenerDetallePostulacion = async (id) => {
  return await fetchConAuth(`/postulaciones/${id}`, {
    method: 'GET'
  });
};

/**
 * Descarta un postulante, exigiendo obligatoriamente un código de motivo.
 * @param {string} id - ID de la postulación.
 * @param {object} payload - { motivoRechazoCodigo: string, feedbackAdicional: string }
 */
export const descartarPostulacion = async (id, payload) => {
  return await fetchConAuth(`/postulaciones/${id}/descartar`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

/**
 * Actualiza manualmente el estado de la postulación a 'EN_REVISION' o 'CONTACTADO'.
 * @param {string} id - ID de la postulación.
 * @param {string} nuevoEstado - 'EN_REVISION' o 'CONTACTADO'
 */
export const actualizarEstadoPostulacion = async (id, nuevoEstado) => {
  return await fetchConAuth(`/postulaciones/${id}/estado?nuevoEstado=${nuevoEstado}`, {
    method: 'PUT'
  });
};
