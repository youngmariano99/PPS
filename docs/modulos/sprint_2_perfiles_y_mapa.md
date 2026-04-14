# MÓDULO: sprint_2_perfiles_y_mapa (Directorio y Geolocalización)

## 1. Objetivo del Módulo
Levantar el "corazón" del marketplace: el directorio público de servicios. El objetivo es que los usuarios puedan crear sus perfiles de Proveedor o Empresa, que sus direcciones se conviertan automáticamente en coordenadas geográficas (Geocoding), y que los clientes puedan buscarlos filtrando por distancia real en kilómetros.

## 2. Tareas Técnicas y Flujo de Trabajo

* **Capa de Dominio (Entidades y Repositorios):**
  * Crear las entidades `Rubro`, `PerfilProveedor`, `PerfilEmpresa` y `Portafolio` mapeando las tablas exactas de `01_MODELO_DE_DATOS.md`.
  * **Crucial (PostGIS):** La columna `ubicacion` debe mapearse usando la clase `org.locationtech.jts.geom.Point`. Configurar el SRID 4326.
  * En los repositorios (ej. `PerfilProveedorRepository`), crear métodos de consulta espaciales. Utilizar `@Query` con funciones de PostGIS como `ST_DWithin` para buscar perfiles que estén a "X" metros de un punto dado.

* **Capa de Integración y Servicios (Geocoding y Lógica):**
  * Crear un `DirectorioService` (o servicios separados por perfil) para manejar la lógica de negocio.
  * **Flujo de Geocoding:** Al crear o actualizar un perfil, el servicio debe tomar los campos de dirección (`calle`, `numero`, `ciudad`, `provincia`, `pais`), armar un string, y hacer un GET a la API de **Nominatim (OpenStreetMap)** (ej. `https://nominatim.openstreetmap.org/search?format=json&q=...`). 
  * Con la Latitud y Longitud obtenidas de Nominatim, instanciar el objeto `Point` con la factoría geométrica (SRID 4326) y guardarlo en la base de datos.
  * Añadir un `Thread.sleep(1000)` si se hacen múltiples llamadas a Nominatim, para respetar su política de uso gratuito y evitar baneos.

* **Capa de Presentación (Controllers):**
  * Crear `DirectorioController` (o `PerfilController`) con endpoints para:
    * Crear/Editar Perfil Proveedor y Empresa.
    * `GET /api/v1/directorio/buscar`: Recibe `latitud`, `longitud`, `radioKm` y opcionalmente `rubroId`. Retorna la lista de perfiles dentro del radio.

* **Sincronización de Contratos API (Frontend):**
  * Generar el archivo `/front/src/api/directorioApi.js` exportando las funciones de creación de perfiles y, fundamentalmente, la función de búsqueda geolocalizada.

## 3. Reglas Estrictas para la IA (Generación de Código)
* **Precisión Geométrica:** Asegurar que al crear el `Point` de JTS, el orden de las coordenadas sea `Longitud` (X) primero y luego `Latitud` (Y). Invertir esto generará ubicaciones en el medio del océano.
* **Separación de Responsabilidades:** No colocar la lógica de llamadas HTTP a Nominatim dentro del Controller. Crear un componente específico, por ejemplo `OpenStreetMapClient` o `GeocodingService`.
* **DTOs Geográficos:** Al devolver los resultados al frontend, el DTO no debe enviar el objeto complejo `Point` de JTS (que puede romper el JSON), sino que debe extraer y enviar campos simples `latitud` y `longitud` (Double).