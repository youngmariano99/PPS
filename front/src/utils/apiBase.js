import { supabase } from './supabaseClient';

// Base URL del backend Spring Boot
const API_BASE_URL = 'http://localhost:8080/api/v1'; 

/**
 * Función base para realizar peticiones autenticadas al backend.
 * Inyecta automáticamente el JWT (Bearer Token) si el usuario está logueado en Supabase.
 */
export async function fetchConAuth(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
  }

  return response.json();
}
