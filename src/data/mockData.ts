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
  Seat
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
  // Manzanillo Stops
  { id: 'mzn-soriana', name: 'Soriana Híper Manzanillo', city: 'Manzanillo', landmark: 'Soriana Híper Manzanillo', address: 'Blvd. Miguel de la Madrid s/n', order: 1, timeOffsetMins: 0 },
  { id: 'mzn-autozone', name: 'AutoZone Manzanillo', city: 'Manzanillo', landmark: 'AutoZone Manzanillo', address: 'Blvd. Miguel de la Madrid #1120', order: 2, timeOffsetMins: 15 },
  
  // Tecomán Stops
  { id: 'tec-kiosko', name: 'Kiosko Tecomán Centro', city: 'Tecomán', landmark: 'Jardín Principal / Farmacia Guadalajara', address: 'Av. López Mateos #45', order: 3, timeOffsetMins: 60 },
  
  // Colima Stops
  { id: 'col-sanfernando', name: 'Oficina Central Colima', city: 'Colima', landmark: 'Av. San Fernando frente a Plaza Sevilla', address: 'Av. San Fernando #410', order: 4, timeOffsetMins: 120 },
  { id: 'col-escala', name: 'Escala Técnica Colima (10-15 min)', city: 'Colima', landmark: 'Punto de escala, estiramiento y sanitarios', address: 'Autopista Colima-Guadalajara Km 5', order: 5, timeOffsetMins: 135 },

  // Cd. Guzmán
  { id: 'cdguzman-parada', name: 'Cd. Guzmán (Acceso Autopista)', city: 'Colima', landmark: 'Glorieta Colón / Entrada Cd. Guzmán', address: 'Av. Cristóbal Colón', order: 6, timeOffsetMins: 190 },

  // Guadalajara Stops
  { id: 'gdl-minerva', name: 'Minerva (Burger)', city: 'Guadalajara', landmark: 'Afuera del estacionamiento del Burger', address: 'Av. Vallarta y Av. López Mateos', order: 7, timeOffsetMins: 270 },
  { id: 'gdl-plazasol', name: 'Plaza del Sol (Súper Colchones)', city: 'Guadalajara', landmark: 'Afuera de Súper Colchones', address: 'Av. Mariano Otero #1499', order: 8, timeOffsetMins: 285 },
  { id: 'gdl-fuentes', name: 'Starbucks Las Fuentes', city: 'Guadalajara', landmark: 'Starbucks Las Fuentes', address: 'Av. López Mateos Sur #5560', order: 9, timeOffsetMins: 300 },
  { id: 'gdl-enramada', name: 'Restaurante Enramada', city: 'Guadalajara', landmark: 'Restaurante Enramada', address: 'Av. López Mateos Sur acceso', order: 10, timeOffsetMins: 315 },
  { id: 'gdl-cuatas', name: 'Gasolinera Cuatas', city: 'Guadalajara', landmark: 'Gasolinera Cuatas', address: 'Carretera a Morelia Km 20', order: 11, timeOffsetMins: 330 },

  // Puntos Especiales
  { id: 'gdl-cas', name: 'CAS / Consulado Americano', city: 'Guadalajara', landmark: 'Centro de Atención a Solicitantes (CAS)', address: 'Av. Unión #210, Col. Obrera, Guadalajara', order: 12, timeOffsetMins: 345, isSpecialPoint: true },
  { id: 'gdl-zoo', name: 'Zoológico Guadalajara', city: 'Guadalajara', landmark: 'Taquilla Principal Huentitán', address: 'Paseo del Zoológico #600, Guadalajara', order: 13, timeOffsetMins: 360, isSpecialPoint: true },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'veh-01', unitNumber: 'Unidad 04', model: 'Mercedes-Benz Sprinter', plate: 'JTZ-4491', capacity: 19, status: 'in_route', odometer: 128450, nextServiceKm: 130000, lastServiceDate: '2026-08-10', driverId: 'drv-01' },
  { id: 'veh-02', unitNumber: 'Unidad 07', model: 'Mercedes-Benz Sprinter', plate: 'JTK-8820', capacity: 19, status: 'active', odometer: 95200, nextServiceKm: 100000, lastServiceDate: '2026-08-18', driverId: 'drv-02' },
  { id: 'veh-03', unitNumber: 'Unidad 02', model: 'Toyota Hiace Executive', plate: 'FML-3112', capacity: 14, status: 'active', odometer: 64100, nextServiceKm: 65000, lastServiceDate: '2026-08-25', driverId: 'drv-03' },
  { id: 'veh-04', unitNumber: 'Unidad 09', model: 'Toyota Hiace Executive', plate: 'FML-9944', capacity: 14, status: 'reserved_rent', odometer: 78900, nextServiceKm: 80000, lastServiceDate: '2026-08-01', driverId: 'drv-04' },
  { id: 'veh-05', unitNumber: 'Unidad 12', model: 'Mercedes-Benz Sprinter', plate: 'JTZ-9014', capacity: 19, status: 'maintenance', odometer: 149800, nextServiceKm: 150000, lastServiceDate: '2026-07-20' },
];

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'drv-01', name: 'Carlos Mendoza Ramos', phone: '314-102-9932', licenseNumber: 'FED-8849201-A', licenseExpiry: '2027-11-30', status: 'in_service', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', currentVehicleId: 'veh-01' },
  { id: 'drv-02', name: 'Roberto Silva Lozano', phone: '312-554-1288', licenseNumber: 'FED-9023411-B', licenseExpiry: '2028-03-15', status: 'available', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', currentVehicleId: 'veh-02' },
  { id: 'drv-03', name: 'Jorge Ramírez Cárdenas', phone: '312-990-4412', licenseNumber: 'FED-7738290-C', licenseExpiry: '2027-09-10', status: 'available', rating: 4.95, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', currentVehicleId: 'veh-03' },
  { id: 'drv-04', name: 'Luis Morales Barajas', phone: '333-810-7756', licenseNumber: 'FED-6649102-A', licenseExpiry: '2028-06-20', status: 'resting', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', currentVehicleId: 'veh-04' },
];

export function generateSprinterSeats(): Seat[] {
  // Sprinter 19 seats layout
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
      if (num <= 19) {
        // Sample pre-booked seats
        const isPreSold = num === 3 || num === 4 || num === 7 || num === 8 || num === 14;
        seats.push({
          id: `seat-${num}`,
          number: num,
          row: r,
          col: c,
          type: 'standard',
          status: isPreSold ? 'sold' : 'available',
          passengerName: isPreSold ? (num === 3 ? 'María Elena Torres' : num === 4 ? 'Raúl Gómez' : 'Pasajero Reservado') : undefined,
        });
        num++;
      }
    }
  }
  return seats;
}

