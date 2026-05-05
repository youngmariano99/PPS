# 11. Documentación de API con Swagger / OpenAPI

Este proyecto cuenta con **Swagger UI** integrado para facilitar el testeo de los endpoints de la API, la visualización de los modelos de datos (DTOs) y la interacción directa con el backend sin necesidad de herramientas externas como Postman.

## 1. Cómo levantar el servidor Backend
Para que Swagger esté disponible, primero tenés que iniciar la aplicación Java. Podés hacerlo de varias formas:

### Opción A: Desde la Terminal (Recomendado)
Abrí una terminal en la raíz del proyecto y ejecutá:
```bash
./mvnw spring-boot:run
```
*(En Windows, si usás PowerShell o CMD, usá `mvnw.cmd spring-boot:run`)*.

### Opción B: Desde el IDE (IntelliJ / Eclipse)
1. Buscá la clase principal: `src/main/java/com/PPS/PPS/PpsApplication.java`.
2. Hacé click derecho y seleccioná **"Run 'PpsApplication'"**.

### Opción C: Generando el JAR
Si preferís compilarlo primero:
```bash
./mvnw clean package
java -jar target/PPS-0.0.1-SNAPSHOT.jar
```

## 2. Cómo acceder
Una vez que veas el mensaje `Started PpsApplication in ... seconds` en la consola, podés acceder a:

*   **Swagger UI (Interfaz Visual):** 
    [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html)
*   **OpenAPI Specs (JSON):** 
    [http://localhost:8080/api/v1/v3/api-docs](http://localhost:8080/api/v1/v3/api-docs)

> [!NOTE]
> La URL incluye `/api/v1` debido a la configuración del `context-path` del servidor.

## 2. Funcionalidades principales
Desde la interfaz de Swagger UI podés:
1.  **Explorar Endpoints:** Ver todos los controladores (`perfiles`, `rubros`, `resenas`, etc.) y sus métodos disponibles (GET, POST, PUT, DELETE).
2.  **Try it out:** Probar los endpoints enviando datos reales.
3.  **Modelos de Datos:** Consultar la estructura de los DTOs (Data Transfer Objects) que la API espera recibir y los que devuelve.
4.  **Códigos de Respuesta:** Ver los posibles códigos HTTP que cada endpoint puede retornar (200, 201, 400, 404, 500).

## 3. Autenticación en Swagger
Aunque actualmente la configuración de seguridad (`SecurityConfig.java`) es permisiva para facilitar el desarrollo, en el futuro algunos endpoints requerirán un Token JWT.
*   Para testear endpoints protegidos, deberás usar el botón **"Authorize"** e ingresar el token obtenido del endpoint de login.

## 4. Configuración Técnica (Spring Boot 3)
La implementación se basa en la librería **SpringDoc OpenAPI v2**:
*   **Dependencia:** `springdoc-openapi-starter-webmvc-ui` en el `pom.xml`.
*   **Configuración:** Localizada en `src/main/resources/application.yml` bajo el nodo `springdoc`.
*   **Seguridad:** Los endpoints de Swagger están excluidos de los filtros de seguridad en `SecurityConfig.java` para permitir su acceso libre.
