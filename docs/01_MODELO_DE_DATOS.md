# 01_MODELO_DE_DATOS: Esquema y Base de Datos (PostgreSQL + PostGIS)

## 1. Estrategia Global de Base de Datos
* **Motor:** PostgreSQL alojado en Supabase.
* **Geolocalización Real:** Uso estricto de la extensión **PostGIS**. Los perfiles almacenan su ubicación como `GEOGRAPHY(Point, 4326)` para permitir búsquedas por radio de cercanía reales, no simples strings de direcciones.
* **Estructura Híbrida (Relacional + Documental):** Cumplimiento estricto de la Tercera Forma Normal (3FN) para la arquitectura relacional (ej. Ofertas y Preguntas de Filtro). Uso estratégico de `JSONB` exclusivamente para el `curriculum_nativo` (experiencia, educación) para evitar sobre-normalización de datos que se leen en bloque.
* **Autenticación (BaaS):** La tabla `usuarios` delega la seguridad a Supabase Auth. El `id` de `usuarios` es una Foreign Key directa a `auth.users(id)`.

## 2. Reglas de Mapeo en Spring Boot (Entidades JPA)
Cuando la IA deba generar código Java (`@Entity`) basado en este esquema, DEBE respetar las siguientes reglas de infraestructura:
* **UUIDs:** Los IDs primarios se generan en la base de datos (`uuid_generate_v4()`). En Java, usar `@Id`, `@GeneratedValue(strategy = GenerationType.UUID)` y el tipo `java.util.UUID`.
* **PostGIS (Hibernate Spatial):** Para mapear la columna `ubicacion GEOGRAPHY`, usar el tipo `org.locationtech.jts.geom.Point` de la librería JTS, asegurando configurar el SRID 4326.
* **JSONB (Hibernate Types):** Para mapear los campos JSONB (`experiencia_laboral`, `educacion`), usar dependencias como `hypersistence-utils` (Vlad Mihalcea) con la anotación `@Type(JsonType.class)` o las implementaciones nativas de Hibernate 6.
* **Triggers de Auditoría:** El campo `updated_at` es manejado por un Trigger de PostgreSQL. La entidad Java no debe sobreescribirlo manualmente.

## 3. ESQUEMA SQL (Única Fuente de Verdad)
> **ATENCIÓN IA:** Este es el esquema físico exacto. PROHIBIDO inventar tablas, columnas o relaciones.
> **REGLA DE EVOLUCIÓN:** Todo cambio en tablas existentes debe actualizar el `CREATE` y añadir el `ALTER TABLE` al final del bloque SQL.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis; 

-- FUNCIONES BASE
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION validar_cooldown_resena() RETURNS TRIGGER AS $$
DECLARE
    v_usuario_interesado_id UUID; v_proveedor_id UUID; v_empresa_id UUID;
BEGIN
    SELECT usuario_interesado_id, proveedor_contactado_id, empresa_contactada_id
    INTO v_usuario_interesado_id, v_proveedor_id, v_empresa_id
    FROM public.intenciones_contacto WHERE id = NEW.intencion_contacto_id;

    IF EXISTS (
        SELECT 1 FROM public.resenas r
        JOIN public.intenciones_contacto ic ON r.intencion_contacto_id = ic.id
        WHERE ic.usuario_interesado_id = v_usuario_interesado_id
          AND ((ic.proveedor_contactado_id = v_proveedor_id AND v_proveedor_id IS NOT NULL) OR
               (ic.empresa_contactada_id = v_empresa_id AND v_empresa_id IS NOT NULL))
          AND r.created_at >= NOW() - INTERVAL '24 hours'
    ) THEN RAISE EXCEPTION 'COOLDOWN_RESENA: Espera 24 horas para volver a calificar.'; END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. RUBROS
CREATE TABLE public.rubros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE, descripcion TEXT, activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USUARIOS
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL, apellido TEXT NOT NULL, email TEXT NOT NULL UNIQUE, telefono TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CURRÍCULUM NATIVO E HÍBRIDO (JSONB)
CREATE TABLE public.curriculums_nativos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titular_profesional TEXT, sobre_mi TEXT,
    experiencia_laboral JSONB DEFAULT '[]'::jsonb, educacion JSONB DEFAULT '[]'::jsonb, habilidades JSONB DEFAULT '[]'::jsonb,
    cv_url_pdf TEXT, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFILES PÚBLICOS (Con PostGIS GEOGRAPHY)
