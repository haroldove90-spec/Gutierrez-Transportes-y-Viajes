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

-- 9. TABLA: PUNTOS OFICIALES DE ABORDAJE Y ESCALA
CREATE TABLE IF NOT EXISTS public.route_stops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    landmark TEXT NOT NULL,
    address TEXT,
    stop_order INTEGER NOT NULL,
    time_offset_mins INTEGER NOT NULL DEFAULT 0,
    is_special_point BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Políticas de lectura pública (ANON)
CREATE POLICY "Permitir lectura publica de vehiculos" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de vehiculos" ON public.vehicles FOR ALL USING (true);

CREATE POLICY "Permitir lectura publica de conductores" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de conductores" ON public.drivers FOR ALL USING (true);

CREATE POLICY "Permitir lectura publica de viajes" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de viajes" ON public.trips FOR ALL USING (true);

CREATE POLICY "Permitir lectura de reservas" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Permitir creacion de reservas" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de reservas" ON public.bookings FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura de cotizaciones" ON public.rental_quotes FOR SELECT USING (true);
CREATE POLICY "Permitir creacion de cotizaciones" ON public.rental_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion de cotizaciones" ON public.rental_quotes FOR UPDATE USING (true);

CREATE POLICY "Permitir gastos en ruta" ON public.trip_expenses FOR ALL USING (true);
CREATE POLICY "Permitir tarifas de ruta" ON public.route_pricing FOR ALL USING (true);
CREATE POLICY "Permitir paradas de ruta" ON public.route_stops FOR ALL USING (true);
CREATE POLICY "Permitir bitacora de auditoria" ON public.audit_logs FOR ALL USING (true);

-- ============================================================================
-- SEED DATA OFICIAL: GUTIÉRREZ TRANSPORTES Y VIAJES
-- ============================================================================

-- Puntos de Abordaje y Paradas
INSERT INTO public.route_stops (id, name, city, landmark, address, stop_order, time_offset_mins, is_special_point)
VALUES
  ('mzn-soriana', 'Soriana Híper Manzanillo', 'Manzanillo', 'Soriana Híper Manzanillo', 'Blvd. Miguel de la Madrid s/n', 1, 0, false),
  ('mzn-autozone', 'AutoZone Manzanillo', 'Manzanillo', 'AutoZone Manzanillo', 'Blvd. Miguel de la Madrid #1120', 2, 15, false),
  ('tec-kiosko', 'Kiosko Tecomán Centro', 'Tecomán', 'Jardín Principal / Farmacia Guadalajara', 'Av. López Mateos #45', 3, 60, false),
  ('col-sanfernando', 'Oficina Central Colima', 'Colima', 'Av. San Fernando frente a Plaza Sevilla', 'Av. San Fernando #410', 4, 120, false),
  ('col-escala', 'Escala Técnica Colima (10-15 min)', 'Colima', 'Punto de escala y sanitarios', 'Autopista Colima-Guadalajara Km 5', 5, 135, false),
  ('cdguzman-parada', 'Cd. Guzmán (Acceso Autopista)', 'Colima', 'Glorieta Colón / Entrada Cd. Guzmán', 'Av. Cristóbal Colón', 6, 190, false),
  ('gdl-minerva', 'Minerva (Burger)', 'Guadalajara', 'Afuera del estacionamiento del Burger', 'Av. Vallarta y Av. López Mateos', 7, 270, false),
  ('gdl-plazasol', 'Plaza del Sol (Súper Colchones)', 'Guadalajara', 'Afuera de Súper Colchones', 'Av. Mariano Otero #1499', 8, 285, false),
  ('gdl-fuentes', 'Starbucks Las Fuentes', 'Guadalajara', 'Starbucks Las Fuentes', 'Av. López Mateos Sur #5560', 9, 300, false),
  ('gdl-enramada', 'Restaurante Enramada', 'Guadalajara', 'Restaurante Enramada', 'Av. López Mateos Sur acceso', 10, 315, false),
  ('gdl-cuatas', 'Gasolinera Cuatas', 'Guadalajara', 'Gasolinera Cuatas', 'Carretera a Morelia Km 20', 11, 330, false),
  ('gdl-cas', 'CAS / Consulado Americano', 'Guadalajara', 'Centro de Atención a Solicitantes', 'Av. Unión #210, Col. Obrera', 12, 345, true),
  ('gdl-zoo', 'Zoológico Guadalajara', 'Guadalajara', 'Taquilla Principal Huentitán', 'Paseo del Zoológico #600', 13, 360, true)
ON CONFLICT (id) DO NOTHING;

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

-- Conductores Iniciales
INSERT INTO public.drivers (id, name, phone, license_type, status, rating, emergency_contact)
VALUES
  ('drv-01', 'Don Carlos Mendoza', '312-319-8822', 'Federal Tipo B (Pasajeros)', 'on_trip', 4.9, 'Esposa: Sra. Elena (312-102-9900)'),
  ('drv-02', 'Javier "Javi" Ramos', '312-554-1290', 'Federal Tipo B (Pasajeros)', 'available', 4.8, 'Hermano: Pedro Ramos (312-404-1122)'),
  ('drv-03', 'Manuel Arriaga', '314-228-4491', 'Federal Tipo B (Pasajeros)', 'available', 5.0, 'Hija: Lucía Arriaga (314-889-1022)')
ON CONFLICT (id) DO NOTHING;

-- Corridas Iniciales
INSERT INTO public.trips (
  id, route_title, origin, destination, date, departure_time, estimated_arrival,
  driver_id, driver_name, vehicle_id, unit_number, base_price, total_seats,
  occupied_seats_count, total_revenue, status, current_scale
)
VALUES
  ('trip-101', 'Manzanillo ➔ Guadalajara (GDL)', 'Manzanillo', 'Guadalajara (GDL)', CURRENT_DATE, '06:30 AM', '11:00 AM', 'drv-01', 'Don Carlos Mendoza', 'veh-01', 'Unidad 04 (Sprinter)', 370, 19, 4, 1480, 'in_progress', 'Escala en Colima (Oficina Central)'),
  ('trip-102', 'Colima ➔ CAS / Consulado Americano GDL', 'Colima', 'CAS / Consulado Americano', CURRENT_DATE, '08:30 AM', '11:45 AM', 'drv-02', 'Javier Ramos', 'veh-02', 'Unidad 07 (Sprinter)', 340, 19, 2, 680, 'scheduled', 'Directo sin escalas'),
  ('trip-103', 'Colima ➔ Guadalajara (GDL)', 'Colima', 'Guadalajara (GDL)', CURRENT_DATE, '09:00 AM', '11:30 AM', 'drv-03', 'Manuel Arriaga', 'veh-03', 'Unidad 12 (Hiace)', 279, 14, 2, 558, 'scheduled', 'Parada en Cd. Guzmán')
ON CONFLICT (id) DO NOTHING;
