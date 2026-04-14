import { fetchConAuth } from '../utils/apiBase';

/**
 * Registra el perfil de un proveedor independiente.
 * Requiere que el usuario ya esté autenticado.
 */
export const crearPerfilProveedor = async (usuarioId, datosPerfil) => {
  return await fetchConAuth(`/perfiles/proveedor/${usuarioId}`, {
    method: 'POST',
    body: JSON.stringify(datosPerfil),
  });
};

/**
 * Registra el perfil de una empresa.
 */
export const crearPerfilEmpresa = async (usuarioId, datosPerfil) => {
  return await fetchConAuth(`/perfiles/empresa/${usuarioId}`, {
    method: 'POST',
    body: JSON.stringify(datosPerfil),
  });
};

/**
 * Busca proveedores y empresas dentro de un radio geográfico.
 * Retorna latitud y longitud para renderizar en Leaflet/OpenStreetMap.
 */
export const buscarPerfilesCercanos = async (lat, lon, radioKm = 10) => {
  return await fetchConAuth(`/directorio/buscar?lat=${lat}&lon=${lon}&radioKm=${radioKm}`, {
    method: 'GET'
  });
};
