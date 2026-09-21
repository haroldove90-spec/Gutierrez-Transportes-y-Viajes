import { createClient } from '@supabase/supabase-js';
import { Booking, TripSchedule, RentalQuote, RouteStop, RoutePricing, Vehicle, Driver, RentalCar } from '../types';
import { ROUTE_STOPS } from '../data/mockData';

// Fallback configuration provided by user
const DEFAULT_SUPABASE_URL = 'https://lyjuhvqpvomryytxyztr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5anVodnFwdm9tcnl5dHh5enRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NTI3NTAsImV4cCI6MjEwNDEyODc1MH0.giEmMK4vwVVMsZYJ9NvBanasINMV_Vb6b4mC9vyEHWU';

// Clean the URL if it contains /rest/v1
const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

const rawUrl = (envUrl || DEFAULT_SUPABASE_URL).trim();
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
export const SUPABASE_ANON_KEY = (envKey || DEFAULT_SUPABASE_ANON_KEY).trim();
export const SUPABASE_PROJECT_ID = 'lyjuhvqpvomryytxyztr';

// Safe in-memory storage fallback if localStorage is denied or throws in an iframe
const createSafeStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const testKey = '__sb_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {
    // localStorage is restricted or blocked in this iframe context
  }
  const memoryStore: Record<string, string> = {};
  return {
    getItem: (key: string) => memoryStore[key] || null,
    setItem: (key: string, value: string) => { memoryStore[key] = value; },
    removeItem: (key: string) => { delete memoryStore[key]; }
  };
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: createSafeStorage()
  }
});

/**
 * Checks connectivity to the Supabase instance
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('trips').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table does not exist yet (e.g., 42P01 in postgres), it means connection is reachable but table isn't created
      if (error.message.includes('relation "trips" does not exist') || error.code === '42P01') {
        return { connected: true, error: 'TABLAS_PENDIENTES: Ejecuta el script SQL en Supabase' };
      }
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Error de red con Supabase' };
  }
}

/**
 * Fetch trips from Supabase if table exists
 */
export async function fetchTripsFromSupabase(): Promise<TripSchedule[] | null> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('date', { ascending: true });

    if (error) return null;
    if (!data) return [];

    return data.map((t: any) => ({
      id: t.id,
      routeTitle: t.route_title || `${t.origin} ➔ ${t.destination}`,
      origin: t.origin,
      destination: t.destination,
      date: t.date,
      departureTime: t.departure_time,
      estimatedArrival: t.estimated_arrival,
      driverId: t.driver_id,
      driverName: t.driver_name,
      vehicleId: t.vehicle_id,
      unitNumber: t.unit_number,
      basePrice: Number(t.base_price),
      totalSeats: Number(t.total_seats),
      occupiedSeatsCount: Number(t.occupied_seats_count || 0),
      totalRevenue: Number(t.total_revenue || 0),
      status: t.status,
      currentScale: t.current_scale,
      seats: Array.isArray(t.seats) ? t.seats : [],
      stops: Array.isArray(t.stops) ? t.stops : ROUTE_STOPS,
      layoutTemplateId: t.layout_template_id || undefined,
      endDate: t.end_date || t.date
    }));
  } catch {
    return null;
  }
}

/**
 * Save / Upsert a Trip to Supabase
 */
