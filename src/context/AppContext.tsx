import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  RentalCar, 
  CharterAssignment,
  DriverAlarm
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
  INITIAL_CHARTER_ASSIGNMENTS,
  ROUTE_STOPS,
  OFFICIAL_PRICING,
  OFFICIAL_RENTAL_CARS
} from '../data/mockData';
import {
  checkSupabaseConnection,
  fetchTripsFromSupabase,
  fetchBookingsFromSupabase,
  fetchRouteStopsFromSupabase,
  upsertRouteStopToSupabase,
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
  charterAssignments: CharterAssignment[];
  
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
  
  // Operations & Maintenance & Agenda de Servicios
  toggleVehicleMaintenance: (vehicleId: string, reason?: string) => void;
  assignDriverToVehicle: (driverId: string, vehicleId: string, forceOverride?: boolean) => boolean;
  releaseDriverFromService: (driverId: string, reason?: string) => boolean;
  assignDriverToCharter: (data: Omit<CharterAssignment, 'id' | 'folio' | 'createdAt' | 'status'>) => CharterAssignment;
  releaseVehicleFromTourContract: (vehicleId: string) => boolean;
  completeCharterAssignment: (charterId: string) => boolean;
  clearAllTestData: () => void;
  
  // Secretary & CRM
  createRentalQuote: (quoteData: Omit<RentalQuote, 'id' | 'createdAt' | 'status' | 'balanceRemaining'>) => RentalQuote;
  convertQuoteToReservation: (quoteId: string, vehicleId: string, driverId: string) => boolean;
  updateQuoteStatus: (quoteId: string, status: RentalQuote['status']) => void;
  
  // Invoicing & Exceptions
  requestInvoice: (invoiceData: Omit<InvoiceCFDI, 'id' | 'status'>) => InvoiceCFDI;
  approveException: (exceptionId: string) => void;
  
  // Route Stops & Departure Points (Admin configurable)
  routeStops: RouteStop[];
  addRouteStop: (stopData: Omit<RouteStop, 'id'>) => RouteStop;
  updateRouteStop: (id: string, updated: Partial<RouteStop>) => boolean;
  toggleRouteStopStatus: (id: string) => boolean;
  deleteRouteStop: (id: string) => boolean;
  resetRouteStopsToDefault: () => void;

  // Fleet Image Management (Admin configurable)
  updateVehicleImage: (vehicleId: string, newImageUrl: string) => void;
  updateRentalCarImage: (carId: string, newImageUrl: string) => void;

  // Active Passenger Quick View (for instant ticket lookup)
  activeTicket: Booking | null;
  setActiveTicket: (booking: Booking | null) => void;
  
  // Notifications & Driver Alarms (Despertador / Recordatorio 2h)
  driverAlarms: DriverAlarm[];
  activeAlarm: DriverAlarm | null;
  sendManualWakeUpAlarm: (driverId: string, tripId?: string, note?: string) => boolean;
  acknowledgeAlarm: (alarmId: string) => void;
  dismissActiveAlarmModal: () => void;
  soundPermissionGranted: boolean;
  requestSoundAndNotificationPermission: () => Promise<boolean>;
  playAlarmSoundTest: () => void;
  stopAlarmSound: () => void;

  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Supabase Cloud Sync
  supabaseConnected: boolean;
  supabaseMessage: string;
  showSupabaseModal: boolean;
  setShowSupabaseModal: (show: boolean) => void;
  syncWithSupabase: () => Promise<void>;
}

export const ALARM_AUDIO_URL = 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/sonidos/u_k9wiszrfee-notify-169186%20(1).mp3';

