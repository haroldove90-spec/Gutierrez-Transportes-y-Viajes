import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, 
  Users, 
  QrCode, 
  Receipt, 
  MapPin, 
  Clock, 
  Phone, 
  Camera, 
  Plus, 
  Fuel, 
  CheckCheck,
  Navigation,
  ExternalLink,
  Compass,
  Palmtree,
  BellRing,
  Volume2,
  AlertTriangle
} from 'lucide-react';
import { TripExpense } from '../../types';
import { DriverWakeUpAlarmModal } from './DriverWakeUpAlarmModal';

interface DriverPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScanner: () => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({ activeTab, setActiveTab, onOpenScanner }) => {
  const { 
    trips, 
    bookings, 
    vehicles, 
    drivers, 
    expenses, 
    routeStops,
    addExpense, 
    updateTripStatus, 
    checkInPassenger, 
    showNotification,
    driverAlarms,
    activeAlarm,
    soundPermissionGranted,
    requestSoundAndNotificationPermission,
    playAlarmSoundTest
  } = useApp();

  // Current logged in driver for demo
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || 'drv-01');
  const currentDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const driverVehicle = vehicles.find(v => v.id === currentDriver.currentVehicleId) || vehicles[0];
  const assignedTrips = trips.filter(t => t.driverId === currentDriver.id);
  const activeTrip = assignedTrips[0] || trips[0];

  // Passengers on this active trip
  const tripBookings = bookings.filter(b => b.tripId === activeTrip.id);
  const checkedInCount = tripBookings.filter(b => b.checkInStatus === 'checked_in').length;

  // New Expense form modal/state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseType, setExpenseType] = useState<TripExpense['type']>('fuel');
  const [amount, setAmount] = useState<string>('1200');
  const [liters, setLiters] = useState<string>('52.0');
  const [ticketFolio, setTicketFolio] = useState<string>('PEMEX-4491');
  const [location, setLocation] = useState<string>('Gasolinera Tecomán Autopista');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showNotification('Ingresa un monto válido.', 'error');
      return;
    }

    addExpense({
      tripId: activeTrip.id,
      vehicleId: driverVehicle.id,
      driverId: currentDriver.id,
      type: expenseType,
      amount: Number(amount),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      location,
      liters: expenseType === 'fuel' ? Number(liters) : undefined,
      ticketFolio,
      receiptImage,
      notes
    });

    setShowExpenseForm(false);
    setNotes('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Floating Emergency Wake-Up Alarm Modal */}
      <DriverWakeUpAlarmModal currentDriverId={currentDriver.id} />

      {/* Device Notification & Audio Permission Banner */}
      <div className="max-w-5xl mx-auto w-full">
        {!soundPermissionGranted ? (
          <div className="bg-amber-500 text-neutral-950 p-4 rounded-3xl shadow-lg border-2 border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-amber-400 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wide">
                  Activa el sonido y notificaciones en tu celular
                </p>
                <p className="text-xs font-semibold text-neutral-900 mt-0.5">
                  Requerido para que la alarma de tu viaje suene 2 horas antes y cuando el Administrador te despierte.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={requestSoundAndNotificationPermission}
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer transition-transform active:scale-95"
              >
                🔔 Activar Alarma Sonora
              </button>
              <button
                onClick={playAlarmSoundTest}
                className="px-3 py-2.5 bg-amber-600/30 hover:bg-amber-600/50 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl border border-neutral-900/20 cursor-pointer"
                title="Probar sonido de alarma MP3"
              >
                <Volume2 className="w-4 h-4 inline mr-1" /> Probar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dispositivo preparado: Notificaciones y alarma sonora (2h antes y admin) activas.</span>
            </div>
            <button
              onClick={playAlarmSoundTest}
              className="px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
            >
              🔊 Probar Sonido
            </button>
          </div>
        )}
      </div>

      {/* Top Driver Status Bar */}
      <div className="max-w-5xl mx-auto w-full bg-black text-white p-5 md:p-6 rounded-3xl border-2 border-neutral-800 shadow-md space-y-4">
        {/* Operator Switcher for Demo & Multi-driver device sharing */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase font-black tracking-wider text-neutral-400">
              Operador en Cabina (7 Choferes Registrados)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-neutral-400">Cambiar Operador:</label>
            <select
              value={selectedDriverId}
              onChange={e => setSelectedDriverId(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-orange-400 text-xs font-black rounded-xl px-3 py-1.5 focus:outline-none focus:border-orange-500"
            >
              {drivers.map(drv => (
                <option key={drv.id} value={drv.id}>
                  {drv.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentDriver.avatar}
              alt={currentDriver.name}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
            />
            <div>
              <h3 className="text-base md:text-lg font-black text-white leading-tight">{currentDriver.name}</h3>
              <div className="flex items-center gap-1.5 text-xs md:text-sm font-mono mt-1">
                <a 
                  href={`tel:${currentDriver.phone.replace(/[\s+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800/90 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 rounded-lg border border-neutral-700/70 transition-colors"
                  title="Llamar o contactar al chofer"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold">{currentDriver.phone}</span>
                </a>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs md:text-sm bg-orange-600/30 text-orange-400 font-black px-3 py-1 rounded-full border border-orange-500/30">
              Unidad: {driverVehicle.unitNumber}
            </span>
            <p className="text-xs md:text-sm text-neutral-400 font-bold mt-1">{driverVehicle.model}</p>
          </div>
        </div>

        {/* Quick Optical QR Scanner Trigger Button */}
        <button
          onClick={onOpenScanner}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <QrCode className="w-5 h-5" />
          Escanear Boleto / Check-in QR de Pasajero
        </button>
      </div>

      {/* Tab 1: Mi Viaje Activo & Bitácora de Tiempos */}
      {activeTab === 'trip' && (
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Card de Viaje Turístico Particular si aplica */}
          {(currentDriver.status === 'charter_service' || currentDriver.charterDetails) && (
            <div className="bg-linear-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-purple-500/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1.5">
                  <Palmtree className="w-3.5 h-3.5" /> Viaje Turístico Particular Asignado
                </span>
                <span className="text-xs font-black text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                  Fuera de Ruta Fija
                </span>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-black text-white">
                  {currentDriver.charterDetails?.destination || 'Servicio Turístico Contratado'}
                </h3>
                <p className="text-xs md:text-sm text-purple-200 mt-1">
                  Cliente Contratante: <strong>{currentDriver.charterDetails?.clientName}</strong> {currentDriver.charterDetails?.clientPhone && `• Tel: ${currentDriver.charterDetails.clientPhone}`}
                </p>
                <p className="text-xs text-purple-300 font-mono mt-1">
                  Fechas: {currentDriver.charterDetails?.startDate} al {currentDriver.charterDetails?.endDate}
                </p>
              </div>

              {currentDriver.charterDetails?.notes && (
                <div className="p-3 bg-white/10 rounded-2xl text-xs text-neutral-200 border border-white/10">
                  <span className="font-bold text-purple-200 uppercase text-[10px] block">Instrucciones:</span>
                  {currentDriver.charterDetails.notes}
                </div>
              )}
            </div>
          )}

          {/* Active Trip Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-black text-orange-600 uppercase tracking-wider">
                Servicio Asignado Hoy
              </span>
              <span className={`text-xs md:text-sm font-black px-3 py-1 rounded-full uppercase ${
                activeTrip.status === 'in_transit' ? 'bg-orange-100 text-orange-800' :
                activeTrip.status === 'boarding' ? 'bg-amber-100 text-amber-800' :
                activeTrip.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'
              }`}>
                {activeTrip.status.replace('_', ' ')}
              </span>
            </div>

            <div>
              <h4 className="text-lg md:text-xl font-black text-neutral-900">{activeTrip.routeTitle}</h4>
              <p className="text-sm md:text-base text-neutral-600 font-bold mt-1">Salida: {activeTrip.departureTime} ➔ Estimada: {activeTrip.estimatedArrival}</p>
            </div>

            {/* Passenger Boarding Counter */}
            <div className="bg-neutral-50 p-4 md:p-5 rounded-2xl border-2 border-neutral-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-neutral-500 uppercase tracking-wider">Pasajeros Abordados</p>
                <p className="text-xl md:text-2xl font-black text-neutral-900 mt-1">
                  {checkedInCount} <span className="text-sm font-bold text-neutral-400">/ {activeTrip.occupiedSeatsCount} reservados</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('manifest')}
                className="text-xs md:text-sm text-orange-600 font-black hover:underline cursor-pointer"
              >
                Ver Lista ➔
              </button>
            </div>

            {/* Fast Bitácora Timeline Buttons */}
            <div className="space-y-2 pt-3 border-t border-neutral-100">
              <p className="text-xs md:text-sm font-black text-neutral-600 uppercase tracking-wider">Control de Bitácora en Ruta</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updateTripStatus(activeTrip.id, 'boarding', 'Oficina Central Manzanillo')}
                  className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    activeTrip.status === 'boarding' ? 'bg-amber-500 text-white shadow-md' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  1. Abordaje
                </button>
                <button
                  onClick={() => updateTripStatus(activeTrip.id, 'in_transit', 'Escala Tecomán')}
                  className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    activeTrip.status === 'in_transit' ? 'bg-orange-600 text-white shadow-md' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  2. En Ruta
                </button>
                <button
                  onClick={() => updateTripStatus(activeTrip.id, 'completed', 'Destino Final Guadalajara')}
                  className={`py-3 px-2 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    activeTrip.status === 'completed' ? 'bg-emerald-600 text-white shadow-md' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  3. Finalizar
                </button>
              </div>
            </div>
          </div>

          {/* Quick Route Stops Checklist */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <span className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-900">
              Paradas y Escalas Autorizadas
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {routeStops.filter(s => s.isActive).slice(0, 6).map((stop, idx) => (
                <div key={stop.id} className="flex items-start justify-between gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-neutral-900 truncate">{stop.name}</p>
                      <p className="text-xs text-neutral-500 font-bold truncate">{stop.landmark} • +{stop.timeOffsetMins} min</p>
                    </div>
                  </div>
                  {stop.mapsUrl && (
                    <a 
                      href={stop.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-xs shrink-0 cursor-pointer"
                      title="Abrir en Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manifiesto Digital de Pasajeros */}
      {activeTab === 'manifest' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Manifiesto Digital de Pasaje</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Ordenado por punto de abordaje</p>
            </div>
            <span className="text-xs md:text-sm font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-xl">
              {checkedInCount} / {tripBookings.length} abordados
            </span>
          </div>

          <div className="space-y-3">
            {tripBookings.map(b => (
              <div
                key={b.id}
                className={`bg-white rounded-3xl p-5 border-2 transition-all ${
                  b.checkInStatus === 'checked_in' ? 'border-emerald-300 bg-emerald-50/20' : 'border-neutral-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                        Asiento #{b.seatNumbers.join(', #')}
                      </span>
                      <h4 className="text-base md:text-lg font-black text-neutral-900">{b.passengerName}</h4>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-600 mt-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-600" /> Sube en: <strong className="text-neutral-900">{b.boardingPoint}</strong>
                    </p>
                  </div>

                  {b.checkInStatus === 'checked_in' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full self-start">
                      <CheckCheck className="w-4 h-4" /> Abordó
                    </span>
                  ) : (
                    <button
                      onClick={() => checkInPassenger(b.id, 'Escala Móvil Chofer')}
                      className="text-xs md:text-sm font-black text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl shadow-md transition-all self-start cursor-pointer"
                    >
                      Marcar Abordaje
                    </button>
                  )}
                </div>

                {/* Contact phone button */}
                <div className="flex items-center justify-between border-t border-neutral-100 mt-3 pt-2 text-xs">
                  <a
                    href={`tel:${b.passengerPhone}`}
                    className="flex items-center gap-1.5 font-bold text-neutral-700 hover:text-orange-600"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" /> {b.passengerPhone}
                  </a>
                  <div className="flex items-center gap-2">
                    {b.addons.parcel && <span className="text-xs bg-orange-50 text-orange-800 px-2 py-0.5 rounded-md font-bold">📦 Paquetería</span>}
                    {b.addons.pet && <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold">🐾 Mascota</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Captura de Gastos en Ruta */}
      {activeTab === 'expenses' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Gastos Registrados en Ruta</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Ligados a {driverVehicle.unitNumber} • {activeTrip.id}</p>
            </div>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar Gasto
            </button>
          </div>

          {/* Expenses List */}
          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-white rounded-3xl p-4 md:p-5 border-2 border-neutral-200 shadow-xs flex items-center justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-neutral-100 text-neutral-700 shrink-0">
                    {exp.type === 'fuel' ? <Fuel className="w-5 h-5 text-amber-600" /> : <Receipt className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-black text-neutral-900 uppercase">
                      {exp.type === 'fuel' ? `Combustible / Diésel (${exp.liters} L)` : exp.type === 'toll' ? 'Caseta de Peaje' : 'Viáticos Operador'}
                    </p>
                    <p className="text-xs text-neutral-500 font-bold">{exp.location} • {exp.date.split(' ')[1] || ''}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base md:text-lg font-black text-neutral-900">${exp.amount} MXN</span>
                  <p className={`text-xs font-black ${
                    exp.status === 'approved' ? 'text-emerald-700' : 'text-orange-600'
                  }`}>
                    {exp.status === 'approved' ? 'Auditado' : 'Por auditar'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Bitácora de Tiempos & Puntos de Partida */}
      {activeTab === 'timeline' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-orange-600" /> Puntos de Partida & Navegación GPS
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 font-medium mt-0.5">
                  Ubicaciones oficiales de abordaje con coordenadas y enlaces directos a Google Maps para navegación móvil.
                </p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-full w-fit">
                {routeStops.filter(s => s.isActive).length} Puntos Activos
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {routeStops.filter(s => s.isActive).map((stop, idx) => (
                <div 
                  key={stop.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200 gap-3 hover:border-orange-400 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black uppercase bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md">
                        {stop.city}
                      </span>
                      <span className="text-xs font-bold text-neutral-500 font-mono">
                        +{stop.timeOffsetMins} min
                      </span>
                    </div>
                    <h4 className="text-sm md:text-base font-black text-neutral-900">
                      {stop.name}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      <span className="font-bold text-neutral-700">Ref:</span> {stop.landmark}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono">
                      {stop.address}
                    </p>
                  </div>

                  {stop.mapsUrl ? (
                    <a
                      href={stop.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Abrir en Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-neutral-400 italic px-3 py-1.5 bg-neutral-200/60 rounded-xl shrink-0">
                      Sin GPS Maps
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal to register new on-road expense */}
      {showExpenseForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="relative bg-white w-full max-w-sm sm:max-w-md my-auto rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-2 border-neutral-200 max-h-[90dvh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black uppercase text-neutral-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" /> Captura de Comprobante
              </h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-neutral-500 hover:text-black font-black text-lg p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Tipo de Gasto</label>
                <select
                  value={expenseType}
                  onChange={e => setExpenseType(e.target.value as any)}
                  className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm"
                >
                  <option value="fuel">Combustible (Gasolina / Diésel)</option>
                  <option value="toll">Casetas de Peaje / Autopista</option>
                  <option value="viatics">Viáticos / Alimentos Operador</option>
                  <option value="parking">Estacionamiento / Pensión</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Monto ($ MXN)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-black text-orange-600 text-sm"
                  />
                </div>
                {expenseType === 'fuel' && (
                  <div>
                    <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Litros Diésel</label>
                    <input
                      type="number"
                      step="0.1"
                      value={liters}
                      onChange={e => setLiters(e.target.value)}
                      className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Ubicación / Establecimiento</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm"
                />
              </div>

              {/* Photo attachment mockup */}
              <div className="p-3 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-orange-600" />
                  <span className="text-xs font-bold text-neutral-700">Foto de Ticket Adjunta</span>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-md">
                  ✓ Adjunto
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm shadow-md transition-colors cursor-pointer"
              >
                Guardar y Enviar a Finanzas
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