export async function saveTripToSupabase(trip: TripSchedule): Promise<boolean> {
  try {
    const { error } = await supabase.from('trips').upsert({
      id: trip.id,
      route_title: trip.routeTitle,
      origin: trip.origin,
      destination: trip.destination,
      date: trip.date,
      departure_time: trip.departureTime,
      estimated_arrival: trip.estimatedArrival,
      driver_id: trip.driverId || null,
      vehicle_id: trip.vehicleId || null,
      base_price: trip.basePrice,
      total_seats: trip.seats?.length || 19,
      occupied_seats_count: trip.occupiedSeatsCount || 0,
      total_revenue: trip.totalRevenue || 0,
      status: trip.status || 'scheduled',
      current_scale: trip.currentScale || null,
      seats: trip.seats || [],
      layout_template_id: trip.layoutTemplateId || null,
      end_date: trip.endDate || trip.date
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete a trip from Supabase permanently
 */
export async function deleteTripFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('trips').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persist a new Booking to Supabase
 */
export async function saveBookingToSupabase(booking: Booking): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('bookings').insert({
      id: booking.id,
      trip_id: booking.tripId,
      passenger_name: booking.passengerName,
      passenger_phone: booking.passengerPhone,
      passenger_email: booking.passengerEmail,
      origin: booking.origin,
      destination: booking.destination,
      boarding_point: booking.boardingPoint,
      dropoff_point: booking.dropoffPoint,
      date: booking.date,
      departure_time: booking.departureTime,
      seat_numbers: booking.seatNumbers,
      unit_number: booking.unitNumber,
      total_amount: booking.totalAmount,
      payment_method: booking.paymentMethod,
      payment_status: booking.paymentStatus,
      source: booking.source,
      trip_type: booking.tripType || 'sencillo',
      return_date: booking.returnDate || null,
      return_time: booking.returnTime || null,
      return_seat_numbers: booking.returnSeatNumbers || null,
      package_type: booking.packageType || 'estandar',
      qr_code_data: booking.qrCodeData,
      check_in_status: booking.checkInStatus,
      check_in_time: booking.checkInTime || null,
      check_in_location: booking.checkInLocation || null,
      addons: booking.addons || {}
    });

    if (error) {
      console.warn('Supabase booking insert notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Fetch bookings from Supabase
 */
export async function fetchBookingsFromSupabase(): Promise<Booking[] | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return null;
    if (!data) return [];

    return data.map((b: any) => ({
      id: b.id,
      tripId: b.trip_id,
      passengerName: b.passenger_name,
      passengerPhone: b.passenger_phone,
      passengerEmail: b.passenger_email,
      origin: b.origin,
      destination: b.destination,
      boardingPoint: b.boarding_point,
      dropoffPoint: b.dropoff_point,
      date: b.date,
      departureTime: b.departure_time,
      seatNumbers: Array.isArray(b.seat_numbers) ? b.seat_numbers : [b.seat_numbers],
      unitNumber: b.unit_number,
      totalAmount: Number(b.total_amount),
      paymentMethod: b.payment_method,
      paymentStatus: b.payment_status,
      source: b.source,
      tripType: b.trip_type,
      returnDate: b.return_date,
      returnTime: b.return_time,
      returnSeatNumbers: Array.isArray(b.return_seat_numbers) ? b.return_seat_numbers : (b.return_seat_numbers ? [b.return_seat_numbers] : undefined),
      packageType: b.package_type,
      qrCodeData: b.qr_code_data,
      createdAt: b.created_at,
      checkInStatus: b.check_in_status,
      checkInTime: b.check_in_time,
      checkInLocation: b.check_in_location,
      addons: b.addons || {}
    }));
  } catch {
    return null;
  }
}

/**
 * Delete a booking from Supabase permanently
 */
export async function deleteBookingFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch Vehicles from Supabase
 */
export async function fetchVehiclesFromSupabase(): Promise<Vehicle[] | null> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });

    if (error) return null;
    if (!data) return [];

    return data.map((v: any) => ({
      id: v.id,
      unitNumber: v.name || v.id,
      model: v.type === 'sprinter' ? 'Mercedes-Benz Sprinter' : (v.type || 'Van Pasajeros'),
      plate: v.plate || 'S/P',
      capacity: Number(v.capacity || 19),
      status: (v.status as any) || 'active',
      category: v.type?.toLowerCase().includes('auto') ? 'auto' : 'van',
      driverId: v.assigned_driver_id || undefined,
      odometer: Number(v.mileage || 120000),
      nextServiceKm: Number(v.mileage ? v.mileage + 5000 : 125000),
      lastServiceDate: '2026-08-15',
      image: v.image_url || undefined,
      layoutTemplateId: v.layout_template_id || undefined
    }));
  } catch {
    return null;
  }
}

