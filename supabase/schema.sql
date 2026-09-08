-- ============================================================================
-- GUTIÉRREZ TRANSPORTES Y VIAJES - SUPABASE SCHEMA & SEED SCRIPT
-- Project: gutierezviajes@appdesignsoftware.com's Project
-- Project ID: lyjuhvqpvomryytxyztr
-- Base URL: https://lyjuhvqpvomryytxyztr.supabase.co
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: VEHÍCULOS (FLOTA)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plate TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 19,
    type TEXT NOT NULL DEFAULT 'sprinter',
    status TEXT NOT NULL DEFAULT 'active',
    assigned_driver_id TEXT,
    last_maintenance DATE,
    next_maintenance DATE,
    fuel_level INTEGER DEFAULT 95,
    mileage INTEGER DEFAULT 120000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: CONDUCTORES / OPERADORES
CREATE TABLE IF NOT EXISTS public.drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_type TEXT DEFAULT 'Federal Tipo B',
    license_expiry DATE,
    rating NUMERIC(3,1) DEFAULT 4.9,
    status TEXT NOT NULL DEFAULT 'available',
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CORRIDAS / VIAJES PROGRAMADOS (TRIPS)
CREATE TABLE IF NOT EXISTS public.trips (
    id TEXT PRIMARY KEY,
    route_title TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    date DATE NOT NULL,
    departure_time TEXT NOT NULL,
    estimated_arrival TEXT NOT NULL,
    driver_id TEXT,
    driver_name TEXT,
    vehicle_id TEXT,
    unit_number TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 19,
    occupied_seats_count INTEGER NOT NULL DEFAULT 0,
    total_revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'scheduled',
    current_scale TEXT,
    seats JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: RESERVAS Y BOLETOS (BOOKINGS)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    trip_id TEXT,
    passenger_name TEXT NOT NULL,
    passenger_phone TEXT,
    passenger_email TEXT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    boarding_point TEXT NOT NULL,
    dropoff_point TEXT NOT NULL,
    date DATE NOT NULL,
    departure_time TEXT NOT NULL,
    seat_numbers INTEGER[] NOT NULL,
    unit_number TEXT,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash_counter',
    payment_status TEXT NOT NULL DEFAULT 'paid',
    source TEXT NOT NULL DEFAULT 'web',
    trip_type TEXT NOT NULL DEFAULT 'sencillo',
    return_date DATE,
    package_type TEXT NOT NULL DEFAULT 'estandar',
    qr_code_data TEXT NOT NULL,
    check_in_status TEXT NOT NULL DEFAULT 'pending',
    check_in_time TEXT,
    check_in_location TEXT,
    addons JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: COTIZACIONES DE RENTA Y VIAJES ESPECIALES
CREATE TABLE IF NOT EXISTS public.rental_quotes (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    vehicle_type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'round_trip',
    calculated_kms INTEGER NOT NULL DEFAULT 400,
    suggested_price NUMERIC(10,2) NOT NULL,
    final_price NUMERIC(10,2) NOT NULL,
    deposit_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
    balance_remaining NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: GASTOS EN RUTA Y OPERACIÓN
CREATE TABLE IF NOT EXISTS public.trip_expenses (
    id TEXT PRIMARY KEY,
    trip_id TEXT,
    concept TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL,
    ticket_url TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    reported_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: MATRIZ OFICIAL DE TARIFAS
CREATE TABLE IF NOT EXISTS public.route_pricing (
    id BIGSERIAL PRIMARY KEY,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    single_price NUMERIC(10,2) NOT NULL,
    round_trip_price NUMERIC(10,2),
    time_estimate TEXT,
    package_type TEXT DEFAULT 'estandar',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: PUNTOS OFICIALES DE ABORDAJE Y ESCALA (MAPS & GPS)
CREATE TABLE IF NOT EXISTS public.route_stops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    landmark TEXT NOT NULL,
    address TEXT,
    maps_url TEXT,
    stop_order INTEGER NOT NULL,
    time_offset_mins INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_special_point BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migraciones seguras para columnas si la tabla ya existía
ALTER TABLE public.route_stops ADD COLUMN IF NOT EXISTS maps_url TEXT;
ALTER TABLE public.route_stops ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.route_stops ADD COLUMN IF NOT EXISTS notes TEXT;

-- 10. TABLA: BITÁCORA DE AUDITORÍA (AUDIT LOGS)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    previous_value TEXT,
    new_value TEXT,
    ip_address TEXT DEFAULT '187.190.22.84'
);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- Permite acceso público y autenticado a través del ANON KEY de Supabase
-- ============================================================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública (ANON) protegidas contra re-ejecuciones
DROP POLICY IF EXISTS "Permitir lectura publica de vehiculos" ON public.vehicles;
DROP POLICY IF EXISTS "Permitir modificacion de vehiculos" ON public.vehicles;
CREATE POLICY "Permitir lectura publica de vehiculos" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de vehiculos" ON public.vehicles FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de conductores" ON public.drivers;
DROP POLICY IF EXISTS "Permitir modificacion de conductores" ON public.drivers;
CREATE POLICY "Permitir lectura publica de conductores" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de conductores" ON public.drivers FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de viajes" ON public.trips;
DROP POLICY IF EXISTS "Permitir modificacion de viajes" ON public.trips;
CREATE POLICY "Permitir lectura publica de viajes" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de viajes" ON public.trips FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura de reservas" ON public.bookings;
DROP POLICY IF EXISTS "Permitir creacion de reservas" ON public.bookings;
DROP POLICY IF EXISTS "Permitir actualizacion de reservas" ON public.bookings;
CREATE POLICY "Permitir lectura de reservas" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Permitir creacion de reservas" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de reservas" ON public.bookings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir lectura de cotizaciones" ON public.rental_quotes;
DROP POLICY IF EXISTS "Permitir creacion de cotizaciones" ON public.rental_quotes;
DROP POLICY IF EXISTS "Permitir actualizacion de cotizaciones" ON public.rental_quotes;
CREATE POLICY "Permitir lectura de cotizaciones" ON public.rental_quotes FOR SELECT USING (true);
CREATE POLICY "Permitir creacion de cotizaciones" ON public.rental_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de cotizaciones" ON public.rental_quotes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir gastos en ruta" ON public.trip_expenses;
CREATE POLICY "Permitir gastos en ruta" ON public.trip_expenses FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir tarifas de ruta" ON public.route_pricing;
CREATE POLICY "Permitir tarifas de ruta" ON public.route_pricing FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir paradas de ruta" ON public.route_stops;
CREATE POLICY "Permitir paradas de ruta" ON public.route_stops FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir bitacora de auditoria" ON public.audit_logs;
CREATE POLICY "Permitir bitacora de auditoria" ON public.audit_logs FOR ALL USING (true);

-- ============================================================================
-- SEED DATA OFICIAL: GUTIÉRREZ TRANSPORTES Y VIAJES
-- ============================================================================

-- Puntos de Abordaje, Escalas y Enlaces GPS de Google Maps
INSERT INTO public.route_stops (id, name, city, landmark, address, maps_url, stop_order, time_offset_mins, is_active, is_special_point, notes)
VALUES
  ('loc-manzanillo-soriana', 'Manzanillo (Soriana Híper / Blvd. Miguel de la Madrid)', 'Manzanillo', 'Soriana Híper Manzanillo / Frente a AutoZone', 'Blvd. Miguel de la Madrid #1120, Valle de las Garzas, Manzanillo, Col.', 'https://maps.app.goo.gl/J5REeQ24NnDFKF84A', 1, 0, true, false, 'Punto de partida principal en Manzanillo. Presentarse 15 min antes de la salida.'),
  ('mzn-autozone', 'Manzanillo (AutoZone Las Brisas)', 'Manzanillo', 'AutoZone Manzanillo Las Brisas', 'Blvd. Miguel de la Madrid #1450, Manzanillo, Col.', 'https://maps.app.goo.gl/J5REeQ24NnDFKF84A', 2, 15, true, false, 'Parada de abordaje sobre el Boulevard.'),
  ('loc-tecoman-kiosko', 'Tecomán (Kiosko Centro / Farmacia Guadalajara)', 'Tecomán', 'Jardín Principal Tecomán / Frente a Farmacia Guadalajara', 'Av. López Mateos #45, Col. Centro, Tecomán, Col.', 'https://maps.app.goo.gl/u5K5hG1v3m1qgK5a8', 3, 60, true, false, 'Abordaje en el Kiosko del Jardín Principal de Tecomán.'),
  ('loc-colima-sanfernando', 'Colima (Oficina Central San Fernando)', 'Colima', 'Av. San Fernando frente a Plaza Sevilla (Escala Técnica)', 'Av. San Fernando #410, Col. Lomas de Circunvalación, Colima, Col.', 'https://maps.app.goo.gl/cT9q5H3rX1B2rW6z7', 4, 120, true, false, 'Oficina Central y escala técnica obligatoria de 10 a 15 minutos (sanitarios y cafetería).'),
  ('col-escala', 'Colima (Escala Técnica Autopista)', 'Colima', 'Punto de escala, estiramiento y sanitarios autopista', 'Autopista Colima-Guadalajara Km 5, Colima, Col.', 'https://maps.app.goo.gl/cT9q5H3rX1B2rW6z7', 5, 135, true, false, 'Parada intermedia técnica.'),
  ('loc-guzman-colombia', 'Guzmán (Glorieta Colón / Acceso Autopista)', 'Guzmán', 'Glorieta Colón / Entrada principal a Ciudad Guzmán', 'Av. Cristóbal Colón y Calzada Madero y Carranza, Cd. Guzmán, Jal.', 'https://maps.app.goo.gl/8v3a4d5g6h7j8k9l0', 6, 190, true, false, 'Conexión rápida sur de Jalisco sobre la glorieta.'),
  ('loc-gdl-minerva', 'Guadalajara (Minerva - Estacionamiento Burger)', 'Guadalajara', 'Afuera del estacionamiento de Burger King Minerva', 'Av. Vallarta #2840 esq. Av. López Mateos, Guadalajara, Jal.', 'https://maps.app.goo.gl/k9L8m7n6b5v4c3x21', 7, 270, true, false, 'Punto de abordaje principal en Guadalajara Zona Poniente.'),
  ('gdl-plazasol', 'Guadalajara (Plaza del Sol - Súper Colchones)', 'Guadalajara', 'Afuera de Súper Colchones Plaza del Sol', 'Av. Mariano Otero #1499, Col. Residencial Victoria, Guadalajara, Jal.', 'https://maps.app.goo.gl/4mK3j2h1g0f9e8d76', 8, 285, true, false, 'Punto de abordaje Zona Plaza del Sol.'),
  ('gdl-fuentes', 'Guadalajara (Starbucks Las Fuentes)', 'Guadalajara', 'Starbucks Las Fuentes sobre López Mateos Sur', 'Av. López Mateos Sur #5560, Las Fuentes, Zapopan, Jal.', 'https://maps.app.goo.gl/4mK3j2h1g0f9e8d76', 9, 300, true, false, 'Abordaje rumbo a Colima / Manzanillo.'),
  ('loc-cas-consulado', 'Cas/Consulado (Centro de Solicitantes de Visa)', 'Cas/Consulado', 'Centro de Atención a Solicitantes (CAS) Guadalajara', 'Av. Unión #210, Col. Obrera / Americana, Guadalajara, Jal.', 'https://maps.app.goo.gl/5nB4v3c2x1z9a8s70', 10, 345, true, true, 'Servicio directo a citas consulares de visa americana.'),
  ('loc-zoologico-gdl', 'Zoológico (Zoológico Guadalajara Huentitán)', 'Zoológico', 'Taquilla Principal y Explanada Paseo del Zoológico', 'Paseo del Zoológico #600, Huentitán el Alto, Guadalajara, Jal.', 'https://maps.app.goo.gl/7xQ6w5e4r3t2y1u98', 11, 360, true, true, 'Paquete especial recreativo y familiar.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  landmark = EXCLUDED.landmark,
  address = EXCLUDED.address,
  maps_url = EXCLUDED.maps_url,
  stop_order = EXCLUDED.stop_order,
  time_offset_mins = EXCLUDED.time_offset_mins,
  is_active = EXCLUDED.is_active,
  is_special_point = EXCLUDED.is_special_point,
  notes = EXCLUDED.notes;

-- Tarifas Oficiales
INSERT INTO public.route_pricing (origin, destination, single_price, round_trip_price, time_estimate, package_type, notes)
VALUES
  ('Manzanillo', 'Guadalajara (GDL)', 370, 720, '4.5 hrs', 'estandar', 'Salida diaria troncal. Escala 10-15 min en Colima.'),
  ('Manzanillo', 'Tecomán', 60, NULL, '1 hr', 'intermedio', 'Conexión directa costa-valle.'),
  ('Manzanillo', 'Colima', 120, 210, '2 hrs', 'intermedio', 'Escala técnica y conexión estatal.'),
  ('Manzanillo', 'CAS / Consulado Americano', 450, 850, '5 hrs', 'consulado', 'Traslado directo a citas consulares.'),
  ('Manzanillo', 'Zoológico de GDL', 500, 920, '5.5 hrs', 'zoologico', 'Paquete turístico y familiar.'),
  ('Tecomán', 'Colima', 60, NULL, '45 mins', 'intermedio', 'Conexión regional directa.'),
  ('Tecomán', 'Guadalajara (GDL)', 330, NULL, '3.5 hrs', 'estandar', 'Salida diaria directa a GDL.'),
  ('Tecomán', 'CAS / Consulado Americano', 400, 780, '4 hrs', 'consulado', 'Paquete de traslado a citas consulares.'),
  ('Colima', 'Guadalajara (GDL)', 279, 520, '2.5 hrs', 'estandar', 'Salida directa a Minerva y Plaza del Sol.'),
  ('Colima', 'Cd. Guzmán', 130, NULL, '1.2 hrs', 'intermedio', 'Conexión sur de Jalisco.'),
  ('Colima', 'CAS / Consulado Americano', 340, 650, '3 hrs', 'consulado', 'Servicio especializado para visas.'),
  ('Colima', 'Zoológico de GDL', 400, 780, '3.5 hrs', 'zoologico', 'Paquete turístico recreativo familiar.'),
  ('Cd. Guzmán', 'Guadalajara (GDL)', 170, 330, '1.8 hrs', 'estandar', 'Salida ágil por autopista.'),
  ('Cd. Guzmán', 'CAS / Consulado Americano', 240, 450, '2.2 hrs', 'consulado', 'Servicio directo a trámites consulares.')
ON CONFLICT DO NOTHING;

-- Flota Inicial
INSERT INTO public.vehicles (id, name, plate, capacity, type, status, assigned_driver_id, fuel_level, mileage)
VALUES
  ('veh-01', 'Mercedes Sprinter Ejecutiva 04', 'JAL-492-B', 19, 'sprinter', 'active', 'drv-01', 92, 142300),
  ('veh-02', 'Mercedes Sprinter Ejecutiva 07', 'COL-118-A', 19, 'sprinter', 'active', 'drv-02', 88, 98400),
  ('veh-03', 'Toyota Hiace Gran Confort 12', 'JAL-883-C', 14, 'hiace', 'active', 'drv-03', 75, 62100)
ON CONFLICT (id) DO NOTHING;

-- Conductores Oficiales (7 Operadores)
INSERT INTO public.drivers (id, name, phone, license_type, status, rating, emergency_contact)
VALUES
  ('drv-01', 'Efraín Martínez Cruz', '+52 314 109 4725', 'Cel: +52 314 109 4725', 'in_service', 4.95, 'Contacto Operativo'),
  ('drv-02', 'Rosendo Navarro', '+52 33 1735 4281', 'Cel: +52 33 1735 4281', 'available', 4.88, 'Contacto Operativo'),
  ('drv-03', 'Eduardo Morales', '+52 33 2633 5014', 'Cel: +52 33 2633 5014', 'available', 4.92, 'Contacto Operativo'),
  ('drv-04', 'Omar Salvador Álvarez', '+52 312 113 6284', 'Cel: +52 312 113 6284', 'in_service', 4.85, 'Contacto Operativo'),
  ('drv-05', 'José Antonio Gutiérrez Ochoa', '+52 33 3326 3521', 'Cel: +52 33 3326 3521', 'available', 5.0, 'Contacto Operativo'),
  ('drv-06', 'Antonio Guerrero Troncoso', '+52 312 298 4953', 'Cel: +52 312 298 4953', 'available', 4.80, 'Contacto Operativo'),
  ('drv-07', 'Adán Daryan Ayala Méndez', '+52 312 120 6564', 'Cel: +52 312 120 6564', 'available', 4.90, 'Contacto Operativo')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  license_type = EXCLUDED.license_type,
  status = EXCLUDED.status,
  rating = EXCLUDED.rating;

-- Corridas Iniciales
INSERT INTO public.trips (
  id, route_title, origin, destination, date, departure_time, estimated_arrival,
  driver_id, driver_name, vehicle_id, unit_number, base_price, total_seats,
  occupied_seats_count, total_revenue, status, current_scale
)
VALUES
  ('trip-101', 'Manzanillo ➔ Guadalajara (GDL)', 'Manzanillo', 'Guadalajara (GDL)', CURRENT_DATE, '06:30 AM', '11:00 AM', 'drv-01', 'Efraín Martínez Cruz', 'veh-01', 'Unidad 01 (Sprinter)', 370, 19, 4, 1480, 'in_progress', 'Escala en Colima (Oficina Central)'),
  ('trip-102', 'Colima ➔ CAS / Consulado Americano GDL', 'Colima', 'CAS / Consulado Americano', CURRENT_DATE, '08:30 AM', '11:45 AM', 'drv-02', 'Rosendo Navarro', 'veh-02', 'Unidad 07 (Sprinter)', 340, 19, 2, 680, 'scheduled', 'Directo sin escalas'),
  ('trip-103', 'Colima ➔ Guadalajara (GDL)', 'Colima', 'Guadalajara (GDL)', CURRENT_DATE, '09:00 AM', '11:30 AM', 'drv-03', 'Eduardo Morales', 'veh-03', 'Unidad 12 (Hiace)', 279, 14, 2, 558, 'scheduled', 'Parada en Cd. Guzmán')
ON CONFLICT (id) DO NOTHING;