export function generateHiaceSeats(): Seat[] {
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
        const isPreSold = num === 2 || num === 5;
        seats.push({
          id: `seat-${num}`,
          number: num,
          row: r,
          col: c,
          type: 'standard',
          status: isPreSold ? 'sold' : 'available',
        });
        num++;
      }
    }
  }
  return seats;
}

export const INITIAL_TRIPS: TripSchedule[] = [
  {
    id: 'trip-101',
    routeTitle: 'Manzanillo ⇄ Guadalajara (Troncal & CAS)',
    origin: 'Manzanillo',
    destination: 'CAS / Consulado GDL',
    date: '2026-09-02',
    departureTime: '06:30 AM',
    estimatedArrival: '11:30 AM',
    vehicleId: 'veh-01',
    driverId: 'drv-01',
    status: 'in_transit',
    currentScale: 'Colima (San Fernando)',
    seats: generateSprinterSeats(),
    stops: ROUTE_STOPS,
    basePrice: 450,
    occupiedSeatsCount: 14,
    totalRevenue: 5420,
  },
  {
    id: 'trip-102',
    routeTitle: 'Colima ⇄ Guadalajara (La Minerva)',
    origin: 'Colima',
    destination: 'Guadalajara (Minerva)',
    date: '2026-09-02',
    departureTime: '09:00 AM',
    estimatedArrival: '11:30 AM',
    vehicleId: 'veh-02',
    driverId: 'drv-02',
    status: 'boarding',
    currentScale: 'Oficina Gutiérrez Colima',
    seats: generateSprinterSeats(),
    stops: ROUTE_STOPS.filter(s => s.city !== 'Manzanillo' && s.city !== 'Tecomán'),
    basePrice: 270,
    occupiedSeatsCount: 9,
    totalRevenue: 2430,
  },
  {
    id: 'trip-103',
    routeTitle: 'Manzanillo ⇄ Zoológico Guadalajara',
    origin: 'Manzanillo',
    destination: 'Zoológico Guadalajara',
    date: '2026-09-02',
    departureTime: '07:00 AM',
    estimatedArrival: '12:30 PM',
    vehicleId: 'veh-03',
    driverId: 'drv-03',
    status: 'scheduled',
    seats: generateHiaceSeats(),
    stops: ROUTE_STOPS,
    basePrice: 500,
    occupiedSeatsCount: 6,
    totalRevenue: 3000,
  },
  {
    id: 'trip-104',
    routeTitle: 'Guadalajara ⇄ Manzanillo (Troncal Retorno)',
    origin: 'Guadalajara (Minerva)',
    destination: 'Manzanillo',
    date: '2026-09-02',
    departureTime: '04:00 PM',
    estimatedArrival: '08:30 PM',
    vehicleId: 'veh-01',
    driverId: 'drv-01',
    status: 'scheduled',
    seats: generateSprinterSeats(),
    stops: [...ROUTE_STOPS].reverse(),
    basePrice: 370,
    occupiedSeatsCount: 11,
    totalRevenue: 4070,
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'TG-9824',
    tripId: 'trip-101',
    passengerName: 'María Elena Torres Valdés',
    passengerPhone: '314-889-1022',
    passengerEmail: 'elena.torres@gmail.com',
    origin: 'Manzanillo',
    destination: 'CAS / Consulado Americano',
    boardingPoint: 'Soriana Híper Manzanillo',
    dropoffPoint: 'CAS / Consulado Americano',
    date: '2026-09-02',
    departureTime: '06:30 AM',
    seatNumbers: [3],
    unitNumber: 'Unidad 04 (Sprinter)',
    totalAmount: 450,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    source: 'web',
    tripType: 'sencillo',
    packageType: 'consulado',
    qrCodeData: 'TG-9824-MZN-CAS-SEAT3-20260902',
    createdAt: '2026-09-01 14:20',
    checkInStatus: 'checked_in',
    checkInTime: '06:22 AM',
    checkInLocation: 'Soriana Híper Manzanillo',
    addons: { pet: false, parcel: false }
  },
  {
    id: 'TG-9825',
    tripId: 'trip-101',
    passengerName: 'Raúl Gómez Vizcaíno',
    passengerPhone: '312-301-4455',
    passengerEmail: 'rgomez_viz@hotmail.com',
    origin: 'Colima',
    destination: 'CAS / Consulado Americano',
    boardingPoint: 'Oficina Central Colima (Av. San Fernando)',
    dropoffPoint: 'CAS / Consulado Americano',
    date: '2026-09-02',
    departureTime: '08:30 AM',
    seatNumbers: [4],
    unitNumber: 'Unidad 04 (Sprinter)',
    totalAmount: 340,
    paymentMethod: 'spei',
    paymentStatus: 'paid',
    source: 'whatsapp',
    tripType: 'sencillo',
    packageType: 'consulado',
    qrCodeData: 'TG-9825-COL-CAS-SEAT4-20260902',
    createdAt: '2026-09-01 16:45',
    checkInStatus: 'pending',
    addons: { parcel: true, parcelDescription: 'Sobre con Documentos Notariales', parcelFee: 150 }
  },
  {
    id: 'TG-9826',
    tripId: 'trip-102',
    passengerName: 'Sofía Navarro Cruz',
    passengerPhone: '312-998-0114',
    passengerEmail: 'sofia.navarro@outlook.com',
    origin: 'Colima',
    destination: 'Guadalajara (GDL)',
    boardingPoint: 'Escala Técnica Colima (10-15 min)',
    dropoffPoint: 'Minerva (Burger)',
    date: '2026-09-02',
    departureTime: '09:00 AM',
    seatNumbers: [7, 8],
    unitNumber: 'Unidad 07 (Sprinter)',
    totalAmount: 520,
    paymentMethod: 'cash_counter',
    paymentStatus: 'paid',
    source: 'counter',
    tripType: 'redondo',
    returnDate: '2026-09-04',
    packageType: 'estandar',
    qrCodeData: 'TG-9826-COL-GDL-SEAT78-20260902',
    createdAt: '2026-09-01 17:10',
    checkInStatus: 'pending',
    addons: { pet: false }
  }
];