/**
 * Save / Upsert Vehicle to Supabase
 */
export async function saveVehicleToSupabase(vehicle: Vehicle): Promise<boolean> {
  try {
    const { error } = await supabase.from('vehicles').upsert({
      id: vehicle.id,
      name: vehicle.unitNumber,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      type: vehicle.category === 'auto' ? 'auto' : 'sprinter',
      status: vehicle.status,
      assigned_driver_id: vehicle.driverId || null,
      mileage: vehicle.odometer,
      image_url: vehicle.image || null,
      layout_template_id: vehicle.layoutTemplateId || null
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete Vehicle from Supabase permanently
 */
export async function deleteVehicleFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch Drivers from Supabase
 */
export async function fetchDriversFromSupabase(): Promise<Driver[] | null> {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name', { ascending: true });

    if (error) return null;
    if (!data) return [];

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      licenseNumber: d.license_number || d.license_type || 'FED-B-99882',
      licenseExpiry: d.license_expiry || '2027-12-31',
      rating: Number(d.rating || 4.9),
      status: (d.status as any) || 'available',
      avatar: d.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      currentVehicleId: d.current_vehicle_id || undefined
    }));
  } catch {
    return null;
  }
}

/**
 * Save / Upsert Driver to Supabase
 */
export async function saveDriverToSupabase(driver: Driver): Promise<boolean> {
  try {
    const { error } = await supabase.from('drivers').upsert({
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      license_number: driver.licenseNumber || null,
      license_expiry: driver.licenseExpiry || null,
      rating: driver.rating,
      status: driver.status,
      avatar: driver.avatar || null,
      current_vehicle_id: driver.currentVehicleId || null
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete Driver from Supabase permanently
 */
export async function deleteDriverFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('drivers').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Update check-in status of a booking in Supabase
 */
export async function updateBookingCheckInInSupabase(
  bookingId: string,
  locationName: string
): Promise<boolean> {
  try {
    const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const { error } = await supabase
      .from('bookings')
      .update({
        check_in_status: 'checked_in',
        check_in_time: now,
        check_in_location: locationName
      })
      .eq('id', bookingId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Save rental quote to Supabase
 */
export async function saveRentalQuoteToSupabase(quote: RentalQuote): Promise<boolean> {
  try {
    const { error } = await supabase.from('rental_quotes').insert({
      id: quote.id,
      client_name: quote.clientName,
      client_phone: quote.clientPhone,
      client_email: quote.clientEmail,
      vehicle_type: quote.vehicleModel,
      capacity: quote.paxCount,
      origin: quote.origin,
      destination: quote.destination,
      pickup_location: quote.origin,
      start_date: quote.departureDate,
      end_date: quote.returnDate,
      service_type: 'round_trip',
      calculated_kms: 400,
      suggested_price: quote.subtotal,
      final_price: quote.totalPrice,
      deposit_paid: quote.advancePaid,
      balance_remaining: quote.balanceRemaining,
      status: quote.status,
      notes: quote.notes || null
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete rental quote from Supabase permanently
 */
export async function deleteRentalQuoteFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('rental_quotes').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch route stops from Supabase if table exists
 */
export async function fetchRouteStopsFromSupabase(): Promise<RouteStop[] | null> {
  try {
    const { data, error } = await supabase
      .from('route_stops')
      .select('*')
      .order('stop_order', { ascending: true });

    if (error) return null;
    if (!data) return [];

    return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      city: s.city,
      landmark: s.landmark,
      address: s.address,
      mapsUrl: s.maps_url,
      order: s.stop_order,
      timeOffsetMins: s.time_offset_mins,
      isActive: s.is_active ?? true,
      isSpecialPoint: s.is_special_point ?? false,
      farePrice: s.fare_price ? Number(s.fare_price) : undefined,
      notes: s.notes
    }));
  } catch {
    return null;
  }
}

/**
 * Upsert route stop to Supabase
 */
export async function upsertRouteStopToSupabase(stop: RouteStop): Promise<boolean> {
  try {
    const { error } = await supabase.from('route_stops').upsert({
      id: stop.id,
      name: stop.name,
      city: stop.city,
      landmark: stop.landmark,
      address: stop.address,
      maps_url: stop.mapsUrl,
      stop_order: stop.order,
      time_offset_mins: stop.timeOffsetMins,
      is_active: stop.isActive,
      is_special_point: stop.isSpecialPoint ?? false,
      fare_price: stop.farePrice ?? null,
      notes: stop.notes || null
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete route stop from Supabase permanently
 */
export async function deleteRouteStopFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('route_stops').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch route pricings / tarifas from Supabase
 */
export async function fetchRoutePricingsFromSupabase(): Promise<RoutePricing[] | null> {
  try {
    const { data, error } = await supabase
      .from('route_pricings')
      .select('*')
      .order('id', { ascending: true });

    if (error) return null;
    if (!data) return [];

    return data.map((p: any) => ({
      id: p.id,
      origin: p.origin,
      destination: p.destination,
      singlePrice: Number(p.single_price),
      roundTripPrice: p.round_trip_price ? Number(p.round_trip_price) : undefined,
      timeEstimate: p.time_estimate || '2.5 hrs',
      notes: p.notes || '',
      packageType: p.package_type || 'estandar',
      isActive: p.is_active ?? true
    }));
  } catch {
    return null;
  }
}

/**
 * Upsert route pricing to Supabase
 */
export async function upsertRoutePricingToSupabase(pricing: RoutePricing): Promise<boolean> {
  try {
    const { error } = await supabase.from('route_pricings').upsert({
      id: pricing.id || `fare-${pricing.origin.toLowerCase().replace(/\s+/g, '')}-${pricing.destination.toLowerCase().replace(/\s+/g, '')}`,
      origin: pricing.origin,
      destination: pricing.destination,
      single_price: pricing.singlePrice,
      round_trip_price: pricing.roundTripPrice ?? null,
      time_estimate: pricing.timeEstimate,
      notes: pricing.notes || null,
      package_type: pricing.packageType || 'estandar',
      is_active: pricing.isActive !== undefined ? pricing.isActive : true
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete route pricing from Supabase
 */
export async function deleteRoutePricingFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('route_pricings').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch Rental Cars from Supabase
 */
export async function fetchRentalCarsFromSupabase(): Promise<RentalCar[] | null> {
  try {
    const { data, error } = await supabase
      .from('rental_cars')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return null;
    if (!data) return [];

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      brand: c.brand,
      category: c.category,
      capacity: Number(c.capacity || 5),
      dailyRateWithoutDriver: Number(c.daily_rate_without_driver || 800),
      dailyRateWithDriver: Number(c.daily_rate_with_driver || 1600),
      transmission: c.transmission || 'Automática',
      hasAC: c.has_ac ?? true,
      fuelType: c.fuel_type || 'Gasolina',
      luggageCapacity: c.luggage_capacity || '',
      image: c.image || '',
      available: c.available ?? true,
      features: Array.isArray(c.features) ? c.features : []
    }));
  } catch {
    return null;
  }
}

/**
 * Save / Update Rental Car in Supabase
 */
export async function saveRentalCarToSupabase(car: RentalCar): Promise<boolean> {
  try {
    const { error } = await supabase.from('rental_cars').upsert({
      id: car.id,
      name: car.name,
      brand: car.brand,
      category: car.category,
      capacity: car.capacity,
      daily_rate_without_driver: car.dailyRateWithoutDriver,
      daily_rate_with_driver: car.dailyRateWithDriver,
      transmission: car.transmission,
      has_ac: car.hasAC,
      fuel_type: car.fuelType,
      luggage_capacity: car.luggageCapacity,
      image: car.image,
      available: car.available,
      features: car.features
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete Rental Car from Supabase permanently
 */
export async function deleteRentalCarFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('rental_cars').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Update Rental Car Availability in Supabase
 */
export async function updateRentalCarAvailabilityInSupabase(id: string, available: boolean): Promise<boolean> {
  try {
    const { error } = await supabase.from('rental_cars').update({ available }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

