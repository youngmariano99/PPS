# 🎓 Presentación Examen Final: CHAMBA (Marketplace de Servicios)

## 🗣️ Introducción (El "Elevator Pitch")
**Lo que van a decir:**  
> "Hola profesor/a. Hoy presentamos **CHAMBA**, nuestro marketplace de servicios. Nuestro enfoque no fue solo hacer que 'funcione', sino construir un backend con calidad de producción, escalable y seguro. Vamos a mostrarles cómo cumplimos con las operaciones CRUD, cómo estructuramos la API REST y las decisiones técnicas que tomamos para lograrlo."

---

## 🧱 Bloque 1: Arquitectura Limpia (Cómo organizamos la casa)
**El concepto:** Explicar que no metieron todo el código en una sola carpeta, sino que usaron "Clean Architecture".

**Cómo explicarlo fácil:**
*   **Dominio:** Es el núcleo del sistema. Acá están nuestras reglas de negocio puras, sin depender de ningún framework.
*   **Aplicación (Casos de Uso):** Es el "director de orquesta". Coordina lo que tiene que pasar (ej. cuando alguien se registra) sin saber cómo se guarda en la base de datos.
*   **Infraestructura:** Es la capa técnica que habla con el mundo exterior: Controladores web, la base de datos PostgreSQL, y conexiones con Supabase o Mercado Pago.

---

## 🔄 Bloque 2: La API REST y el CRUD (Requisito del Profesor)
**El concepto:** Demostrar que tienen endpoints 100% funcionales para Crear, Leer, Actualizar y Borrar.

**Cómo explicarlo fácil:**  
"Mapeamos estrictamente nuestras operaciones de negocio a los verbos HTTP estándar:"
*   **C (Crear):** Usamos `@PostMapping`. Recibimos los datos y, si todo sale bien, devolvemos un estado `201 Created`.
*   **R (Leer):** Usamos `@GetMapping`. Permite traer listas o buscar por ID. Si no existe, capturamos el error y devolvemos un `404 Not Found` limpio.
*   **U (Actualizar):** Usamos `@PutMapping` para reemplazar datos garantizando que la operación sea idempotente (hacerla varias veces da el mismo resultado).
*   **D (Borrar):** Usamos `@DeleteMapping`. Y aquí hay un diferencial: implementamos **Borrado Lógico (Soft Delete)**. No borramos el dato físico para no romper la integridad, solo le cambiamos el estado a `activo = false` mediante Hibernate, y devolvemos un `204 No Content`.

---

## 🛡️ Bloque 3: Seguridad y DTOs (Por qué no exponemos la base de datos)
**El concepto:** Explicar el uso de Data Transfer Objects.

**Cómo explicarlo fácil:**  
"Nuestras Entidades de base de datos nunca llegan al cliente. Usamos **DTOs** por tres motivos:
1.  **Seguridad:** No filtramos contraseñas ni IDs ocultos.
2.  **Rendimiento:** Evitamos errores de recursividad al transformar a JSON.
3.  **Contrato Estable:** Mantenemos un contrato fijo con el frontend independientemente de cómo cambie la DB."

> **Dato extra:** "Incluso separamos los DTOs en `request` (donde aplicamos las validaciones `@Valid`) y `response` (lo que sale limpio hacia el cliente)."

---

## 🧪 Bloque 4: Swagger y Pruebas (Requisito del Profesor)
**El concepto:** Mostrar la documentación interactiva.

**Cómo explicarlo fácil:**  
"Cumpliendo con los requisitos, integramos **Swagger (OpenAPI 3)**. Nuestra API está 100% documentada. Esto genera una interfaz gráfica donde pudimos realizar todas las pruebas de nuestras rutas, permitiendo incluso inyectar el token **JWT** para probar los endpoints protegidos directamente desde el navegador."

---

## 🧠 Bloque 5: Decisiones Arquitectónicas (El "Por Qué")
*Este bloque demuestra que pensaron como verdaderos ingenieros de software.*

1.  **Sincronización Dual con Supabase:**  
    *   **Por qué:** En lugar de guardar contraseñas (riesgo de seguridad), delegamos la autenticación a Supabase. Guardamos el UUID localmente para mantener la integridad de los perfiles.
2.  **Columnas JSONB en PostgreSQL:**  
    *   **Por qué:** Para datos variables (redes sociales o especialidades), usamos esquemas **JSONB**. Nos da la flexibilidad de NoSQL con la robustez de SQL.
3.  **Carga de Archivos vs. Enlaces:**  
    *   **Por qué:** Las fotos se suben a **Cloudinary (CDN)** porque guardar imágenes en la DB arruina el rendimiento. Para videos, usamos enlaces externos para ahorrar costos y mejorar el **SEO**.
4.  **Slugs vs. UUIDs para el Frontend:**  
    *   **Por qué:** Reemplazamos URLs con IDs largos por **Slugs** (ej. `/proveedor/kevin-yanez-programador`). Esto hace que los perfiles sean compartibles y posicionen mejor en Google.
5.  **Transacciones Atómicas:**  
    *   **Por qué:** El registro está anotado con `@Transactional`. Es una operación "todo o nada", evitando dejar cuentas a medio crear si algo falla.