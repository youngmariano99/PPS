# 📧 Configuración de Resend (Email) para Autenticación y Olvido de Contraseña

Para que los correos de confirmación de registro y restablecimiento de contraseña funcionen correctamente usando **Resend**, debemos configurar dos partes: **Supabase** (que es quien dispara los correos de Auth) y el **Backend** (para correos personalizados).

---

## 1. Configuración en Supabase (Fundamental)
Como usamos Supabase para la gestión de usuarios, es Supabase quien envía los mails de "Bienvenida" y "Reset Password". Debemos decirle que use el SMTP de Resend.

1.  **Entra a tu proyecto en Supabase.**
2.  Ve a **Project Settings** (el engranaje abajo a la izquierda).
3.  Ve a **Authentication**.
4.  Busca la sección **SMTP Settings**.
5.  Activa el switch de **Enable Custom SMTP**.
6.  Completa con estos datos de Resend:
    *   **Sender email:** El email que verificaste en Resend (ej: `hola@tu-dominio.com`). Si no tienes dominio, Resend te da uno de prueba: `onboarding@resend.dev`.
    *   **Sender name:** "Chamba App" o el nombre que prefieras.
    *   **SMTP Host:** `smtp.resend.com`
    *   **SMTP Port:** `465` (SSL) o `587` (TLS).
    *   **SMTP User:** `resend` (Literalmente la palabra "resend").
    *   **SMTP Pass:** Tu API Key de Resend (empieza con `re_...`).

> [!TIP]
> Si usas el puerto `465`, asegúrate de que la opción SSL esté activada. Si usas `587`, usa TLS.

---

## 2. Configuración en el Backend (Spring Boot)
He preparado el código para que puedas enviar mails personalizados desde el backend también.

### Paso A: Obtener API Key
1. Ve a [resend.com](https://resend.com/).
2. Crea una **API Key** con permisos de envío.
3. Copia la clave.

### Paso B: Configurar variables de entorno
En tu archivo `.env` o en la configuración de Render/Heroku, agrega estas dos variables:

```bash
RESEND_API_KEY=tu_clave_de_resend_aqui
RESEND_FROM=tu_email_verificado@tudominio.com
```

> [!NOTE]
> Si estás en desarrollo y no tienes dominio propio, usa `onboarding@resend.dev` como email de remitente, pero recuerda que solo podrás enviar correos a tu propio email de cuenta de Resend.

---

## 3. Uso del servicio en el código
Si necesitas enviar un correo desde un servicio, simplemente inyecta `IMailPort`:

```java
@Autowired
private IMailPort mailPort;

public void avisarAlgo(String email) {
    mailPort.enviarEmail(email, "Asunto importante", "<h1>Hola!</h1><p>Contenido del mail.</p>");
}
```

---

## 4. Troubleshooting (Cosas que pueden fallar)
*   **Domain not verified:** Resend no te dejará enviar correos desde un dominio que no hayas verificado en su panel (Settings -> Domains).
*   **Rate limit:** Si estás en el plan gratuito de Resend, tienes un límite de correos diarios.
*   **Supabase SMTP Error:** Si Supabase no puede conectar, verifica que el puerto (465/587) coincida con el protocolo (SSL/TLS).