CREATE TABLE public.perfiles_proveedor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
    rubro_principal_id UUID REFERENCES public.rubros(id), rubro_personalizado TEXT,
    dni TEXT NOT NULL UNIQUE, matricula TEXT, descripcion_profesional TEXT NOT NULL, cv_url_pdf TEXT, foto_perfil_url TEXT,
    pais TEXT NOT NULL, provincia TEXT NOT NULL, ciudad TEXT NOT NULL, calle TEXT NOT NULL, numero INTEGER NOT NULL, codigo_postal INTEGER NOT NULL,
    ubicacion GEOGRAPHY(Point, 4326), 
    instagram_url TEXT, facebook_url TEXT, linkedin_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_prov_rubro CHECK (rubro_principal_id IS NOT NULL OR rubro_personalizado IS NOT NULL)
);
CREATE INDEX idx_perfiles_proveedor_ubicacion ON public.perfiles_proveedor USING GIST (ubicacion);

CREATE TABLE public.perfiles_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    rubro_principal_id UUID REFERENCES public.rubros(id), rubro_personalizado TEXT,
    razon_social TEXT NOT NULL, cuit TEXT NOT NULL UNIQUE, descripcion_empresa TEXT NOT NULL, logo_url TEXT,
    pais TEXT NOT NULL, provincia TEXT NOT NULL, ciudad TEXT NOT NULL, calle TEXT NOT NULL, numero INTEGER NOT NULL, codigo_postal INTEGER NOT NULL,
    ubicacion GEOGRAPHY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_emp_rubro CHECK (rubro_principal_id IS NOT NULL OR rubro_personalizado IS NOT NULL)
);
CREATE INDEX idx_perfiles_empresa_ubicacion ON public.perfiles_empresa USING GIST (ubicacion);

-- 5. PORTAFOLIOS
CREATE TABLE public.portafolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.perfiles_empresa(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL, url_recurso TEXT NOT NULL, tipo_recurso TEXT NOT NULL CHECK (tipo_recurso IN ('IMAGEN', 'DOCUMENTO', 'ENLACE')),
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_portafolio_propietario CHECK ((usuario_id IS NOT NULL AND empresa_id IS NULL) OR (usuario_id IS NULL AND empresa_id IS NOT NULL))
);

-- 6. OFERTAS DE EMPLEO
CREATE TABLE public.ofertas_empleo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proveedor_id UUID REFERENCES public.perfiles_proveedor(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.perfiles_empresa(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL, descripcion TEXT NOT NULL,
    modalidad TEXT NOT NULL CHECK (modalidad IN ('REMOTO', 'PRESENCIAL', 'HIBRIDO')),
    salario_min NUMERIC, salario_max NUMERIC, habilidades_clave TEXT[], 
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_oferta_propietario CHECK ((proveedor_id IS NOT NULL AND empresa_id IS NULL) OR (proveedor_id IS NULL AND empresa_id IS NOT NULL))
);

-- 6.1 PREGUNTAS DE FILTRO (Knockout Questions)
CREATE TABLE public.preguntas_filtro_oferta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oferta_id UUID NOT NULL REFERENCES public.ofertas_empleo(id) ON DELETE CASCADE,
    pregunta TEXT NOT NULL, tipo_pregunta TEXT NOT NULL CHECK (tipo_pregunta IN ('SI_NO', 'TEXTO_CORTO')), 
    respuesta_esperada_excluyente TEXT, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. POSTULACIONES
CREATE TABLE public.postulaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oferta_id UUID NOT NULL REFERENCES public.ofertas_empleo(id) ON DELETE CASCADE,
    usuario_candidato_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE, 
    mensaje_presentacion TEXT, cv_url_adjunto TEXT, 
    estado TEXT NOT NULL DEFAULT 'ENVIADO' CHECK (estado IN ('ENVIADO', 'VISTO', 'EN_REVISION', 'CONTACTADO', 'DESCARTADO')),
    motivo_rechazo_codigo TEXT, feedback_adicional TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_postulacion_unica UNIQUE (oferta_id, usuario_candidato_id)
);

-- 7.1 RESPUESTAS DEL CANDIDATO
CREATE TABLE public.respuestas_candidato (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postulacion_id UUID NOT NULL REFERENCES public.postulaciones(id) ON DELETE CASCADE,
    pregunta_id UUID NOT NULL REFERENCES public.preguntas_filtro_oferta(id) ON DELETE CASCADE,
    respuesta_dada TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_respuesta_unica UNIQUE (postulacion_id, pregunta_id)
);

-- 8. CONTACTOS Y RESEÑAS
CREATE TABLE public.intenciones_contacto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_interesado_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    proveedor_contactado_id UUID REFERENCES public.perfiles_proveedor(id) ON DELETE CASCADE,
    empresa_contactada_id UUID REFERENCES public.perfiles_empresa(id) ON DELETE CASCADE,
    direccion_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_contacto_destino CHECK ((proveedor_contactado_id IS NOT NULL AND empresa_contactada_id IS NULL) OR (proveedor_contactado_id IS NULL AND empresa_contactada_id IS NOT NULL))
);

