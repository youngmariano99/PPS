# Guía de Exposición: Tiempo Real con WebSockets y Patrón Adapter

Este documento contiene la explicación didáctica, los flujos y los fragmentos de código reales de nuestro proyecto para exponer en clase de Programación. Está diseñado para que sea fácil de entender, estructurado paso a paso y visualmente descriptivo.

---

## 💡 1. Introducción: ¿Por qué y para qué implementamos Tiempo Real?

### El Escenario Original (Polling)
Antes de esta funcionalidad, para mostrar notificaciones nuevas (como un cambio en el estado de una postulación) el navegador del usuario tenía que realizar peticiones HTTP de tipo **Polling** (preguntar al servidor cada 30 segundos: *"¿Hay algo nuevo?"*).
*   **Problema de Servidor:** Cientos de usuarios preguntando constantemente saturan la base de datos con consultas redundantes (99% de las veces la respuesta era "no hay nada nuevo").
*   **Problema de Experiencia (UX):** Si una empresa rechazaba o veía tu postulación, podías tardar hasta 30 segundos en enterarte, lo que se sentía lento y poco interactivo.

### La Solución (WebSockets)
Implementamos una conexión **push bidireccional permanente (WebSockets)**. Ahora, el servidor es quien "empuja" la notificación al navegador en milisegundos en el momento exacto en que ocurre el evento, eliminando las consultas repetitivas.

---

## 🛠️ 2. El Desafío de Ingeniería: ¿Por qué usamos el Patrón Adapter?

Un error común al programar tiempo real en React es acoplar el componente visual (`CampanaNotificaciones.jsx`) directamente a la librería del proveedor (por ejemplo, escribir código directo de Supabase dentro del botón o de la campana).

### El problema de acoplar la UI:
¿Qué pasa si en el futuro decidimos apagar Supabase y usar nuestro propio servidor de WebSockets nativo en **Spring Boot (STOMP)**? Tendríamos que reescribir todo el componente de la campana, arriesgándonos a romper los estilos o la lógica visual.

### La Solución: El Patrón Adapter (Desacoplamiento de Red)
El **patrón de diseño Adapter** actúa como un "traductor". Define un contrato común para que el componente visual no sepa (ni le importe) si el mensaje viene de Supabase o de Spring Boot. Solo le importa que llegue.

```
┌────────────────────────────────────────┐
│      CampanaNotificaciones (UI)        │
└───────────────────┬────────────────────┘
                    │ Consume DTOs Estructurados (camelCase)
                    ▼
┌────────────────────────────────────────┐
│     Interfaz Común (IRealtimeAdapter)  │
└─────────┬────────────────────┬─────────┘
          │                    │
          ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│ SupabaseAdapter  │  │ SpringBootAdapter│
│ (Postgres WAL)   │  │ (STOMP Protocol) │
└──────────────────┘  └──────────────────┘
```

---

## 🔄 3. El Flujo de Datos Paso a Paso (Didáctico)

Cuando una Empresa cambia el estado de una postulación (por ejemplo, a `VISTO`), la información viaja así:

1.  **Backend (Java):** La empresa realiza la acción en el backend. El `NotificacionEventListener` de Spring Boot intercepta el evento y guarda la notificación en PostgreSQL:
    ```java
    notificacionRepository.save(notificacion);
    ```
2.  **Base de Datos (Supabase/Postgres):** El registro se guarda físicamente en la tabla `notificaciones`.
3.  **Motor Realtime (Supabase):** Como habilitamos la replicación de tiempo real en Postgres para esta tabla, Supabase captura el `INSERT` del log de la base de datos.
4.  **Emisión por Socket:** Supabase distribuye el evento por WebSocket filtrando para que solo le llegue al `usuario_id` destinatario.
5.  **Recepción y Traducción (Adapter en React):** El navegador recibe el JSON en `snake_case`. El `SupabaseRealtimeAdapter` lo intercepta y lo traduce al formato estándar de la aplicación (`camelCase`).
6.  **Actualización Visual (React):** La campana recibe el objeto traducido, incrementa el contador de no leídos de forma animada (con Framer Motion) y agrega la notificación a la lista sin recargar la página.

---

