import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Palmtree, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Bus, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  BellRing,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { CharterAssignment } from '../../types';

export const ToursManager: React.FC = () => {
  const { 
    charterAssignments, 
    vehicles, 
    drivers, 
    assignDriverToCharter, 
    completeCharterAssignment,
    sendManualWakeUpAlarm 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form for new tour registration
  const todayStr = new Date().toISOString().substring(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10);

  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    origin: 'Colima / Manzanillo',
    destination: '',
    startDate: todayStr,
    startTime: '08:00 AM',
    endDate: tomorrowStr,
    returnTime: '20:00 PM',
    unitNumber: vehicles[0]?.unitNumber || '',
    vehicleId: vehicles[0]?.id || '',
    driverName: drivers[0]?.name || '',
    driverId: drivers[0]?.id || '',
    totalAmount: 18500,
    notes: ''
  });

  // Filtered tours
  const filteredTours = useMemo(() => {
    return charterAssignments.filter(tour => {
      const matchSearch = tour.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || tour.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [charterAssignments, searchTerm, statusFilter]);

  // Quick stats
  const stats = useMemo(() => {
    return {
      total: charterAssignments.length,
      active: charterAssignments.filter(t => t.status === 'active').length,
      upcoming: charterAssignments.filter(t => t.status === 'upcoming').length,
      completed: charterAssignments.filter(t => t.status === 'completed').length,
      totalRevenue: charterAssignments.reduce((acc, t) => acc + (t.totalAmount || 0), 0)
    };
  }, [charterAssignments]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.destination || !form.vehicleId || !form.driverId) return;

    const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);
    const selectedDriver = drivers.find(d => d.id === form.driverId);

    assignDriverToCharter({
      driverId: form.driverId,
      driverName: selectedDriver?.name || form.driverName,
      unitNumber: selectedVehicle?.unitNumber || form.unitNumber,
      vehicleId: form.vehicleId,
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      origin: form.origin,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime,
      returnTime: form.returnTime,
      totalAmount: Number(form.totalAmount),
      notes: form.notes
    });

    setShowCreateModal(false);
    setForm({
      clientName: '',
      clientPhone: '',
      origin: 'Colima / Manzanillo',
      destination: '',
      startDate: todayStr,
      startTime: '08:00 AM',
      endDate: tomorrowStr,
      returnTime: '20:00 PM',
      unitNumber: vehicles[0]?.unitNumber || '',
      vehicleId: vehicles[0]?.id || '',
      driverName: drivers[0]?.name || '',
      driverId: drivers[0]?.id || '',
      totalAmount: 18500,
      notes: ''
    });
  };

  const handleCompleteTour = (tourId: string, folio: string) => {
    if (window.confirm(`¿Confirmas finalizar el tour ${folio}? Esto liberará la unidad y al chofer para nuevos servicios en flotilla.`)) {
      completeCharterAssignment(tourId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-600">
              <Palmtree className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">Fletamentos & Turismo</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mt-1">
              Registro & Control de Tours
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-medium">
              Registra viajes turísticos especiales, bloquea unidades en exclusiva y asigna operadores responsables.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4" /> Registrar Nuevo Tour
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center">
            <span className="text-[10px] uppercase font-black text-purple-800">Tours en Curso</span>
            <p className="text-xl md:text-2xl font-black text-purple-700 mt-0.5">{stats.active}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center">
            <span className="text-[10px] uppercase font-black text-blue-800">Próximos Programados</span>
            <p className="text-xl md:text-2xl font-black text-blue-700 mt-0.5">{stats.upcoming}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-black text-emerald-800">Completados</span>
            <p className="text-xl md:text-2xl font-black text-emerald-700 mt-0.5">{stats.completed}</p>
          </div>
          <div className="p-3 bg-neutral-900 text-white rounded-2xl text-center">
            <span className="text-[10px] uppercase font-black text-purple-300">Ingresos Totales Tours</span>
            <p className="text-xl md:text-2xl font-black text-white mt-0.5">${stats.totalRevenue.toLocaleString()} MXN</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por destino, cliente, folio o chofer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-xs md:text-sm font-bold text-neutral-900 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todos ({charterAssignments.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'active' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            En Curso ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Programados ({stats.upcoming})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Completados ({stats.completed})
          </button>
        </div>
      </div>

      {/* Tours Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTours.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-neutral-200 space-y-2">
            <Palmtree className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-base font-black text-neutral-700">No hay tours registrados con los filtros seleccionados</p>
            <p className="text-xs text-neutral-400">Registra un nuevo tour turístico o viaje especial para clientes privados.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Registrar Tour
            </button>
          </div>
        ) : (
          filteredTours.map(tour => {
            const isActive = tour.status === 'active';
            const isCompleted = tour.status === 'completed';

            return (
              <div 
                key={tour.id} 
                className={`bg-white rounded-3xl p-6 border-2 shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                  isActive ? 'border-purple-300 bg-purple-50/20' : 'border-neutral-200'
                }`}
              >
                <div>
                  {/* Top Header: Folio, Status Badge & Price */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          {tour.folio}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isActive 
                            ? 'bg-purple-600 text-white animate-pulse' 
                            : isCompleted 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isActive ? '🌴 En Curso' : isCompleted ? '✓ Finalizado' : 'Próximo'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-neutral-900 mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                        {tour.origin} ➔ {tour.destination}
                      </h3>
                      <p className="text-xs text-neutral-500 font-bold">
                        Cliente / Grupo: <span className="text-neutral-800 font-black">{tour.clientName}</span>
                        {tour.clientPhone && ` • Tel: ${tour.clientPhone}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Tarifa Contrato</span>
                      <span className="text-base md:text-lg font-black text-neutral-900">
                        ${tour.totalAmount.toLocaleString()} MXN
                      </span>
                    </div>
                  </div>

                  {/* Dates & Schedule */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Salida:</span>
                      <p className="font-black text-neutral-900">{tour.startDate}</p>
                      <p className="text-neutral-500 font-bold">{tour.startTime || '08:00 AM'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Regreso Programado:</span>
                      <p className="font-black text-neutral-900">{tour.endDate}</p>
                      <p className="text-neutral-500 font-bold">{tour.returnTime || '20:00 PM'}</p>
                    </div>
                  </div>

                  {/* Assigned Resources: Unit & Driver */}
                  <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Unidad Bloqueada:</span>
                      <p className="font-black text-neutral-900 flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-purple-600" /> {tour.unitNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Operador Responsable:</span>
                      <p className="font-black text-neutral-900 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-orange-600" /> {tour.driverName}
                      </p>
                    </div>
                  </div>

                  {/* Notes / Itinerary */}
                  {tour.notes && (
                    <div className="mt-2 p-2.5 bg-neutral-50 rounded-xl text-xs text-neutral-600 italic">
                      <span className="font-black not-italic text-neutral-700">Itinerario/Notas: </span>
                      {tour.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => sendManualWakeUpAlarm(tour.driverId, tour.id, `Tour ${tour.folio} hacia ${tour.destination}. Salida: ${tour.startDate} a las ${tour.startTime}`)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-purple-50 hover:text-purple-700 text-neutral-700 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1 border border-neutral-200"
                    title="Enviar recordatorio sonoro al chofer"
                  >
                    <BellRing className="w-3.5 h-3.5 text-purple-600" /> Recordar al Chofer
                  </button>

                  {!isCompleted && (
                    <button
                      onClick={() => handleCompleteTour(tour.id, tour.folio)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar & Liberar Flotilla
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Registrar Nuevo Tour */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border-2 border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Registrar Nuevo Tour o Viaje Especial</h3>
                <p className="text-xs text-neutral-500 font-medium">Contrato particular con bloqueo de unidad y asignación de chofer</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-800 font-black text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Nombre del Cliente o Grupo</label>
                  <input 
                    type="text"
                    placeholder="Ej. Familia Martínez / Excursión Mazamitla"
                    value={form.clientName}
                    onChange={e => setForm(prev => ({ ...prev, clientName: e.target.value }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Teléfono Móvil del Cliente</label>
                  <input 
                    type="tel"
                    placeholder="+52 314 987 6543"
                    value={form.clientPhone}
                    onChange={e => setForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Origen</label>
                  <input 
                    type="text"
                    value={form.origin}
                    onChange={e => setForm(prev => ({ ...prev, origin: e.target.value }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Destino del Tour</label>
                  <input 
                    type="text"
                    placeholder="Ej. Mazamitla / Puerto Vallarta / Tapalpa"
                    value={form.destination}
                    onChange={e => setForm(prev => ({ ...prev, destination: e.target.value }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Fecha Salida</label>
                  <input 
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Hora Salida</label>
                  <input 
                    type="text"
                    placeholder="08:00 AM"
                    value={form.startTime}
                    onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Fecha Regreso</label>
                  <input 
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Hora Regreso</label>
                  <input 
                    type="text"
                    placeholder="20:00 PM"
                    value={form.returnTime}
                    onChange={e => setForm(prev => ({ ...prev, returnTime: e.target.value }))}
                    className="w-full p-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Unidad a Bloquear para el Tour</label>
                  <select
                    value={form.vehicleId}
                    onChange={e => setForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  >
                    {vehicles.filter(v => v.status !== 'maintenance').map(v => (
                      <option key={v.id} value={v.id}>
                        {v.unitNumber} ({v.model} - {v.capacity} pl.) {v.status === 'tour_contract' ? '[En Tour]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Chofer / Operador Responsable</label>
                  <select
                    value={form.driverId}
                    onChange={e => setForm(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.status === 'available' ? '(Disponible)' : `(${d.status})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-neutral-700 mb-1">Monto Total del Contrato ($ MXN)</label>
                <input 
                  type="number"
                  value={form.totalAmount}
                  onChange={e => setForm(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                  required
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-black text-neutral-700 mb-1">Notas del Itinerario y Paradas</label>
                <textarea 
                  rows={2}
                  placeholder="Ej. Parada en restaurante de Tapalpa, espera en Hotel Cabañas del Bosque, regreso domingo 8 PM."
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-black cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black shadow-lg cursor-pointer transition-all active:scale-98"
                >
                  Registrar Tour & Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