export const INITIAL_EXPENSES: TripExpense[] = [
  {
    id: 'exp-01',
    tripId: 'trip-101',
    vehicleId: 'veh-01',
    driverId: 'drv-01',
    type: 'fuel',
    amount: 1450,
    date: '2026-09-02 06:10',
    location: 'Gasolinera PEMEX Manzanillo Salagua',
    liters: 62.5,
    ticketFolio: 'F-88912',
    receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80',
    notes: 'Tanque lleno diésel inicio de jornada',
    status: 'approved'
  },
  {
    id: 'exp-02',
    tripId: 'trip-101',
    vehicleId: 'veh-01',
    driverId: 'drv-01',
    type: 'toll',
    amount: 380,
    date: '2026-09-02 07:45',
    location: 'Caseta Cuyutlán & Acatlán de Juárez',
    ticketFolio: 'TAG-449102',
    notes: 'Cruce autopista Manzanillo - Colima',
    status: 'approved'
  },
  {
    id: 'exp-03',
    tripId: 'trip-101',
    vehicleId: 'veh-01',
    driverId: 'drv-01',
    type: 'viatics',
    amount: 250,
    date: '2026-09-02 08:30',
    location: 'Colima Parador Los Arcos',
    notes: 'Alimentos y café para operador en escala',
    status: 'pending_audit'
  }
];

