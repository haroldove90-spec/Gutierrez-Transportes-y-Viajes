import { 
  RouteStop, 
  RoutePricing, 
  Vehicle, 
  Driver, 
  TripSchedule, 
  Booking, 
  TripExpense, 
  RentalQuote, 
  InvoiceCFDI, 
  AuditLog, 
  ExceptionRequest,
  Seat,
  RentalCar,
  CharterAssignment
} from '../types';

export const OFFICIAL_PHONE = '312 312 4237';
export const OFFICIAL_WHATSAPP = '312 113 8193';
export const OFFICIAL_EXPERIENCE_YEARS = 18;

export const OFFICIAL_PRICING: RoutePricing[] = [
  // Origen: Manzanillo
  { origin: 'Manzanillo', destination: 'Guadalajara (GDL)', singlePrice: 370, roundTripPrice: 720, timeEstimate: '4.5 hrs', notes: 'Salida diaria troncal. Escala de 10-15 min en Colima.', packageType: 'estandar' },
  { origin: 'Manzanillo', destination: 'Tecomán', singlePrice: 60, timeEstimate: '1 hr', notes: 'Conexión directa costa-valle.', packageType: 'intermedio' },
  { origin: 'Manzanillo', destination: 'Colima', singlePrice: 120, roundTripPrice: 210, timeEstimate: '2 hrs', notes: 'Escala técnica y conexión estatal.', packageType: 'intermedio' },
  { origin: 'Manzanillo', destination: 'CAS / Consulado Americano', singlePrice: 450, roundTripPrice: 850, timeEstimate: '5 hrs', notes: 'Traslado directo a citas consulares y visados.', packageType: 'consulado' },
  { origin: 'Manzanillo', destination: 'Zoológico de GDL', singlePrice: 500, roundTripPrice: 920, timeEstimate: '5.5 hrs', notes: 'Paquete especial y turístico familiar.', packageType: 'zoologico' },

  // Origen: Tecomán
  { origin: 'Tecomán', destination: 'Colima', singlePrice: 60, timeEstimate: '45 mins', notes: 'Conexión regional directa.', packageType: 'intermedio' },
  { origin: 'Tecomán', destination: 'Guadalajara (GDL)', singlePrice: 330, timeEstimate: '3.5 hrs', notes: 'Salida diaria directa hacia GDL.', packageType: 'estandar' },
  { origin: 'Tecomán', destination: 'CAS / Consulado Americano', singlePrice: 400, roundTripPrice: 780, timeEstimate: '4 hrs', notes: 'Paquete de traslado para citas consulares.', packageType: 'consulado' },

  // Origen: Colima
  { origin: 'Colima', destination: 'Guadalajara (GDL)', singlePrice: 279, roundTripPrice: 520, timeEstimate: '2.5 hrs', notes: 'Salida directa a Minerva y Plaza del Sol.', packageType: 'estandar' },
  { origin: 'Colima', destination: 'Cd. Guzmán', singlePrice: 130, timeEstimate: '1.2 hrs', notes: 'Conexión sur de Jalisco.', packageType: 'intermedio' },
  { origin: 'Colima', destination: 'CAS / Consulado Americano', singlePrice: 340, roundTripPrice: 650, timeEstimate: '3 hrs', notes: 'Servicio especializado para citas de visa.', packageType: 'consulado' },
  { origin: 'Colima', destination: 'Zoológico de GDL', singlePrice: 400, roundTripPrice: 780, timeEstimate: '3.5 hrs', notes: 'Paquete turístico y recreativo familiar.', packageType: 'zoologico' },

  // Origen: Cd. Guzmán
  { origin: 'Cd. Guzmán', destination: 'Guadalajara (GDL)', singlePrice: 170, roundTripPrice: 330, timeEstimate: '1.8 hrs', notes: 'Salida ágil por autopista.', packageType: 'estandar' },
  { origin: 'Cd. Guzmán', destination: 'CAS / Consulado Americano', singlePrice: 240, roundTripPrice: 450, timeEstimate: '2.2 hrs', notes: 'Servicio directo a trámites consulares.', packageType: 'consulado' },
];

