export type UserRole = 
  | 'home'
  | 'pasajero'
  | 'conductor'
  | 'secretaria'
  | 'operaciones'
  | 'finanzas'
  | 'director';

export interface RouteStop {
  id: string;
  name: string;
  city: string; // Manzanillo, Tecomán, Colima, Guzmán, Guadalajara, Cas/Consulado, Zoológico u otros
  landmark: string;
  address: string;
  mapsUrl?: string; // Enlace Google Maps (ej. https://maps.app.goo.gl/J5REeQ24NnDFKF84A)
  order: number;
  timeOffsetMins: number;
  isActive: boolean; // Control para activar/desactivar punto de partida
  isSpecialPoint?: boolean; // CAS, Zoológico
  notes?: string;
}

export interface RoutePricing {
  origin: string;
  destination: string;
  singlePrice: number;
  roundTripPrice?: number;
  timeEstimate: string;
  notes: string;
  packageType?: 'estandar' | 'consulado' | 'zoologico' | 'intermedio';
}

export interface Seat {
  id: string;
  number: number;
  row: number;
  col: number;
  type: 'standard' | 'driver' | 'door' | 'walkway';
  status: 'available' | 'locked' | 'sold';
  lockedBy?: string;
  lockedUntil?: number; // timestamp
  passengerName?: string;
  ticketId?: string;
}

export interface Vehicle {
  id: string;
  unitNumber: string;
  model: string; // 'Mercedes-Benz Sprinter' | 'Toyota Hiace'
  plate: string;
  capacity: number; // 19 or 14
  status: 'active' | 'in_route' | 'maintenance' | 'reserved_rent';
  odometer: number;
  nextServiceKm: number;
  lastServiceDate: string;
  driverId?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'available' | 'in_service' | 'off_duty' | 'resting';
  rating: number;
  avatar: string;
  currentVehicleId?: string;
}

export interface TripSchedule {
  id: string;
  routeTitle: string; // e.g., 'Manzanillo ⇄ Guadalajara (Troncal)'
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  estimatedArrival: string;
  vehicleId: string;
  driverId: string;
  status: 'scheduled' | 'boarding' | 'in_transit' | 'at_scale' | 'completed' | 'cancelled';
  currentScale?: string;
  seats: Seat[];
  stops: RouteStop[];
  basePrice: number;
  occupiedSeatsCount: number;
  totalRevenue: number;
}

export interface BookingPassenger {
  name: string;
  phone: string;
  email?: string;
  emergencyContact?: string;
  boardingStopId: string;
  droppingStopId: string;
  seatNumber: number;
  hasBaggage?: boolean;
  hasPet?: boolean;
  notes?: string;
}

export interface Booking {
  id: string;
  tripId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  origin: string;
  destination: string;
  boardingPoint: string;
  dropoffPoint: string;
  date: string;
  departureTime: string;
  seatNumbers: number[];
  unitNumber: string;
  totalAmount: number;
  paymentMethod: 'card' | 'cash_counter' | 'spei' | 'oxxo';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  source: 'web' | 'counter' | 'whatsapp' | 'phone';
  tripType?: 'sencillo' | 'redondo';
  returnDate?: string;
  packageType?: 'estandar' | 'consulado' | 'zoologico' | 'intermedio';
  qrCodeData: string;
  createdAt: string;
  checkInStatus: 'pending' | 'checked_in' | 'no_show';
  checkInTime?: string;
  checkInLocation?: string;
  addons: {
    parcel?: boolean;
    parcelDescription?: string;
    parcelFee?: number;
    pet?: boolean;
    petFee?: number;
  };
}

export interface TripExpense {
  id: string;
  tripId: string;
  vehicleId: string;
  driverId: string;
  type: 'fuel' | 'toll' | 'viatics' | 'parking' | 'maintenance_emergency' | 'driver_pay';
  amount: number;
  date: string;
  location: string;
  liters?: number;
  ticketFolio?: string;
  receiptImage?: string;
  notes: string;
  status: 'pending_audit' | 'approved' | 'rejected';
}

export interface RentalCar {
  id: string;
  name: string;
  brand: string;
  category: 'Sedán' | 'Familiar' | 'SUV' | 'Camioneta / Van' | 'Sprinter Ejecutiva';
  capacity: number; // Pasajeros
  dailyRateWithoutDriver: number; // Tarifa por día sin chofer
  dailyRateWithDriver: number; // Tarifa por día con chofer
  transmission: string;
  hasAC: boolean;
  fuelType: string;
  luggageCapacity: string;
  image: string;
  available: boolean;
  features: string[];
}

export interface RentalQuote {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  paxCount: number;
  vehicleModel: string; // e.g., 'Mercedes Sprinter (20 Pax)', 'Jetta VW', 'Vento VW', etc.
  includesDriver: boolean;
  subtotal: number;
  estimatedFuel: number;
  estimatedTolls: number;
  driverFee: number;
  totalPrice: number;
  advancePaymentRequired: number; // 30% or custom
  advancePaid: number;
  balanceRemaining: number;
  status: 'draft' | 'sent' | 'followup_24h' | 'followup_48h' | 'followup_7d' | 'reserved' | 'completed' | 'cancelled';
  notes: string;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  createdAt: string;
}

export interface InvoiceCFDI {
  id: string;
  bookingId?: string;
  rentalId?: string;
  clientName: string;
  rfc: string;
  taxRegime: string;
  cfdiUsage: string;
  postalCode: string;
  email: string;
  subtotal: number;
  iva: number;
  total: number;
  status: 'requested' | 'generated' | 'cancelled';
  uuid?: string;
  issuedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
}

export interface ExceptionRequest {
  id: string;
  bookingId: string;
  requestedBy: string;
  type: 'cancellation' | 'courtesy' | 'discount' | 'refund';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
}
