### usuario

create table public.usuarios (
  id uuid not null,
  nombre character varying(255) not null,
  apellido character varying(255) not null,
  email character varying(255) not null,
  telefono character varying(255) not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint usuarios_pkey primary key (id),
  constraint usuarios_email_key unique (email),
  constraint usuarios_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

# suscripciones_usuario

create table public.suscripciones_usuario (
  id uuid not null default extensions.uuid_generate_v4 (),
  usuario_id uuid not null,
  plan_id uuid not null,
  estado text not null default 'ACTIVA'::text,
  fecha_inicio timestamp with time zone not null default now(),
  fecha_fin timestamp with time zone not null,
  mp_preferencia_id text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint suscripciones_usuario_pkey primary key (id),
  constraint suscripciones_usuario_plan_id_fkey foreign KEY (plan_id) references planes_suscripcion (id) on delete RESTRICT,
  constraint suscripciones_usuario_usuario_id_fkey foreign KEY (usuario_id) references usuarios (id) on delete CASCADE,
  constraint suscripciones_usuario_estado_check check (
    (
      estado = any (
        array[
          'ACTIVA'::text,
          'VENCIDA'::text,
          'CANCELADA'::text,
          'PENDIENTE'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_suscripciones_modtime BEFORE
update on suscripciones_usuario for EACH row
execute FUNCTION update_updated_at_column ();

# rubros

create table public.rubros (
  id uuid not null default extensions.uuid_generate_v4 (),
  nombre character varying(255) not null,
  descripcion character varying(255) null,
  activa boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint rubros_pkey primary key (id),
  constraint rubros_nombre_key unique (nombre)
) TABLESPACE pg_default;

# resenas

create table public.resenas (
  id uuid not null default extensions.uuid_generate_v4 (),
  intencion_contacto_id uuid null,
  estrellas numeric(3, 2) not null,
  comentario text null,
  respuesta_proveedor text null,
  fecha_respuesta timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  solicitud_servicio_id uuid null,
  trabajo_verificado boolean not null default false,
  constraint resenas_pkey primary key (id),
  constraint resenas_intencion_contacto_id_key unique (intencion_contacto_id),
  constraint resenas_solicitud_servicio_id_key unique (solicitud_servicio_id),
  constraint resenas_intencion_contacto_id_fkey foreign KEY (intencion_contacto_id) references intenciones_contacto (id) on delete CASCADE,
  constraint chk_resena_origen check (
    (
      (
        (intencion_contacto_id is not null)
        and (solicitud_servicio_id is null)
      )
      or (
        (intencion_contacto_id is null)
        and (solicitud_servicio_id is not null)
      )
    )
  ),
  constraint resenas_estrellas_check check (
    (
      (estrellas >= (1)::numeric)
      and (estrellas <= (5)::numeric)
    )
  )
) TABLESPACE pg_default;

create trigger trg_cooldown_resena BEFORE INSERT on resenas for EACH row
execute FUNCTION validar_cooldown_resena ();

# portafolios

create table public.portafolios (
  id uuid not null default extensions.uuid_generate_v4 (),
  usuario_id uuid null,
  empresa_id uuid null,
  titulo text not null,
  url_recurso text not null,
  tipo_recurso text not null,
  created_at timestamp with time zone not null default now(),
  visible boolean not null default true,
  constraint portafolios_pkey primary key (id),
  constraint portafolios_empresa_id_fkey foreign KEY (empresa_id) references perfiles_empresa (id) on delete CASCADE,
  constraint portafolios_usuario_id_fkey foreign KEY (usuario_id) references usuarios (id) on delete CASCADE,
  constraint chk_portafolio_propietario check (
    (
      (
        (usuario_id is not null)
        and (empresa_id is null)
      )
      or (
        (usuario_id is null)
        and (empresa_id is not null)
      )
    )
  ),
  constraint portafolios_tipo_recurso_check check (
    (
      tipo_recurso = any (
        array['IMAGEN'::text, 'DOCUMENTO'::text, 'ENLACE'::text]
      )
    )
  )
) TABLESPACE pg_default;

# planes_suscripcion

create table public.planes_suscripcion (
  id uuid not null default extensions.uuid_generate_v4 (),
  nombre text not null,
  descripcion text null,
  precio_mensual numeric(10, 2) not null,
  activo boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint planes_suscripcion_pkey primary key (id),
  constraint planes_suscripcion_nombre_key unique (nombre)
) TABLESPACE pg_default;

[{"idx":0,"id":"86a2af80-fe68-45e3-a61d-fc39cf3a5df6","nombre":"PRO","descripcion":"Potencia tu perfil en la plataforma y garantiza que tus potenciales clientes te vean por sobre tu competencia","precio_mensual":"3000.00","activo":true,"created_at":"2026-04-15 15:57:47.505055+00","updated_at":"2026-04-15 15:57:47.505055+00"}]

# perfiles_proveedor

create table public.perfiles_proveedor (
  id uuid not null default extensions.uuid_generate_v4 (),
  usuario_id uuid not null,
  rubro_principal_id uuid null,
  rubro_personalizado character varying(255) null,
  dni character varying(255) not null,
  matricula character varying(255) null,
  descripcion_profesional text not null,
  cv_url_pdf character varying(255) null,
  pais character varying(255) not null,
  provincia character varying(255) not null,
  ciudad character varying(255) not null,
  calle character varying(255) not null,
  numero integer not null,
  codigo_postal integer not null,
  ubicacion geography null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  foto_perfil_url text null,
  instagram_url text null,
  facebook_url text null,
  linkedin_url text null,
  constraint perfiles_proveedor_pkey primary key (id),
  constraint perfiles_proveedor_dni_key unique (dni),
  constraint perfiles_proveedor_usuario_id_key unique (usuario_id),
  constraint perfiles_proveedor_rubro_principal_id_fkey foreign KEY (rubro_principal_id) references rubros (id),
  constraint perfiles_proveedor_usuario_id_fkey foreign KEY (usuario_id) references usuarios (id) on delete CASCADE,
  constraint chk_prov_rubro check (
    (
      (rubro_principal_id is not null)
      or (rubro_personalizado is not null)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_perfiles_proveedor_ubicacion on public.perfiles_proveedor using gist (ubicacion) TABLESPACE pg_default;

# perfiles_empresa

create table public.perfiles_empresa (
  id uuid not null default extensions.uuid_generate_v4 (),
  usuario_id uuid not null,
  rubro_principal_id uuid null,
  rubro_personalizado character varying(255) null,
  razon_social character varying(255) not null,
  cuit character varying(255) not null,
  descripcion_empresa text not null,
  logo_url character varying(255) null,
  pais character varying(255) not null,
  provincia character varying(255) not null,
  ciudad character varying(255) not null,
  calle character varying(255) not null,
  numero integer not null,
  codigo_postal integer not null,
  ubicacion geography null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint perfiles_empresa_pkey primary key (id),
  constraint perfiles_empresa_cuit_key unique (cuit),
  constraint perfiles_empresa_rubro_principal_id_fkey foreign KEY (rubro_principal_id) references rubros (id),
  constraint perfiles_empresa_usuario_id_fkey foreign KEY (usuario_id) references usuarios (id) on delete CASCADE,
  constraint chk_emp_rubro check (
    (
      (rubro_principal_id is not null)
      or (rubro_personalizado is not null)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_perfiles_empresa_ubicacion on public.perfiles_empresa using gist (ubicacion) TABLESPACE pg_default;

