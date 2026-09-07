import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  TripSchedule, 
  Vehicle, 
  Driver, 
  Booking, 
  TripExpense, 
  RentalQuote, 
  InvoiceCFDI, 
  AuditLog, 
  ExceptionRequest,
  Seat,
  RouteStop,
  RentalCar
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_BOOKINGS,
  INITIAL_EXPENSES,
  INITIAL_RENTAL_QUOTES,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_EXCEPTIONS,
  ROUTE_STOPS,
  OFFICIAL_PRICING,
  OFFICIAL_RENTAL_CARS
} from '../data/mockData';
import {
  checkSupabaseConnection,
  fetchTripsFromSupabase,
  fetchBookingsFromSupabase,
  saveBookingToSupabase,
  updateBookingCheckInInSupabase,
  saveRentalQuoteToSupabase
} from '../lib/supabase';
import { SupabaseSqlModal } from '../components/modals/SupabaseSqlModal';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (val: boolean) => void;
  
  // Data
  trips: TripSchedule[];
  vehicles: Vehicle[];
  drivers: Driver[];
  rentalCars: RentalCar[];
  bookings: Booking[];
  expenses: TripExpense[];
  quotes: RentalQuote[];
  invoices: InvoiceCFDI[];
  auditLogs: AuditLog[];
  exceptions: ExceptionRequest[];
  
  // Active selection / temp state
  selectedTripId: string | null;
  setSelectedTripId: (id: string | null) => void;
  tempLockedSeats: { tripId: string; seatNumbers: number[]; expiresAt: number } | null;
  
  // Actions
  lockSeatsTemporarily: (tripId: string, seatNumbers: number[]) => boolean;
  releaseTemporarySeatLock: () => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'qrCodeData' | 'checkInStatus'>) => Booking;
  cancelBooking: (bookingId: string, reason: string) => boolean;
  
  // Driver Actions
  validateTicketQR: (qrData: string) => { status: 'valid' | 'already_used' | 'invalid'; booking?: Booking };
  checkInPassenger: (bookingId: string, locationName: string) => boolean;
  updateTripStatus: (tripId: string, status: TripSchedule['status'], currentScale?: string) => void;
  addExpense: (expense: Omit<TripExpense, 'id' | 'status'>) => TripExpense;
  approveExpense: (expenseId: string) => void;
  
  // Operations & Maintenance
  toggleVehicleMaintenance: (vehicleId: string, reason?: string) => void;
  assignDriverToVehicle: (driverId: string, vehicleId: string) => boolean;
  
  // Secretary & CRM
  createRentalQuote: (quoteData: Omit<RentalQuote, 'id' | 'createdAt' | 'status' | 'balanceRemaining'>) => RentalQuote;
  convertQuoteToReservation: (quoteId: string, vehicleId: string, driverId: string) => boolean;
  updateQuoteStatus: (quoteId: string, status: RentalQuote['status']) => void;
  
  // Invoicing & Exceptions
  requestInvoice: (invoiceData: Omit<InvoiceCFDI, 'id' | 'status'>) => InvoiceCFDI;
  approveException: (exceptionId: string) => void;
  
  // Active Passenger Quick View (for instant ticket lookup)
  activeTicket: Booking | null;
  setActiveTicket: (booking: Booking | null) => void;
  
  // Notifications
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Supabase Cloud Sync
  supabaseConnected: boolean;
  supabaseMessage: string;
  showSupabaseModal: boolean;
  setShowSupabaseModal: (show: boolean) => void;
  syncWithSupabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('home');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);
  
  const [trips, setTrips] = useState<TripSchedule[]>(INITIAL_TRIPS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [rentalCars, setRentalCars] = useState<RentalCar[]>(OFFICIAL_RENTAL_CARS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [expenses, setExpenses] = useState<TripExpense[]>(INITIAL_EXPENSES);
  const [quotes, setQuotes] = useState<RentalQuote[]>(INITIAL_RENTAL_QUOTES);
  const [invoices, setInvoices] = useState<InvoiceCFDI[]>(INITIAL_INVOICES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [exceptions, setExceptions] = useState<ExceptionRequest[]>(INITIAL_EXCEPTIONS);
  
  const [selectedTripId, setSelectedTripId] = useState<string | null>('trip-101');
  const [tempLockedSeats, setTempLockedSeats] = useState<{ tripId: string; seatNumbers: number[]; expiresAt: number } | null>(null);
  const [activeTicket, setActiveTicket] = useState<Booking | null>(INITIAL_BOOKINGS[0]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Supabase State
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseMessage, setSupabaseMessage] = useState<string>('Comprobando Supabase...');
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  // Sync with Supabase
  const syncWithSupabase = async () => {
    try {
      const res = await checkSupabaseConnection();
      setSupabaseConnected(res.connected);
      if (res.error) {
        setSupabaseMessage(res.error);
      } else if (res.connected) {
        setSupabaseMessage('Conectado a Supabase PostgreSQL');
        const [cloudTrips, cloudBookings] = await Promise.all([
          fetchTripsFromSupabase(),
          fetchBookingsFromSupabase()
        ]);
        if (cloudTrips && cloudTrips.length > 0) {
          setTrips(cloudTrips);
        }
        if (cloudBookings && cloudBookings.length > 0) {
          setBookings(cloudBookings);
        }
      }
    } catch {
      setSupabaseConnected(false);
      setSupabaseMessage('Modo local (Supabase no alcanzable)');
    }
  };

  useEffect(() => {
    syncWithSupabase();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  const addAuditEntry = (action: string, entity: string, entityId: string, previousValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: currentRole === 'pasajero' ? 'Cliente Web / PWA' : `Usuario (${currentRole.toUpperCase()})`,
      userRole: currentRole,
      action,
      entity,
      entityId,
      previousValue,
      newValue,
      ipAddress: '187.190.22.84'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Check seat lock expiration
  useEffect(() => {
    if (!tempLockedSeats) return;
    const interval = setInterval(() => {
      if (Date.now() > tempLockedSeats.expiresAt) {
        releaseTemporarySeatLock();
        showNotification('El tiempo de bloqueo de asiento (10 min) ha expirado.', 'info');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tempLockedSeats]);

  const lockSeatsTemporarily = (tripId: string, seatNumbers: number[]) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return false;

    // Check if any seat is already sold or locked by another
    const isConflict = trip.seats.some(s => 
      seatNumbers.includes(s.number) && 
      (s.status === 'sold' || (s.status === 'locked' && s.lockedUntil && s.lockedUntil > Date.now()))
    );

    if (isConflict) {
      showNotification('Uno o más asientos ya fueron reservados por otro usuario.', 'error');
      return false;
    }

    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes lock

    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        seats: t.seats.map(s => {
          if (seatNumbers.includes(s.number)) {
            return {
              ...s,
              status: 'locked',
              lockedUntil: expiresAt
            };
          }
          return s;
        })
      };
    }));

    setTempLockedSeats({ tripId, seatNumbers, expiresAt });
    addAuditEntry('BLOQUEO_TEMPORAL_ASIENTOS', 'Seat', `Viaje ${tripId}`, 'Disponible', `Asientos [${seatNumbers.join(', ')}] (10 min)`);
    return true;
  };

  const releaseTemporarySeatLock = () => {
    if (!tempLockedSeats) return;
    setTrips(prev => prev.map(t => {
      if (t.id !== tempLockedSeats.tripId) return t;
      return {
        ...t,
        seats: t.seats.map(s => {
          if (tempLockedSeats.seatNumbers.includes(s.number) && s.status === 'locked') {
            return {
              ...s,
              status: 'available',
              lockedUntil: undefined
            };
          }
          return s;
        })
      };
    }));
    setTempLockedSeats(null);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'qrCodeData' | 'checkInStatus'>): Booking => {
    const bookingId = `TG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      qrCodeData: `${bookingId}-${bookingData.origin.substring(0, 3)}-${bookingData.destination.substring(0, 3)}-SEAT${bookingData.seatNumbers.join('')}-${Date.now()}`,
      checkInStatus: 'pending'
    };

    // Mark seats as permanently SOLD in trip
    setTrips(prev => prev.map(t => {
      if (t.id !== bookingData.tripId) return t;
      return {
        ...t,
        occupiedSeatsCount: t.occupiedSeatsCount + bookingData.seatNumbers.length,
        totalRevenue: t.totalRevenue + bookingData.totalAmount,
        seats: t.seats.map(s => {
          if (bookingData.seatNumbers.includes(s.number)) {
            return {
              ...s,
              status: 'sold',
              passengerName: bookingData.passengerName,
              ticketId: bookingId,
              lockedUntil: undefined
            };
          }
          return s;
        })
      };
    }));

    setBookings(prev => [newBooking, ...prev]);
    setActiveTicket(newBooking);
    setTempLockedSeats(null);

    // Asynchronously synchronize with Supabase
    saveBookingToSupabase(newBooking).catch(err => {
      console.warn('Supabase sync notice:', err);
    });

    addAuditEntry(
      'EMISION_BOLETO_DEFINITIVO',
      'Booking',
      bookingId,
      'Bloqueado',
      `Vendido a ${bookingData.passengerName} ($${bookingData.totalAmount} MXN)`
    );

    showNotification(`¡Boleto ${bookingId} emitido exitosamente!`, 'success');
    return newBooking;
  };

  const cancelBooking = (bookingId: string, reason: string): boolean => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return false;

    // Release seats
    setTrips(prev => prev.map(t => {
      if (t.id !== booking.tripId) return t;
      return {
        ...t,
        occupiedSeatsCount: Math.max(0, t.occupiedSeatsCount - booking.seatNumbers.length),
        seats: t.seats.map(s => {
          if (booking.seatNumbers.includes(s.number)) {
            return {
              ...s,
              status: 'available',
              passengerName: undefined,
              ticketId: undefined
            };
          }
          return s;
        })
      };
    }));

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentStatus: 'refunded', checkInStatus: 'no_show' } : b));
    
    // Add exception request/log
    const newExc: ExceptionRequest = {
      id: `exc-${Date.now()}`,
      bookingId,
      requestedBy: currentRole,
      type: 'cancellation',
      amount: booking.totalAmount,
      reason,
      status: 'approved',
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setExceptions(prev => [newExc, ...prev]);
    addAuditEntry('CANCELACION_BOLETO', 'Booking', bookingId, 'Vendido', `Cancelado por: ${reason}`);
    showNotification(`Boleto ${bookingId} cancelado y liberado en inventario.`, 'info');
    return true;
  };

  const validateTicketQR = (qrData: string): { status: 'valid' | 'already_used' | 'invalid'; booking?: Booking } => {
    const booking = bookings.find(b => b.qrCodeData === qrData || b.id === qrData || qrData.includes(b.id));
    if (!booking) {
      return { status: 'invalid' };
    }
    if (booking.checkInStatus === 'checked_in') {
      return { status: 'already_used', booking };
    }
    return { status: 'valid', booking };
  };

  const checkInPassenger = (bookingId: string, locationName: string): boolean => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return false;

    const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    setBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      checkInStatus: 'checked_in',
      checkInTime: time,
      checkInLocation: locationName
    } : b));

    addAuditEntry('CHECK_IN_PASAJERO_QR', 'Booking', bookingId, 'Pendiente', `Abordó en: ${locationName} a las ${time}`);
    showNotification(`Abordaje confirmado: ${booking.passengerName}`, 'success');
    
    // Sync check-in to Supabase
    updateBookingCheckInInSupabase(bookingId, locationName).catch(err => {
      console.warn('Supabase checkin sync notice:', err);
    });

    return true;
  };

  const updateTripStatus = (tripId: string, status: TripSchedule['status'], currentScale?: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        status,
        currentScale: currentScale || t.currentScale
      };
    }));

    addAuditEntry('CAMBIO_ESTATUS_VIAJE', 'TripSchedule', tripId, 'En proceso', `Nuevo estatus: ${status} (${currentScale || 'Ruta'})`);
    showNotification(`Viaje actualizado a: ${status.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const addExpense = (expenseData: Omit<TripExpense, 'id' | 'status'>): TripExpense => {
    const newExpense: TripExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      status: 'pending_audit'
    };
    setExpenses(prev => [newExpense, ...prev]);
    addAuditEntry('REGISTRO_GASTO_OPERATIVO', 'TripExpense', newExpense.id, undefined, `$${expenseData.amount} MXN en ${expenseData.type}`);
    showNotification(`Gasto de $${expenseData.amount} registrado para auditoría.`, 'success');
    return newExpense;
  };

  const approveExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'approved' } : e));
    addAuditEntry('AUDITORIA_GASTO_APROBADO', 'TripExpense', expenseId, 'pending_audit', 'approved');
    showNotification('Gasto aprobado y conciliado.', 'success');
  };

  const toggleVehicleMaintenance = (vehicleId: string, reason?: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const newStatus = vehicle.status === 'maintenance' ? 'active' : 'maintenance';
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));

    addAuditEntry(
      newStatus === 'maintenance' ? 'BLOQUEO_TALLER' : 'DESBLOQUEO_TALLER',
      'Vehicle',
      vehicle.unitNumber,
      vehicle.status,
      newStatus + (reason ? ` (${reason})` : '')
    );

    showNotification(
      newStatus === 'maintenance' 
        ? `${vehicle.unitNumber} puesta FUERA DE SERVICIO en taller.`
        : `${vehicle.unitNumber} reactivada para servicio.`,
      newStatus === 'maintenance' ? 'error' : 'success'
    );
  };

  const assignDriverToVehicle = (driverId: string, vehicleId: string): boolean => {
    // Check if vehicle in maintenance
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle?.status === 'maintenance') {
      showNotification('No se puede asignar: El vehículo está en mantenimiento.', 'error');
      return false;
    }

    // Check if driver is already in service
    const driver = drivers.find(d => d.id === driverId);
    if (driver?.status === 'in_service' && driver.currentVehicleId !== vehicleId) {
      showNotification('Conflicto: El chofer ya tiene un servicio activo asignado.', 'error');
      return false;
    }

    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, driverId } : v));
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, currentVehicleId: vehicleId, status: 'in_service' } : d));

    addAuditEntry('DESPACHO_ASIGNACION', 'Fleet', vehicleId, 'Sin asignar', `Chofer: ${driver?.name}`);
    showNotification(`Unidad ${vehicle?.unitNumber} asignada a ${driver?.name}`, 'success');
    return true;
  };

  const createRentalQuote = (quoteData: Omit<RentalQuote, 'id' | 'createdAt' | 'status' | 'balanceRemaining'>): RentalQuote => {
    const quoteId = `COT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const balanceRemaining = quoteData.totalPrice - quoteData.advancePaid;
    
    const newQuote: RentalQuote = {
      ...quoteData,
      id: quoteId,
      status: quoteData.advancePaid > 0 ? 'reserved' : 'draft',
      balanceRemaining,
      createdAt: new Date().toISOString().substring(0, 10)
    };

    setQuotes(prev => [newQuote, ...prev]);
    
    // Sync rental quote to Supabase
    saveRentalQuoteToSupabase(newQuote).catch(err => {
      console.warn('Supabase quote sync notice:', err);
    });

    addAuditEntry('NUEVA_COTIZACION_RENTA', 'RentalQuote', quoteId, undefined, `$${quoteData.totalPrice} a ${quoteData.destination}`);
    showNotification(`Cotización ${quoteId} generada exitosamente.`, 'success');
    return newQuote;
  };

  const convertQuoteToReservation = (quoteId: string, vehicleId: string, driverId: string): boolean => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle?.status === 'maintenance') {
      showNotification('La unidad seleccionada se encuentra en mantenimiento.', 'error');
      return false;
    }

    // Block vehicle in fleet calendar
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'reserved_rent', driverId } : v));
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'in_service', currentVehicleId: vehicleId } : d));
    
    setQuotes(prev => prev.map(q => {
      if (q.id !== quoteId) return q;
      return {
        ...q,
        status: 'reserved',
        assignedVehicleId: vehicleId,
        assignedDriverId: driverId,
        advancePaid: q.advancePaymentRequired,
        balanceRemaining: q.totalPrice - q.advancePaymentRequired
      };
    }));

    addAuditEntry('CONVERSION_COTIZACION_A_RESERVA', 'RentalQuote', quoteId, 'Cotización', `Bloqueada unidad ${vehicle?.unitNumber}`);
    showNotification(`¡Cotización ${quoteId} convertida a RESERVA EN FIRME! Recursos bloqueados.`, 'success');
    return true;
  };

  const updateQuoteStatus = (quoteId: string, status: RentalQuote['status']) => {
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q));
    addAuditEntry('CAMBIO_PIPELINE_CRM', 'RentalQuote', quoteId, undefined, `Nuevo estatus: ${status}`);
    showNotification(`Estatus actualizado a: ${status}`, 'info');
  };

  const requestInvoice = (invoiceData: Omit<InvoiceCFDI, 'id' | 'status'>): InvoiceCFDI => {
    const newInvoice: InvoiceCFDI = {
      ...invoiceData,
      id: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'generated',
      uuid: `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4D6C-98BC-2109884F19A2`,
      issuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setInvoices(prev => [newInvoice, ...prev]);
    addAuditEntry('EMISION_FACTURA_CFDI', 'InvoiceCFDI', newInvoice.id, 'Pendiente', `Timbrada para ${newInvoice.rfc}`);
    showNotification(`Factura CFDI 4.0 timbrada con éxito (${newInvoice.id})`, 'success');
    return newInvoice;
  };

  const approveException = (exceptionId: string) => {
    setExceptions(prev => prev.map(e => e.id === exceptionId ? { ...e, status: 'approved', approvedBy: 'Dirección General' } : e));
    addAuditEntry('APROBACION_EXCEPCION_DIRECCION', 'ExceptionRequest', exceptionId, 'pending', 'approved');
    showNotification('Excepción autorizada por Dirección.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        isMobileDeviceFrame,
        setIsMobileDeviceFrame,
        trips,
        vehicles,
        drivers,
        rentalCars,
        bookings,
        expenses,
        quotes,
        invoices,
        auditLogs,
        exceptions,
        selectedTripId,
        setSelectedTripId,
        tempLockedSeats,
        lockSeatsTemporarily,
        releaseTemporarySeatLock,
        createBooking,
        cancelBooking,
        validateTicketQR,
        checkInPassenger,
        updateTripStatus,
        addExpense,
        approveExpense,
        toggleVehicleMaintenance,
        assignDriverToVehicle,
        createRentalQuote,
        convertQuoteToReservation,
        updateQuoteStatus,
        requestInvoice,
        approveException,
        activeTicket,
        setActiveTicket,
        notification,
        showNotification,
        supabaseConnected,
        supabaseMessage,
        showSupabaseModal,
        setShowSupabaseModal,
        syncWithSupabase
      }}
    >
      {children}
      {showSupabaseModal && (
        <SupabaseSqlModal onClose={() => setShowSupabaseModal(false)} />
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
