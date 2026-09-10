import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, 
  Wrench, 
  FileSpreadsheet, 
  Map, 
  ShieldAlert, 
  Printer, 
  Gauge, 
  UserCheck,
  CalendarDays,
  Palmtree,
  ArrowRight,
  Plus,
  Edit3,
  Trash2,
  X,
  Car,
  Truck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { RouteLocationsManager } from '../common/RouteLocationsManager';
import { DriverAssignmentsSchedule } from './DriverAssignmentsSchedule';
import { Vehicle, VehicleCategory } from '../../types';

interface OperationsPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const OperationsPortal: React.FC<OperationsPortalProps> = ({ activeTab, setActiveTab }) => {
  const { 
    vehicles, 
    drivers, 
    trips, 
    bookings, 
    addVehicle,
    updateVehicle,
    deleteVehicle,
    toggleVehicleMaintenance, 
    assignDriverToVehicle 
  } = useApp();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[1]?.id || '');
  const [selectedTripForManifest, setSelectedTripForManifest] = useState<string>(trips[0]?.id || '');

  // Category filter for fleet view
  const [fleetCategoryFilter, setFleetCategoryFilter] = useState<'all' | VehicleCategory>('all');

  // Modal para Alta / Edición de Unidades
  const [showVehicleModal, setShowVehicleModal] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<{
    unitNumber: string;
    model: string;
    plate: string;
    capacity: number;
    category: VehicleCategory;
    odometer: number;
    nextServiceKm: number;
    image: string;
  }>({
    unitNumber: '',
    model: '',
    plate: '',
    capacity: 14,
    category: 'van',
    odometer: 0,
    nextServiceKm: 10000,
    image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png'
  });

  const activeTrip = trips.find(t => t.id === selectedTripForManifest) || trips[0];
  const manifestPassengers = bookings.filter(b => b.tripId === activeTrip.id);

  const handleAssignDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    assignDriverToVehicle(selectedDriverId, selectedVehicleId, true);
  };

  const handleOpenAddVehicle = (defaultCategory: VehicleCategory = 'van') => {
    setEditingVehicle(null);
    const presets: Record<VehicleCategory, { img: string; capacity: number; model: string; namePrefix: string }> = {
      van: {
        img: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png',
        capacity: 14,
        model: 'Toyota Hiace Commuter',
        namePrefix: 'Unidad '
      },
      auto: {
        img: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/vento.png',
        capacity: 5,
        model: 'VW Vento / Jetta',
        namePrefix: 'Auto '
      },
      camion: {
        img: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/l200mitsubishi.png',
        capacity: 3,
        model: 'Camión de Carga 3.5 Ton',
        namePrefix: 'Camión '
      },
      autobus: {
        img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60',
        capacity: 45,
        model: 'Irizar i6 / Scania K440',
        namePrefix: 'Autobús '
      }
    };

    const preset = presets[defaultCategory];
    setVehicleForm({
      unitNumber: `${preset.namePrefix}${vehicles.length + 1}`,
      model: preset.model,
      plate: `GT-${Math.floor(100 + Math.random() * 900)}-${defaultCategory.toUpperCase().substring(0, 2)}`,
      capacity: preset.capacity,
      category: defaultCategory,
      odometer: 15000,
      nextServiceKm: 25000,
      image: preset.img
    });
    setShowVehicleModal(true);
  };

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setVehicleForm({
      unitNumber: v.unitNumber,
      model: v.model,
      plate: v.plate,
      capacity: v.capacity,
      category: v.category || 'van',
      odometer: v.odometer,
      nextServiceKm: v.nextServiceKm,
      image: v.image || ''
    });
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.unitNumber.trim() || !vehicleForm.model.trim()) return;

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        unitNumber: vehicleForm.unitNumber.trim(),
        model: vehicleForm.model.trim(),
        plate: vehicleForm.plate.trim(),
        capacity: Number(vehicleForm.capacity),
        category: vehicleForm.category,
        odometer: Number(vehicleForm.odometer),
        nextServiceKm: Number(vehicleForm.nextServiceKm),
        image: vehicleForm.image.trim() || undefined
      });
    } else {
      addVehicle({
        unitNumber: vehicleForm.unitNumber.trim(),
        model: vehicleForm.model.trim(),
        plate: vehicleForm.plate.trim(),
        capacity: Number(vehicleForm.capacity),
        category: vehicleForm.category,
        status: 'active',
        odometer: Number(vehicleForm.odometer),
        nextServiceKm: Number(vehicleForm.nextServiceKm),
        image: vehicleForm.image.trim() || undefined
      });
    }
    setShowVehicleModal(false);
  };

  const filteredVehicles = vehicles.filter(v => {
    if (fleetCategoryFilter === 'all') return true;
    return (v.category || 'van') === fleetCategoryFilter;
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Tab: Agenda de Servicios, Choferes y Viajes Particulares */}
      {activeTab === 'charter_schedule' && (
        <div className="max-w-6xl mx-auto w-full">
          <DriverAssignmentsSchedule />
        </div>
      )}

      {/* Tab 1: Despacho & Asignación de Recursos */}
      {activeTab === 'dispatch' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Banner de Acceso Rápido a la Agenda de Viajes Turísticos y Reasignación */}
          <div className="bg-linear-to-r from-purple-900 to-neutral-900 rounded-3xl p-5 md:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Nuevo Módulo
              </span>
              <h4 className="text-base md:text-lg font-black flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-300" /> Agenda de Operadores & Bloqueo por Viajes Particulares
              </h4>
              <p className="text-xs text-neutral-300 max-w-xl">
                ¿Vas a cambiar el servicio a un chofer o asignar una unidad a contratación particular para que no venda boletos de ruta? Usa la agenda con desbloqueo directo.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('charter_schedule')}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl text-xs md:text-sm font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              Abrir Agenda <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-sm md:text-base font-black text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-5 h-5" /> Despacho & Asignación de Recursos
              </span>
              <span className="text-xs md:text-sm bg-neutral-900 text-white font-black px-3 py-1 rounded-full">
                Control Anti-Colisión
              </span>
            </div>

            <form onSubmit={handleAssignDispatch} className="space-y-4 text-sm">
              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Seleccionar Unidad</label>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm md:text-base"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.unitNumber} - {v.model} ({v.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Seleccionar Conductor Certificado</label>
                <select
                  value={selectedDriverId}
                  onChange={e => setSelectedDriverId(e.target.value)}
                  className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm md:text-base"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} • Cel: {d.phone} ({d.status === 'available' ? 'Disponible' : 'En servicio'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm md:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <UserCheck className="w-5 h-5" /> Asignar y Validar Agenda
              </button>
            </form>
          </div>

          {/* Active Fleet Map / Status */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-neutral-200 shadow-xs">
              <div>
                <h4 className="text-base font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <Bus className="w-5 h-5 text-orange-600" />
                  Control de Flotilla y Clasificación ({vehicles.length} unidades)
                </h4>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Visualiza y clasifica camionetas vans, autos sedán, camiones y autobuses foráneos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddVehicle('van')}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs md:text-sm font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Dar de Alta Unidad (+)
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFleetCategoryFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  fleetCategoryFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                Todas ({vehicles.length})
              </button>
              <button
                type="button"
                onClick={() => setFleetCategoryFilter('van')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  fleetCategoryFilter === 'van'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                🚐 Vans ({vehicles.filter(v => (v.category || 'van') === 'van').length})
              </button>
              <button
                type="button"
                onClick={() => setFleetCategoryFilter('auto')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  fleetCategoryFilter === 'auto'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                🚗 Autos / Sedán ({vehicles.filter(v => v.category === 'auto').length})
              </button>
              <button
                type="button"
                onClick={() => setFleetCategoryFilter('camion')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  fleetCategoryFilter === 'camion'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                🚚 Camiones ({vehicles.filter(v => v.category === 'camion').length})
              </button>
              <button
                type="button"
                onClick={() => setFleetCategoryFilter('autobus')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  fleetCategoryFilter === 'autobus'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                🚌 Autobuses ({vehicles.filter(v => v.category === 'autobus').length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredVehicles.map(v => {
                const category = v.category || 'van';
                return (
                  <div key={v.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {v.image && (
                          <img 
                            src={v.image} 
                            alt={v.unitNumber} 
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shrink-0 bg-neutral-100" 
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-base md:text-lg text-neutral-900">{v.unitNumber}</span>
                            <span className="text-xs text-neutral-500 font-mono font-bold">Placas {v.plate}</span>
                          </div>
                          
                          {/* Classification Pill */}
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              category === 'auto' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              category === 'camion' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              category === 'autobus' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                              'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {category === 'auto' ? '🚗 Auto / Sedán' :
                               category === 'camion' ? '🚚 Camión' :
                               category === 'autobus' ? '🚌 Autobús' :
                               '🚐 Van de Pasajeros'}
                            </span>
                            <span className="text-xs text-neutral-600 font-semibold">• {v.capacity} Pax</span>
                          </div>

                          <p className="text-xs md:text-sm text-neutral-600 mt-0.5 truncate">{v.model}</p>
                          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">Odómetro: {v.odometer.toLocaleString()} km</p>
                        </div>
                      </div>

                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase shrink-0 ${
                        v.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        v.status === 'in_route' ? 'bg-orange-100 text-orange-800' :
                        v.status === 'maintenance' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {v.status === 'active' ? '🟢 Disponible' :
                         v.status === 'maintenance' ? '🔧 Taller' :
                         v.status === 'tour_contract' ? '🌴 En Tour' : v.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Quick Unit Card Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditVehicle(v)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Dar de baja la unidad "${v.unitNumber}"?`)) {
                            deleteVehicle(v.id);
                          }
                        }}
                        className="p-1.5 bg-neutral-100 hover:bg-red-100 text-neutral-500 hover:text-red-700 rounded-xl transition-all cursor-pointer"
                        title="Eliminar unidad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Gestión de Taller, Mantenimiento & Odómetro */}
      {activeTab === 'maintenance' && (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-2">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-orange-600 flex items-center gap-2">
              <Wrench className="w-5 h-5" /> Semáforo de Mantenimiento y Taller
            </h3>
            <p className="text-sm text-neutral-600">
              Alertas preventivas por odómetro (km) y botón de bloqueo total inmediato para unidades en reparación.
            </p>
          </div>

          <div className="space-y-3">
            {vehicles.map(v => {
              const kmLeft = v.nextServiceKm - v.odometer;
              const isUrgent = kmLeft <= 1000;
              const isWarning = kmLeft <= 3000;
              const isMaintenance = v.status === 'maintenance';

              return (
                <div
                  key={v.id}
                  className={`bg-white rounded-3xl p-5 border-2 shadow-xs space-y-3 ${
                    isMaintenance ? 'border-red-400 bg-red-50/10' :
                    isUrgent ? 'border-amber-400 bg-amber-50/10' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base md:text-lg text-neutral-900">{v.unitNumber}</span>
                        <span className="text-xs text-neutral-500 font-mono font-bold">({v.model})</span>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-600 mt-1 flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-orange-600" /> Odómetro actual: <strong className="text-neutral-900">{v.odometer.toLocaleString()} km</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => toggleVehicleMaintenance(v.id)}
                      className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                        isMaintenance
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {isMaintenance ? 'Reactivar Unidad' : 'Bloquear p/ Taller'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-2xl text-xs md:text-sm">
                    <div>
                      <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Próximo Servicio</span>
                      <p className="font-black text-neutral-900">{v.nextServiceKm.toLocaleString()} km</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Kilómetros Restantes</span>
                      <p className={`font-black ${isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {kmLeft.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Descarga de Manifiestos */}
      {activeTab === 'manifests' && (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-orange-600" /> Manifiesto Oficial de Despacho
              </h3>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs md:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-orange-500" /> Imprimir / PDF
              </button>
            </div>

            <div>
              <label className="text-xs md:text-sm font-black text-neutral-700 uppercase tracking-wider">Seleccionar Corrida para Descarga</label>
              <select
                value={selectedTripForManifest}
                onChange={e => setSelectedTripForManifest(e.target.value)}
                className="w-full mt-1.5 p-3.5 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm md:text-base"
              >
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.departureTime} - {t.routeTitle} ({t.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs md:text-sm font-black uppercase tracking-wider text-neutral-700">Pasajeros Confirmados en Corrida</h4>
              <div className="space-y-2">
                {manifestPassengers.map(p => (
                  <div key={p.id} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs md:text-sm">
                    <div>
                      <p className="font-black text-neutral-900">{p.passengerName} (Asiento #{p.seatNumbers.join(', #')})</p>
                      <p className="text-xs text-neutral-500">Aborda: {p.boardingPoint} • Tel: {p.passengerPhone}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      {p.checkInStatus === 'checked_in' ? '✓ Abordó' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Configuración de Rutas y Puntos de Partida */}
      {activeTab === 'routes_config' && (
        <div className="max-w-5xl mx-auto w-full">
          <RouteLocationsManager />
        </div>
      )}

      {/* Modal: Alta y Edición de Unidades Vehiculares */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-neutral-900 text-white p-5 md:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center font-black">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg">
                    {editingVehicle ? 'Editar Unidad Vehicular' : 'Dar de Alta Nueva Unidad (+)'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {editingVehicle ? `Modificando ${editingVehicle.unitNumber}` : 'Registra vans, autos, camiones o autobuses'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVehicle} className="p-5 md:p-6 space-y-4">
              {/* Classification Selector */}
              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-2">
                  Tipo / Clasificación de la Unidad *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleForm(prev => ({
                        ...prev,
                        category: 'van',
                        image: prev.image.includes('toyotahiacede15pasajeros') || !prev.image ? 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png' : prev.image
                      }));
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      vehicleForm.category === 'van'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-black shadow-xs'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold'
                    }`}
                  >
                    <span className="text-xl">🚐</span>
                    <span className="text-xs">Van Pasaje</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVehicleForm(prev => ({
                        ...prev,
                        category: 'auto',
                        image: prev.image.includes('vento') || !prev.image ? 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/vento.png' : prev.image
                      }));
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      vehicleForm.category === 'auto'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-xs'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold'
                    }`}
                  >
                    <span className="text-xl">🚗</span>
                    <span className="text-xs">Auto / Sedán</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVehicleForm(prev => ({
                        ...prev,
                        category: 'camion',
                        image: prev.image.includes('l200') || !prev.image ? 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/l200mitsubishi.png' : prev.image
                      }));
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      vehicleForm.category === 'camion'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-black shadow-xs'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold'
                    }`}
                  >
                    <span className="text-xl">🚚</span>
                    <span className="text-xs">Camión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVehicleForm(prev => ({
                        ...prev,
                        category: 'autobus',
                        image: prev.image.includes('photo-1544620347') || !prev.image ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60' : prev.image
                      }));
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      vehicleForm.category === 'autobus'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-black shadow-xs'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold'
                    }`}
                  >
                    <span className="text-xl">🚌</span>
                    <span className="text-xs">Autobús</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-1">
                    Número Económico *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.unitNumber}
                    onChange={e => setVehicleForm({ ...vehicleForm, unitNumber: e.target.value })}
                    placeholder="Ej. Unidad 14 / Autobús 02"
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm focus:border-orange-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-1">
                    Marca y Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.model}
                    onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    placeholder="Ej. Toyota Hiace Commuter / Irizar i6"
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm focus:border-orange-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-1">
                    Placas Oficiales *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.plate}
                    onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })}
                    placeholder="Ej. GT-890-VN"
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm focus:border-orange-500 focus:bg-white transition-all outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-1">
                    Capacidad (Pasajeros) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    required
                    value={vehicleForm.capacity}
                    onChange={e => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) })}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm focus:border-orange-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-1">
                    Odómetro Inicial (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={vehicleForm.odometer}
                    onChange={e => setVehicleForm({ ...vehicleForm, odometer: Number(e.target.value) })}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm focus:border-orange-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-1">
                    Próximo Servicio Preventivo (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={vehicleForm.nextServiceKm}
                    onChange={e => setVehicleForm({ ...vehicleForm, nextServiceKm: Number(e.target.value) })}
                    className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-sm focus:border-orange-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Photo URL & Quick Presets */}
              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider block mb-1">
                  Fotografía de la Unidad (URL Web)
                </label>
                <input
                  type="url"
                  value={vehicleForm.image}
                  onChange={e => setVehicleForm({ ...vehicleForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900 text-xs focus:border-orange-500 focus:bg-white transition-all outline-none font-mono"
                />
                
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setVehicleForm({ ...vehicleForm, image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/toyotahiacede15pasajeros.png' })}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    Van Hiace
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleForm({ ...vehicleForm, image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/vento.png' })}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    Auto Sedán
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleForm({ ...vehicleForm, image: 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/autos/l200mitsubishi.png' })}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    Camión L200
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleForm({ ...vehicleForm, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60' })}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    Autobús Foráneo
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-5 py-3 rounded-2xl text-xs md:text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs md:text-sm font-black shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  {editingVehicle ? 'Guardar Cambios' : 'Registrar Unidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
