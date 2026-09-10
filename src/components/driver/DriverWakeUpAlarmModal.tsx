import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BellRing, 
  Volume2, 
  AlarmClock, 
  MapPin, 
  Clock, 
  Bus, 
  AlertTriangle,
  CheckCircle2,
  Phone
} from 'lucide-react';

interface DriverWakeUpAlarmModalProps {
  currentDriverId?: string;
}

export const DriverWakeUpAlarmModal: React.FC<DriverWakeUpAlarmModalProps> = ({ currentDriverId }) => {
  const { activeAlarm, acknowledgeAlarm, playAlarmSoundTest, stopAlarmSound, drivers, vehicles } = useApp();
  const [pulseTick, setPulseTick] = useState<boolean>(false);

  // Strobe effect toggle
  useEffect(() => {
    if (!activeAlarm || activeAlarm.status !== 'active') return;
    const timer = setInterval(() => {
      setPulseTick(prev => !prev);
    }, 450);
    return () => clearInterval(timer);
  }, [activeAlarm]);

  if (!activeAlarm || activeAlarm.status !== 'active') {
    return null;
  }

  // If filtered by driver, only show if it matches (or if no currentDriverId specified)
  if (currentDriverId && activeAlarm.driverId !== currentDriverId) {
    return null;
  }

  const driver = drivers.find(d => d.id === activeAlarm.driverId);
  const isTwoHour = activeAlarm.type === 'two_hour_reminder';
  const isManualWake = activeAlarm.type === 'admin_manual_wake';
  const isAssignment = activeAlarm.type === 'new_trip_assigned';

  const handleTurnOff = () => {
    acknowledgeAlarm(activeAlarm.id);
  };

  return (
    <div 
      id="driver-alarm-urgent-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md select-none overflow-y-auto"
      role="alertdialog"
      aria-modal="true"
    >
      <div 
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all duration-300 border-4 ${
          pulseTick 
            ? 'border-red-500 bg-neutral-900 shadow-red-500/50' 
            : 'border-amber-400 bg-neutral-950 shadow-amber-500/50'
        }`}
      >
        {/* Animated Emergency Beacon */}
        <div className="flex justify-center items-center mb-5">
          <div className="relative">
            <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-300 ${
              pulseTick ? 'bg-red-600/80 scale-125' : 'bg-amber-500/80 scale-100'
            }`} />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-xl animate-bounce">
              {isManualWake ? (
                <BellRing className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" />
              ) : isTwoHour ? (
                <AlarmClock className="w-12 h-12 sm:w-14 sm:h-14 animate-spin" style={{ animationDuration: '4s' }} />
              ) : (
                <Bus className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Alarm Banner & Title */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500 text-red-200 text-xs font-black uppercase tracking-wider mb-3">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>ALARMA SONORA CONTINUA EN CURSO</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2 leading-tight">
          {isManualWake ? '🚨 DESPERTADOR URGENTE' : isTwoHour ? '⏰ RECORDATORIO 2 HORAS' : '🚐 NUEVA ASIGNACIÓN'}
        </h2>

        <p className="text-amber-300 text-sm sm:text-base font-medium mb-5 px-2">
          {activeAlarm.message}
        </p>

        {/* Trip Card Information */}
        <div className="bg-neutral-900/90 rounded-2xl p-4 border border-neutral-800 text-left space-y-2.5 mb-6 text-neutral-200 text-xs sm:text-sm">
          {driver && (
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400">Operador:</span>
              <span className="font-bold text-white">{driver.name}</span>
            </div>
          )}

          {activeAlarm.unitNumber && (
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400">Unidad Asignada:</span>
              <span className="font-black text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                {activeAlarm.unitNumber}
              </span>
            </div>
          )}

          {activeAlarm.departureTime && (
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400">Hora de Salida:</span>
              <span className="font-black text-red-400 flex items-center gap-1 text-sm sm:text-base">
                <Clock className="w-4 h-4" />
                {activeAlarm.departureTime}
              </span>
            </div>
          )}

          {activeAlarm.routeDetails && (
            <div className="flex items-start justify-between gap-2 pt-0.5">
              <span className="text-neutral-400 shrink-0">Ruta / Servicio:</span>
              <span className="font-semibold text-right text-neutral-100">{activeAlarm.routeDetails}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
            <span>Disparado por:</span>
            <span className="italic">{activeAlarm.triggeredBy}</span>
          </div>
        </div>

        {/* Warning instructions */}
        <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3 mb-6 flex items-center gap-2.5 text-left text-xs text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>
            Esta alarma seguirá sonando indefinidamente en tu dispositivo hasta que confirmes recepción y conocimiento de tu viaje.
          </span>
        </div>

        {/* Massive Turn Off Alarm Button */}
        <button
          id="btn-driver-wake-up-confirm"
          onClick={handleTurnOff}
          className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 text-white font-black text-lg sm:text-xl uppercase tracking-wider shadow-2xl hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-3 cursor-pointer ring-4 ring-white/20"
        >
          <CheckCircle2 className="w-7 h-7 shrink-0 text-white" />
          <span>¡DESPERTAR Y APAGAR ALARMA!</span>
        </button>

        <p className="text-[11px] text-neutral-400 mt-3 font-medium">
          Al presionar este botón, se notifica a la Administración que el chofer confirmó su turno.
        </p>
      </div>
    </div>
  );
};
