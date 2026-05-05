-- 1. Agregar la columna slug a la tabla de perfiles
ALTER TABLE public.perfiles_proveedor ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Función para generar un slug básico (normalización de texto)
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, surname TEXT, category TEXT) 
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    result := lower(unaccent(name || '-' || surname || '-' || category));
    result := regexp_replace(result, '[^a-z0-9\-]', '', 'g');
    result := regexp_replace(result, '-+', '-', 'g');
    result := trim(both '-' from result);
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Actualizar registros existentes (Asegurar que unaccent esté disponible)
-- CREATE EXTENSION IF NOT EXISTS unaccent;
UPDATE public.perfiles_proveedor p
SET slug = generate_slug(u.nombre, u.apellido, COALESCE(r.nombre, p.rubro_personalizado))
FROM public.usuarios u
LEFT JOIN public.rubros r ON p.rubro_principal_id = r.id
WHERE p.usuario_id = u.id AND p.slug IS NULL;

-- 4. (Opcional) Si hay duplicados, agregar el ID para desempatar en la migración
UPDATE public.perfiles_proveedor
SET slug = slug || '-' || substring(id::text, 1, 4)
WHERE slug IN (
    SELECT slug FROM public.perfiles_proveedor GROUP BY slug HAVING count(*) > 1
);