export function parseDepartureTimeToDate(dateStr: string, timeStr: string): Date | null {
  try {
    if (!dateStr || !timeStr) return null;
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');
    const numPart = cleanTime.replace('AM', '').replace('PM', '').trim();
    const timeComponents = numPart.split(':');
    let hours = parseInt(timeComponents[0], 10);
    const minutes = timeComponents.length > 1 ? parseInt(timeComponents[1], 10) : 0;

    if (isNaN(hours)) return null;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes, 0, 0);
  } catch (e) {
    return null;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('home');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);
  
  const [trips, setTrips] = useState<TripSchedule[]>(INITIAL_TRIPS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      // Clear legacy test cache
      localStorage.removeItem('gutierrez_vehicles_v2');
      const saved = localStorage.getItem('gutierrez_vehicles_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error loading cached vehicles', e);
    }
    return INITIAL_VEHICLES;
  });
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem('gutierrez_drivers_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error loading cached drivers', e);
    }
    return INITIAL_DRIVERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('gutierrez_vehicles_v3', JSON.stringify(vehicles));
    } catch (e) {
      console.error('Error persisting vehicles', e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('gutierrez_drivers_v3', JSON.stringify(drivers));
    } catch (e) {
      console.error('Error persisting drivers', e);
    }
  }, [drivers]);

  const [rentalCars, setRentalCars] = useState<RentalCar[]>(() => {
    try {
      const saved = localStorage.getItem('gutierrez_rental_cars_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error loading cached rental cars', e);
    }
    return OFFICIAL_RENTAL_CARS;
  });
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [expenses, setExpenses] = useState<TripExpense[]>(INITIAL_EXPENSES);
  const [quotes, setQuotes] = useState<RentalQuote[]>(INITIAL_RENTAL_QUOTES);
  const [invoices, setInvoices] = useState<InvoiceCFDI[]>(INITIAL_INVOICES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [exceptions, setExceptions] = useState<ExceptionRequest[]>(INITIAL_EXCEPTIONS);
  const [charterAssignments, setCharterAssignments] = useState<CharterAssignment[]>(() => {
    try {
      // Clear legacy test cache
      localStorage.removeItem('gutierrez_charter_assignments_v1');
      const saved = localStorage.getItem('gutierrez_charter_assignments_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error loading cached charter assignments', e);
    }
    return INITIAL_CHARTER_ASSIGNMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('gutierrez_charter_assignments_v2', JSON.stringify(charterAssignments));
    } catch (e) {
      console.error('Error persisting charter assignments', e);
    }
  }, [charterAssignments]);
  
  // Route Stops & Departure Points (Admin manual configuration)
  const [routeStops, setRouteStops] = useState<RouteStop[]>(() => {
    try {
      const saved = localStorage.getItem('gutierrez_route_stops_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved route stops', e);
    }
    return ROUTE_STOPS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('gutierrez_route_stops_v1', JSON.stringify(routeStops));
    } catch (e) {
      console.error('Error persisting route stops', e);
    }
  }, [routeStops]);

  const [selectedTripId, setSelectedTripId] = useState<string | null>('trip-101');
  const [tempLockedSeats, setTempLockedSeats] = useState<{ tripId: string; seatNumbers: number[]; expiresAt: number } | null>(null);
  const [activeTicket, setActiveTicket] = useState<Booking | null>(INITIAL_BOOKINGS[0]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Driver Alarms & Despertador State
  const [driverAlarms, setDriverAlarms] = useState<DriverAlarm[]>(() => {
    try {
      const saved = localStorage.getItem('gutierrez_driver_alarms_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading driver alarms', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('gutierrez_driver_alarms_v1', JSON.stringify(driverAlarms));
    } catch (e) {}
  }, [driverAlarms]);

  const [activeAlarm, setActiveAlarm] = useState<DriverAlarm | null>(null);
  const [soundPermissionGranted, setSoundPermissionGranted] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const audio = new Audio(ALARM_AUDIO_URL);
      audio.loop = true;
      audio.volume = 1.0;
      audio.preload = 'auto';
      alarmAudioRef.current = audio;
    } catch (e) {
      console.warn('Audio initialization warning', e);
    }

    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current = null;
      }
    };
  }, []);

  const startAlarmSound = () => {
    try {
      if (!alarmAudioRef.current) {
        const audio = new Audio(ALARM_AUDIO_URL);
        audio.loop = true;
        audio.volume = 1.0;
        alarmAudioRef.current = audio;
      }
      const audio = alarmAudioRef.current;
      audio.currentTime = 0;
      audio.loop = true;
      audio.volume = 1.0;
      audio.play().catch(e => {
        console.warn('Autoplay prevented by browser, manual touch required:', e);
      });
    } catch (e) {
      console.error('Error starting alarm audio:', e);
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([1000, 500, 1000, 500, 1000]);
      } catch (e) {}
    }
  };

  const stopAlarmSound = () => {
    try {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
    } catch (e) {}

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  };

  const playAlarmSoundTest = () => {
    startAlarmSound();
    showNotification('🔔 Probando sonido de alarma oficial. Sonará durante 5 segundos...', 'info');
    setTimeout(() => {
      if (!activeAlarm) {
        stopAlarmSound();
      }
    }, 5000);
  };

  const requestSoundAndNotificationPermission = async (): Promise<boolean> => {
    try {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.volume = 1.0;
        alarmAudioRef.current.currentTime = 0;
        const p = alarmAudioRef.current.play();
        if (p !== undefined) {
          p.then(() => {
            setTimeout(() => {
              if (!activeAlarm) {
                alarmAudioRef.current?.pause();
                alarmAudioRef.current!.currentTime = 0;
              }
            }, 600);
          }).catch(err => {
            console.warn('Audio pre-unlock warning:', err);
          });
        }
      }

      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setSoundPermissionGranted(granted);
        if (granted) {
          showNotification('¡Notificaciones y sonido de alarma habilitados en este dispositivo!', 'success');
          return true;
        } else {
          showNotification('Permiso del navegador denegado. La alerta flotante en pantalla seguirá activa.', 'info');
        }
      } else {
        setSoundPermissionGranted(true);
      }
    } catch (e) {
      console.error('Error requesting permissions:', e);
    }
    return false;
  };

  const acknowledgeAlarm = (alarmId: string) => {
    stopAlarmSound();
    setDriverAlarms(prev => prev.map(a => a.id === alarmId ? {
      ...a,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString()
    } : a));
    if (activeAlarm?.id === alarmId) {
      setActiveAlarm(null);
    }
    showNotification('¡Alarma apagada con éxito! Has confirmado asistencia y conocimiento de tu viaje.', 'success');
    addAuditEntry('ALARMA_DESPERTADOR_APAGADA', 'DriverAlarm', alarmId, undefined, 'Chofer apagó la alarma y confirmó asistencia.');
  };

  const dismissActiveAlarmModal = () => {
    if (activeAlarm) {
      acknowledgeAlarm(activeAlarm.id);
    } else {
      stopAlarmSound();
    }
  };

  const sendManualWakeUpAlarm = (driverId: string, tripId?: string, note?: string): boolean => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      showNotification('No se encontró el operador seleccionado.', 'error');
      return false;
    }

    const trip = trips.find(t => t.id === tripId) || trips.find(t => t.driverId === driverId);
    const veh = vehicles.find(v => v.id === (trip?.vehicleId || driver.currentVehicleId));

    const newAlarm: DriverAlarm = {
      id: `alarm-manual-${driverId}-${Date.now()}`,
      driverId,
      tripId: trip?.id,
      type: 'admin_manual_wake',
      title: '🚨 DESPERTADOR URGENTE DE ADMINISTRACIÓN',
      message: note || `La Administración ha activado esta alarma sonora en tu celular. ¡Despierta y confirma inmediatamente tu salida del viaje a ${trip?.destination || 'Ruta'}!`,
      routeDetails: trip?.routeTitle,
      unitNumber: veh?.unitNumber,
      departureTime: trip?.departureTime,
      createdAt: new Date().toISOString(),
      status: 'active',
      triggeredBy: 'Administración / Despacho Central'
    };

    setDriverAlarms(prev => [newAlarm, ...prev]);
    setActiveAlarm(newAlarm);
    startAlarmSound();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newAlarm.title, {
          body: newAlarm.message,
          icon: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
          requireInteraction: true
        });
      } catch (e) {}
    }

    addAuditEntry(
      'ALARMA_DESPERTADOR_DISPARADA',
      'Driver',
      driverId,
      undefined,
      `Alarma despertador manual enviada a ${driver.name} por Administración.`
    );

    showNotification(`¡Alarma despertador enviada con sonido a ${driver.name}!`, 'success');
    return true;
  };

  // Temporizador preventivo: Alarma automática 2 horas antes de la salida del viaje
  useEffect(() => {
    const checkUpcomingTrips = () => {
      const now = new Date();

      trips.forEach(trip => {
        if (!trip.driverId || (trip.status !== 'scheduled' && trip.status !== 'boarding')) {
          return;
        }

        const departureDate = parseDepartureTimeToDate(trip.date, trip.departureTime);
        if (!departureDate) return;

        const diffMinutes = (departureDate.getTime() - now.getTime()) / (1000 * 60);

        // Si faltan 2 horas o menos (entre 0 y 120 minutos)
        if (diffMinutes <= 120 && diffMinutes >= -15) {
          setDriverAlarms(prev => {
            const alreadyExists = prev.some(
              a => a.driverId === trip.driverId && a.tripId === trip.id && a.type === 'two_hour_reminder'
            );
            if (alreadyExists) return prev;

            const veh = vehicles.find(v => v.id === trip.vehicleId);
            const newAlarm: DriverAlarm = {
              id: `alarm-2h-${trip.id}-${trip.driverId}-${Date.now()}`,
              driverId: trip.driverId,
              tripId: trip.id,
              type: 'two_hour_reminder',
              title: '⏰ RECORDATORIO: TU VIAJE SALE EN MENOS DE 2 HORAS',
              message: `Atención: Tu viaje de las ${trip.departureTime} en la ${veh?.unitNumber || 'unidad asignada'} está próximo a salir. Ruta: ${trip.routeTitle}. Confirma que estás despierto.`,
              routeDetails: trip.routeTitle,
              unitNumber: veh?.unitNumber,
              departureTime: trip.departureTime,
              createdAt: new Date().toISOString(),
              status: 'active',
              triggeredBy: 'Sistema Automático (2h antes)'
            };

            setActiveAlarm(newAlarm);
            startAlarmSound();

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(newAlarm.title, {
                  body: newAlarm.message,
                  icon: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
                  requireInteraction: true
                });
              } catch (e) {}
            }

            return [newAlarm, ...prev];
          });
        }
      });
    };

    checkUpcomingTrips();
    const timer = setInterval(checkUpcomingTrips, 25000);
    return () => clearInterval(timer);
  }, [trips, vehicles]);

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
        const [cloudTrips, cloudBookings, cloudStops] = await Promise.all([
          fetchTripsFromSupabase(),
          fetchBookingsFromSupabase(),
          fetchRouteStopsFromSupabase()
        ]);
        if (cloudTrips && cloudTrips.length > 0) {
          setTrips(cloudTrips);
        }
        if (cloudBookings && cloudBookings.length > 0) {
          setBookings(cloudBookings);
        }
        if (cloudStops && cloudStops.length > 0) {
          setRouteStops(cloudStops);
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

  const assignDriverToVehicle = (driverId: string, vehicleId: string, forceOverride: boolean = true): boolean => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      showNotification('No se encontró la unidad vehicular seleccionada.', 'error');
      return false;
    }

    if (vehicle.status === 'maintenance') {
      showNotification('No se puede asignar: La unidad está fuera de servicio en taller mecánico.', 'error');
      return false;
    }

    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      showNotification('No se encontró el operador seleccionado.', 'error');
      return false;
    }

    if (!forceOverride && (driver.status === 'in_service' || driver.status === 'charter_service') && driver.currentVehicleId !== vehicleId) {
      showNotification('Conflicto: El chofer ya tiene un servicio activo asignado.', 'error');
      return false;
    }

    const previousDriverOnVehicleId = vehicle.driverId;
    const previousVehicleOfDriverId = driver.currentVehicleId;

    // 1. Si la unidad objetivo ya tenía otro chofer asignado, liberar a ese chofer anterior
    if (previousDriverOnVehicleId && previousDriverOnVehicleId !== driverId) {
      setDrivers(prev => prev.map(d => d.id === previousDriverOnVehicleId ? {
        ...d,
        currentVehicleId: undefined,
        status: 'available',
        currentServiceType: 'none',
        charterDetails: undefined
      } : d));
    }

    // 2. Si el chofer ya estaba asignado a otra unidad anterior, liberar esa unidad previa
    if (previousVehicleOfDriverId && previousVehicleOfDriverId !== vehicleId) {
      setVehicles(prev => prev.map(v => v.id === previousVehicleOfDriverId ? {
        ...v,
        driverId: undefined
      } : v));
    }

    // 3. Asignar el chofer a la unidad objetivo
    setVehicles(prev => prev.map(v => v.id === vehicleId ? {
      ...v,
      driverId,
      status: v.status === 'tour_contract' ? 'active' : v.status,
      tourContractDetails: undefined
    } : v));

    // 4. Actualizar estado del chofer con su nueva unidad
    setDrivers(prev => prev.map(d => d.id === driverId ? { 
      ...d, 
      currentVehicleId: vehicleId, 
      status: 'in_service',
      currentServiceType: 'route',
      charterDetails: undefined
    } : d));

    // 5. SINCRONIZACIÓN ATÓMICA DE ITINERARIOS (TRIPS):
    // Todas las salidas/corridas programadas para esta unidad se asignan inmediatamente al chofer
    setTrips(prev => prev.map(t => {
      if (t.vehicleId === vehicleId) {
        return { ...t, driverId };
      }
      // Si el itinerario tenía este chofer pero en su unidad anterior, desvincular chofer de esa corrida
      if (t.driverId === driverId && previousVehicleOfDriverId && t.vehicleId === previousVehicleOfDriverId) {
        return { ...t, driverId: undefined };
      }
      return t;
    }));

    // 6. Notificación y Alarma de Despacho Inmediata al Chofer
    const assignAlarm: DriverAlarm = {
      id: `alarm-assign-${driverId}-${Date.now()}`,
      driverId,
      type: 'new_trip_assigned',
      title: '🚐 NUEVA UNIDAD Y VIAJE ASIGNADO',
      message: `El Administrador te ha asignado la unidad ${vehicle.unitNumber} (${vehicle.model}, Placas ${vehicle.plate}). Revisa tus horarios de salida programados en tu panel.`,
      unitNumber: vehicle.unitNumber,
      createdAt: new Date().toISOString(),
      status: 'active',
      triggeredBy: 'Administración / Despacho Central'
    };

    setDriverAlarms(prev => [assignAlarm, ...prev]);
    setActiveAlarm(assignAlarm);
    startAlarmSound();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(assignAlarm.title, {
          body: assignAlarm.message,
          icon: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
          requireInteraction: true
        });
      } catch (e) {}
    }

    addAuditEntry(
      'DESPACHO_ASIGNACION',
      'Fleet',
      vehicleId,
      previousDriverOnVehicleId || 'Sin asignar',
      `Operador: ${driver.name} asignado a ${vehicle.unitNumber}`
    );
    showNotification(`¡Asignación exitosa! ${driver.name} quedó asignado a la ${vehicle.unitNumber} y fue notificado.`, 'success');
    return true;
  };

  const releaseDriverFromService = (driverId: string, reason?: string): boolean => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return false;

    const previousVehicleId = driver.currentVehicleId;

    // Liberar la unidad vehicular si estaba asignada
    if (previousVehicleId) {
      setVehicles(prev => prev.map(v => v.id === previousVehicleId ? { 
        ...v, 
        driverId: undefined,
        status: v.status === 'tour_contract' ? 'active' : v.status,
        tourContractDetails: undefined
      } : v));

      // Desvincular de los viajes programados de esa unidad
      setTrips(prev => prev.map(t => {
        if (t.vehicleId === previousVehicleId && t.driverId === driverId) {
          return { ...t, driverId: undefined };
        }
        return t;
      }));
    }

    setDrivers(prev => prev.map(d => d.id === driverId ? {
      ...d,
      status: 'available',
      currentVehicleId: undefined,
      currentServiceType: 'none',
      charterDetails: undefined
    } : d));

    addAuditEntry('LIBERACION_CHOFER', 'Driver', driverId, driver.status, `Liberado: ${driver.name}. Motivo: ${reason || 'Fin de servicio / Cambio de agenda'}`);
    showNotification(`Operador ${driver.name} liberado exitosamente. Ahora está DISPONIBLE en base.`, 'success');
    return true;
  };

  const assignDriverToCharter = (data: Omit<CharterAssignment, 'id' | 'folio' | 'createdAt' | 'status'>): CharterAssignment => {
    const charterId = `charter-${Date.now()}`;
    const folio = `TUR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newAssignment: CharterAssignment = {
      ...data,
      id: charterId,
      folio,
      status: 'active',
      createdAt: new Date().toISOString().substring(0, 10)
    };

    // 1. Bloquear camioneta para viaje turístico particular (No disponible para rutas regulares)
    setVehicles(prev => prev.map(v => v.id === data.vehicleId ? {
      ...v,
      status: 'tour_contract',
      driverId: data.driverId,
      tourContractDetails: {
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes
      }
    } : v));

    // 2. Asignar chofer al viaje turístico particular
    setDrivers(prev => prev.map(d => d.id === data.driverId ? {
      ...d,
      status: 'charter_service',
      currentVehicleId: data.vehicleId,
      currentServiceType: 'charter',
      charterDetails: {
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes
      }
    } : d));

    // 3. Registrar en la agenda de asignaciones
    setCharterAssignments(prev => [newAssignment, ...prev]);

    // 4. Notificación y Alarma de Despacho Inmediata al Chofer
    const charterAlarm: DriverAlarm = {
      id: `alarm-charter-${data.driverId}-${Date.now()}`,
      driverId: data.driverId,
      type: 'new_trip_assigned',
      title: '🌴 NUEVO SERVICIO TURÍSTICO ASIGNADO',
      message: `El Administrador te ha asignado al viaje especial hacia ${data.destination} para ${data.clientName}. Fechas: ${data.startDate} al ${data.endDate}. Unidad: ${data.unitNumber}.`,
      unitNumber: data.unitNumber,
      routeDetails: `Viaje Especial a ${data.destination}`,
      createdAt: new Date().toISOString(),
      status: 'active',
      triggeredBy: 'Administración / Despacho'
    };

    setDriverAlarms(prev => [charterAlarm, ...prev]);
    setActiveAlarm(charterAlarm);
    startAlarmSound();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(charterAlarm.title, {
          body: charterAlarm.message,
          icon: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/sprinterde21pasajeros.png',
          requireInteraction: true
        });
      } catch (e) {}
    }

    addAuditEntry(
      'ASIGNACION_VIAJE_TURISTICO_PARTICULAR',
      'CharterAssignment',
      folio,
      undefined,
      `${data.unitNumber} con ${data.driverName} p/ ${data.clientName} a ${data.destination}`
    );

    showNotification(
      `¡Servicio Turístico Asignado! ${data.unitNumber} bloqueada y ${data.driverName} asignado al viaje particular a ${data.destination}.`,
      'success'
    );

    return newAssignment;
  };

  const releaseVehicleFromTourContract = (vehicleId: string): boolean => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return false;

    const assignedDriverId = vehicle.driverId;

    // Reactivar unidad
    setVehicles(prev => prev.map(v => v.id === vehicleId ? {
      ...v,
      status: 'active',
      driverId: undefined,
      tourContractDetails: undefined
    } : v));

    // Liberar chofer si estaba en este viaje
    if (assignedDriverId) {
      setDrivers(prev => prev.map(d => d.id === assignedDriverId ? {
        ...d,
        status: 'available',
        currentVehicleId: undefined,
        currentServiceType: 'none',
        charterDetails: undefined
      } : d));
    }

    addAuditEntry('LIBERACION_CONTRATACION_TURISTICA', 'Vehicle', vehicleId, 'tour_contract', 'active');
    showNotification(`Unidad ${vehicle.unitNumber} desbloqueada y disponible para rutas regulares.`, 'success');
    return true;
  };

  const completeCharterAssignment = (charterId: string): boolean => {
    const charter = charterAssignments.find(c => c.id === charterId);
    if (!charter) return false;

    // Mark charter as completed
    setCharterAssignments(prev => prev.map(c => c.id === charterId ? { ...c, status: 'completed' } : c));

    // Release vehicle
    releaseVehicleFromTourContract(charter.vehicleId);

    showNotification(`Servicio turístico ${charter.folio} finalizado y recursos liberados.`, 'info');
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

  // Route Stops CRUD Handlers
  const addRouteStop = (stopData: Omit<RouteStop, 'id'>): RouteStop => {
    const newStop: RouteStop = {
      ...stopData,
      id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: stopData.order || routeStops.length + 1,
      isActive: stopData.isActive !== undefined ? stopData.isActive : true
    };
    setRouteStops(prev => [...prev, newStop]);
    upsertRouteStopToSupabase(newStop).catch(() => {});
    addAuditEntry('CREACION_PUNTO_PARTIDA', 'RouteStop', newStop.id, 'n/a', `Ubicación: ${newStop.name} (${newStop.city})`);
    showNotification(`Nueva ubicación "${newStop.name}" guardada con éxito.`, 'success');
    return newStop;
  };

  const updateRouteStop = (id: string, updated: Partial<RouteStop>): boolean => {
    let found = false;
    let targetStop: RouteStop | null = null;
    setRouteStops(prev => prev.map(stop => {
      if (stop.id === id) {
        found = true;
        const merged = { ...stop, ...updated };
        targetStop = merged;
        return merged;
      }
      return stop;
    }));
    if (found && targetStop) {
      upsertRouteStopToSupabase(targetStop).catch(() => {});
      addAuditEntry('ACTUALIZACION_PUNTO_PARTIDA', 'RouteStop', id, 'modificado', JSON.stringify(updated));
      showNotification('Punto de partida actualizado correctamente.', 'success');
    }
    return found;
  };

  const toggleRouteStopStatus = (id: string): boolean => {
    let newStatus = false;
    let stopName = '';
    let targetStop: RouteStop | null = null;
    setRouteStops(prev => prev.map(stop => {
      if (stop.id === id) {
        newStatus = !stop.isActive;
        stopName = stop.name;
        const merged = { ...stop, isActive: newStatus };
        targetStop = merged;
        return merged;
      }
      return stop;
    }));
    if (targetStop) {
      upsertRouteStopToSupabase(targetStop).catch(() => {});
    }
    addAuditEntry('ESTADO_PUNTO_PARTIDA', 'RouteStop', id, newStatus ? 'activo' : 'inactivo', `Punto ${stopName}`);
    showNotification(
      newStatus ? `"${stopName}" ACTIVADO como punto de partida` : `"${stopName}" DESACTIVADO de rutas activas`,
      newStatus ? 'success' : 'info'
    );
    return true;
  };

  const deleteRouteStop = (id: string): boolean => {
    const target = routeStops.find(s => s.id === id);
    setRouteStops(prev => prev.filter(stop => stop.id !== id));
    addAuditEntry('ELIMINACION_PUNTO_PARTIDA', 'RouteStop', id, 'eliminado', target ? target.name : id);
    showNotification('Ubicación eliminada del catálogo.', 'info');
    return true;
  };

  const resetRouteStopsToDefault = () => {
    setRouteStops(ROUTE_STOPS);
    try {
      localStorage.removeItem('gutierrez_route_stops_v1');
    } catch (e) {}
    showNotification('Catálogo restablecido a las ubicaciones oficiales base.', 'info');
  };

  const updateVehicleImage = (vehicleId: string, newImageUrl: string) => {
    setVehicles(prev => {
      const updated = prev.map(v => v.id === vehicleId ? { ...v, image: newImageUrl } : v);
      try {
        localStorage.setItem('gutierrez_vehicles_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving vehicles to cache', e);
      }
      return updated;
    });
    addAuditEntry('ACTUALIZACION_FOTO_FLOTILLA', 'Vehicle', vehicleId, undefined, `Nueva URL: ${newImageUrl}`);
    showNotification('Foto de la unidad actualizada exitosamente.', 'success');
  };

  const updateRentalCarImage = (carId: string, newImageUrl: string) => {
    setRentalCars(prev => {
      const updated = prev.map(c => c.id === carId ? { ...c, image: newImageUrl } : c);
      try {
        localStorage.setItem('gutierrez_rental_cars_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving rental cars to cache', e);
      }
      return updated;
    });
    addAuditEntry('ACTUALIZACION_FOTO_RENTA', 'RentalCar', carId, undefined, `Nueva URL: ${newImageUrl}`);
    showNotification('Foto del vehículo de renta actualizada en catálogo.', 'success');
  };

  const clearAllTestData = () => {
    // 1. Reset bookings, expenses, quotes, invoices, exceptions, logs, charters
    setBookings([]);
    setExpenses([]);
    setQuotes([]);
    setInvoices([]);
    setExceptions([]);
    setAuditLogs([]);
    setCharterAssignments([]);

    // 2. Clean localStorage cache
    try {
      localStorage.removeItem('gutierrez_vehicles_v2');
      localStorage.removeItem('gutierrez_vehicles_v3');
      localStorage.removeItem('gutierrez_drivers_v3');
      localStorage.removeItem('gutierrez_charter_assignments_v1');
      localStorage.removeItem('gutierrez_charter_assignments_v2');
      localStorage.removeItem('gutierrez_bookings');
      localStorage.removeItem('gutierrez_expenses');
    } catch (e) {
      console.warn('Error clearing localStorage', e);
    }

    // 3. Reset vehicles to fresh state (all active, unassigned)
    setVehicles(INITIAL_VEHICLES.map(v => ({
      ...v,
      driverId: undefined,
      status: 'active',
      tourContractDetails: undefined
    })));

    // 4. Reset drivers to available (unassigned)
    setDrivers(INITIAL_DRIVERS.map(d => ({
      ...d,
      currentVehicleId: undefined,
      status: 'available',
      currentServiceType: 'none',
      charterDetails: undefined
    })));

    // 5. Reset trips with empty seats
    setTrips(prev => prev.map(t => ({
      ...t,
      status: 'scheduled',
      occupiedSeatsCount: 0,
      totalRevenue: 0,
      seats: t.seats.map(s => ({
        ...s,
        status: 'available',
        passengerName: undefined,
        bookingId: undefined
      }))
    })));

    showNotification('Se han borrado todos los datos de prueba. El sistema está limpio para capturar datos reales.', 'success');
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
        charterAssignments,
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
        releaseDriverFromService,
        assignDriverToCharter,
        releaseVehicleFromTourContract,
        completeCharterAssignment,
        clearAllTestData,
        createRentalQuote,
        convertQuoteToReservation,
        updateQuoteStatus,
        requestInvoice,
        approveException,
        routeStops,
        addRouteStop,
        updateRouteStop,
        toggleRouteStopStatus,
        deleteRouteStop,
        resetRouteStopsToDefault,
        updateVehicleImage,
        updateRentalCarImage,
        activeTicket,
        setActiveTicket,
        driverAlarms,
        activeAlarm,
        sendManualWakeUpAlarm,
        acknowledgeAlarm,
        dismissActiveAlarmModal,
        soundPermissionGranted,
        requestSoundAndNotificationPermission,
        playAlarmSoundTest,
        stopAlarmSound,
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
