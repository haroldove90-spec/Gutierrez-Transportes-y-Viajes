import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, TripSchedule } from '../../types';
import { 
  Ticket, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  Users, 
  Bus, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  Clock, 
  ChevronRight, 
  Eye, 
  QrCode, 
  Download, 
  Trash2, 
  Check, 
  X,
  CreditCard,
  Shield,
  LayoutGrid
} from 'lucide-react';
import { LiveTripSupervisionModal } from '../modals/LiveTripSupervisionModal';

interface SalesManagerProps {
  onSelectTrip?: (trip: TripSchedule) => void;
  onOpenTicket?: (booking: Booking) => void;
}

export const SalesManager: React.FC<SalesManagerProps> = ({ onSelectTrip, onOpenTicket }) => {
  const { 
    bookings, 
    trips, 
    vehicles, 
    drivers, 
    saleAlerts, 
    markSaleAlertAsRead, 
    clearSaleAlerts,
    updateBookingPaymentStatus,
    cancelBooking,
    deleteBooking,
    showNotification
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all');
  const [selectedTripFilter, setSelectedTripFilter] = useState<string>('all');
  const [selectedTripForInspection, setSelectedTripForInspection] = useState<string>(trips[0]?.id || '');
  const [activeSupervisionTripId, setActiveSupervisionTripId] = useState<string | null>(null);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);

  // Financial Metrics
  const metrics = useMemo(() => {
    let paidAmount = 0;
    let pendingAmount = 0;
    let totalSeatsSold = 0;
    let paidBookingsCount = 0;
    let pendingBookingsCount = 0;

    bookings.forEach(b => {
      if (b.paymentStatus === 'paid') {
        paidAmount += b.totalAmount;
        totalSeatsSold += b.seatNumbers.length;
        paidBookingsCount++;
      } else if (b.paymentStatus === 'pending') {
        pendingAmount += b.totalAmount;
        totalSeatsSold += b.seatNumbers.length;
        pendingBookingsCount++;
      }
    });

    return {
      paidAmount,
      pendingAmount,
      totalSeatsSold,
      paidBookingsCount,
      pendingBookingsCount,
      totalBookings: bookings.length
    };
  }, [bookings]);

  // Filtered Bookings for the Table
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Status filter
      if (selectedStatusFilter !== 'all' && b.paymentStatus !== selectedStatusFilter) {
        return false;
      }
      // Trip filter
      if (selectedTripFilter !== 'all' && b.tripId !== selectedTripFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = b.passengerName.toLowerCase().includes(query);
        const matchesPhone = b.passengerPhone?.includes(query);
        const matchesId = b.id.toLowerCase().includes(query);
        const matchesOrigin = b.origin.toLowerCase().includes(query);
        const matchesDest = b.destination.toLowerCase().includes(query);
        const matchesSeat = b.seatNumbers.some(num => num.toString() === query);
        return matchesName || matchesPhone || matchesId || matchesOrigin || matchesDest || matchesSeat;
      }
      return true;
    });
  }, [bookings, selectedStatusFilter, selectedTripFilter, searchTerm]);

  // Current trip for seat preview
  const inspectedTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripForInspection) || trips[0] || null;
  }, [trips, selectedTripForInspection]);

  // Unread sale alerts
  const unreadAlertsCount = useMemo(() => {
    return saleAlerts.filter(a => !a.read).length;
  }, [saleAlerts]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      showNotification('No hay ventas para exportar con los filtros actuales.', 'info');
      return;
    }
    const headers = 'Folio,Fecha,Pasajero,Telefono,Origen,Destino,Asientos,Monto,MetodoPago,Estado\n';
    const rows = filteredBookings.map(b => 
      `"${b.id}","${b.createdAt}","${b.passengerName}","${b.passengerPhone}","${b.origin}","${b.destination}","${b.seatNumbers.join(';')}",${b.totalAmount},"${b.paymentMethod}","${b.paymentStatus}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_boletos_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Reporte de ventas descargado en CSV.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      
      {/* Sales Module Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Ticket className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">Módulo de Administración Comercial</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-neutral-900">
              Ventas & Supervisión de Boletos
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-medium mt-1">
              Monitoreo en tiempo real de reservaciones, boletos cobrados, asientos vendidos y alertas de compra.
            </p>
          </div>

          {/* Live Alerts Stream Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
              className="relative px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Bell className="w-4 h-4 text-orange-400" />
              <span>Alertas en Vivo</span>
              {unreadAlertsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-black animate-pulse">
                  {unreadAlertsCount} nuevas
                </span>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border border-neutral-200"
              title="Descargar reporte de ventas en archivo CSV Excel"
            >
              <Download className="w-4 h-4 text-neutral-600" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Live Alerts Drawer */}
        {showAlertsDrawer && (
          <div className="mt-5 p-4 bg-neutral-50 rounded-2xl border-2 border-orange-200 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900">
                  Transmisión de Alertas de Ventas para el Admin
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {saleAlerts.length > 0 && (
                  <button
                    onClick={clearSaleAlerts}
                    className="text-[11px] font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                  >
                    Limpiar historial
                  </button>
                )}
                <button
                  onClick={() => setShowAlertsDrawer(false)}
                  className="text-neutral-400 hover:text-neutral-800 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {saleAlerts.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3 text-center">
                No hay alertas recientes. Cuando un cliente reserve o pague un boleto en la app, la notificación sonará y aparecerá aquí automáticamente.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {saleAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      markSaleAlertAsRead(alert.id);
                      if (alert.tripId) {
                        setActiveSupervisionTripId(alert.tripId);
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs cursor-pointer transition-colors ${
                      alert.read 
                        ? 'bg-white border-neutral-200' 
                        : 'bg-orange-50/80 border-orange-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        alert.type === 'payment' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {alert.type === 'payment' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-neutral-900">{alert.title}</span>
                          {!alert.read && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-orange-600 text-white">
                              NUEVA
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-600 font-medium mt-0.5">{alert.message}</p>
                        <span className="text-[10px] text-neutral-400 font-bold block mt-1">
                          {alert.timestamp} • Clic para monitorear el viaje
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 mt-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4 Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
          <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 shadow-xs">
            <span className="text-[10px] text-neutral-400 uppercase font-black">Ingresos Cobrados</span>
            <p className="text-xl md:text-2xl font-black text-emerald-400 mt-1">
              ${metrics.paidAmount.toLocaleString()} MXN
            </p>
            <p className="text-xs text-neutral-400 font-bold mt-0.5">
              {metrics.paidBookingsCount} boletos confirmados
            </p>
          </div>

          <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 shadow-xs">
            <span className="text-[10px] text-neutral-400 uppercase font-black">Reservaciones Pendientes</span>
            <p className="text-xl md:text-2xl font-black text-amber-400 mt-1">
              ${metrics.pendingAmount.toLocaleString()} MXN
            </p>
            <p className="text-xs text-neutral-400 font-bold mt-0.5">
              {metrics.pendingBookingsCount} boletos por cobrar
            </p>
          </div>

          <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 shadow-xs">
            <span className="text-[10px] text-neutral-400 uppercase font-black">Lugares Vendidos</span>
            <p className="text-xl md:text-2xl font-black text-white mt-1">
              {metrics.totalSeatsSold} Plazas
            </p>
            <p className="text-xs text-orange-400 font-bold mt-0.5">
              En toda la flota programada
            </p>
          </div>

          <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 shadow-xs">
            <span className="text-[10px] text-neutral-400 uppercase font-black">Total Transacciones</span>
            <p className="text-xl md:text-2xl font-black text-orange-400 mt-1">
              {metrics.totalBookings}
            </p>
            <p className="text-xs text-neutral-400 font-bold mt-0.5">
              Historial acumulado
            </p>
          </div>
        </div>
      </div>

      {/* Seat Supervision Selector & Trip Preview Card */}
      {inspectedTrip && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4" /> Inspección de Asientos por Viaje
              </span>
              <h3 className="text-lg md:text-xl font-black text-neutral-900">
                Ocupación y Diagrama en Tiempo Real
              </h3>
            </div>

            {/* Select Trip dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-neutral-500 uppercase">Seleccionar Viaje:</label>
              <select
                value={selectedTripForInspection}
                onChange={e => setSelectedTripForInspection(e.target.value)}
                className="px-3 py-1.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 cursor-pointer"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.departureTime} • {t.origin} ➔ {t.destination} ({t.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trip Summary Pill Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-neutral-900">{inspectedTrip.routeTitle}</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                  {inspectedTrip.date} • {inspectedTrip.departureTime}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-bold">
                Unidad: {inspectedTrip.unitNumber || 'Sprinter'} • Recaudado: ${inspectedTrip.totalRevenue.toLocaleString()} MXN
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSupervisionTripId(inspectedTrip.id)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Monitorear Asientos & Pasajeros
              </button>
            </div>
          </div>

          {/* Quick Seat Grid Bar */}
          <div className="bg-neutral-900 p-4 rounded-2xl text-white space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-400">Distribución de Asientos:</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Libres: {inspectedTrip.seats.filter(s => s.status === 'available').length}
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Pagados: {inspectedTrip.seats.filter(s => s.status === 'sold').length}
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Reservados: {inspectedTrip.seats.filter(s => s.status === 'locked').length}
                </span>
              </div>
            </div>

            {/* Visual seat badges row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {inspectedTrip.seats.filter(s => s.type === 'standard' || (!s.type && s.number > 0)).map(seat => {
                const booking = bookings.find(b => b.tripId === inspectedTrip.id && b.seatNumbers.includes(seat.number));
                const isPaid = booking ? booking.paymentStatus === 'paid' : (seat.status === 'sold');
                const isPending = booking ? booking.paymentStatus === 'pending' : (seat.status === 'locked');

                return (
                  <button
                    key={seat.id || seat.number}
                    onClick={() => setActiveSupervisionTripId(inspectedTrip.id)}
                    className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                      isPaid 
                        ? 'bg-blue-600 text-white' 
                        : isPending 
                        ? 'bg-amber-500 text-neutral-950 font-black' 
                        : 'bg-emerald-500 text-white'
                    }`}
                    title={`Asiento #${seat.number}: ${isPaid ? `Pagado por ${seat.passengerName || 'Cliente'}` : isPending ? 'Reservado pendiente' : 'Disponible'}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Complete Sales & Bookings History Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-black text-neutral-900">
              Historial Completo de Ventas y Boletos
            </h3>
            <p className="text-xs md:text-sm text-neutral-500 font-medium">
              Consulta qué boletos han sido reservados, cuáles están pagados y administra el cobro de cada pasaje.
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                selectedStatusFilter === 'all' 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Todos ({bookings.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                selectedStatusFilter === 'paid' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              ✓ Pagados ({bookings.filter(b => b.paymentStatus === 'paid').length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                selectedStatusFilter === 'pending' 
                  ? 'bg-amber-500 text-neutral-950 font-black' 
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              ⏳ Reservados ({bookings.filter(b => b.paymentStatus === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('refunded')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                selectedStatusFilter === 'refunded' 
                  ? 'bg-neutral-800 text-white' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Cancelados ({bookings.filter(b => b.paymentStatus === 'refunded').length})
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre de cliente, teléfono, folio #TG o número de asiento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Filter by trip */}
          <div>
            <select
              value={selectedTripFilter}
              onChange={e => setSelectedTripFilter(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 cursor-pointer"
            >
              <option value="all">-- Todas las Corridas --</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>
                  {t.departureTime} • {t.origin} ➔ {t.destination}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="border-2 border-neutral-200 rounded-2xl overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 font-medium">
              No se encontraron ventas o reservaciones que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-600 uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-3">Folio</th>
                    <th className="p-3">Fecha Venta</th>
                    <th className="p-3">Pasajero / Contacto</th>
                    <th className="p-3">Ruta & Salida</th>
                    <th className="p-3">Asientos</th>
                    <th className="p-3">Monto Total</th>
                    <th className="p-3">Método</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {filteredBookings.map(b => {
                    const relatedTrip = trips.find(t => t.id === b.tripId);

                    return (
                      <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-3 font-mono font-black text-neutral-900 whitespace-nowrap">
                          {b.id}
                        </td>
                        <td className="p-3 text-neutral-500 whitespace-nowrap text-[11px]">
                          {b.createdAt}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-neutral-900">{b.passengerName}</p>
                          {b.passengerPhone && (
                            <a 
                              href={`tel:${b.passengerPhone}`}
                              className="text-[11px] text-neutral-500 font-bold hover:text-emerald-600 flex items-center gap-1"
                            >
                              <Phone className="w-2.5 h-2.5 text-neutral-400" /> {b.passengerPhone}
                            </a>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-neutral-900">{b.origin} ➔ {b.destination}</p>
                          <p className="text-[11px] text-neutral-500 font-medium">{b.date} • {b.departureTime}</p>
                        </td>
                        <td className="p-3 font-black text-orange-600 whitespace-nowrap">
                          #{b.seatNumbers.join(', #')}
                        </td>
                        <td className="p-3 font-black text-neutral-900 whitespace-nowrap">
                          ${b.totalAmount} MXN
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="text-[11px] font-bold text-neutral-600 uppercase">
                            {b.paymentMethod === 'card' ? '💳 Tarjeta' :
                             b.paymentMethod === 'spei' ? '🏦 SPEI' :
                             b.paymentMethod === 'oxxo' ? '🏪 OXXO' : '💵 Ventanilla'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            b.paymentStatus === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : b.paymentStatus === 'pending'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {b.paymentStatus === 'paid' ? '✓ Pagado' : 
                             b.paymentStatus === 'pending' ? '⏳ Reservado Pendiente' : '✕ Cancelado'}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Action: Mark as Paid if pending */}
                            {b.paymentStatus === 'pending' && (
                              <button
                                onClick={() => updateBookingPaymentStatus(b.id, 'paid')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                                title="Marcar como cobrado y pagado"
                              >
                                <Check className="w-3 h-3" /> Cobrar
                              </button>
                            )}

                            {/* Action: View / Monitor Trip */}
                            <button
                              onClick={() => setActiveSupervisionTripId(b.tripId)}
                              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-neutral-200"
                              title="Monitorear el viaje completo y ver todos los asientos"
                            >
                              <Eye className="w-3 h-3 text-neutral-600" /> Monitorear
                            </button>

                            {/* Action: View Ticket */}
                            {onOpenTicket && (
                              <button
                                onClick={() => onOpenTicket(b)}
                                className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-orange-200"
                                title="Ver boleto con código QR"
                              >
                                <Ticket className="w-3 h-3 text-orange-600" /> Boleto
                              </button>
                            )}

                            {/* Action: Cancel / Refund */}
                            {b.paymentStatus !== 'refunded' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Seguro de cancelar el boleto ${b.id} y liberar sus asientos?`)) {
                                    cancelBooking(b.id, 'Cancelado desde panel de ventas');
                                  }
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[10px] transition-colors cursor-pointer border border-rose-200"
                                title="Cancelar y liberar inventario"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Live Trip Supervision Modal if clicked */}
      {activeSupervisionTripId && (
        <LiveTripSupervisionModal
          tripId={activeSupervisionTripId}
          onClose={() => setActiveSupervisionTripId(null)}
          onOpenTicket={onOpenTicket}
        />
      )}

    </div>
  );
};
