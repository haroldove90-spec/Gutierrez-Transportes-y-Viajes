import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Bus, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  X, 
  ExternalLink,
  Sparkles,
  Palmtree,
  ShieldCheck
} from 'lucide-react';
import { DriverAcceptedEvent } from '../../types';

interface DriverAcceptedNotificationModalProps {
  notification: DriverAcceptedEvent | null;
  onClose: () => void;
  onViewTrip?: (notification: DriverAcceptedEvent) => void;
}

export const DriverAcceptedNotificationModal: React.FC<DriverAcceptedNotificationModalProps> = ({
  notification,
  onClose,
  onViewTrip
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!notification) return;
    const interval = setInterval(() => setPulse(p => !p), 500);

    // Friendly audio chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.36); // C6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {}

    return () => clearInterval(interval);
  }, [notification]);

  if (!notification) return null;

  return (
    <div 
      id="driver-accepted-notification-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
    >
      <div className={`relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 transition-all duration-300 ${
        pulse ? 'border-emerald-500 shadow-emerald-500/30' : 'border-emerald-400 shadow-xl'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
          title="Cerrar notificación"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Badge & Beacon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className={`absolute -inset-3 rounded-full blur-xl bg-emerald-400/50 transition-all ${
              pulse ? 'scale-125 opacity-100' : 'scale-100 opacity-60'
            }`} />
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-11 h-11 sm:w-12 sm:h-12 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Title and Confirmation status */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>CONFIRMACIÓN DE DESPACHO RECIBIDA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase tracking-tight leading-tight">
            ¡VIAJE ACEPTADO POR EL CHOFER!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            El operador ha confirmado formalmente su asistencia y disponibilidad para este servicio.
          </p>
        </div>

        {/* Driver Card Info */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 mb-4 flex items-center gap-3.5">
          {notification.driverAvatar ? (
            <img 
              src={notification.driverAvatar} 
              alt={notification.driverName} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shrink-0">
              <User className="w-7 h-7" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
              Operador Confirmado:
            </span>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 truncate">
              {notification.driverName}
            </h3>
            {notification.driverPhone && (
              <p className="text-xs text-neutral-600 font-bold flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700" /> {notification.driverPhone}
              </p>
            )}
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black shrink-0 shadow-xs">
            ✓ ACEPTADO
          </span>
        </div>

        {/* Trip Details Card */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-xs space-y-2.5 mb-6 text-neutral-700">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500 font-bold flex items-center gap-1">
              {notification.type === 'tour' ? <Palmtree className="w-3.5 h-3.5 text-purple-600" /> : <Bus className="w-3.5 h-3.5 text-orange-600" />}
              Tipo de Servicio:
            </span>
            <span className="font-black text-neutral-900 uppercase">
              {notification.type === 'tour' ? '🌴 Tour Turístico' : '🚌 Ruta Troncal Regular'} {notification.folio && `(${notification.folio})`}
            </span>
          </div>

          <div className="flex items-start justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500 font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> Destino:
            </span>
            <span className="font-black text-neutral-900 text-right max-w-[240px]">
              {notification.origin} ➔ {notification.destination}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500 font-bold flex items-center gap-1">
              <Bus className="w-3.5 h-3.5 text-blue-600" /> Unidad Asignada:
            </span>
            <span className="font-mono font-black text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-300">
              {notification.unitNumber || 'Unidad Asignada'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-neutral-500 font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> Fecha y Salida:
            </span>
            <span className="font-black text-neutral-900">
              {notification.date} a las {notification.departureTime}
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-neutral-500 font-bold">Estatus del Viaje:</span>
            <span className="inline-flex items-center gap-1 font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] border border-emerald-300">
              ✓ CHOFER CONFIRMADO / EN AGENDA
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all cursor-pointer shadow-sm active:scale-98 text-center"
          >
            ✓ Entendido, Continuar
          </button>
          {onViewTrip && (
            <button
              type="button"
              onClick={() => {
                onViewTrip(notification);
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl font-black text-xs transition-colors cursor-pointer border border-neutral-300 flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4 text-neutral-700" />
              Ver en Agenda
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