export const ROUTE_STOPS: RouteStop[] = [
  // 1. Manzanillo
  { 
    id: 'loc-manzanillo-soriana', 
    name: 'Manzanillo (Soriana Híper / Blvd. Miguel de la Madrid)', 
    city: 'Manzanillo', 
    landmark: 'Soriana Híper Manzanillo / Frente a AutoZone', 
    address: 'Blvd. Miguel de la Madrid #1120, Valle de las Garzas, Manzanillo, Col.', 
    mapsUrl: 'https://maps.app.goo.gl/J5REeQ24NnDFKF84A', 
    order: 1, 
    timeOffsetMins: 0, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Punto de partida principal en Manzanillo. Presentarse 15 min antes de la salida.'
  },
  { 
    id: 'mzn-autozone', 
    name: 'Manzanillo (AutoZone Las Brisas)', 
    city: 'Manzanillo', 
    landmark: 'AutoZone Manzanillo Las Brisas', 
    address: 'Blvd. Miguel de la Madrid #1450, Manzanillo, Col.', 
    mapsUrl: 'https://maps.app.goo.gl/J5REeQ24NnDFKF84A', 
    order: 2, 
    timeOffsetMins: 15, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Parada de abordaje sobre el Boulevard.'
  },
  
  // 2. Tecomán
  { 
    id: 'loc-tecoman-kiosko', 
    name: 'Tecomán (Kiosko Centro / Farmacia Guadalajara)', 
    city: 'Tecomán', 
    landmark: 'Jardín Principal Tecomán / Frente a Farmacia Guadalajara', 
    address: 'Av. López Mateos #45, Col. Centro, Tecomán, Col.', 
    mapsUrl: 'https://maps.app.goo.gl/u5K5hG1v3m1qgK5a8', 
    order: 3, 
    timeOffsetMins: 60, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Abordaje en el Kiosko del Jardín Principal de Tecomán.'
  },
  
  // 3. Colima
  { 
    id: 'loc-colima-sanfernando', 
    name: 'Colima (Oficina Central San Fernando)', 
    city: 'Colima', 
    landmark: 'Av. San Fernando frente a Plaza Sevilla (Escala Técnica)', 
    address: 'Av. San Fernando #410, Col. Lomas de Circunvalación, Colima, Col.', 
    mapsUrl: 'https://maps.app.goo.gl/cT9q5H3rX1B2rW6z7', 
    order: 4, 
    timeOffsetMins: 120, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Oficina Central y escala técnica obligatoria de 10 a 15 minutos (sanitarios y cafetería).'
  },
  { 
    id: 'col-escala', 
    name: 'Colima (Escala Técnica Autopista)', 
    city: 'Colima', 
    landmark: 'Punto de escala, estiramiento y sanitarios autopista', 
    address: 'Autopista Colima-Guadalajara Km 5, Colima, Col.', 
    mapsUrl: 'https://maps.app.goo.gl/cT9q5H3rX1B2rW6z7', 
    order: 5, 
    timeOffsetMins: 135, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Parada intermedia técnica.'
  },

  // 4. Guzmán (Cd. Guzmán)
  { 
    id: 'loc-guzman-colombia', 
    name: 'Guzmán (Glorieta Colón / Acceso Autopista)', 
    city: 'Guzmán', 
    landmark: 'Glorieta Colón / Entrada principal a Ciudad Guzmán', 
    address: 'Av. Cristóbal Colón y Calzada Madero y Carranza, Cd. Guzmán, Jal.', 
    mapsUrl: 'https://maps.app.goo.gl/8v3a4d5g6h7j8k9l0', 
    order: 6, 
    timeOffsetMins: 190, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Conexión rápida sur de Jalisco sobre la glorieta.'
  },

  // 5. Guadalajara
  { 
    id: 'loc-gdl-minerva', 
    name: 'Guadalajara (Minerva - Estacionamiento Burger)', 
    city: 'Guadalajara', 
    landmark: 'Afuera del estacionamiento de Burger King Minerva', 
    address: 'Av. Vallarta #2840 esq. Av. López Mateos, Guadalajara, Jal.', 
    mapsUrl: 'https://maps.app.goo.gl/k9L8m7n6b5v4c3x21', 
    order: 7, 
    timeOffsetMins: 270, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Punto de abordaje principal en Guadalajara Zona Poniente.'
  },
  { 
    id: 'gdl-plazasol', 
    name: 'Guadalajara (Plaza del Sol - Súper Colchones)', 
    city: 'Guadalajara', 
    landmark: 'Afuera de Súper Colchones Plaza del Sol', 
    address: 'Av. Mariano Otero #1499, Col. Residencial Victoria, Guadalajara, Jal.', 
    mapsUrl: 'https://maps.app.goo.gl/4mK3j2h1g0f9e8d76', 
    order: 8, 
    timeOffsetMins: 285, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Punto de abordaje Zona Plaza del Sol.'
  },
  { 
    id: 'gdl-fuentes', 
    name: 'Guadalajara (Starbucks Las Fuentes)', 
    city: 'Guadalajara', 
    landmark: 'Starbucks Las Fuentes sobre López Mateos Sur', 
    address: 'Av. López Mateos Sur #5560, Las Fuentes, Zapopan, Jal.', 
    mapsUrl: 'https://maps.app.goo.gl/4mK3j2h1g0f9e8d76', 
    order: 9, 
    timeOffsetMins: 300, 
    isActive: true,
    isSpecialPoint: false,
    notes: 'Abordaje rumbo a Colima / Manzanillo.'
  },

  // 6. Cas/Consulado
  { 
    id: 'loc-cas-consulado', 
    name: 'Cas/Consulado (Centro de Solicitantes de Visa)', 
    city: 'Cas/Consulado', 
    landmark: 'Centro de Atención a Solicitantes (CAS) Guadalajara', 
    address: 'Av. Unión #210, Col. Obrera / Americana, Guadalajara, Jal.', 
    mapsUrl: 'https://maps.app.goo.gl/5nB4v3c2x1z9a8s70', 
    order: 10, 
    timeOffsetMins: 345, 
    isActive: true,
    isSpecialPoint: true,
    notes: 'Servicio directo a citas consulares de visa americana.'
  },

  // 7. Zoológico
  { 
    id: 'loc-zoologico-gdl', 
    name: 'Zoológico (Zoológico Guadalajara Huentitán)', 
    city: 'Zoológico', 
    landmark: 'Taquilla Principal y Explanada Paseo del Zoológico', 
    address: 'Paseo del Zoológico #600, Huentitán el Alto, Guadalajara, Jal.', 
    mapsUrl: 'https://maps.app.goo.gl/7xQ6w5e4r3t2y1u98', 
    order: 11, 
    timeOffsetMins: 360, 
    isActive: true,
    isSpecialPoint: true,
    notes: 'Paquete especial recreativo y familiar.'
  },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  // 1 Mercedes Sprinter 20 pasajeros
  { 
    id: 'veh-sp20-01', 
    unitNumber: 'Unidad 01 (Sprinter 20)', 
    model: 'Mercedes-Benz Sprinter 20 Pax', 
    plate: '48-RB-9X', 
    capacity: 20, 
    status: 'active', 
    odometer: 114200, 
    nextServiceKm: 120000, 
    lastServiceDate: '2026-08-15', 
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png'
  },
  // 4 Toyota Hiace 14 pasajeros
  { 
    id: 'veh-hi14-01', 
    unitNumber: 'Unidad 02 (Hiace 14)', 
    model: 'Toyota Hiace Gran Confort 14 Pax', 
    plate: '31-TA-5M', 
    capacity: 14, 
    status: 'active', 
    odometer: 72400, 
    nextServiceKm: 75000, 
    lastServiceDate: '2026-08-20', 
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'
  },
  { 
    id: 'veh-hi14-02', 
    unitNumber: 'Unidad 03 (Hiace 14)', 
    model: 'Toyota Hiace Gran Confort 14 Pax', 
    plate: '31-TA-6M', 
    capacity: 14, 
    status: 'active', 
    odometer: 68900, 
    nextServiceKm: 70000, 
    lastServiceDate: '2026-08-22', 
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'
  },
  { 
    id: 'veh-hi14-03', 
    unitNumber: 'Unidad 04 (Hiace 14)', 
    model: 'Toyota Hiace Gran Confort 14 Pax', 
    plate: '31-TA-7M', 
    capacity: 14, 
    status: 'active', 
    odometer: 84100, 
    nextServiceKm: 90000, 
    lastServiceDate: '2026-08-10', 
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'
  },
  { 
    id: 'veh-hi14-04', 
    unitNumber: 'Unidad 05 (Hiace 14)', 
    model: 'Toyota Hiace Gran Confort 14 Pax', 
    plate: '31-TA-8M', 
    capacity: 14, 
    status: 'active', 
    odometer: 59300, 
    nextServiceKm: 65000, 
    lastServiceDate: '2026-08-28', 
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'
  },
  // 2 Toyota Hiace 11 pasajeros
  { 
    id: 'veh-hi11-01', 
    unitNumber: 'Unidad 06 (Hiace 11 VIP)', 
    model: 'Toyota Hiace Turismo VIP 11 Pax', 
    plate: '15-TC-2K', 
    capacity: 11, 
    status: 'active', 
    odometer: 45200, 
    nextServiceKm: 50000, 
    lastServiceDate: '2026-08-12', 
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png'
  },
  { 
    id: 'veh-hi11-02', 
    unitNumber: 'Unidad 07 (Hiace 11 VIP)', 
    model: 'Toyota Hiace Turismo VIP 11 Pax', 
    plate: '15-TC-3K', 
    capacity: 11, 
    status: 'active', 
    odometer: 41800, 
    nextServiceKm: 45000, 
    lastServiceDate: '2026-08-05',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png'
  },
  // 1 Ford Transit 18 pasajeros
  { 
    id: 'veh-tr18-01', 
    unitNumber: 'Unidad 08 (Ford Transit 18)', 
    model: 'Ford Transit Tourneo 18 Pax', 
    plate: '92-FT-4H', 
    capacity: 18, 
    status: 'active', 
    odometer: 63500, 
    nextServiceKm: 70000, 
    lastServiceDate: '2026-08-19', 
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/fordtransitde18pasajeros.png'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  { 
    id: 'drv-01', 
    name: 'Efraín Martínez Cruz', 
    phone: '+52 314 109 4725', 
    licenseNumber: '+52 314 109 4725', 
    licenseExpiry: '2028-12-31', 
    status: 'available', 
    rating: 4.95, 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'drv-02', 
    name: 'Rosendo Navarro', 
    phone: '+52 33 1735 4281', 
    licenseNumber: '+52 33 1735 4281', 
    licenseExpiry: '2028-12-31', 
    status: 'available', 
    rating: 4.88, 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'drv-03', 
    name: 'Eduardo Morales', 
    phone: '+52 33 2633 5014', 
    licenseNumber: '+52 33 2633 5014', 
    licenseExpiry: '2028-12-31', 
    status: 'available', 
    rating: 4.92, 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'drv-04', 
    name: 'Omar Salvador Álvarez', 
    phone: '+52 312 113 6284', 
    licenseNumber: '+52 312 113 6284', 
    licenseExpiry: '2028-12-31', 
    status: 'available', 
    rating: 4.85, 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'drv-05', 
    name: 'José Antonio Gutiérrez Ochoa', 
    phone: '+52 33 3326 3521', 
    licenseNumber: '+52 33 3326 3521', 
    licenseExpiry: '2028-12-31', 
    status: 'available', 
    rating: 5.0, 
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'drv-06', 
    name: 'Antonio Guerrero Troncoso', 
    phone: '+52 312 298 4953', 
    licenseNumber: '+52 312 298 4953', 
    licenseExpiry: '2028-12-31', 
    status: 'available', 
    rating: 4.80, 
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  { 
    id: 'drv-07', 
    name: 'Adán Daryan Ayala Méndez', 
    phone: '+52 312 120 6564', 
    licenseNumber: '+52 312 120 6564', 
    licenseExpiry: '2028-12-31', 
    status: 'available', 
    rating: 4.90, 
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  }
];

export const OFFICIAL_RENTAL_CARS: RentalCar[] = [
  {
    id: 'rc-vento',
    name: 'Vento VW',
    brand: 'Volkswagen',
    category: 'Sedán',
    capacity: 5,
    dailyRateWithoutDriver: 800,
    dailyRateWithDriver: 1600,
    transmission: 'Estándar',
    hasAC: true,
    fuelType: 'Gasolina',
    luggageCapacity: '2 maletas grandes',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/vento.png',
    available: true,
    features: ['Aire acondicionado', 'Económico y rendidor', 'Bluetooth & USB', 'Cajuela amplia 455L']
  },
  {
    id: 'rc-avanza',
    name: 'Avanza Toyota',
    brand: 'Toyota',
    category: 'Familiar',
    capacity: 7,
    dailyRateWithoutDriver: 1500,
    dailyRateWithDriver: 2300,
    transmission: 'Automática',
    hasAC: true,
    fuelType: 'Gasolina',
    luggageCapacity: '3 maletas + portaequipaje',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/avanzatoyota.png',
    available: true,
    features: ['3 filas de asientos (7 pasajeros)', 'Doble aire acondicionado', 'Gran versatilidad familiar', 'Frenos ABS']
  },
  {
    id: 'rc-l200',
    name: 'Mitsubishi L200 (Doble Cabina 4x4)',
    brand: 'Mitsubishi',
    category: 'Pick-up / Trabajo & Aventura',
    capacity: 5,
    dailyRateWithoutDriver: 1800,
    dailyRateWithDriver: 2600,
    transmission: 'Manual 6 vel 4x4',
    hasAC: true,
    fuelType: 'Diésel Turbo',
    luggageCapacity: 'Batea de carga amplia para herramientas y equipaje',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/l200mitsubishi.png',
    available: true,
    features: ['Tracción 4x4 todo terreno', 'Doble cabina para 5 pasajeros', 'Batea de carga para trabajo rudo', 'Clima y conectividad Bluetooth']
  },
  {
    id: 'rc-teramont',
    name: 'Teramont VW',
    brand: 'Volkswagen',
    category: 'SUV',
    capacity: 7,
    dailyRateWithoutDriver: 4500,
    dailyRateWithDriver: 5500,
    transmission: 'Automática',
    hasAC: true,
    fuelType: 'Gasolina',
    luggageCapacity: '5 maletas grandes',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/teramon.png',
    available: true,
    features: ['SUV de Gran Lujo 7 Pasajeros', 'Asientos de piel climatizados', 'Techo panorámico corredizo', 'Motor V6 4MOTION']
  },
  {
    id: 'rc-tiguan',
    name: 'Tiguan VW',
    brand: 'Volkswagen',
    category: 'SUV',
    capacity: 7,
    dailyRateWithoutDriver: 2800,
    dailyRateWithDriver: 3600,
    transmission: 'Automática',
    hasAC: true,
    fuelType: 'Gasolina',
    luggageCapacity: '4 maletas',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/tiguan.png',
    available: true,
    features: ['SUV ejecutiva moderna 7 Pax', 'Excelente confort de marcha', 'Tracción y seguridad avanzada', 'Cámara de reversa 360']
  },
  {
    id: 'rc-hiace14',
    name: 'Toyota Hiace (14 Pasajeros)',
    brand: 'Toyota',
    category: 'Camioneta / Van',
    capacity: 14,
    dailyRateWithoutDriver: 3000,
    dailyRateWithDriver: 4000,
    transmission: 'Manual 6 vel',
    hasAC: true,
    fuelType: 'Diésel',
    luggageCapacity: 'Área posterior de equipaje',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png',
    available: true,
    features: ['14 asientos reclinables de confort', 'Doble difusor de A/C en cabina', 'Disponible con y sin chofer', 'Ideal para grupos y familias']
  },
  {
    id: 'rc-hiace11',
    name: 'Toyota Hiace (11 Pasajeros)',
    brand: 'Toyota',
    category: 'Camioneta / Van',
    capacity: 11,
    dailyRateWithoutDriver: 3000,
    dailyRateWithDriver: 4000,
    transmission: 'Automática / Manual',
    hasAC: true,
    fuelType: 'Gasolina/Diésel',
    luggageCapacity: 'Amplio maletero trasero',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede12pasajeros.png',
    available: true,
    features: ['11 asientos ejecutivos VIP', 'Mayor espacio entre filas', 'Disponible con y sin chofer', 'Cinturones de 3 puntos']
  },
  {
    id: 'rc-transit18',
    name: 'Ford Transit (18 Pasajeros)',
    brand: 'Ford',
    category: 'Camioneta / Van',
    capacity: 18,
    dailyRateWithoutDriver: 4800,
    dailyRateWithDriver: 6000,
    transmission: 'Manual 6 vel',
    hasAC: true,
    fuelType: 'Diésel EcoBlue',
    luggageCapacity: 'Maletero posterior reforzado',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/fordtransitde18pasajeros.png',
    available: true,
    features: ['18 asientos individuales', 'Doble rodado y máxima estabilidad', 'Disponible con y sin chofer', 'Aire acondicionado integral']
  },
  {
    id: 'rc-sprinter20',
    name: 'Mercedes-Benz Sprinter (20 Pasajeros)',
    brand: 'Mercedes-Benz',
    category: 'Sprinter Ejecutiva',
    capacity: 20,
    dailyRateWithoutDriver: 5800,
    dailyRateWithDriver: 7200,
    transmission: 'Automática 9G-TRONIC',
    hasAC: true,
    fuelType: 'Diésel',
    luggageCapacity: 'Cajuela posterior de gran volumen',
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
    available: true,
    features: ['20 asientos de piel reclinables', 'Sonido premium y pantallas', 'Disponible con y sin chofer', 'Suspensión neumática ejecutiva']
  }
];

export function generateSprinterSeats(totalSeats: number = 20): Seat[] {
  // Sprinter 20 seats layout
  const seats: Seat[] = [];
  let num = 1;
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 4; c++) {
      if (r === 1 && c === 1) {
        // Driver position
        seats.push({ id: `s-drv`, number: 0, row: r, col: c, type: 'driver', status: 'sold' });
        continue;
      }
      if (r === 1 && c === 2) {
        // Door / Entry
        seats.push({ id: `s-door`, number: 0, row: r, col: c, type: 'door', status: 'available' });
        continue;
      }
      if (r < 6 && c === 3) {
        // Walkway aisle
        seats.push({ id: `s-aisle-${r}`, number: 0, row: r, col: c, type: 'walkway', status: 'available' });
        continue;
      }
      
      // Standard seat
      if (num <= totalSeats) {
        seats.push({
          id: `seat-${num}`,
          number: num,
          row: r,
          col: c,
          type: 'standard',
          status: 'available',
        });
        num++;
      }
    }
  }
  return seats;
}

