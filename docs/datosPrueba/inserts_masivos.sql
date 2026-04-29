-- ==============================================================================
-- SCRIPT DE POBLACIÓN MASIVA v6.0 (HYPER-LOCAL PRINGLES & CIRCULAR DISTRIBUTION)
-- Escala: 3,000 Proveedores + 10,000 Reseñas.
-- Distribución: 500 en Pringles (Radio < 1km) + 2,500 en Prov. BA (Nodos Circulares).
-- ==============================================================================

BEGIN;

-- 1. LIMPIEZA TOTAL
TRUNCATE public.resenas, public.intenciones_contacto, public.perfiles_proveedor, public.perfiles_empresa, public.suscripciones_usuario, public.usuarios CASCADE;
DELETE FROM auth.users WHERE email LIKE '%@pps.com' OR email LIKE '%@test.com' OR email LIKE '%@pringles.com';

-- 2. RUBROS (16 categorías con IDs fijos)
INSERT INTO public.rubros (id, nombre, activa) VALUES
('b1e1a1b1-1111-4444-8888-000000000001', 'Plomería', true),
('b1e1a1b1-1111-4444-8888-000000000002', 'Electricidad', true),
('b1e1a1b1-1111-4444-8888-000000000003', 'Gasista', true),
('b1e1a1b1-1111-4444-8888-000000000004', 'Carpintería', true),
('b1e1a1b1-1111-4444-8888-000000000005', 'Pintura', true),
('b1e1a1b1-1111-4444-8888-000000000006', 'Jardinería', true),
('b1e1a1b1-1111-4444-8888-000000000007', 'Climatización', true),
('b1e1a1b1-1111-4444-8888-000000000008', 'Cerrajería', true),
('b1e1a1b1-1111-4444-8888-000000000009', 'Albañilería', true),
('b1e1a1b1-1111-4444-8888-000000000010', 'Techista', true),
('b1e1a1b1-1111-4444-8888-000000000011', 'Informática', true),
('b1e1a1b1-1111-4444-8888-000000000012', 'Fletes', true),
('b1e1a1b1-1111-4444-8888-000000000013', 'Peluquería', true),
('b1e1a1b1-1111-4444-8888-000000000014', 'Masajista', true),
('b1e1a1b1-1111-4444-8888-000000000015', 'Paseador', true),
('b1e1a1b1-1111-4444-8888-000000000016', 'Limpieza', true)
ON CONFLICT (nombre) DO UPDATE SET activa = true;

-- 3. GENERAR 3,000 USUARIOS
DO $$
DECLARE
    i INTEGER;
    new_id UUID;
BEGIN
    FOR i IN 1..3000 LOOP
        new_id := extensions.uuid_generate_v4();
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role)
        VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'user_' || i || '@pps.com', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', now(), 'authenticated', 'authenticated');
        INSERT INTO public.usuarios (id, nombre, apellido, email, telefono)
        VALUES (new_id, 'Prestador', 'Industrial_' || i, 'user_' || i || '@pps.com', '2922-' || (900000 + i));
    END LOOP;
END $$;

-- 4. GENERAR 3,000 PERFILES (DISTRIBUCIÓN CIRCULAR REALISTA)
DO $$
DECLARE
    registro RECORD;
    cnt INTEGER := 1;
    v_rubro_id UUID;
    v_lat DOUBLE PRECISION;
    v_lon DOUBLE PRECISION;
    v_angle DOUBLE PRECISION;
    v_radius DOUBLE PRECISION;
    v_calle_idx INTEGER;
    v_ciudad TEXT;
    -- Centros Urbanos
    ciudades TEXT[] := ARRAY['Coronel Pringles', 'Bahia Blanca', 'Tandil', 'Mar del Plata', 'La Plata', 'Junin', 'Olavarria'];
    lats DOUBLE PRECISION[] := ARRAY[-38.3323, -38.7196, -37.3217, -38.0055, -34.9214, -34.5850, -36.8927];
    lons DOUBLE PRECISION[] := ARRAY[-61.3563, -62.2724, -59.1332, -57.5504, -57.9545, -60.9489, -60.3225];
    -- 100 Calles proporcionadas
    calles TEXT[] := ARRAY['Prof. José García de la Calle', 'Bartolomé Mitre', 'Sáenz Peña', 'Colón', 'España', 'Avellaneda', 'Simón Bolívar', 'Italia', 'Juan XXIII', 'Arturo Frondizi', 'Brown', 'Sarmiento', 'Lavalle', 'Güemes', 'Las Heras', 'Pueyrredón', 'Alvear', 'Saavedra', 'Liniers', 'Azcuénaga', 'Tucumán', 'Mendoza', 'Córdoba', 'Santa Fe', 'Entre Ríos', 'Corrientes', 'Jujuy', 'Catamarca', 'La Rioja', 'San Luis', 'San Juan', 'Santiago del Estero', 'Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego', 'Pasaje Las Heras', 'Pasaje Güemes', 'Pasaje Sarmiento', 'Pasaje Lavalle', 'Pasaje Alvear', 'Pasaje Pueyrredón', 'Pasaje Saavedra', 'Pasaje Liniers', 'Pasaje Azcuénaga', 'Pasaje Moreno', 'Pasaje Rivadavia', 'Pasaje Mitre', 'Pasaje Belgrano', 'Garay', 'Alem', 'Dorrego', 'Pellegrini', 'Belgrano', 'Tierra del Fuego', 'Francia', 'Uruguay', 'Chile', 'Bolivia', 'México', 'Brasil', 'Paraguay', 'Perú', 'Venezuela', 'Ecuador', 'Colombia', 'Panamá', 'Costa Rica', 'Honduras', 'Nicaragua', 'El Salvador', 'Guatemala', 'Haití', 'República Dominicana', 'Cuba', 'Puerto Rico', 'Jamaica', 'Trinidad', 'Barbados', 'Malvinas', 'Patricios', 'Independencia', 'Libertad', 'Constitución', 'Democracia', 'República', 'Nación', 'Federal', 'Unidad', 'Pringles', 'Cabrera', 'Cabrera Norte', 'Cabrera Sur', 'Cabrera Este', 'Cabrera Oeste', 'Terminal', 'Matadero', 'Club Alumni', 'Club Los Carneros'];
    idx INTEGER;
