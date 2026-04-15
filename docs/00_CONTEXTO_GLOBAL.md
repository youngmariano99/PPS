# 00_CONTEXTO_GLOBAL: Backend de Plataforma de Servicios y Empleos

## 1. Visión, Objetivo y Problema

*   **Problema:** La fragmentación y dificultad en la búsqueda de profesionales locales de confianza, sumado al "agujero negro" y la falta de transparencia que sufren los postulantes en la búsqueda de empleo formal.
*   **Objetivo:** Construir una plataforma de fricción cero que una oferta y demanda de servicios locales mediante geolocalización en tiempo real (**PostGIS**), integrando un sistema de postulaciones laborales transparente y un motor anti-fraude para reseñas.
*   **Alcance Backend:** API RESTful robusta que soporte autenticación, gestión de perfiles duales (Usuarios/Proveedores/Empresas), manejo de coordenadas espaciales, algoritmos de ranking y flujos de matching laboral.
*     *Excluye:* pasarelas de pago y chat en tiempo real.

---

## 2. Stack Tecnológico Estricto (Backend)

El código debe generarse **EXCLUSIVAMENTE** utilizando las siguientes dependencias y herramientas:

*   **Lenguaje y Framework:** Java 21+ con Spring Boot 4.0.5.
*   **Base de Datos:** PostgreSQL (alojada en Supabase) con la extensión espacial **PostGIS**.
*   **Dependencias Core:**
    *   `spring-boot-starter-web`: Para exponer la API REST (Tomcat embebido).
    *   `spring-boot-starter-data-jpa`: Para el acceso a datos mediante Hibernate.
    *   `postgresql`: Driver de conexión.
    *   `hibernate-spatial`: Para mapear los tipos de datos geométricos/geográficos de PostGIS en las entidades Java.
    *   `lombok`: Para reducir el código repetitivo (generación de getters, setters, constructores y builders).
    *   `spring-boot-devtools`: Para agilizar el desarrollo local.
*   **Integración Frontend (Contexto):** El cliente consumirá esta API usando React y renderizará mapas con Leaflet alimentados por OpenStreetMap.

---

## 3. Arquitectura y Patrones de Diseño (Innegociable)

El proyecto se rige por los principios de **Clean Architecture** (Arquitectura Limpia) y los principios **SOLID**. La estructura de paquetes debe separar claramente el **Dominio** (Entities), la **Aplicación** (Services, DTOs), la **Infraestructura** (Repositories) y la **Presentación** (Controllers).

### Patrones de Diseño Obligatorios:
*   **Patrones Creacionales (Factory Method / Abstract Factory):** Utilizar para instanciar objetos complejos (ej. creación de distintos tipos de perfiles o postulaciones). **NUNCA** instanciar clases con lógica compleja usando `new` directamente en controladores o servicios principales.
*   **Patrones Estructurales (Decorator / Proxy):** Utilizar para agregar comportamientos transversales (como logging, validaciones específicas de negocio o caché) **SIN** modificar el código de la clase original, respetando el principio Open/Closed.
*   **Patrones de Comportamiento (Strategy / State):** Utilizar para eliminar bloques masivos de `if/else` o `switch`. Si una entidad cambia de comportamiento según su estado (ej. una Postulación pasa de "Enviado" a "Visto"), la lógica debe encapsularse en clases de estado separadas. Prohibido crear métodos de control de flujo masivos.

---

## 4. Reglas Estrictas de Código y Nomenclatura

*   **Idioma del Código:** El dominio del negocio (variables, métodos, clases, tablas) **DEBE** estar en **Español Latinoamericano** claro y descriptivo.
    *   *Ejemplo Correcto:* `obtenerProveedoresCercanos()`, `class GestorDePostulaciones`, `List<OfertaEmpleo>`.
    *   *Excepción:* Sufijos del framework o patrones globales (`UsuarioController`, `OfertaService`, `PostulacionRepository`).
*   **Documentación:** Toda clase, interfaz y método complejo **DEBE** incluir **Javadoc en español** explicando concisamente qué hace, parámetros y retornos.
*   **Límite Anti-Monolito:** Ningún archivo debe superar las **350-400 líneas** de código. Si se acerca a este límite, la lógica **DEBE** modularizarse abstrayendo responsabilidades.

---

## 5. Regla Suprema de Ejecución (ANTI-ALUCINACIONES)

1.  **Prohibido Inventar:** La IA **NUNCA** debe asumir decisiones de negocio, reglas de base de datos o arquitectura sin respaldo explícito.
2.  **Parada de Seguridad:** Si falta contexto o no se entiende un flujo, la IA **DEBE DETENERSE** inmediatamente.
3.  **Acción Requerida ante Duda:** En lugar de generar código inventado, la IA debe devolver un archivo llamado `CUESTIONARIO_DUDAS.md` con las preguntas específicas que necesita que el humano responda para poder continuar con el desarrollo seguro.

---

## 6. Gestión de Multimedia y Límites de Plan

Para garantizar la sostenibilidad y calidad visual de la plataforma, se aplican los siguientes límites estrictos:

### 6.1 Límites de Imágenes (Cloudinary)
*   **Plan Gratuito:** 
    *   1 Foto de Perfil.
    *   Máximo **5** fotos de portafolio/galería.
*   **Plan Premium:** 
    *   1 Foto de Perfil.
    *   Máximo **20** fotos de portafolio/galería.

### 6.2 Enlaces de Video (Externos)
*   **Capacidad:** Máximo **3** enlaces por perfil (independiente del plan).
*   **Dominios Permitidos (Regex Validation):**
    *   YouTube (`youtube.com`, `youtu.be`)
    *   Instagram (`instagram.com`)
    *   TikTok (`tiktok.com`)
    *   Google Drive (`drive.google.com`)