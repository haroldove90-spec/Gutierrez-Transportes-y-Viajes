import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Terminal, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { SUPABASE_URL, SUPABASE_PROJECT_ID, checkSupabaseConnection } from '../../lib/supabase';

interface SupabaseSqlModalProps {
  onClose: () => void;
}

export const SUPABASE_SQL_SCRIPT = `-- ============================================================================
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
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;

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
DROP POLICY IF EXISTS "Permitir lectura de vehiculos" ON public.vehicles;
DROP POLICY IF EXISTS "Permitir modificacion de vehiculos" ON public.vehicles;
CREATE POLICY "Permitir lectura de vehiculos" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de vehiculos" ON public.vehicles FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura de conductores" ON public.drivers;
DROP POLICY IF EXISTS "Permitir modificacion de conductores" ON public.drivers;
CREATE POLICY "Permitir lectura de conductores" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Permitir modificacion de conductores" ON public.drivers FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir lectura de viajes" ON public.trips;
DROP POLICY IF EXISTS "Permitir modificacion de viajes" ON public.trips;
CREATE POLICY "Permitir lectura de viajes" ON public.trips FOR SELECT USING (true);
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

DROP POLICY IF EXISTS "Permitir gastos de ruta" ON public.trip_expenses;
CREATE POLICY "Permitir gastos de ruta" ON public.trip_expenses FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir tarifas de ruta" ON public.route_pricing;
CREATE POLICY "Permitir tarifas de ruta" ON public.route_pricing FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir paradas de ruta" ON public.route_stops;
CREATE POLICY "Permitir paradas de ruta" ON public.route_stops FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir auditoria" ON public.audit_logs;
CREATE POLICY "Permitir auditoria" ON public.audit_logs FOR ALL USING (true);

-- ============================================================================
-- SEED DATA OFICIAL
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

-- Flota Inicial Oficial (8 Unidades con Fotos en Supabase Storage)
INSERT INTO public.vehicles (id, name, plate, capacity, type, status, assigned_driver_id, fuel_level, mileage, image_url)
VALUES
  ('veh-sp20-01', 'Unidad 01 (Mercedes-Benz Sprinter 20 Pax)', '48-RB-9X', 20, 'sprinter', 'active', 'drv-01', 95, 114200, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png'),
  ('veh-hi14-01', 'Unidad 02 (Toyota Hiace Gran Confort 14 Pax)', '31-TA-5M', 14, 'hiace', 'active', 'drv-02', 90, 72400, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'),
  ('veh-hi14-02', 'Unidad 03 (Toyota Hiace Gran Confort 14 Pax)', '31-TA-6M', 14, 'hiace', 'active', 'drv-03', 88, 68900, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'),
  ('veh-hi14-03', 'Unidad 04 (Toyota Hiace Gran Confort 14 Pax)', '31-TA-7M', 14, 'hiace', 'reserved_rent', 'drv-04', 85, 84100, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'),
  ('veh-hi14-04', 'Unidad 05 (Toyota Hiace Gran Confort 14 Pax)', '31-TA-8M', 14, 'hiace', 'active', 'drv-05', 92, 59300, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'),
  ('veh-hi11-01', 'Unidad 06 (Toyota Hiace Turismo VIP 11 Pax)', '15-TC-2K', 11, 'hiace', 'active', 'drv-06', 94, 45200, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png'),
  ('veh-hi11-02', 'Unidad 07 (Toyota Hiace Turismo VIP 11 Pax)', '15-TC-3K', 11, 'hiace', 'maintenance', NULL, 70, 41800, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png'),
  ('veh-tr18-01', 'Unidad 08 (Ford Transit Tourneo 18 Pax)', '92-FT-4H', 18, 'transit', 'active', 'drv-07', 91, 63500, 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/fordtransitde18pasajeros.png')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  plate = EXCLUDED.plate,
  capacity = EXCLUDED.capacity,
  image_url = EXCLUDED.image_url;

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

INSERT INTO public.trips (
  id, route_title, origin, destination, date, departure_time, estimated_arrival,
  driver_id, driver_name, vehicle_id, unit_number, base_price, total_seats,
  occupied_seats_count, total_revenue, status, current_scale
)
VALUES
  ('trip-101', 'Manzanillo ➔ Guadalajara (GDL)', 'Manzanillo', 'Guadalajara (GDL)', CURRENT_DATE, '06:30 AM', '11:00 AM', 'drv-01', 'Efraín Martínez Cruz', 'veh-sp20-01', 'Unidad 01 (Sprinter)', 370, 20, 4, 1480, 'in_progress', 'Escala en Colima (Oficina Central)'),
  ('trip-102', 'Colima ➔ CAS / Consulado Americano GDL', 'Colima', 'CAS / Consulado Americano', CURRENT_DATE, '08:30 AM', '11:45 AM', 'drv-02', 'Rosendo Navarro', 'veh-hi14-01', 'Unidad 02 (Hiace)', 340, 14, 2, 680, 'scheduled', 'Directo sin escalas'),
  ('trip-103', 'Colima ➔ Guadalajara (GDL)', 'Colima', 'Guadalajara (GDL)', CURRENT_DATE, '09:00 AM', '11:30 AM', 'drv-03', 'Eduardo Morales', 'veh-hi14-02', 'Unidad 03 (Hiace)', 279, 14, 2, 558, 'scheduled', 'Parada en Cd. Guzmán')
ON CONFLICT (id) DO NOTHING;
`;

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [connStatus, setConnStatus] = useState<{ loading: boolean; connected?: boolean; message?: string }>({
    loading: true
  });

  const checkConnection = async () => {
    setConnStatus({ loading: true });
    const res = await checkSupabaseConnection();
    setConnStatus({
      loading: false,
      connected: res.connected,
      message: res.error || (res.connected ? 'Conectado exitosamente con Supabase' : 'Error al conectar')
    });
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCRIPT], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gutierrez-transportes-supabase-schema-${SUPABASE_PROJECT_ID}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 md:p-6 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black">Configuración Supabase</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">
                Proyecto: <strong className="text-neutral-200">lyjuhvqpvomryytxyztr</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 text-neutral-800">
          
          {/* Status and Project Credential Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Connection Status Box */}
            <div className="p-4 rounded-2xl border bg-neutral-50 border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-600" /> Estado de Conexión
                </span>
                <button
                  onClick={checkConnection}
                  disabled={connStatus.loading}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${connStatus.loading ? 'animate-spin' : ''}`} /> Probar
                </button>
              </div>

              {connStatus.loading ? (
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 py-1">
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-600" /> Verificando endpoint Supabase...
                </div>
              ) : connStatus.connected ? (
                <div className="flex items-start gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <p className="font-black">¡Conectado al proyecto Supabase!</p>
                    <p className="text-[11px] font-medium text-emerald-800">{connStatus.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-black">Reachable (Correr SQL para crear tablas)</p>
                    <p className="text-[11px] font-medium text-amber-900">{connStatus.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Credentials Info Box */}
            <div className="p-4 rounded-2xl border bg-neutral-50 border-neutral-200 space-y-1.5 text-xs">
              <span className="font-black text-neutral-500 uppercase tracking-wider block">
                Detalles del Proyecto
              </span>
              <p className="text-neutral-700">
                <span className="font-bold text-neutral-900">Project ID:</span> <code className="bg-neutral-200 px-1.5 py-0.5 rounded font-mono text-[11px]">{SUPABASE_PROJECT_ID}</code>
              </p>
              <p className="text-neutral-700 truncate">
                <span className="font-bold text-neutral-900">Endpoint:</span> <code className="bg-neutral-200 px-1.5 py-0.5 rounded font-mono text-[11px]">{SUPABASE_URL}</code>
              </p>
              <p className="text-neutral-700">
                <span className="font-bold text-neutral-900">Auth & RLS:</span> <span className="text-emerald-700 font-bold">Activo (Anon Key cargada)</span>
              </p>
            </div>
          </div>

          {/* Quick Steps Guide */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs md:text-sm text-neutral-800 space-y-2">
            <h4 className="font-black text-orange-900 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-orange-600" /> Instrucciones para correr el script en Supabase:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-neutral-700 font-medium">
              <li>Haz clic en el botón <strong>"Copiar Script SQL Completo"</strong> a continuación.</li>
              <li>Abre tu consola de Supabase en <a href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`} target="_blank" rel="noreferrer" className="text-orange-700 font-black underline inline-flex items-center gap-0.5">SQL Editor <ExternalLink className="w-3 h-3" /></a>.</li>
              <li>Pega el código en el editor y presiona <strong>"Run"</strong> (Ejecutar).</li>
              <li>¡Listo! Todas las tablas, políticas de seguridad RLS y datos de prueba quedarán creados.</li>
            </ol>
          </div>

          {/* Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-orange-600" /> Script SQL (DDL + RLS + Seed Data)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSql}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar .sql
                </button>
                <button
                  onClick={handleCopySql}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> ¡Copiado al portapapeles!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Script SQL Completo
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-neutral-950 text-neutral-100 rounded-2xl p-4 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto border border-neutral-800">
              <pre>{SUPABASE_SQL_SCRIPT}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-neutral-500 font-medium">
            Archivo guardado en el proyecto: <code className="font-bold text-neutral-700">/supabase/schema.sql</code>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all cursor-pointer ml-auto"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
