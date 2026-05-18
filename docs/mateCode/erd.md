{
  "project_name": "CHAMBA",
  "default_engine": "postgresql",
  "tables": [
    {
      "id": "t1",
      "name": "usuarios",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID" } },
        { "name": "nombre", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "apellido", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "email", "data_family": "string", "is_unique": true, "native_type": "VARCHAR(255)" },
        { "name": "telefono", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t2",
      "name": "planes_suscripcion",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "nombre", "data_family": "text", "is_unique": true },
        { "name": "descripcion", "data_family": "text", "is_nullable": true },
        { "name": "precio_mensual", "data_family": "decimal", "engine_overrides": { "postgresql": "NUMERIC(10, 2)" } },
        { "name": "activo", "data_family": "boolean", "engine_overrides": { "postgresql": "BOOLEAN DEFAULT TRUE" } },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t3",
      "name": "suscripciones_usuario",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_id", "data_family": "uuid" },
        { "name": "plan_id", "data_family": "uuid" },
        { "name": "estado", "data_family": "text", "engine_overrides": { "postgresql": "TEXT DEFAULT 'ACTIVA'" } },
        { "name": "fecha_inicio", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "fecha_fin", "data_family": "datetime" },
        { "name": "mp_preferencia_id", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t4",
      "name": "rubros",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "nombre", "data_family": "string", "is_unique": true, "native_type": "VARCHAR(255)" },
        { "name": "descripcion", "data_family": "string", "is_nullable": true, "native_type": "VARCHAR(255)" },
        { "name": "activa", "data_family": "boolean", "engine_overrides": { "postgresql": "BOOLEAN DEFAULT TRUE" } },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t5",
      "name": "perfiles_proveedor",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_id", "data_family": "uuid", "is_unique": true },
        { "name": "rubro_principal_id", "data_family": "uuid", "is_nullable": true },
        { "name": "rubro_personalizado", "data_family": "string", "is_nullable": true, "native_type": "VARCHAR(255)" },
        { "name": "dni", "data_family": "string", "is_unique": true, "native_type": "VARCHAR(255)" },
        { "name": "matricula", "data_family": "string", "is_nullable": true, "native_type": "VARCHAR(255)" },
        { "name": "descripcion_profesional", "data_family": "text" },
        { "name": "cv_url_pdf", "data_family": "string", "is_nullable": true, "native_type": "VARCHAR(255)" },
        { "name": "pais", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "provincia", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "ciudad", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "calle", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "numero", "data_family": "integer" },
        { "name": "codigo_postal", "data_family": "integer" },
        { "name": "ubicacion", "data_family": "spatial", "is_nullable": true, "engine_overrides": { "postgresql": "GEOGRAPHY(Point, 4326)" } },
        { "name": "foto_perfil_url", "data_family": "text", "is_nullable": true },
        { "name": "instagram_url", "data_family": "text", "is_nullable": true },
        { "name": "facebook_url", "data_family": "text", "is_nullable": true },
        { "name": "linkedin_url", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t6",
      "name": "perfiles_empresa",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_id", "data_family": "uuid", "is_unique": true },
        { "name": "rubro_principal_id", "data_family": "uuid", "is_nullable": true },
        { "name": "rubro_personalizado", "data_family": "string", "is_nullable": true, "native_type": "VARCHAR(255)" },
        { "name": "razon_social", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "cuit", "data_family": "string", "is_unique": true, "native_type": "VARCHAR(255)" },
        { "name": "descripcion_empresa", "data_family": "text" },
        { "name": "logo_url", "data_family": "string", "is_nullable": true, "native_type": "VARCHAR(255)" },
        { "name": "pais", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "provincia", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "ciudad", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "calle", "data_family": "string", "native_type": "VARCHAR(255)" },
        { "name": "numero", "data_family": "integer" },
        { "name": "codigo_postal", "data_family": "integer" },
        { "name": "ubicacion", "data_family": "spatial", "is_nullable": true, "engine_overrides": { "postgresql": "GEOGRAPHY(Point, 4326)" } },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t7",
      "name": "intenciones_contacto",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_interesado_id", "data_family": "uuid" },
        { "name": "proveedor_contactado_id", "data_family": "uuid", "is_nullable": true },
        { "name": "empresa_contactada_id", "data_family": "uuid", "is_nullable": true },
        { "name": "direccion_ip", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t8",
      "name": "resenas",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "propietario_id", "data_family": "uuid" },
        { "name": "usuario_id", "data_family": "uuid" },
        { "name": "intencion_contacto_id", "data_family": "uuid", "is_nullable": true, "is_unique": true },
        { "name": "solicitud_servicio_id", "data_family": "uuid", "is_nullable": true, "is_unique": true },
        { "name": "estrellas", "data_family": "decimal", "engine_overrides": { "postgresql": "NUMERIC(3,2)" } },
        { "name": "comentario", "data_family": "text", "is_nullable": true },
        { "name": "respuesta_proveedor", "data_family": "text", "is_nullable": true },
        { "name": "fecha_respuesta", "data_family": "datetime", "is_nullable": true },
        { "name": "trabajo_verificado", "data_family": "boolean", "engine_overrides": { "postgresql": "BOOLEAN DEFAULT FALSE" } },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t9",
      "name": "reportes_resenas",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "resena_id", "data_family": "uuid" },
        { "name": "usuario_reportador_id", "data_family": "uuid" },
        { "name": "motivo", "data_family": "text" },
        { "name": "evidencia_url", "data_family": "text", "is_nullable": true },
        { "name": "estado", "data_family": "text", "engine_overrides": { "postgresql": "TEXT DEFAULT 'PENDIENTE'" } },
        { "name": "resolucion_admin", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t10",
      "name": "portafolios",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_id", "data_family": "uuid", "is_nullable": true },
        { "name": "empresa_id", "data_family": "uuid", "is_nullable": true },
        { "name": "titulo", "data_family": "text" },
        { "name": "url_recurso", "data_family": "text" },
        { "name": "tipo_recurso", "data_family": "text" },
        { "name": "visible", "data_family": "boolean", "engine_overrides": { "postgresql": "BOOLEAN DEFAULT TRUE" } },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t11",
      "name": "ofertas_empleo",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "proveedor_id", "data_family": "uuid", "is_nullable": true },
        { "name": "empresa_id", "data_family": "uuid", "is_nullable": true },
        { "name": "titulo", "data_family": "text" },
        { "name": "descripcion", "data_family": "text" },
        { "name": "modalidad", "data_family": "text" },
        { "name": "salario_min", "data_family": "decimal", "is_nullable": true },
        { "name": "salario_max", "data_family": "decimal", "is_nullable": true },
        { "name": "habilidades_clave", "data_family": "array", "is_nullable": true, "engine_overrides": { "postgresql": "TEXT[]" } },
        { "name": "activa", "data_family": "boolean", "engine_overrides": { "postgresql": "BOOLEAN DEFAULT TRUE" } },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t12",
      "name": "preguntas_filtro_oferta",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "oferta_id", "data_family": "uuid" },
        { "name": "pregunta", "data_family": "text" },
        { "name": "tipo_pregunta", "data_family": "text" },
        { "name": "respuesta_esperada_excluyente", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t13",
      "name": "postulaciones",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "oferta_id", "data_family": "uuid" },
        { "name": "usuario_candidato_id", "data_family": "uuid" },
        { "name": "mensaje_presentacion", "data_family": "text", "is_nullable": true },
        { "name": "cv_url_adjunto", "data_family": "text", "is_nullable": true },
        { "name": "estado", "data_family": "text", "engine_overrides": { "postgresql": "TEXT DEFAULT 'ENVIADO'" } },
        { "name": "motivo_rechazo_codigo", "data_family": "text", "is_nullable": true },
        { "name": "feedback_adicional", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t14",
      "name": "respuestas_candidato",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "postulacion_id", "data_family": "uuid" },
        { "name": "pregunta_id", "data_family": "uuid" },
        { "name": "respuesta_dada", "data_family": "text" },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t15",
      "name": "notificaciones",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_id", "data_family": "uuid" },
        { "name": "tipo_notificacion", "data_family": "text" },
        { "name": "mensaje", "data_family": "text" },
        { "name": "entidad_referencia_id", "data_family": "uuid", "is_nullable": true },
        { "name": "leida", "data_family": "boolean", "engine_overrides": { "postgresql": "BOOLEAN DEFAULT FALSE" } },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t16",
      "name": "curriculums_nativos",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_id", "data_family": "uuid", "is_unique": true },
        { "name": "titular_profesional", "data_family": "text", "is_nullable": true },
        { "name": "sobre_mi", "data_family": "text", "is_nullable": true },
        { "name": "experiencia_laboral", "data_family": "json", "is_nullable": true, "engine_overrides": { "postgresql": "JSONB DEFAULT '[]'" } },
        { "name": "educacion", "data_family": "json", "is_nullable": true, "engine_overrides": { "postgresql": "JSONB DEFAULT '[]'" } },
        { "name": "habilidades", "data_family": "json", "is_nullable": true, "engine_overrides": { "postgresql": "JSONB DEFAULT '[]'" } },
        { "name": "cv_url_pdf", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } },
        { "name": "updated_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    },
    {
      "id": "t17",
      "name": "alertas_empleo",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true, "engine_overrides": { "postgresql": "UUID DEFAULT extensions.uuid_generate_v4()" } },
        { "name": "usuario_id", "data_family": "uuid" },
        { "name": "etiquetas_busqueda", "data_family": "array", "engine_overrides": { "postgresql": "TEXT[]" } },
        { "name": "modalidad_preferida", "data_family": "text", "is_nullable": true },
        { "name": "created_at", "data_family": "datetime", "engine_overrides": { "postgresql": "TIMESTAMP WITH TIME ZONE DEFAULT NOW()" } }
      ]
    }
  ],
  "relationships": [
    { "id": "r1", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "suscripciones_usuario", "target_column": "usuario_id" },
    { "id": "r2", "type": "one_to_many", "source_table": "planes_suscripcion", "source_column": "id", "target_table": "suscripciones_usuario", "target_column": "plan_id" },
    { "id": "r3", "type": "one_to_one", "source_table": "usuarios", "source_column": "id", "target_table": "perfiles_proveedor", "target_column": "usuario_id" },
    { "id": "r4", "type": "one_to_many", "source_table": "rubros", "source_column": "id", "target_table": "perfiles_proveedor", "target_column": "rubro_principal_id" },
    { "id": "r5", "type": "one_to_one", "source_table": "usuarios", "source_column": "id", "target_table": "perfiles_empresa", "target_column": "usuario_id" },
    { "id": "r6", "type": "one_to_many", "source_table": "rubros", "source_column": "id", "target_table": "perfiles_empresa", "target_column": "rubro_principal_id" },
    { "id": "r7", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "intenciones_contacto", "target_column": "usuario_interesado_id" },
    { "id": "r8", "type": "one_to_many", "source_table": "perfiles_proveedor", "source_column": "id", "target_table": "intenciones_contacto", "target_column": "proveedor_contactado_id" },
    { "id": "r9", "type": "one_to_many", "source_table": "perfiles_empresa", "source_column": "id", "target_table": "intenciones_contacto", "target_column": "empresa_contactada_id" },
    { "id": "r10", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "resenas", "target_column": "usuario_id" },
    { "id": "r11", "type": "one_to_one", "source_table": "intenciones_contacto", "source_column": "id", "target_table": "resenas", "target_column": "intencion_contacto_id" },
    { "id": "r12", "type": "one_to_many", "source_table": "resenas", "source_column": "id", "target_table": "reportes_resenas", "target_column": "resena_id" },
    { "id": "r13", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "reportes_resenas", "target_column": "usuario_reportador_id" },
    { "id": "r14", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "portafolios", "target_column": "usuario_id" },
    { "id": "r15", "type": "one_to_many", "source_table": "perfiles_empresa", "source_column": "id", "target_table": "portafolios", "target_column": "empresa_id" },
    { "id": "r16", "type": "one_to_many", "source_table": "perfiles_empresa", "source_column": "id", "target_table": "ofertas_empleo", "target_column": "empresa_id" },
    { "id": "r17", "type": "one_to_many", "source_table": "perfiles_proveedor", "source_column": "id", "target_table": "ofertas_empleo", "target_column": "proveedor_id" },
    { "id": "r18", "type": "one_to_many", "source_table": "ofertas_empleo", "source_column": "id", "target_table": "preguntas_filtro_oferta", "target_column": "oferta_id" },
    { "id": "r19", "type": "one_to_many", "source_table": "ofertas_empleo", "source_column": "id", "target_table": "postulaciones", "target_column": "oferta_id" },
    { "id": "r20", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "postulaciones", "target_column": "usuario_candidato_id" },
    { "id": "r21", "type": "one_to_many", "source_table": "postulaciones", "source_column": "id", "target_table": "respuestas_candidato", "target_column": "postulacion_id" },
    { "id": "r22", "type": "one_to_many", "source_table": "preguntas_filtro_oferta", "source_column": "id", "target_table": "respuestas_candidato", "target_column": "pregunta_id" },
    { "id": "r23", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "notificaciones", "target_column": "usuario_id" },
    { "id": "r24", "type": "one_to_one", "source_table": "usuarios", "source_column": "id", "target_table": "curriculums_nativos", "target_column": "usuario_id" },
    { "id": "r25", "type": "one_to_many", "source_table": "usuarios", "source_column": "id", "target_table": "alertas_empleo", "target_column": "usuario_id" }
  ]
}