export function generateHiaceSeats(): Seat[] {
  return generateHiace14Seats();
}

export function generateHiace14Seats(): Seat[] {
  // Hiace 14 seats layout
  const seats: Seat[] = [];
  let num = 1;
  for (let r = 1; r <= 5; r++) {
    for (let c = 1; c <= 4; c++) {
      if (r === 1 && c === 1) {
        seats.push({ id: `s-drv`, number: 0, row: r, col: c, type: 'driver', status: 'sold' });
        continue;
      }
      if (r === 1 && c === 2) {
        seats.push({ id: `s-door`, number: 0, row: r, col: c, type: 'door', status: 'available' });
        continue;
      }
      if (r < 5 && c === 3) {
        seats.push({ id: `s-aisle-${r}`, number: 0, row: r, col: c, type: 'walkway', status: 'available' });
        continue;
      }
      if (num <= 14) {
        seats.push({
          id: `seat-${num}`,
          number: num,
          row: r,
          col: c,
          type: 'standard',
          status: 'available',
        });
        num++;
      }
    }
  }
  return seats;
}

export function generateHiace11Seats(): Seat[] {
  // Hiace 11 VIP seats layout
  const seats: Seat[] = [];
  let num = 1;
  for (let r = 1; r <= 4; r++) {
    for (let c = 1; c <= 4; c++) {
      if (r === 1 && c === 1) {
        seats.push({ id: `s-drv`, number: 0, row: r, col: c, type: 'driver', status: 'sold' });
        continue;
      }
      if (r === 1 && c === 2) {
        seats.push({ id: `s-door`, number: 0, row: r, col: c, type: 'door', status: 'available' });
        continue;
      }
      if (r < 4 && c === 3) {
        seats.push({ id: `s-aisle-${r}`, number: 0, row: r, col: c, type: 'walkway', status: 'available' });
        continue;
      }
      if (num <= 11) {
        seats.push({
          id: `seat-${num}`,
          number: num,
          row: r,
          col: c,
          type: 'standard',
          status: 'available',
        });
        num++;
      }
    }
  }
  return seats;
}

