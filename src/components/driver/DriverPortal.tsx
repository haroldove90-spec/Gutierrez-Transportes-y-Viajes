import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  User,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Save,
  X
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
    updateDriver,
    showNotification,
    driverAlarms,
    activeAlarm,
    soundPermissionGranted,
    requestSoundAndNotificationPermission,
    playAlarmSoundTest
  } = useApp();

  // Current logged in driver with persistence
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gutierrez_driver_id_v1');
      if (saved && drivers.some(d => d.id === saved)) return saved;
    } catch {}
    return drivers[0]?.id || 'drv-01';
  });

  useEffect(() => {
    try {
      localStorage.setItem('gutierrez_driver_id_v1', selectedDriverId);
    } catch {}
  }, [selectedDriverId]);
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

  // Driver Profile editing state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentDriver?.name || '',
    phone: currentDriver?.phone || '',
    licenseNumber: currentDriver?.licenseNumber || '',
    licenseExpiry: currentDriver?.licenseExpiry || '2028-12-31',
    avatar: currentDriver?.avatar || ''
  });

  // Sync profile form when currentDriver changes
  useEffect(() => {
    if (currentDriver) {
      setProfileForm({
        name: currentDriver.name,
        phone: currentDriver.phone,
        licenseNumber: currentDriver.licenseNumber || '',
        licenseExpiry: currentDriver.licenseExpiry || '2028-12-31',
        avatar: currentDriver.avatar
      });
    }
  }, [currentDriver?.id]);

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('La fotografía no debe superar los 5MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProfileForm(prev => ({ ...prev, avatar: result }));
        showNotification('Fotografía seleccionada correctamente.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.phone.trim()) {
      showNotification('Nombre y teléfono son obligatorios.', 'error');
      return;
    }

    updateDriver(currentDriver.id, {
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      licenseNumber: profileForm.licenseNumber.trim() || undefined,
      licenseExpiry: profileForm.licenseExpiry || undefined,
      avatar: profileForm.avatar
    });

    showNotification('¡Tus datos personales y foto de perfil han sido actualizados con éxito!', 'success');
    setShowProfileModal(false);
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
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <a 
                  href={`tel:${currentDriver.phone.replace(/[\s+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800/90 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 rounded-lg border border-neutral-700/70 transition-colors text-xs font-mono"
                  title="Llamar o contactar al chofer"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold">{currentDriver.phone}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-600/30 hover:bg-orange-600 text-orange-200 hover:text-white rounded-lg border border-orange-500/40 transition-colors text-xs font-black cursor-pointer shadow-xs active:scale-95"
                  title="Ver y actualizar foto y datos del chofer"
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Mi Perfil & Foto</span>
                </button>
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

      {/* Tab 5: Mi Perfil & Foto del Chofer */}
      {activeTab === 'profile' && (
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-5 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                  Credencial del Operador
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
                  Mi Perfil & Datos Personales
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                  Actualiza tu fotografía y tus datos de contacto registrados en el sistema
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                currentDriver.status === 'available'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : currentDriver.status === 'in_service' || currentDriver.status === 'charter_service'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {currentDriver.status === 'available' ? '✓ Disponible' : currentDriver.status === 'in_service' ? 'En Servicio' : currentDriver.status === 'charter_service' ? 'En Tour' : 'En Descanso'}
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-6 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-300">
                <div className="relative group shrink-0">
                  <img
                    src={profileForm.avatar || currentDriver.avatar}
                    alt={profileForm.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute -bottom-2 -right-2 p-2 bg-orange-600 text-white rounded-full shadow-lg border-2 border-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-black text-neutral-900">
                    Fotografía del Chofer
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">
                    Sube una foto clara y de frente para que los pasajeros y la administración puedan identificarte con facilidad.
                  </p>
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-all active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>Subir Nueva Fotografía</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-neutral-400 font-bold mt-1.5">
                      Formatos: JPG, PNG, WEBP (Máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Data Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5">
                    Nombre Completo del Operador *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-sm focus:border-orange-600 focus:outline-none"
                    placeholder="Ej. Juan Pérez García"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5">
                    Teléfono Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-sm focus:border-orange-600 focus:outline-none"
                    placeholder="Ej. +52 312 555 0192"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5">
                    Número de Licencia Federal
                  </label>
                  <input
                    type="text"
                    value={profileForm.licenseNumber}
                    onChange={e => setProfileForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-sm focus:border-orange-600 focus:outline-none"
                    placeholder="Ej. FED-998822-B"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1.5">
                    Fecha de Vencimiento de Licencia
                  </label>
                  <input
                    type="date"
                    value={profileForm.licenseExpiry}
                    onChange={e => setProfileForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                    className="w-full p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-sm focus:border-orange-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Assignment & Fleet Info (Read-only badges) */}
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-orange-600" />
                  <span className="font-bold text-neutral-700">Unidad de Flotilla Asignada:</span>
                  <span className="font-black text-orange-600">Unidad {driverVehicle.unitNumber} ({driverVehicle.model})</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-neutral-700">Calificación del Conductor:</span>
                  <span className="font-black text-neutral-900">⭐ {currentDriver.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios en Mi Perfil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Modal: Ver y Editar Perfil y Fotografía */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-2 border-neutral-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900">
                    Mi Perfil & Fotografía
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-500 font-medium">
                    Actualiza tu foto de identificación y datos de contacto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
                {/* Photo Upload Box */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-300">
                  <img
                    src={profileForm.avatar || currentDriver.avatar}
                    alt={profileForm.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-orange-500 shadow-md shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                      Fotografía del Operador
                    </h4>
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Fotografía</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-neutral-400 font-bold">
                      JPG, PNG, WEBP (cámara o galería)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-xs sm:text-sm focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-xs sm:text-sm focus:border-orange-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                      Licencia Federal
                    </label>
                    <input
                      type="text"
                      value={profileForm.licenseNumber}
                      onChange={e => setProfileForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-xs sm:text-sm focus:border-orange-600 focus:outline-none"
                      placeholder="Ej. FED-8822"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                      Vigencia
                    </label>
                    <input
                      type="date"
                      value={profileForm.licenseExpiry}
                      onChange={e => setProfileForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                      className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-xs sm:text-sm focus:border-orange-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-neutral-100 shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-black text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Perfil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to register new on-road expense */}
      {showExpenseForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="relative bg-white w-full max-w-sm sm:max-w-md my-auto rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border-2 border-neutral-200 max-h-[92dvh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 shrink-0">
              <h3 className="text-base font-black uppercase text-neutral-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" /> Captura de Comprobante
              </h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-neutral-500 hover:text-black font-black text-lg p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="flex-1 overflow-y-auto min-h-0 space-y-3">
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
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm shadow-md transition-colors cursor-pointer shrink-0 mt-2"
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
