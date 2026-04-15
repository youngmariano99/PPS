# 07_ARQUITECTURA_FRONTEND_Y_API: Estructura React/Framer y Contratos

## 1. Objetivo del Documento
Definir la arquitectura estricta del directorio `/front`. El objetivo es mantener una separación absoluta entre la Interfaz de Usuario (UI) y la lógica de conexión con el Backend (Spring Boot). Esto garantiza que el código sea 100% modular, permitiendo migrar o reutilizar componentes fácilmente en entornos como Framer.

## 2. Estructura de Carpetas Obligatoria (`/front/src`)
La IA DEBE respetar esta jerarquía al generar cualquier código para el frontend.

```text
/front
  /src
    ├── /api          -> CONTRATOS API: Funciones puras que hacen fetch a Spring Boot.
    ├── /components   
    │     ├── /framer -> CODE COMPONENTS: Componentes listos para copiar y pegar en Framer.
    │     └── /ui     -> UI REUTILIZABLE: Componentes atómicos (Botones, Inputs).
    ├── /hooks        -> LÓGICA DE ESTADO: Custom hooks para manejo de datos.
    ├── /utils        -> HERRAMIENTAS GLOBALES: Configuración de Supabase, apiBase.js.
```

## 3. Estándar de Componentes para Framer
Cada componente diseñado para Framer debe cumplir con:
*   **Exportación por Defecto**: `export default function NombreComponente(props)`.
*   **Property Controls**: Uso de `addPropertyControls` para exponer variables de diseño y configuración (ej. `apiUrl`, `colores`).
*   **Branding Inyectado**: Uso obligatorio de la paleta definida en `08_BRANDING_FRONT.md`.
    *   Primario: `#7c3aed` (Violeta).
    *   Fondo Card: `#ffffff`.
    *   Texto Título: `#000000`.
*   **Self-Contained**: Aunque los utilitarios estén en `/front/src/utils`, el componente de Framer debe ser fácil de portar, incluyendo las importaciones necesarias.

## 4. Configuración Base de Red (/utils/apiBase.js)
Todas las peticiones protegidas a Spring Boot deben inyectar automáticamente el JWT de Supabase.

```javascript
import { supabase } from './supabaseClient';

const API_BASE_URL = 'http://localhost:8080/api/v1'; // Ajustar según entorno

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
```

## 5. Sincronización Obligatoria
Cuando la IA desarrolle un nuevo endpoint en Spring Boot:
1.  Debe crear su contrato en `/front/src/api/`.
2.  Debe crear un componente visual en `/front/src/components/framer/` siguiendo el branding oficial.
