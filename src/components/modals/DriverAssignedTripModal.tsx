import React, { useEffect, useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { DriverAssignedEvent } from '../../types';

interface DriverAssignedTripModalProps {
  assignment: DriverAssignedEvent | null;
  onClose: () => void;
  onAccept: (assignment: DriverAssignedEvent) => void;
}

export const DriverAssignedTripModal: React.FC<DriverAssignedTripModalProps> = ({
  assignment,
  onClose,
  onAccept
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!assignment) return;
    const interval = setInterval(() => setPulse(p => !p), 450);

    // Audio chime for assignment
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.15); // C#5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.3); // E5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {}

    return () => clearInterval(interval);
  }, [assignment]);

  if (!assignment) return null;

  return (
    <div 
      id="driver-assigned-trip-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs select-none animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
    >
      <div 
        className={`relative w-full max-w-lg bg-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 transition-all duration-300 ${
          pulse ? 'border-orange-500 shadow-orange-500/40' : 'border-orange-600 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white border border-orange-500 shadow-sm animate-pulse">
            <Bus className="w-3.5 h-3.5" />
            ¡Atención Conductor • Nuevo Viaje Asignado!
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
          {assignment.title || `${assignment.origin} ➔ ${assignment.destination}`}
        </h3>

        <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
          La administración te ha programado una salida en ruta. Por favor confirma tu conocimiento y asistencia.
        </p>

        {/* Details card */}
        <div className="mt-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-400" /> Ruta / Salida
              </span>
              <p className="font-black text-white text-sm mt-0.5">
                {assignment.origin} ➔ {assignment.destination}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-1">
                <Bus className="w-3 h-3 text-orange-400" /> Unidad Asignada
              </span>
              <p className="font-black text-orange-400 text-sm mt-0.5">
                {assignment.unitNumber}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-neutral-800">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" /> Fecha del Viaje
              </span>
              <p className="font-bold text-neutral-200 mt-0.5">
                {assignment.date}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" /> Hora de Salida
              </span>
              <p className="font-black text-white mt-0.5">
                {assignment.departureTime}
              </p>
            </div>
          </div>

          {assignment.notes && (
            <p className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-900/60 mt-2">
              <strong>Nota de Despacho:</strong> {assignment.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onAccept(assignment)}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-400/50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Aceptar Viaje y Confirmar Asistencia</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-sm transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
