import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CalendarDays, 
  UserCheck, 
  UserX, 
  Palmtree, 
  Bus, 
  CheckCircle2, 
  Clock, 
  ArrowRightLeft, 
  Phone, 
  MapPin, 
  Plus, 
  ShieldAlert,
  Calendar,
  AlertCircle,
  BellRing,
  Volume2
} from 'lucide-react';
import { Vehicle, Driver } from '../../types';

export const DriverAssignmentsSchedule: React.FC = () => {
  const { 
    vehicles, 
    drivers, 
    charterAssignments,
    assignDriverToVehicle, 
    releaseDriverFromService, 
    assignDriverToCharter,
    releaseVehicleFromTourContract,
    completeCharterAssignment,
    trips,
    sendManualWakeUpAlarm,
    playAlarmSoundTest,
    driverAlarms
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'charters' | 'quick_reassign'>('schedule');

  // Modal para Despertador Manual
  const [wakeUpModalDriverId, setWakeUpModalDriverId] = useState<string | null>(null);
  const [wakeUpNote, setWakeUpNote] = useState<string>('¡Operador, despierta! Tienes un viaje programado por salir. Confirma de inmediato tu asistencia.');

  // Modal para Asignar Viaje Turístico Particular
  const [showCharterModal, setShowCharterModal] = useState<boolean>(false);
  const [selectedDriverForCharter, setSelectedDriverForCharter] = useState<string>(drivers[0]?.id || '');
  const [selectedVehicleForCharter, setSelectedVehicleForCharter] = useState<string>(vehicles[0]?.id || '');
  const [charterForm, setCharterForm] = useState({
    clientName: '',
    clientPhone: '',
    origin: 'Colima, Col.',
    destination: '',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10),
    totalAmount: 12000,
    notes: 'Servicio particular privado con chofer incluido.'
  });

  // Modal para Reasignación Rápida de Chofer a Unidad
  const [showReassignModal, setShowReassignModal] = useState<boolean>(false);
  const [reassignDriverId, setReassignDriverId] = useState<string>(drivers[0]?.id || '');
  const [reassignVehicleId, setReassignVehicleId] = useState<string>(vehicles[0]?.id || '');

  // Manejar creación de Viaje Turístico Particular
  const handleCreateCharter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charterForm.clientName || !charterForm.destination) return;

    const driver = drivers.find(d => d.id === selectedDriverForCharter);
    const vehicle = vehicles.find(v => v.id === selectedVehicleForCharter);

    if (!driver || !vehicle) return;

    assignDriverToCharter({
      clientName: charterForm.clientName,
      clientPhone: charterForm.clientPhone,
      origin: charterForm.origin,
      destination: charterForm.destination,
      vehicleId: vehicle.id,
      unitNumber: vehicle.unitNumber,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      startDate: charterForm.startDate,
      endDate: charterForm.endDate,
      totalAmount: Number(charterForm.totalAmount),
      notes: charterForm.notes
    });

    setShowCharterModal(false);
    setCharterForm({
      clientName: '',
      clientPhone: '',
      origin: 'Colima, Col.',
      destination: '',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10),
      totalAmount: 12000,
      notes: 'Servicio particular privado con chofer incluido.'
    });
  };

  // Manejar Reasignación forzada
  const handleForceReassign = (e: React.FormEvent) => {
    e.preventDefault();
    assignDriverToVehicle(reassignDriverId, reassignVehicleId, true);
    setShowReassignModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                Agenda Operativa
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 flex items-center gap-1">
                <Palmtree className="w-3.5 h-3.5" /> Viajes Particulares / Charters
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mt-2">
              Control de Asignaciones, Agenda de Operadores & Bloqueo de Unidades
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 mt-1 max-w-3xl">
              Administra la disponibilidad de los 7 choferes y 8 unidades. Si un operador (ej. Efraín) cambia de servicio o sale a un viaje turístico por contratación particular, puedes liberar su estatus, reasignarlo o bloquear la camioneta para que no venda boletos de ruta regular.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedDriverForCharter(drivers[0]?.id || '');
                setShowCharterModal(true);
              }}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs md:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Palmtree className="w-4 h-4" /> Asignar Viaje Turístico Particular
            </button>
            <button
              onClick={() => setShowReassignModal(true)}
              className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-black text-xs md:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-orange-400" /> Reasignar Operador a Unidad
            </button>
          </div>
        </div>

        {/* Subnavigation Pills */}
        <div className="flex items-center gap-2 mt-4 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'schedule'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            👨‍✈️ Estado de los 7 Operadores ({drivers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('charters')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'charters'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            🌴 Viajes Turísticos Particulares ({charterAssignments.filter(c => c.status === 'active').length} Activos)
          </button>
          <button
            onClick={() => setActiveSubTab('quick_reassign')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'quick_reassign'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            🚐 Estado y Bloqueo de las 8 Unidades
          </button>
        </div>
      </div>

      {/* Subtab 1: Agenda de los 7 Operadores */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-800">
              Operadores Federales y Asignación Actual
            </h3>
            <span className="text-xs text-neutral-500 font-bold">
              Tip: Usa &quot;Liberar a Disponible&quot; para quitar cualquier bloqueo de servicio anterior
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map(driver => {
              const assignedVehicle = vehicles.find(v => v.id === driver.currentVehicleId);
              const isCharter = driver.status === 'charter_service';
              const isInService = driver.status === 'in_service';
              const isAvailable = driver.status === 'available';

              return (
                <div 
                  key={driver.id} 
                  className={`bg-white rounded-3xl p-5 border-2 shadow-xs transition-all space-y-4 ${
                    isCharter ? 'border-purple-300 bg-purple-50/20' :
                    isInService ? 'border-blue-200' : 'border-emerald-200 bg-emerald-50/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={driver.avatar} 
                        alt={driver.name} 
                        className="w-13 h-13 rounded-2xl object-cover border border-neutral-200 shrink-0 bg-neutral-100" 
                      />
                      <div className="min-w-0">
                        <h4 className="font-black text-base text-neutral-900 truncate">{driver.name}</h4>
                        <p className="text-xs text-neutral-500 font-mono font-bold flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <a href={`tel:${driver.phone}`} className="hover:text-orange-600 transition-colors">
                            {driver.phone}
                          </a>
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          ID: {driver.id} • Calificación: ⭐ {driver.rating}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase shrink-0 ${
                      isCharter ? 'bg-purple-600 text-white' :
                      isInService ? 'bg-blue-100 text-blue-800' :
                      isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {isCharter ? '🌴 Viaje Turístico' :
                       isInService ? '🔵 En Ruta Fija' :
                       isAvailable ? '🟢 Libre / Disponible' : driver.status}
                    </span>
                  </div>

                  {/* Detalle del Servicio Actual */}
                  <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="font-bold text-neutral-500 uppercase text-[10px]">Unidad Asignada:</span>
                      <span className="font-black text-neutral-900">
                        {assignedVehicle ? `${assignedVehicle.unitNumber} (${assignedVehicle.plate})` : 'Ninguna (Sin asignar)'}
                      </span>
                    </div>

                    {isCharter && driver.charterDetails && (
                      <div className="pt-1 border-t border-neutral-200 text-purple-900 space-y-0.5">
                        <p className="font-black flex items-center gap-1">
                          <Palmtree className="w-3.5 h-3.5 text-purple-600" /> Destino: {driver.charterDetails.destination}
                        </p>
                        <p className="text-[11px] text-neutral-600">
                          Cliente: <strong>{driver.charterDetails.clientName}</strong> {driver.charterDetails.clientPhone && `(${driver.charterDetails.clientPhone})`}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          Periodo: {driver.charterDetails.startDate} al {driver.charterDetails.endDate}
                        </p>
                      </div>
                    )}

                    {isInService && (
                      <div className="pt-1 border-t border-neutral-200 text-blue-900">
                        <p className="font-bold text-[11px]">
                          Itinerario de Corridas Regulares Activas (Guadalajara ⇄ Colima ⇄ Manzanillo)
                        </p>
                      </div>
                    )}

                    {isAvailable && (
                      <div className="pt-1 border-t border-neutral-200 text-emerald-800">
                        <p className="font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Listo para ser asignado a ruta o contratación especial
                        </p>
                      </div>
                    )}

                    {/* Estado de Alarma Despertador si está sonando */}
                    {driverAlarms.some(a => a.driverId === driver.id && a.status === 'active') && (
                      <div className="p-2.5 bg-red-600 text-white rounded-xl text-xs font-black flex items-center justify-between animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <BellRing className="w-4 h-4" /> ¡ALARMA SONANDO EN SU CELULAR!
                        </span>
                        <span className="text-[10px] bg-red-900/80 px-2 py-0.5 rounded uppercase">Sin apagar</span>
                      </div>
                    )}
                  </div>

                  {/* Botones de Acción Directa */}
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedDriverForCharter(driver.id);
                          if (driver.currentVehicleId) {
                            setSelectedVehicleForCharter(driver.currentVehicleId);
                          }
                          setShowCharterModal(true);
                        }}
                        className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Palmtree className="w-3.5 h-3.5 text-purple-600" /> Asignar Particular
                      </button>

                      {!isAvailable ? (
                        <button
                          onClick={() => releaseDriverFromService(driver.id, 'Liberación manual por administración')}
                          className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Libera al chofer para que pase a estatus Disponible y quite cualquier bloqueo de servicio"
                        >
                          <UserX className="w-3.5 h-3.5 text-red-600" /> Liberar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setReassignDriverId(driver.id);
                            setShowReassignModal(true);
                          }}
                          className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Bus className="w-3.5 h-3.5 text-orange-400" /> Asignar Ruta
                        </button>
                      )}
                    </div>

                    {/* Botón de Despertador Manual de Administración */}
                    <button
                      onClick={() => setWakeUpModalDriverId(driver.id)}
                      className="w-full py-2.5 px-3 bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                      title="Enviar alarma sonora despertador ineludible al celular de este chofer"
                    >
                      <BellRing className="w-4 h-4 animate-bounce" /> 🚨 Sonar Despertador al Celular
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 2: Viajes Turísticos Particulares (Charters) */}
      {activeSubTab === 'charters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
              <Palmtree className="w-5 h-5 text-purple-600" /> Registro de Contrataciones Especiales y Tours
            </h3>
            <button
              onClick={() => setShowCharterModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nueva Contratación
            </button>
          </div>

          {charterAssignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-neutral-300">
              <Palmtree className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="font-black text-neutral-700">No hay viajes turísticos particulares registrados actualmente</p>
              <p className="text-xs text-neutral-500 mt-1">Haz clic en &quot;Nueva Contratación&quot; para bloquear una camioneta y asignarla con chofer a un cliente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {charterAssignments.map(assignment => {
                const isActive = assignment.status === 'active';
                const isUpcoming = assignment.status === 'upcoming';
                const isCompleted = assignment.status === 'completed';

                return (
                  <div 
                    key={assignment.id} 
                    className={`bg-white rounded-3xl p-5 md:p-6 border-2 shadow-xs transition-all space-y-4 ${
                      isActive ? 'border-purple-400 bg-purple-50/10' :
                      isUpcoming ? 'border-amber-300' : 'border-neutral-200 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-xs md:text-sm text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                            {assignment.folio}
                          </span>
                          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                            isActive ? 'bg-purple-600 text-white' :
                            isUpcoming ? 'bg-amber-100 text-amber-800' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {isActive ? '🌴 En Curso / Camioneta Bloqueada' :
                             isUpcoming ? '⏳ Próximo' : '✓ Completado / Liberado'}
                          </span>
                        </div>
                        <h4 className="text-base md:text-lg font-black text-neutral-900 mt-1">
                          {assignment.destination}
                        </h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-neutral-500 uppercase font-bold">Monto Contratado</span>
                        <p className="text-lg md:text-xl font-black text-emerald-600">
                          ${assignment.totalAmount.toLocaleString()} MXN
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-50 p-4 rounded-2xl text-xs">
                      <div>
                        <span className="text-neutral-400 uppercase font-bold text-[10px]">Cliente Particular:</span>
                        <p className="font-black text-neutral-900 text-sm mt-0.5">{assignment.clientName}</p>
                        <p className="text-neutral-600 text-[11px] font-mono mt-0.5">Tel: {assignment.clientPhone}</p>
                      </div>

                      <div>
                        <span className="text-neutral-400 uppercase font-bold text-[10px]">Camioneta y Operador:</span>
                        <p className="font-black text-neutral-900 text-sm mt-0.5">{assignment.unitNumber}</p>
                        <p className="text-purple-800 font-bold text-[11px] mt-0.5 flex items-center gap-1">
                          👨‍✈️ {assignment.driverName} ({assignment.driverPhone})
                        </p>
                      </div>

                      <div>
                        <span className="text-neutral-400 uppercase font-bold text-[10px]">Fechas de Viaje:</span>
                        <p className="font-black text-neutral-900 text-sm mt-0.5">
                          {assignment.startDate} al {assignment.endDate}
                        </p>
                        <p className="text-neutral-500 text-[10px] mt-0.5 truncate">
                          {assignment.notes || 'Sin observaciones'}
                        </p>
                      </div>
                    </div>

                    {/* Acciones para finalizar o liberar */}
                    {isActive && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-neutral-500 font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-purple-600" />
                          La unidad no aparece disponible para corridas públicas mientras este servicio esté activo.
                        </span>
                        <button
                          onClick={() => completeCharterAssignment(assignment.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Finalizar Viaje & Liberar Camioneta y Chofer
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Estado y Bloqueo de las 8 Unidades */}
      {activeSubTab === 'quick_reassign' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-800">
              Disponibilidad de la Flotilla Oficial (8 Unidades)
            </h3>
            <span className="text-xs text-neutral-500 font-bold">
              Las unidades en contratación turística quedan protegidas contra sobreventa en ruta
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map(v => {
              const assignedDriver = drivers.find(d => d.id === v.driverId);
              const isCharter = v.status === 'tour_contract';
              const isMaintenance = v.status === 'maintenance';
              const isActive = v.status === 'active';

              return (
                <div 
                  key={v.id} 
                  className={`bg-white rounded-3xl p-5 border-2 shadow-xs space-y-3 ${
                    isCharter ? 'border-purple-300 bg-purple-50/20' :
                    isMaintenance ? 'border-red-300 bg-red-50/20' : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {v.image && (
                        <img 
                          src={v.image} 
                          alt={v.unitNumber} 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shrink-0 bg-neutral-100" 
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-base text-neutral-900 truncate">{v.unitNumber}</h4>
                          <span className="text-xs text-neutral-500 font-mono font-bold">({v.plate})</span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">{v.model} • {v.capacity} Pax</p>
                        <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          Odómetro: {v.odometer.toLocaleString()} km
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${
                      isCharter ? 'bg-purple-600 text-white' :
                      isMaintenance ? 'bg-red-100 text-red-800' :
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {isCharter ? '🌴 Bloqueada p/ Tour' :
                       isMaintenance ? '🔧 Taller' :
                       isActive ? '🟢 Disponible' : v.status}
                    </span>
                  </div>

                  {/* Datos del Chofer y Asignación */}
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-bold uppercase text-[10px]">Operador Asignado:</span>
                      <span className="font-black text-neutral-900">
                        {assignedDriver ? `👨‍✈️ ${assignedDriver.name}` : 'Sin chofer asignado'}
                      </span>
                    </div>

                    {isCharter && v.tourContractDetails && (
                      <div className="pt-1 border-t border-neutral-200 text-purple-900">
                        <p className="font-black text-[11px]">
                          Viaje Particular a: {v.tourContractDetails.destination}
                        </p>
                        <p className="text-[10px] text-neutral-600">
                          Contratante: {v.tourContractDetails.clientName} ({v.tourContractDetails.startDate} al {v.tourContractDetails.endDate})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones de la Unidad */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      {isCharter ? (
                        <button
                          onClick={() => releaseVehicleFromTourContract(v.id)}
                          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Desbloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedVehicleForCharter(v.id);
                            setShowCharterModal(true);
                          }}
                          className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Palmtree className="w-3.5 h-3.5 text-purple-600" /> Particular
                        </button>
                      )}

                      {assignedDriver && (
                        <button
                          onClick={() => setWakeUpModalDriverId(assignedDriver.id)}
                          className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title={`Sonar despertador inmediato a ${assignedDriver.name}`}
                        >
                          <BellRing className="w-3.5 h-3.5 animate-bounce" /> Despertar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: Asignar Viaje Turístico Particular (Bloqueo de Camioneta & Chofer) */}
      {showCharterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                  Contratación Especial
                </span>
                <h3 className="text-lg md:text-xl font-black text-neutral-900 mt-1">
                  Asignar Chofer y Bloquear Camioneta para Viaje Turístico Particular
                </h3>
              </div>
              <button
                onClick={() => setShowCharterModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCharter} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Operador / Chofer
                  </label>
                  <select
                    value={selectedDriverForCharter}
                    onChange={e => setSelectedDriverForCharter(e.target.value)}
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} • {d.phone} ({d.status === 'available' ? 'Disponible' : d.status === 'charter_service' ? 'En viaje particular' : 'En ruta'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Nota: Puedes seleccionar a Efraín o cualquier operador; el sistema actualizará su agenda sin bloquearte.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Camioneta a Bloquear
                  </label>
                  <select
                    value={selectedVehicleForCharter}
                    onChange={e => setSelectedVehicleForCharter(e.target.value)}
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.unitNumber} - {v.model} ({v.capacity} Pax)
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    La unidad quedará bloqueada en el sistema para que no venda boletos en rutas fijas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Nombre del Cliente Contratante
                  </label>
                  <input
                    type="text"
                    value={charterForm.clientName}
                    onChange={e => setCharterForm({ ...charterForm, clientName: e.target.value })}
                    placeholder="Ej. Familia Rodríguez / Ing. Carlos Mendoza"
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Teléfono del Cliente (+52)
                  </label>
                  <input
                    type="tel"
                    value={charterForm.clientPhone}
                    onChange={e => setCharterForm({ ...charterForm, clientPhone: e.target.value })}
                    placeholder="+52 312 000 0000"
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Origen del Viaje
                  </label>
                  <input
                    type="text"
                    value={charterForm.origin}
                    onChange={e => setCharterForm({ ...charterForm, origin: e.target.value })}
                    placeholder="Colima, Col."
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Destino Turístico / Particular
                  </label>
                  <input
                    type="text"
                    value={charterForm.destination}
                    onChange={e => setCharterForm({ ...charterForm, destination: e.target.value })}
                    placeholder="Ej. Mazamitla / Puerto Vallarta / San Juan de los Lagos"
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Fecha de Salida
                  </label>
                  <input
                    type="date"
                    value={charterForm.startDate}
                    onChange={e => setCharterForm({ ...charterForm, startDate: e.target.value })}
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Fecha de Regreso
                  </label>
                  <input
                    type="date"
                    value={charterForm.endDate}
                    onChange={e => setCharterForm({ ...charterForm, endDate: e.target.value })}
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                    Precio Total Acordado (MXN)
                  </label>
                  <input
                    type="number"
                    value={charterForm.totalAmount}
                    onChange={e => setCharterForm({ ...charterForm, totalAmount: Number(e.target.value) })}
                    className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  Notas / Observaciones del Servicio
                </label>
                <textarea
                  value={charterForm.notes}
                  onChange={e => setCharterForm({ ...charterForm, notes: e.target.value })}
                  rows={2}
                  className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-medium text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCharterModal(false)}
                  className="px-5 py-3 rounded-2xl font-black text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Palmtree className="w-4 h-4" /> Confirmar y Bloquear Unidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reasignación Directa de Operador a Unidad */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                  Cambio de Servicio
                </span>
                <h3 className="text-lg md:text-xl font-black text-neutral-900 mt-1">
                  Reasignar Chofer a Unidad de Forma Directa
                </h3>
              </div>
              <button
                onClick={() => setShowReassignModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Esta acción reasigna al chofer seleccionado inmediatamente a la nueva unidad, liberando cualquier asignación previa sin arrojar errores de bloqueo.
            </p>

            <form onSubmit={handleForceReassign} className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  Seleccionar Chofer
                </label>
                <select
                  value={reassignDriverId}
                  onChange={e => setReassignDriverId(e.target.value)}
                  className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} • {d.phone} (Estado actual: {d.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">
                  Nueva Unidad a Asignar
                </label>
                <select
                  value={reassignVehicleId}
                  onChange={e => setReassignVehicleId(e.target.value)}
                  className="w-full mt-1 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-900"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.unitNumber} - {v.model} ({v.plate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-5 py-3 rounded-2xl font-black text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" /> Aplicar Reasignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Despertador Manual de Administración */}
      {wakeUpModalDriverId && (() => {
        const targetDriver = drivers.find(d => d.id === wakeUpModalDriverId);
        const assignedVeh = vehicles.find(v => v.id === targetDriver?.currentVehicleId);
        const upcomingTrip = trips.find(t => t.driverId === targetDriver?.id);

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-600 space-y-5 my-8 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                    <BellRing className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                      Disparo Forzado
                    </span>
                    <h3 className="text-xl font-black text-neutral-900 leading-tight">
                      Mandar Despertador al Chofer
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setWakeUpModalDriverId(null)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {targetDriver && (
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-bold">Chofer Destinatario:</span>
                    <span className="font-black text-neutral-900 text-sm">{targetDriver.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-bold">Teléfono Celular:</span>
                    <span className="font-mono font-bold text-neutral-800">{targetDriver.phone}</span>
                  </div>
                  {assignedVeh && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-bold">Unidad Vehicular:</span>
                      <span className="font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {assignedVeh.unitNumber} ({assignedVeh.model})
                      </span>
                    </div>
                  )}
                  {upcomingTrip && (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-2">
                      <span className="text-neutral-500 font-bold">Próxima Salida:</span>
                      <span className="font-bold text-red-600">{upcomingTrip.departureTime} - {upcomingTrip.routeTitle}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  ¿Cómo funciona el despertador?
                </p>
                <p>
                  Hará sonar el audio oficial en bucle continuo y desplegará una pantalla de alerta flotante de emergencia en el celular del chofer que no podrá cerrarse hasta que confirme que ya está despierto y listo.
                </p>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-neutral-600 block mb-1">
                  Mensaje urgente en pantalla para el chofer:
                </label>
                <textarea
                  value={wakeUpNote}
                  onChange={e => setWakeUpNote(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-neutral-50 border-2 border-neutral-200 focus:border-red-500 rounded-2xl font-medium text-xs text-neutral-900 focus:outline-none"
                  placeholder="Escribe instrucciones para el chofer..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={playAlarmSoundTest}
                  className="text-xs text-neutral-600 hover:text-neutral-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-red-500" /> Probar audio oficial
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setWakeUpModalDriverId(null)}
                  className="px-5 py-3 rounded-2xl font-black text-neutral-600 hover:bg-neutral-100 cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (targetDriver) {
                      sendManualWakeUpAlarm(targetDriver.id, upcomingTrip?.id, wakeUpNote);
                      setWakeUpModalDriverId(null);
                    }
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <BellRing className="w-5 h-5 animate-pulse" /> ¡DISPARAR DESPERTADOR AHORA!
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
