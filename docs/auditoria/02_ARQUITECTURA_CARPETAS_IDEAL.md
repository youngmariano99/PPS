# 02_ARQUITECTURA_CARPETAS_IDEAL: Clean Architecture en Spring Boot

Para cumplir estrictamente con los estándares y garantizar que nuestra lógica de negocio esté aislada, el proyecto debe evolucionar hacia una estructura orientada a **Clean Architecture / Arquitectura Hexagonal**.

## Árbol de Directorios Propuesto

```text
com.PPS.PPS
├── config                      # Configuración general de Spring, Beans globales y Exception Handlers transversales.
│
├── domain                      # EL NÚCLEO: Independiente de cualquier framework (ni JPA, ni Spring).
│   ├── model                   # Entidades de Dominio puras de Java (POJOs). Representan las reglas de negocio reales.
│   ├── repository              # Interfaces (Puertos de Salida) que dictan cómo se guardan los datos (sin extender de JpaRepository).
│   └── exception               # Excepciones puras de negocio (ej. ReglaNegocioInvalidaException).
│
├── application                 # CASOS DE USO: Orquestan la lógica del dominio.
│   ├── usecase                 # Interfaces de los casos de uso (Puertos de Entrada). Ej: IRegistrarUsuarioUseCase.
│   ├── service                 # Implementaciones concretas de los Use Cases (aquí van las anotaciones @Service).
│   └── dto                     # Objetos de Transferencia de Datos entre la capa de entrada (API) y la Aplicación.
│
├── infrastructure              # IMPLEMENTACIONES Y ADAPTADORES: Todo lo que interactúa con el mundo exterior.
│   ├── adapter
│   │   ├── in                  # Adaptadores de Entrada (Driver Adapters)
│   │   │   └── web             # Controladores REST (Controllers). Reciben HTTP y llaman a los UseCases de 'application'.
│   │   │
│   │   └── out                 # Adaptadores de Salida (Driven Adapters)
│   │       ├── persistence     # Implementación concreta de DB.
│   │       │   ├── entity      # Entidades JPA (aquí sí van las anotaciones @Entity, @Table).
│   │       │   ├── mapper      # Clases para mapear de JPA Entity <-> Domain Model.
│   │       │   └── repository  # Spring Data Repositories e implementaciones concretas de los repositorios del 'domain'.
│   │       │
│   │       └── api             # Clientes de APIs Externas (Supabase, MercadoPago, Geocoding).
│   │
└── common                      # Utilidades transversales e implementaciones de Patrones (Factories, Decorators puros).
```

## Responsabilidad por Capas

1. **Dominio (`domain`):** Es la razón de ser de la aplicación. Aquí viven objetos como `Usuario` o `OfertaEmpleo` como objetos Java limpios. Tienen comportamientos, no son solo getters/setters. **Regla de oro:** No debe importar absolutamente nada de `org.springframework` o `jakarta.persistence`.
2. **Aplicación (`application`):** Actúa como director de orquesta. Recibe solicitudes desde los controladores (a través de DTOs), invoca reglas de negocio en las entidades del Dominio y coordina con los puertos de salida (ej. guardar en DB).
3. **Infraestructura (`infrastructure`):** Es la capa "sucia". Contiene controladores web, integración con PostgreSQL (JPA/PostGIS), y clientes HTTP (RestClient). Es la encargada de adaptar el mundo exterior al lenguaje que la aplicación entiende.

## Ventajas de este Enfoque
- Evita de raíz que los controladores manejen lógica de negocio.
- Permite inyectar diferentes implementaciones de base de datos sin tocar la lógica de negocio.
- Facilita testear Casos de Uso (`application/service`) haciendo *mocking* simple de interfaces de repositorios, sin depender de bases de datos embebidas.
