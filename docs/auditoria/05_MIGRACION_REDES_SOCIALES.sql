-- Archivo de Migración: 05_MIGRACION_REDES_SOCIALES.sql
-- Propósito: Eliminar columnas hardcodeadas de redes sociales e implementar un esquema JSONB escalable.

-- 1. Eliminar columnas viejas
ALTER TABLE public.perfiles_proveedor
DROP COLUMN IF EXISTS instagram_url,
DROP COLUMN IF EXISTS facebook_url,
DROP COLUMN IF EXISTS linkedin_url;

-- 2. Agregar nuevas columnas
ALTER TABLE public.perfiles_proveedor
ADD COLUMN redes_sociales JSONB DEFAULT '[]'::jsonb,
ADD COLUMN sitio_web_url TEXT;
