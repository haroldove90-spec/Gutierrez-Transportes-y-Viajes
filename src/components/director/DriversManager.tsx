import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Bus, 
  Star, 
  BellRing, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { Driver } from '../../types';

export const DriversManager: React.FC = () => {
  const { 
    drivers, 
    vehicles, 
    addDriver, 
    updateDriver, 
    deleteDriver, 
    assignDriverToVehicle, 
    releaseDriverFromService,
    sendManualWakeUpAlarm 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'in_service' | 'charter_service' | 'resting'>('all');

  // Modal: Alta de Chofer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '2028-12-31',
    currentVehicleId: '',
    status: 'available' as Driver['status'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  // Modal: Edición de Chofer
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Filtered drivers list
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (driver.licenseNumber && driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = statusFilter === 'all' || driver.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  // Quick stats
  const stats = useMemo(() => {
    return {
      total: drivers.length,
      available: drivers.filter(d => d.status === 'available').length,
      inService: drivers.filter(d => d.status === 'in_service').length,
      charter: drivers.filter(d => d.status === 'charter_service').length,
      resting: drivers.filter(d => d.status === 'resting' || d.status === 'off_duty').length
    };
  }, [drivers]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.phone.trim()) return;

    addDriver({
      name: createForm.name.trim(),
      phone: createForm.phone.trim(),
      licenseNumber: createForm.licenseNumber.trim() || undefined,
      licenseExpiry: createForm.licenseExpiry || undefined,
      status: createForm.status,
      rating: 5.0,
      avatar: createForm.avatar,
      currentVehicleId: createForm.currentVehicleId || undefined
    });

    setCreateForm({
      name: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '2028-12-31',
      currentVehicleId: '',
      status: 'available',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    setShowCreateModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    updateDriver(editingDriver.id, {
      name: editingDriver.name,
      phone: editingDriver.phone,
      licenseNumber: editingDriver.licenseNumber,
      licenseExpiry: editingDriver.licenseExpiry,
      status: editingDriver.status
    });

    if (editingDriver.currentVehicleId) {
      assignDriverToVehicle(editingDriver.id, editingDriver.currentVehicleId, true);
    }

    setEditingDriver(null);
  };

  const handleDeleteDriver = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de dar de baja al chofer "${name}"? Se desvinculará de cualquier vehículo.`)) {
      deleteDriver(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-600">
              <Users className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">Padrón de Operadores</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mt-1">
              Control & Alta de Choferes
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-medium">
              Da de alta a nuevos operadores, gestiona sus licencias federales, estatus en tiempo real y asignación de flotilla.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-auto active:scale-98"
          >
            <UserPlus className="w-4 h-4" /> Dar de Alta Chofer
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6">
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
            <span className="text-[10px] uppercase font-black text-neutral-400">Total Choferes</span>
            <p className="text-xl md:text-2xl font-black text-neutral-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-black text-emerald-800">Disponibles</span>
            <p className="text-xl md:text-2xl font-black text-emerald-700 mt-0.5">{stats.available}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center">
            <span className="text-[10px] uppercase font-black text-blue-800">En Ruta Regular</span>
            <p className="text-xl md:text-2xl font-black text-blue-700 mt-0.5">{stats.inService}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center">
            <span className="text-[10px] uppercase font-black text-purple-800">En Tour Especial</span>
            <p className="text-xl md:text-2xl font-black text-purple-700 mt-0.5">{stats.charter}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <span className="text-[10px] uppercase font-black text-amber-800">De Descanso</span>
            <p className="text-xl md:text-2xl font-black text-amber-700 mt-0.5">{stats.resting}</p>
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
            placeholder="Buscar por nombre, tel o licencia..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-xs md:text-sm font-bold text-neutral-900 focus:outline-none focus:border-orange-500"
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
            Todos ({drivers.length})
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'available' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Disponibles ({stats.available})
          </button>
          <button
            onClick={() => setStatusFilter('in_service')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'in_service' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            En Servicio ({stats.inService})
          </button>
          <button
            onClick={() => setStatusFilter('charter_service')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'charter_service' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Tours ({stats.charter})
          </button>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrivers.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-neutral-200 space-y-2">
            <Users className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-base font-black text-neutral-700">No se encontraron choferes con los filtros actuales</p>
            <p className="text-xs text-neutral-400">Prueba cambiando la búsqueda o da de alta a un nuevo chofer.</p>
          </div>
        ) : (
          filteredDrivers.map(driver => {
            const assignedVehicle = vehicles.find(v => v.id === driver.currentVehicleId);
            const isAvailable = driver.status === 'available';
            const isCharter = driver.status === 'charter_service';
            const isInService = driver.status === 'in_service';

            return (
              <div 
                key={driver.id} 
                className="bg-white rounded-3xl p-5 md:p-6 border-2 border-neutral-200 shadow-xs hover:border-neutral-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={driver.avatar} 
                        alt={driver.name} 
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-neutral-200 shrink-0"
                      />
                      <div>
                        <h3 className="text-base font-black text-neutral-900 leading-tight">
                          {driver.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-black mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{driver.rating || 5.0}</span>
                          <span className="text-neutral-400 font-normal">/ 5.0</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border shrink-0 ${
                      isAvailable 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : isCharter 
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : isInService
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}>
                      {isAvailable ? '✓ Disponible' : isCharter ? '🌴 En Tour' : isInService ? '🚌 En Ruta' : 'Descanso'}
                    </span>
                  </div>

                  {/* Contact & License Info */}
                  <div className="space-y-2 mt-4 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <span className="text-neutral-500 font-bold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Teléfono:
                      </span>
                      <a 
                        href={`tel:${driver.phone}`} 
                        className="font-black text-neutral-900 hover:text-orange-600 transition-colors"
                      >
                        {driver.phone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <span className="text-neutral-500 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Licencia Federal:
                      </span>
                      <span className="font-mono font-black text-neutral-900">
                        {driver.licenseNumber || 'Sin registrar'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                      <span className="text-neutral-500 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" /> Vigencia Licencia:
                      </span>
                      <span className="font-bold text-neutral-800">
                        {driver.licenseExpiry || '2028-12-31'}
                      </span>
                    </div>

                    {/* Assigned Vehicle */}
                    <div className="p-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                      <span className="text-[10px] text-neutral-400 uppercase font-black block">Unidad Asignada:</span>
                      {assignedVehicle ? (
                        <div className="flex items-center justify-between mt-1">
                          <div>
                            <p className="font-black text-xs md:text-sm text-neutral-900">{assignedVehicle.unitNumber} ({assignedVehicle.model})</p>
                            <p className="text-[10px] text-neutral-500 font-mono font-bold">Placa: {assignedVehicle.plate}</p>
                          </div>
                          <button
                            onClick={() => releaseDriverFromService(driver.id, 'Liberación administrativa')}
                            className="text-[11px] font-black text-orange-600 hover:text-orange-800 hover:underline cursor-pointer"
                          >
                            Liberar
                          </button>
                        </div>
                      ) : (
                        <p className="font-bold text-xs text-neutral-400 italic mt-0.5">
                          Sin unidad asignada actualmente (en base)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => sendManualWakeUpAlarm(driver.id, undefined, '¡Operador, recordatorio de guardia / turno por parte de Dirección!')}
                    className="p-2 bg-neutral-100 hover:bg-orange-50 hover:text-orange-600 text-neutral-700 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1 border border-neutral-200"
                    title="Enviar alarma / despertador sonoro al chofer"
                  >
                    <BellRing className="w-3.5 h-3.5 text-orange-500" /> Alarma
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingDriver(driver)}
                      className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors cursor-pointer"
                      title="Editar chofer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver.id, driver.name)}
                      className="p-2 bg-neutral-100 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Dar de baja chofer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Dar de Alta Chofer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border-2 border-neutral-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Dar de Alta a Nuevo Chofer</h3>
                <p className="text-xs text-neutral-500 font-medium">Registra los datos oficiales del operador</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-800 font-black text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-black text-neutral-700 mb-1">Nombre Completo del Operador</label>
                <input 
                  type="text"
                  placeholder="Ej. Juan Carlos Ramos Solís"
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Teléfono Móvil / WhatsApp</label>
                  <input 
                    type="tel"
                    placeholder="+52 314 123 4567"
                    value={createForm.phone}
                    onChange={e => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Número de Licencia</label>
                  <input 
                    type="text"
                    placeholder="LIC-FED-78291"
                    value={createForm.licenseNumber}
                    onChange={e => setCreateForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Vigencia de Licencia</label>
                  <input 
                    type="date"
                    value={createForm.licenseExpiry}
                    onChange={e => setCreateForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Estatus Inicial</label>
                  <select
                    value={createForm.status}
                    onChange={e => setCreateForm(prev => ({ ...prev, status: e.target.value as Driver['status'] }))}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  >
                    <option value="available">Disponible</option>
                    <option value="resting">En Descanso</option>
                    <option value="in_service">En Servicio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-neutral-700 mb-1">Asignar Unidad Inicial (Opcional)</label>
                <select
                  value={createForm.currentVehicleId}
                  onChange={e => setCreateForm(prev => ({ ...prev, currentVehicleId: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                >
                  <option value="">Sin unidad asignada (Disponible en base)</option>
                  {vehicles.filter(v => v.status !== 'maintenance').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.unitNumber} ({v.model} - {v.capacity} pl.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black text-neutral-700 mb-1">URL Avatar / Foto de Perfil</label>
                <input 
                  type="url"
                  value={createForm.avatar}
                  onChange={e => setCreateForm(prev => ({ ...prev, avatar: e.target.value }))}
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 text-xs"
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
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-lg cursor-pointer transition-all active:scale-98"
                >
                  Guardar y Dar de Alta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Chofer */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border-2 border-neutral-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Editar Datos del Chofer</h3>
                <p className="text-xs text-neutral-500 font-medium">{editingDriver.name}</p>
              </div>
              <button 
                onClick={() => setEditingDriver(null)}
                className="text-neutral-400 hover:text-neutral-800 font-black text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-black text-neutral-700 mb-1">Nombre Completo</label>
                <input 
                  type="text"
                  value={editingDriver.name}
                  onChange={e => setEditingDriver(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  required
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Teléfono</label>
                  <input 
                    type="tel"
                    value={editingDriver.phone}
                    onChange={e => setEditingDriver(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    required
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Licencia Federal</label>
                  <input 
                    type="text"
                    value={editingDriver.licenseNumber || ''}
                    onChange={e => setEditingDriver(prev => prev ? ({ ...prev, licenseNumber: e.target.value }) : null)}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-neutral-700 mb-1">Vigencia</label>
                  <input 
                    type="date"
                    value={editingDriver.licenseExpiry || ''}
                    onChange={e => setEditingDriver(prev => prev ? ({ ...prev, licenseExpiry: e.target.value }) : null)}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-neutral-700 mb-1">Estatus</label>
                  <select
                    value={editingDriver.status}
                    onChange={e => setEditingDriver(prev => prev ? ({ ...prev, status: e.target.value as Driver['status'] }) : null)}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                  >
                    <option value="available">Disponible</option>
                    <option value="in_service">En Ruta Regular</option>
                    <option value="charter_service">En Tour Turístico</option>
                    <option value="resting">En Descanso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-neutral-700 mb-1">Unidad Asignada</label>
                <select
                  value={editingDriver.currentVehicleId || ''}
                  onChange={e => setEditingDriver(prev => prev ? ({ ...prev, currentVehicleId: e.target.value }) : null)}
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-bold text-neutral-900"
                >
                  <option value="">Sin unidad asignada</option>
                  {vehicles.filter(v => v.status !== 'maintenance').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.unitNumber} ({v.model} - {v.capacity} pl.)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="px-5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-black cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-lg cursor-pointer transition-all active:scale-98"
                >
                  Actualizar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