export const INITIAL_RENTAL_QUOTES: RentalQuote[] = [
  {
    id: 'COT-2026-081',
    clientName: 'Lic. Fernando Ochoa (Colegio Terranova)',
    clientPhone: '312-314-9900',
    clientEmail: 'eventos@colegioterranova.edu.mx',
    origin: 'Colima',
    destination: 'Puerto Vallarta, Jalisco',
    departureDate: '2026-09-12 06:00',
    returnDate: '2026-09-14 18:00',
    paxCount: 18,
    vehicleModel: 'Mercedes Sprinter (19 Pax)',
    includesDriver: true,
    subtotal: 16500,
    estimatedFuel: 3800,
    estimatedTolls: 1450,
    driverFee: 2400,
    totalPrice: 24150,
    advancePaymentRequired: 7245,
    advancePaid: 7245,
    balanceRemaining: 16905,
    status: 'reserved',
    assignedVehicleId: 'veh-04',
    assignedDriverId: 'drv-04',
    notes: 'Viaje académico. Unidad bloqueada en calendario.',
    createdAt: '2026-08-28'
  },
  {
    id: 'COT-2026-082',
    clientName: 'Familia Barreto Michel',
    clientPhone: '314-112-8877',
    clientEmail: 'barreto.familia@gmail.com',
    origin: 'Manzanillo',
    destination: 'Mazamitla Pueblo Mágico',
    departureDate: '2026-09-18 07:00',
    returnDate: '2026-09-20 16:00',
    paxCount: 12,
    vehicleModel: 'Toyota Hiace (14 Pax)',
    includesDriver: true,
    subtotal: 12000,
    estimatedFuel: 2600,
    estimatedTolls: 980,
    driverFee: 1800,
    totalPrice: 17380,
    advancePaymentRequired: 5214,
    advancePaid: 0,
    balanceRemaining: 17380,
    status: 'followup_24h',
    notes: 'Cotización enviada por WhatsApp. Alerta de seguimiento activa.',
    createdAt: '2026-09-01'
  },
  {
    id: 'COT-2026-083',
    clientName: 'Ing. Alejandro Solórzano (Agencia Aduanal)',
    clientPhone: '314-333-2190',
    clientEmail: 'asolorzano@aduanasolorzano.com',
    origin: 'Manzanillo',
    destination: 'Expo Guadalajara (Cita de Negocios)',
    departureDate: '2026-09-08 05:00',
    returnDate: '2026-09-08 22:00',
    paxCount: 8,
    vehicleModel: 'Toyota Hiace (14 Pax)',
    includesDriver: true,
    subtotal: 8500,
    estimatedFuel: 1900,
    estimatedTolls: 850,
    driverFee: 1200,
    totalPrice: 12450,
    advancePaymentRequired: 3735,
    advancePaid: 0,
    balanceRemaining: 12450,
    status: 'followup_48h',
    notes: 'Viaje redondo mismo día. Requiere factura CFDI 4.0.',
    createdAt: '2026-08-30'
  }
];

