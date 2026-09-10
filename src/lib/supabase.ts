import { createClient } from '@supabase/supabase-js';
import { Booking, TripSchedule, RentalQuote, RouteStop, RoutePricing } from '../types';
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

    if (error || !data || data.length === 0) return null;

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
      stops: Array.isArray(t.stops) ? t.stops : ROUTE_STOPS
    }));
  } catch {
    return null;
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

    if (error || !data || data.length === 0) return null;

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
 * Fetch route stops from Supabase if table exists
 */
export async function fetchRouteStopsFromSupabase(): Promise<RouteStop[] | null> {
  try {
    const { data, error } = await supabase
      .from('route_stops')
      .select('*')
      .order('stop_order', { ascending: true });

    if (error || !data || data.length === 0) return null;

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
 * Fetch route pricings / tarifas from Supabase
 */
export async function fetchRoutePricingsFromSupabase(): Promise<RoutePricing[] | null> {
  try {
    const { data, error } = await supabase
      .from('route_pricings')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) return null;

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
