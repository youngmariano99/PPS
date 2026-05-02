-- 1. Agregar columna usuario_id (quién emite la reseña)
ALTER TABLE public.resenas ADD COLUMN usuario_id UUID;

-- 2. Migrar datos existentes (poblar usuario_id desde intenciones_contacto si existe)
UPDATE public.resenas r
SET usuario_id = ic.usuario_interesado_id
FROM public.intenciones_contacto ic
WHERE r.intencion_contacto_id = ic.id;

-- 3. Hacer que la columna sea obligatoria y agregar la FK
ALTER TABLE public.resenas ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE public.resenas ADD CONSTRAINT resenas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;

-- 4. ESCUDO DE DUPLICADOS: Evitar que un usuario deje más de una reseña al mismo perfil
-- Nota: Si ya existen duplicados en tu DB local, este comando fallará y deberás borrar los duplicados antes.
ALTER TABLE public.resenas ADD CONSTRAINT unique_resena_usuario_propietario UNIQUE (usuario_id, propietario_id);

-- 5. OPCIONAL: Limpiar intenciones de contacto huérfanas si el link mágico generó demasiadas
-- DELETE FROM public.intenciones_contacto ic 
-- WHERE NOT EXISTS (SELECT 1 FROM public.resenas r WHERE r.intencion_contacto_id = ic.id)
-- AND ic.created_at < now() - interval '1 hour';