export const INITIAL_INVOICES: InvoiceCFDI[] = [
  {
    id: 'FAC-4091',
    bookingId: 'TG-9824',
    clientName: 'MARIA ELENA TORRES VALDES',
    rfc: 'TOVM8403158X1',
    taxRegime: '612 - Personas Físicas con Actividades Empresariales',
    cfdiUsage: 'G03 - Gastos en general',
    postalCode: '28200',
    email: 'elena.torres@gmail.com',
    subtotal: 387.93,
    iva: 62.07,
    total: 450.00,
    status: 'generated',
    uuid: '4E72B198-10AA-4D6C-98BC-2109884F19A2',
    issuedAt: '2026-09-01 14:30'
  },
  {
    id: 'FAC-4092',
    rentalId: 'COT-2026-081',
    clientName: 'INSTITUTO EDUCATIVO TERRANOVA SC',
    rfc: 'IET990812KM4',
    taxRegime: '601 - General de Ley Personas Morales',
    cfdiUsage: 'G03 - Gastos en general',
    postalCode: '28017',
    email: 'facturacion@colegioterranova.edu.mx',
    subtotal: 6245.69,
    iva: 999.31,
    total: 7245.00,
    status: 'generated',
    uuid: '8A11CD34-55B1-4A8E-BF09-9023414A0812',
    issuedAt: '2026-08-28 11:15'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-101',
    timestamp: '2026-09-01 17:15:00',
    userName: 'Laura Montes (Secretaría)',
    userRole: 'secretaria',
    action: 'EMISION_BOLETO_VENTANILLA',
    entity: 'Booking',
    entityId: 'TG-9826',
    previousValue: 'Asiento Libre (7, 8)',
    newValue: 'Asiento Vendido ($540 MXN)',
    ipAddress: '187.190.22.10 (Mostrador Colima)'
  },
  {
    id: 'aud-102',
    timestamp: '2026-09-01 16:30:22',
    userName: 'Ing. Gabriel Gutiérrez (Dirección)',
    userRole: 'director',
    action: 'AUTORIZACION_CORTESIA',
    entity: 'Booking',
    entityId: 'TG-9799',
    previousValue: 'Tarifa Regular $370',
    newValue: 'Cortesía 100% (Apoyo Familiar)',
    ipAddress: '189.201.88.94 (Oficina Ejecutiva)'
  },
  {
    id: 'aud-103',
    timestamp: '2026-09-01 15:40:11',
    userName: 'Ing. Ramón Velázquez (Taller)',
    userRole: 'operaciones',
    action: 'BLOQUEO_UNIDAD_MANTENIMIENTO',
    entity: 'Vehicle',
    entityId: 'veh-05 (Unidad 12)',
    previousValue: 'Estatus: Activo',
    newValue: 'Estatus: En Taller (Cambio de Frenos y Balatas)',
    ipAddress: '187.190.22.11 (Taller Mecánico)'
  },
  {
    id: 'aud-104',
    timestamp: '2026-09-01 14:22:05',
    userName: 'Sistema Web (Autoservicio)',
    userRole: 'pasajero',
    action: 'BLOQUEO_TEMPORAL_ASIENTO',
    entity: 'Seat',
    entityId: 'Trip 101 - Seat 3',
    previousValue: 'Disponible',
    newValue: 'Bloqueado Temporal (10 min Pessimistic Lock)',
    ipAddress: '201.144.90.14'
  }
];

export const INITIAL_EXCEPTIONS: ExceptionRequest[] = [
  {
    id: 'exc-01',
    bookingId: 'TG-9780',
    requestedBy: 'Laura Montes (Secretaría)',
    type: 'refund',
    amount: 370,
    reason: 'Pasajero con justificante médico IMSS. Solicita reembolso del 80%.',
    status: 'pending',
    createdAt: '2026-09-01 15:10'
  },
  {
    id: 'exc-02',
    bookingId: 'TG-9788',
    requestedBy: 'Laura Montes (Secretaría)',
    type: 'courtesy',
    amount: 450,
    reason: 'Convenio con Fundación Trasplante CAS GDL para traslado de paciente.',
    status: 'approved',
    approvedBy: 'Dirección General',
    createdAt: '2026-08-31 10:20'
  }
];