export function generateTransitSeats(): Seat[] {
  // Ford Transit 18 seats layout
  const seats: Seat[] = [];
  let num = 1;
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 4; c++) {
      if (r === 1 && c === 1) {
        seats.push({ id: `s-drv`, number: 0, row: r, col: c, type: 'driver', status: 'sold' });
        continue;
      }
      if (r === 1 && c === 2) {
        seats.push({ id: `s-door`, number: 0, row: r, col: c, type: 'door', status: 'available' });
        continue;
      }
      if (r < 6 && c === 3) {
        seats.push({ id: `s-aisle-${r}`, number: 0, row: r, col: c, type: 'walkway', status: 'available' });
        continue;
      }
      if (num <= 18) {
        seats.push({
          id: `seat-${num}`,
          number: num,
          row: r,
          col: c,
          type: 'standard',
          status: 'available',
        });
        num++;
      }
    }
  }
  return seats;
}

const todayStr = new Date().toISOString().substring(0, 10);

export const INITIAL_TRIPS: TripSchedule[] = [
  {
    id: 'trip-101',
    routeTitle: 'Manzanillo ⇄ Guadalajara (Troncal & CAS)',
    origin: 'Manzanillo',
    destination: 'CAS / Consulado GDL',
    date: todayStr,
    departureTime: '06:30 AM',
    estimatedArrival: '11:30 AM',
    vehicleId: 'veh-sp20-01',
    driverId: 'drv-01',
    status: 'scheduled',
    currentScale: 'Colima (San Fernando)',
    seats: generateSprinterSeats(20),
    stops: ROUTE_STOPS,
    basePrice: 450,
    occupiedSeatsCount: 0,
    totalRevenue: 0,
  },
  {
    id: 'trip-102',
    routeTitle: 'Colima ⇄ Guadalajara (La Minerva)',
    origin: 'Colima',
    destination: 'Guadalajara (Minerva)',
    date: todayStr,
    departureTime: '09:00 AM',
    estimatedArrival: '11:30 AM',
    vehicleId: 'veh-hi14-01',
    driverId: 'drv-02',
    status: 'scheduled',
    currentScale: 'Oficina Gutiérrez Colima',
    seats: generateHiace14Seats(),
    stops: ROUTE_STOPS.filter(s => s.city !== 'Manzanillo' && s.city !== 'Tecomán'),
    basePrice: 279,
    occupiedSeatsCount: 0,
    totalRevenue: 0,
  },
  {
    id: 'trip-103',
    routeTitle: 'Manzanillo ⇄ Zoológico Guadalajara',
    origin: 'Manzanillo',
    destination: 'Zoológico Guadalajara',
    date: todayStr,
    departureTime: '07:00 AM',
    estimatedArrival: '12:30 PM',
    vehicleId: 'veh-hi14-02',
    driverId: 'drv-03',
    status: 'scheduled',
    seats: generateHiace14Seats(),
    stops: ROUTE_STOPS,
    basePrice: 500,
    occupiedSeatsCount: 0,
    totalRevenue: 0,
  },
  {
    id: 'trip-104',
    routeTitle: 'Guadalajara ⇄ Manzanillo (Troncal Retorno)',
    origin: 'Guadalajara (Minerva)',
    destination: 'Manzanillo',
    date: todayStr,
    departureTime: '04:00 PM',
    estimatedArrival: '08:30 PM',
    vehicleId: 'veh-sp20-01',
    driverId: 'drv-01',
    status: 'scheduled',
    seats: generateSprinterSeats(20),
    stops: [...ROUTE_STOPS].reverse(),
    basePrice: 370,
    occupiedSeatsCount: 0,
    totalRevenue: 0,
  }
];

export const INITIAL_BOOKINGS: Booking[] = [];
export const INITIAL_EXPENSES: TripExpense[] = [];
export const INITIAL_RENTAL_QUOTES: RentalQuote[] = [];
export const INITIAL_INVOICES: InvoiceCFDI[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_EXCEPTIONS: ExceptionRequest[] = [];
export const INITIAL_CHARTER_ASSIGNMENTS: CharterAssignment[] = [];