## 💻 4. Explicando el Código Real (Ejemplos Didácticos)

### Paso A: La Interfaz de Contrato (`IRealtimeAdapter`)
Es una clase abstracta que obliga a todos los adaptadores a implementar los mismos métodos:
```javascript
class IRealtimeAdapter {
    connect(userId, onNotificationReceived) {
        throw new Error("Método 'connect' debe ser implementado.");
    }
    disconnect() {
        throw new Error("Método 'disconnect' debe ser implementado.");
    }
}
```

### Paso B: El Adaptador de Supabase (El Traductor)
Este adaptador se suscribe al canal de Supabase. Su magia principal está en **mapear el formato de base de datos a formato de frontend**:
```javascript
class SupabaseRealtimeAdapter extends IRealtimeAdapter {
    connect(userId, onNotificationReceived) {
        this.channel = supabase
            .channel(`noti-realtime-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notificaciones',
                filter: `usuario_id=eq.${userId}`
            }, (payload) => {
                // TRADUCCIÓN: De snake_case de BD a camelCase de React
                const dto = {
                    id: payload.new.id,
                    tipoNotificacion: payload.new.tipo_notificacion,
                    mensaje: payload.new.mensaje,
                    entidadReferenciaId: payload.new.entidad_referencia_id,
                    leida: payload.new.leida,
                    fechaCreacion: payload.new.created_at
                };
                onNotificationReceived(dto); // Enviamos el dato ya traducido
            })
            .subscribe();
    }
    // ... método disconnect para limpiar recursos
}
```

### Paso C: La Fábrica en Caliente (`useRealtimeNotifications`)
Este custom hook actúa como una fábrica simple. Permite cambiar el proveedor de red modificando una sola línea de código, haciendo que la migración sea instantánea:
```javascript
const PROVIDER_TYPE = 'SUPABASE'; // Cambiar a 'SPRING_BOOT' para conmutar de backend

function useRealtimeNotifications(userId, apiUrl, onNotificationReceived) {
    const adapterRef = useRef(null);
    useEffect(() => {
        if (!userId) return;
        
        // FÁBRICA: Instancia el adaptador elegido
        if (PROVIDER_TYPE === 'SUPABASE') {
            adapterRef.current = new SupabaseRealtimeAdapter();
        } else {
            adapterRef.current = new SpringBootRealtimeAdapter(apiUrl);
        }
        
        adapterRef.current.connect(userId, onNotificationReceived);
        return () => adapterRef.current?.disconnect();
    }, [userId, apiUrl, onNotificationReceived]);
}
```

### Paso D: Integración Limpia en la Campana (UI)
Gracias a toda esta abstracción, el componente visual de la campana se mantiene sumamente limpio y libre de lógica de sockets:
```javascript
export default function CampanaNotificaciones(props) {
    // ...
    const [notificaciones, setNotificaciones] = useState([]);
    
    // Callback que recibe la notificación limpia del adaptador
    const handleNuevaNotificacion = useCallback((nuevaNoti) => {
        setNotificaciones(prev => [nuevaNoti, ...prev].slice(0, 5));
        setUnreadCount(prev => prev + 1);
    }, []);

    // LLAMADA AL ADAPTER: Desacoplamiento absoluto
    useRealtimeNotifications(userId, apiUrl, handleNuevaNotificacion);
    // ...
}
```

---

## 🎓 5. Conclusiones para la Defensa de la Exposición

Si te hacen preguntas durante la presentación, podés cerrar con estas 3 ideas clave de arquitectura:
1.  **Portabilidad:** La UI está totalmente desacoplada de la infraestructura de red. Cambiar de Supabase a Spring Boot STOMP no requiere tocar una sola línea de código visual de la campana.
2.  **Sostenibilidad y Rendimiento:** Reemplazar el Polling HTTP por WebSockets reduce significativamente la cantidad de peticiones que recibe el backend, disminuyendo el consumo de base de datos y mejorando los tiempos de respuesta.
3.  **Tolerancia a fallos:** Mantuvimos el polling REST tradicional únicamente como un "fallback secundario" (mecanismo de respaldo). Si la conexión del WebSocket se cae por problemas de señal del usuario, el sistema sigue funcionando y recuperando las alertas en segundo plano.
