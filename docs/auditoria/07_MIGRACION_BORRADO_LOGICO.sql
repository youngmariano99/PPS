-- 07_MIGRACION_BORRADO_LOGICO.sql
-- Implementación del patrón Soft Delete exigido en la auditoría

-- ==============================================================================
-- SI AÚN NO AGREGASTE LAS COLUMNAS, EJECUTA ESTE BLOQUE:
-- ==============================================================================

-- 1. Agregar columna 'activo' a Usuarios
ALTER TABLE public.usuarios ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX idx_usuarios_activo ON public.usuarios(activo);

-- 2. Agregar columna 'activo' a Perfil Proveedor
ALTER TABLE public.perfiles_proveedor ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX idx_perfiles_proveedor_activo ON public.perfiles_proveedor(activo);

-- 3. Agregar columna 'activo' a Perfil Empresa
ALTER TABLE public.perfiles_empresa ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX idx_perfiles_empresa_activo ON public.perfiles_empresa(activo);


-- ==============================================================================
-- SI YA AGREGASTE LAS COLUMNAS PERO HAY DATOS EN NULL (O VIEJOS), EJECUTA ESTO:
-- ==============================================================================

UPDATE public.usuarios SET activo = TRUE WHERE activo IS NULL;
UPDATE public.perfiles_proveedor SET activo = TRUE WHERE activo IS NULL;
UPDATE public.perfiles_empresa SET activo = TRUE WHERE activo IS NULL;

-- Nota: ON DELETE CASCADE de Supabase ahora será reemplazado por la lógica de aplicación que hará un soft-delete (activo = false).
