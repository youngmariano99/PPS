import { fetchConAuth } from '../utils/apiBase';

/**
 * Registra un nuevo usuario en el sistema.
 * Endpoint: POST /api/v1/auth/registro
 */
export const registrarUsuario = async (datosRegistro) => {
  return await fetchConAuth('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datosRegistro),
  });
};

/**
 * Inicia sesión para obtener un token JWT.
 * Endpoint: POST /api/v1/auth/login
 */
export const loginUsuario = async (credenciales) => {
  return await fetchConAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  });
};
