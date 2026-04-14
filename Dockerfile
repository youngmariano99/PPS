# Etapa 1: Compilación (Build)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar el pom.xml y descargar dependencias (para aprovechar el caché de Docker)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copiar el código fuente y compilar el proyecto
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Runtime)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copiar el .jar desde la etapa de compilación
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto (Render lo inyectará dinámicamente)
EXPOSE 8080

# Ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