CREATE TABLE public.resenas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    propietario_id UUID NOT NULL, -- Perfil (Proveedor/Empresa) evaluado
    intencion_contacto_id UUID UNIQUE REFERENCES public.intenciones_contacto(id) ON DELETE CASCADE, 
    solicitud_servicio_id UUID UNIQUE, 
    trabajo_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    estrellas NUMERIC(3, 2) NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
    comentario TEXT, respuesta_proveedor TEXT, fecha_respuesta TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_cooldown_resena BEFORE INSERT ON public.resenas FOR EACH ROW EXECUTE FUNCTION validar_cooldown_resena();

-- 9. REPORTES DE RESEÑAS
CREATE TABLE public.reportes_resenas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resena_id UUID NOT NULL REFERENCES public.resenas(id) ON DELETE CASCADE,
    usuario_reportador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE, 
    motivo TEXT NOT NULL, evidencia_url TEXT, 
    estado TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    resolucion_admin TEXT, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER update_reportes_modtime BEFORE UPDATE ON public.reportes_resenas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. NOTIFICACIONES
CREATE TABLE public.alertas_empleo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    etiquetas_busqueda TEXT[] NOT NULL, modalidad_preferida TEXT CHECK (modalidad_preferida IN ('REMOTO', 'PRESENCIAL', 'HIBRIDO')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo_notificacion TEXT NOT NULL CHECK (tipo_notificacion IN ('CAMBIO_ESTADO_POSTULACION', 'NUEVA_OFERTA_COMPATIBLE', 'NUEVA_RESENA', 'NUEVO_MENSAJE', 'REPORTE_RESUELTO')),
    mensaje TEXT NOT NULL, entidad_referencia_id UUID, leida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PLANES Y SUSCRIPCIONES
CREATE TABLE public.planes_suscripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE, 
    descripcion TEXT,
    precio_mensual NUMERIC(10, 2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.suscripciones_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.planes_suscripcion(id) ON DELETE RESTRICT,
    estado TEXT NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'VENCIDA', 'CANCELADA', 'PENDIENTE')),
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ NOT NULL,
    mp_preferencia_id TEXT, -- Mapea la preferencia de pago de MP
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER update_suscripciones_modtime BEFORE UPDATE ON public.suscripciones_usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------------------
-- HISTORIAL DE MIGRACIONES (SCRIPTS DE ACTUALIZACIÓN)
--------------------------------------------------------------------------------

-- [2026-04-15] Refactorización Multimedia Sprint 4
-- Propósito: Añadir foto de perfil al proveedor y soporte de visibilidad para portafolio.
ALTER TABLE public.perfiles_proveedor ADD COLUMN foto_perfil_url TEXT;
ALTER TABLE public.portafolios ADD COLUMN visible BOOLEAN NOT NULL DEFAULT TRUE;

-- [2026-04-17] Auditoría y Anti-Fraude en Contactos y Reseñas Duales
ALTER TABLE public.intenciones_contacto ADD COLUMN direccion_ip TEXT;
ALTER TABLE public.resenas ADD COLUMN solicitud_servicio_id UUID UNIQUE;
ALTER TABLE public.resenas ADD COLUMN trabajo_verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.resenas ALTER COLUMN intencion_contacto_id DROP NOT NULL;
-- [2026-04-17] Redes Sociales en Perfiles
ALTER TABLE public.perfiles_proveedor ADD COLUMN instagram_url TEXT;
ALTER TABLE public.perfiles_proveedor ADD COLUMN facebook_url TEXT;
ALTER TABLE public.perfiles_proveedor ADD COLUMN linkedin_url TEXT;

-- [2026-05-02] Refactorización Reseñas: Modelo de Prestigio (No restrictivo)
-- Propósito: Permitir reseñas sin contacto previo y centralizar propiedad.
ALTER TABLE public.resenas ADD COLUMN propietario_id UUID;
UPDATE public.resenas r SET propietario_id = COALESCE(
    (SELECT ic.proveedor_contactado_id FROM public.intenciones_contacto ic WHERE ic.id = r.intencion_contacto_id),
    (SELECT ic.empresa_contactada_id FROM public.intenciones_contacto ic WHERE ic.id = r.intencion_contacto_id)
) WHERE intencion_contacto_id IS NOT NULL;
ALTER TABLE public.resenas ALTER COLUMN propietario_id SET NOT NULL;
ALTER TABLE public.resenas DROP CONSTRAINT IF EXISTS chk_resena_origen;
```

### 12. Extensión Multimedia (Consolidada + Degradación Suave)
La gestión de multimedia se ha unificado en la tabla existente `portafolios` para evitar redundancias. Implementa "Graceful Downgrade": los recursos se preservan siempre, pero su visibilidad pública se filtra mediante la columna `visible` basándose en el plan activo.
