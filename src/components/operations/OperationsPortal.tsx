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
  UserCheck
} from 'lucide-react';
import { ROUTE_STOPS } from '../../data/mockData';

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
    toggleVehicleMaintenance, 
    assignDriverToVehicle 
  } = useApp();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[1]?.id || '');
  const [selectedTripForManifest, setSelectedTripForManifest] = useState<string>(trips[0]?.id || '');

  const activeTrip = trips.find(t => t.id === selectedTripForManifest) || trips[0];
  const manifestPassengers = bookings.filter(b => b.tripId === activeTrip.id);

  const handleAssignDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    assignDriverToVehicle(selectedDriverId, selectedVehicleId);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Tab 1: Despacho & Asignación de Recursos */}
      {activeTab === 'dispatch' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
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
                      {d.name} ({d.status.toUpperCase()} • Rating: {d.rating}★)
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
          <div className="space-y-3">
            <h4 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-800 px-1">
              Estado de Unidades en Flota
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base md:text-lg text-neutral-900">{v.unitNumber}</span>
                      <span className="text-xs text-neutral-500 font-mono font-bold">Placas {v.plate}</span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-600 mt-1">{v.model} • Odómetro: {v.odometer.toLocaleString()} km</p>
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                    v.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    v.status === 'in_route' ? 'bg-orange-100 text-orange-800' :
                    v.status === 'maintenance' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {v.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
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

      {/* Tab 4: Configuración de Rutas */}
      {activeTab === 'routes_config' && (
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-3">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-orange-600 flex items-center gap-2">
              <Map className="w-5 h-5" /> Configuración de Puntos y Paradas de Ruta
            </h3>
            <p className="text-sm text-neutral-600">
              Puntos de parada y transbordo activos en el corredor Pacífico - Occidente.
            </p>

            <div className="space-y-2 pt-2">
              {ROUTE_STOPS.map((stop, idx) => (
                <div key={stop.id} className="p-4 bg-neutral-50 rounded-2xl border-2 border-neutral-200 flex items-center justify-between text-xs md:text-sm">
                  <div>
                    <span className="font-black text-neutral-900">{idx + 1}. {stop.name}</span>
                    <p className="text-xs text-neutral-500 font-bold">{stop.city} &bull; Referencia: {stop.landmark}</p>
                  </div>
                  <span className="text-xs font-black text-neutral-700 bg-neutral-200 px-3 py-1 rounded-xl">
                    +{stop.timeOffsetMins} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
