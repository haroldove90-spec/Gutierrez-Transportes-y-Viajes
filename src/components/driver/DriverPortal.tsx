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
  CheckCheck
} from 'lucide-react';
import { ROUTE_STOPS } from '../../data/mockData';
import { TripExpense } from '../../types';

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
    addExpense, 
    updateTripStatus, 
    checkInPassenger, 
    showNotification 
  } = useApp();

  // Current logged in driver for demo
  const currentDriver = drivers[0]; // Carlos Mendoza
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
      {/* Top Driver Status Bar */}
      <div className="max-w-5xl mx-auto w-full bg-black text-white p-5 md:p-6 rounded-3xl border-2 border-neutral-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentDriver.avatar}
              alt={currentDriver.name}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
            />
            <div>
              <h3 className="text-base md:text-lg font-black text-white leading-tight">{currentDriver.name}</h3>
              <p className="text-xs md:text-sm text-neutral-400 font-mono mt-0.5">Lic. Federal {currentDriver.licenseNumber}</p>
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
              {ROUTE_STOPS.slice(0, 6).map((stop, idx) => (
                <div key={stop.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-neutral-900">{stop.name}</p>
                    <p className="text-xs text-neutral-500 font-bold">{stop.landmark} • +{stop.timeOffsetMins} min</p>
                  </div>
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

      {/* Tab 4: Bitácora de Tiempos */}
      {activeTab === 'timeline' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" /> Registro Forense de Horarios
            </h3>
            <p className="text-sm text-neutral-600 font-medium">
              Registros geolocalizados para control operativo y puntualidad de itinerarios.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="text-sm md:text-base font-black text-neutral-800">Salida Manzanillo</span>
                <span className="text-sm md:text-base font-mono font-black text-emerald-700">06:32 AM (A tiempo)</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="text-sm md:text-base font-black text-neutral-800">Escala Tecomán Kiosko</span>
                <span className="text-sm md:text-base font-mono font-black text-emerald-700">07:28 AM</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="text-sm md:text-base font-black text-neutral-800">Escala Colima San Fernando</span>
                <span className="text-sm md:text-base font-mono font-black text-orange-600">08:35 AM (En curso)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to register new on-road expense */}
      {showExpenseForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-neutral-200">
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
