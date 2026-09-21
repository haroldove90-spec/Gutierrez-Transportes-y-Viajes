import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TripSchedule, Booking } from '../../types';
import { 
  X, 
  Bus, 
  Clock, 
  MapPin, 
  Users, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Shield, 
  BellRing, 
  Ticket, 
  Search, 
  Check, 
  TrendingUp, 
  Car, 
  QrCode,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { SeatDiagramViewer } from '../common/SeatDiagramViewer';

interface LiveTripSupervisionModalProps {
  tripId: string;
  onClose: () => void;
  onOpenTicket?: (booking: Booking) => void;
}

export const LiveTripSupervisionModal: React.FC<LiveTripSupervisionModalProps> = ({
  tripId,
  onClose,
  onOpenTicket
}) => {
  const { 
    trips, 
    vehicles, 
    drivers, 
    bookings, 
    seatTemplates,
    toggleTripBookingStatus,
    updateTripStatus,
    updateBookingPaymentStatus,
    cancelBooking,
    sendManualWakeUpAlarm,
    showNotification
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'pending'>('all');
  const [inspectedSeatNum, setInspectedSeatNum] = useState<number | null>(null);

  const trip = useMemo(() => {
    return trips.find(t => t.id === tripId) || null;
  }, [trips, tripId]);

  if (!trip) {
    return null;
  }

  const assignedVehicle = vehicles.find(v => v.id === trip.vehicleId);
  const assignedDriver = drivers.find(d => d.id === trip.driverId);
  const assignedTemplate = seatTemplates.find(t => t.id === trip.layoutTemplateId)
    || seatTemplates.find(t => t.totalSeats === trip.seats.filter(s => s.type === 'standard' || (!s.type && s.number > 0)).length)
    || seatTemplates[0];

  // Trip bookings
  const tripBookings = useMemo(() => {
    return bookings.filter(b => b.tripId === trip.id);
  }, [bookings, trip.id]);

  // Standard seats
  const standardSeats = useMemo(() => {
    return trip.seats.filter(s => s.type === 'standard' || (!s.type && s.number > 0));
  }, [trip.seats]);

  // Calculate paid vs pending vs available seats
  const { paidSeats, pendingSeats, availableSeats, totalPaidRevenue, totalPendingRevenue } = useMemo(() => {
    let paidCount = 0;
    let pendingCount = 0;
    let paidRev = 0;
    let pendingRev = 0;

    const paidSeatNumbers = new Set<number>();
    const pendingSeatNumbers = new Set<number>();

    tripBookings.forEach(b => {
      if (b.paymentStatus === 'paid') {
        b.seatNumbers.forEach(num => paidSeatNumbers.add(num));
        paidRev += b.totalAmount;
      } else if (b.paymentStatus === 'pending') {
        b.seatNumbers.forEach(num => pendingSeatNumbers.add(num));
        pendingRev += b.totalAmount;
      }
    });

    standardSeats.forEach(s => {
      if (paidSeatNumbers.has(s.number)) {
        paidCount++;
      } else if (pendingSeatNumbers.has(s.number) || s.status === 'locked') {
        pendingCount++;
      } else if (s.status === 'sold') {
        // Fallback if booking not matched but seat sold
        paidCount++;
      }
    });

    const totalStandard = standardSeats.length || trip.totalSeats || 19;
    const occupiedTotal = paidCount + pendingCount;
    const available = Math.max(0, totalStandard - occupiedTotal);

    return {
      paidSeats: paidCount,
      pendingSeats: pendingCount,
      availableSeats: available,
      totalPaidRevenue: paidRev || trip.totalRevenue,
      totalPendingRevenue: pendingRev
    };
  }, [standardSeats, tripBookings, trip.totalSeats, trip.totalRevenue]);

  // Filtered bookings list
  const filteredBookings = useMemo(() => {
    return tripBookings.filter(b => {
      const matchesSearch = 
        b.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.passengerPhone.includes(searchTerm) ||
        b.seatNumbers.some(n => n.toString() === searchTerm.trim());

      const matchesPayment = 
        filterPayment === 'all' ? true :
        filterPayment === 'paid' ? b.paymentStatus === 'paid' :
        b.paymentStatus === 'pending';

      return matchesSearch && matchesPayment;
    });
  }, [tripBookings, searchTerm, filterPayment]);

  const isSoldOut = trip.isFull === true || availableSeats === 0;

  // Inspected booking if any seat selected
  const inspectedBooking = useMemo(() => {
    if (!inspectedSeatNum) return null;
    return tripBookings.find(b => b.seatNumbers.includes(inspectedSeatNum)) || null;
  }, [inspectedSeatNum, tripBookings]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-2 border-neutral-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 p-4 sm:p-6 shrink-0 bg-white">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-500" /> Monitoreo y Supervisión de Viaje
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                En Tiempo Real
              </span>
              {isSoldOut ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                  🚨 100% Vendido (Lleno)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                  {availableSeats} Asientos Libres
                </span>
              )}
            </div>
            
            <h3 className="text-base sm:text-xl font-black text-neutral-900 flex items-center gap-2">
              <span>{trip.routeTitle}</span>
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 font-bold">
              <span className="text-neutral-900">{trip.date}</span>
              <span>•</span>
              <span className="text-orange-600 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> Salida: {trip.departureTime}
              </span>
              <span>•</span>
              <span className="text-emerald-700 flex items-center gap-1 font-mono">
                Llegada aprox: {trip.estimatedArrival}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer transition-colors"
            title="Cerrar modal de supervisión"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational & Financial KPI Ribbon */}
        <div className="bg-neutral-900 text-white p-4 sm:p-5 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-neutral-800">
          <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700">
            <span className="text-[10px] text-neutral-400 uppercase font-black block">Ingresos Pagados</span>
            <p className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">
              ${totalPaidRevenue.toLocaleString()} MXN
            </p>
            <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
              {paidSeats} lugares confirmados
            </p>
          </div>

          <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700">
            <span className="text-[10px] text-neutral-400 uppercase font-black block">Reservas Pendientes</span>
            <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
              ${totalPendingRevenue.toLocaleString()} MXN
            </p>
            <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
              {pendingSeats} lugares apartados
            </p>
          </div>

          <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700">
            <span className="text-[10px] text-neutral-400 uppercase font-black block">Disponibilidad</span>
            <p className="text-lg sm:text-xl font-black text-white mt-0.5">
              {availableSeats} / {standardSeats.length}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
              {availableSeats > 0 ? 'Plazas en venta' : 'Cupo agotado'}
            </p>
          </div>

          <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700">
            <span className="text-[10px] text-neutral-400 uppercase font-black block">Ocupación Total</span>
            <p className="text-lg sm:text-xl font-black text-orange-400 mt-0.5">
              {Math.round(((paidSeats + pendingSeats) / Math.max(1, standardSeats.length)) * 100)}%
            </p>
            <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
              {tripBookings.length} boletos registrados
            </p>
          </div>
        </div>

        {/* Assigned Unit & Driver Bar */}
        <div className="p-3 sm:p-4 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* Unit */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-black block">Unidad Asignada</span>
                <span className="font-black text-neutral-900">{assignedVehicle?.unitNumber || trip.unitNumber || 'Por asignar'}</span>
                {assignedVehicle && (
                  <span className="text-neutral-500 font-bold ml-1">({assignedVehicle.model} • {assignedVehicle.plate})</span>
                )}
              </div>
            </div>

            {/* Driver */}
            <div className="flex items-center gap-2 border-l border-neutral-200 pl-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-200 text-neutral-800 flex items-center justify-center font-black">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-black block">Chofer / Operador</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-neutral-900">{assignedDriver?.name || trip.driverName || 'Por asignar'}</span>
                  {trip.driverAccepted ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Aceptado
                    </span>
                  ) : trip.driverRejectionReason ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200" title={trip.driverRejectionReason}>
                      ✕ Rechazado
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                      ⏳ Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions for Admin */}
          <div className="flex items-center gap-2">
            {assignedDriver && (
              <button
                onClick={() => sendManualWakeUpAlarm(assignedDriver.id, trip.id, `Alerta despacho: Tu viaje ${trip.routeTitle} tiene ${paidSeats + pendingSeats} pasajeros confirmados.`)}
                className="px-3 py-1.5 bg-white hover:bg-orange-50 hover:text-orange-600 text-neutral-700 rounded-xl font-black text-xs transition-colors cursor-pointer flex items-center gap-1 border border-neutral-200 shadow-2xs"
                title="Enviar notificación / alarma sonora al celular del operador"
              >
                <BellRing className="w-3.5 h-3.5 text-orange-500" /> Alerta Chofer
              </button>
            )}

            <button
              onClick={() => toggleTripBookingStatus(trip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                trip.isActiveForBooking === false || trip.isFull
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {trip.isActiveForBooking === false || trip.isFull
                ? '✓ Reactivar Ventas'
                : '🚫 Pausar Ventas'}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          
          {/* Seat Map Visualizer */}
          <div className="bg-neutral-50 p-4 sm:p-5 rounded-3xl border-2 border-neutral-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-600" /> Mapa Gráfico de Asientos del Viaje
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  Haz clic en cualquier asiento ocupado o libre para inspeccionar su comprador y detalles.
                </p>
              </div>

              {/* Status color tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold bg-white px-3 py-1.5 rounded-2xl border border-neutral-200">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Libre
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span> Pagado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span> Reservado
                </span>
              </div>
            </div>

            {/* Custom Interactive Seat Visualizer Grid */}
            <div className="max-w-md mx-auto bg-white p-4 sm:p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
              <div className="w-36 mx-auto bg-sky-100 text-sky-800 text-[10px] font-black text-center py-1 rounded-xl uppercase tracking-widest">
                Parabrisas Frontal
              </div>

              <div className="grid grid-cols-4 gap-2.5 pt-2">
                {standardSeats.map(seat => {
                  const b = tripBookings.find(booking => booking.seatNumbers.includes(seat.number));
                  const isPaid = b ? b.paymentStatus === 'paid' : (seat.status === 'sold');
                  const isPending = b ? b.paymentStatus === 'pending' : (seat.status === 'locked');
                  const isAvailable = !isPaid && !isPending;
                  const isSelected = inspectedSeatNum === seat.number;

                  return (
                    <button
                      key={seat.id || seat.number}
                      type="button"
                      onClick={() => setInspectedSeatNum(seat.number === inspectedSeatNum ? null : seat.number)}
                      className={`h-11 sm:h-12 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center transition-all cursor-pointer relative shadow-2xs border-2 ${
                        isSelected 
                          ? 'ring-4 ring-orange-400 scale-105 z-10' 
                          : ''
                      } ${
                        isPaid
                          ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                          : isPending
                          ? 'bg-amber-400 text-amber-950 border-amber-500 hover:bg-amber-500'
                          : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                      }`}
                      title={`Asiento #${seat.number} • ${isPaid ? 'Pagado' : isPending ? 'Reservado pendiente' : 'Disponible'}`}
                    >
                      <span className="leading-none font-black">{seat.number}</span>
                      <span className="text-[8px] font-extrabold uppercase mt-0.5 leading-none">
                        {isPaid ? 'Pagado' : isPending ? 'Reserv' : 'Libre'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inspected Seat Detail Card */}
            {inspectedSeatNum !== null && (
              <div className="p-4 bg-white rounded-2xl border-2 border-orange-200 shadow-sm animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                      #{inspectedSeatNum}
                    </span>
                    <div>
                      <h5 className="text-xs sm:text-sm font-black text-neutral-900">
                        Detalle del Asiento #{inspectedSeatNum}
                      </h5>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        {inspectedBooking ? `Folio: ${inspectedBooking.id}` : 'Asiento actualmente disponible para venta'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedSeatNum(null)}
                    className="text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
                  >
                    ✕ Cerrar detalle
                  </button>
                </div>

                {inspectedBooking ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Pasajero</span>
                      <p className="font-black text-neutral-900 mt-0.5">{inspectedBooking.passengerName}</p>
                      {inspectedBooking.passengerPhone && (
                        <p className="text-neutral-600 font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" /> {inspectedBooking.passengerPhone}
                        </p>
                      )}
                    </div>

                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Estado de Pago</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          inspectedBooking.paymentStatus === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inspectedBooking.paymentStatus === 'paid' ? '✓ Pagado y Confirmado' : '⏳ Reservado Pendiente'}
                        </span>
                      </div>
                      <p className="text-neutral-700 font-bold mt-1">Total: ${inspectedBooking.totalAmount} MXN</p>
                    </div>

                    <div className="flex flex-col justify-center gap-2">
                      {inspectedBooking.paymentStatus === 'pending' && (
                        <button
                          onClick={() => updateBookingPaymentStatus(inspectedBooking.id, 'paid')}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Marcar como Pagado
                        </button>
                      )}
                      {onOpenTicket && (
                        <button
                          onClick={() => onOpenTicket(inspectedBooking)}
                          className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Ticket className="w-3.5 h-3.5 text-orange-400" /> Ver Boleto Digital
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 font-medium">
                    Este asiento está libre en inventario y listo para ser adquirido por cualquier usuario en la app o en taquilla.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Passenger Manifest & Sales Table */}
          <div className="bg-white rounded-3xl border-2 border-neutral-200 overflow-hidden shadow-xs space-y-0">
            <div className="p-4 bg-neutral-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider">
                    Manifiesto de Pasaje y Boletos ({tripBookings.length} Boletos • {paidSeats + pendingSeats} Asientos)
                  </h4>
                  <p className="text-[11px] text-neutral-400">Supervisión nominal de pasajeros que viajan en esta unidad</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterPayment('all')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    filterPayment === 'all' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Todos ({tripBookings.length})
                </button>
                <button
                  onClick={() => setFilterPayment('paid')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    filterPayment === 'paid' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Pagados ({tripBookings.filter(b => b.paymentStatus === 'paid').length})
                </button>
                <button
                  onClick={() => setFilterPayment('pending')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    filterPayment === 'pending' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Pendientes ({tripBookings.filter(b => b.paymentStatus === 'pending').length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-3 bg-neutral-50 border-b border-neutral-200">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por pasajero, teléfono, folio o número de asiento..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Table */}
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 font-medium">
                {tripBookings.length === 0 
                  ? 'Aún no hay reservaciones registradas para este viaje.' 
                  : 'No se encontraron boletos que coincidan con el filtro de búsqueda.'}
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 uppercase font-black text-[10px] sticky top-0">
                    <tr>
                      <th className="p-3">Asientos</th>
                      <th className="p-3">Pasajero</th>
                      <th className="p-3">Contacto</th>
                      <th className="p-3">Punto de Abordaje</th>
                      <th className="p-3">Folio / Ticket</th>
                      <th className="p-3">Monto Total</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    {filteredBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-3 font-black text-orange-600 whitespace-nowrap">
                          #{booking.seatNumbers.join(', #')}
                        </td>
                        <td className="p-3 font-bold text-neutral-900 whitespace-nowrap">
                          {booking.passengerName}
                        </td>
                        <td className="p-3 text-neutral-600 whitespace-nowrap font-bold">
                          {booking.passengerPhone ? (
                            <a 
                              href={`tel:${booking.passengerPhone}`}
                              className="hover:text-emerald-600 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-neutral-400" />
                              {booking.passengerPhone}
                            </a>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-neutral-600 max-w-[140px] truncate" title={booking.boardingPoint}>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                            {booking.boardingPoint || trip.origin}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                          {booking.id}
                        </td>
                        <td className="p-3 font-black text-neutral-900 whitespace-nowrap">
                          ${booking.totalAmount} MXN
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            booking.paymentStatus === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {booking.paymentStatus === 'paid' ? '✓ Pagado' : '⏳ Reservado'}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {booking.paymentStatus === 'pending' && (
                              <button
                                onClick={() => updateBookingPaymentStatus(booking.id, 'paid')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                                title="Marcar como pagado (recibido en efectivo o SPEI)"
                              >
                                <Check className="w-3 h-3" /> Cobrado
                              </button>
                            )}

                            {onOpenTicket && (
                              <button
                                onClick={() => onOpenTicket(booking)}
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-neutral-200"
                                title="Ver boleto digital con código QR"
                              >
                                <QrCode className="w-3 h-3 text-neutral-600" /> Boleto
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (window.confirm(`¿Deseas cancelar el boleto ${booking.id} de ${booking.passengerName} y liberar sus asientos?`)) {
                                  cancelBooking(booking.id, 'Cancelado por administración');
                                }
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[10px] transition-colors cursor-pointer border border-rose-200"
                              title="Cancelar y liberar asientos"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 flex items-center justify-between shrink-0 bg-white">
          <div className="text-xs text-neutral-500 font-bold">
            Salida: <strong className="text-neutral-900">{trip.origin} ➔ {trip.destination}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white rounded-xl font-black text-xs cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            Cerrar Supervisión
          </button>
        </div>

      </div>
    </div>
  );
};