BEGIN
    FOR registro IN (SELECT id FROM public.usuarios ORDER BY id) LOOP
        SELECT id INTO v_rubro_id FROM public.rubros ORDER BY random() LIMIT 1;
        
        -- Distribución Polar (Círculo)
        v_angle := random() * 2 * PI();
        
        IF cnt <= 500 THEN
            -- PRINGLES (Radio ultra-cerrado: 800m aprox)
            v_radius := random() * 0.008; 
            v_lat := lats[1] + (v_radius * cos(v_angle));
            v_lon := lons[1] + (v_radius * sin(v_angle));
            v_ciudad := 'Coronel Pringles';
            v_calle_idx := ((cnt - 1) % 100) + 1;
        ELSE
            -- OTROS NODOS (Radio urbano: 3km aprox)
            idx := floor(random() * 6 + 2);
            v_radius := random() * 0.03;
            v_lat := lats[idx] + (v_radius * cos(v_angle));
            v_lon := lons[idx] + (v_radius * sin(v_angle));
            v_ciudad := ciudades[idx];
            v_calle_idx := 1; -- Calle genérica para el resto
        END IF;

        INSERT INTO public.perfiles_proveedor (
            usuario_id, rubro_principal_id, dni, descripcion_profesional, 
            pais, provincia, ciudad, calle, numero, codigo_postal, ubicacion
        ) VALUES (
            registro.id, v_rubro_id, (90000000 + cnt)::text, 'Prestador v6.0 en ' || v_ciudad,
            'Argentina', 'Buenos Aires', v_ciudad, 
            CASE WHEN cnt <= 500 THEN calles[v_calle_idx] ELSE 'Calle Urbana' END, 
            floor(random() * 2000 + 1), 7530,
            ST_SetSRID(ST_MakePoint(v_lon, v_lat), 4326)::geography
        );
        cnt := cnt + 1;
    END LOOP;
END $$;

-- 5. 100 SUSCRIPCIONES PRO
INSERT INTO public.suscripciones_usuario (usuario_id, plan_id, estado, fecha_inicio, fecha_fin)
SELECT id, '86a2af80-fe68-45e3-a61d-fc39cf3a5df6', 'ACTIVA', now(), now() + interval '1 year'
FROM public.usuarios LIMIT 100;

-- 6. 10,000 RESEÑAS (Bypass trigger)
ALTER TABLE public.resenas DISABLE TRIGGER trg_cooldown_resena;
DO $$
DECLARE
    v_prov_id UUID;
    v_clie_id UUID;
    v_int_id UUID;
    i INTEGER;
BEGIN
    FOR i IN 1..10000 LOOP
        SELECT id INTO v_prov_id FROM public.perfiles_proveedor ORDER BY random() LIMIT 1;
        SELECT id INTO v_clie_id FROM public.usuarios ORDER BY random() LIMIT 1;
        IF v_prov_id != v_clie_id THEN
            v_int_id := extensions.uuid_generate_v4();
            INSERT INTO public.intenciones_contacto (id, usuario_interesado_id, proveedor_contactado_id)
            VALUES (v_int_id, v_clie_id, v_prov_id) ON CONFLICT DO NOTHING;
            INSERT INTO public.resenas (intencion_contacto_id, estrellas, comentario, trabajo_verificado)
            VALUES (v_int_id, floor(random() * 5 + 1), 'Calificación de prueba v6.0.', (random() > 0.5)) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;
ALTER TABLE public.resenas ENABLE TRIGGER trg_cooldown_resena;

COMMIT;

-- 📊 AUDITORÍA
SELECT 
    (SELECT count(*) FROM public.perfiles_proveedor WHERE ciudad = 'Coronel Pringles') as pringles_count,
    (SELECT count(*) FROM public.perfiles_proveedor) as total_count,
    round(avg(estrellas), 2) as avg_rating FROM public.resenas;
