import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Ticket, 
  MapPin, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  X, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SaleAlert } from '../../types';

interface LiveSaleNotificationModalProps {
  alert: SaleAlert | null;
  onClose: () => void;
  onViewSales: () => void;
}

export const LiveSaleNotificationModal: React.FC<LiveSaleNotificationModalProps> = ({
  alert,
  onClose,
  onViewSales
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!alert) return;
    const interval = setInterval(() => setPulse(p => !p), 400);

    // Audio chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.2); // D6
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}

    return () => clearInterval(interval);
  }, [alert]);

  if (!alert) return null;

  const isPaid = alert.type === 'payment';

  return (
    <div 
      id="live-sale-notification-modal"
      className="fixed inset-0 z-[99998] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
    >
      <div 
        className={`relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 transition-all duration-300 ${
          pulse ? 'border-amber-500 shadow-amber-500/30' : 'border-amber-400 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          title="Cerrar notificación"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            ¡Nueva Venta de Boletos en Tiempo Real!
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-neutral-950 flex items-center gap-2">
          {alert.title}
        </h3>

        {/* Message description */}
        <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1 leading-relaxed">
          {alert.message}
        </p>

        {/* Ticket Details Card */}
        <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-[11px] font-black uppercase text-neutral-500">Folio de Venta</span>
            <span className="font-mono font-black text-sm text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-300">
              {alert.bookingId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-neutral-600" /> Pasajero
              </span>
              <p className="font-extrabold text-neutral-900 text-sm mt-0.5 truncate">{alert.passengerName}</p>
              {alert.passengerPhone && (
                <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5 font-mono">
                  <Phone className="w-3 h-3 text-neutral-400" /> {alert.passengerPhone}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" /> Total Cobrado
              </span>
              <p className="font-black text-emerald-700 text-base mt-0.5">
                ${alert.amount?.toLocaleString('es-MX')} MXN
              </p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-0.5 ${
                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {isPaid ? 'Cobro Confirmado' : 'Reservación Pendiente'}
              </span>
            </div>
          </div>

          {/* Seat Numbers Highlighted in Red */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600">Asientos Reservados:</span>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {alert.seatNumbers?.map(num => (
                <span 
                  key={num} 
                  className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black text-xs border border-red-700 shadow-xs flex items-center gap-1"
                >
                  <Ticket className="w-3 h-3" /> #{num}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onViewSales();
            }}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ver en Ventas & Boletos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-sm transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
