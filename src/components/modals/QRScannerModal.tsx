import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, QrCode, CheckCircle2, AlertTriangle, XCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Booking } from '../../types';

interface QRScannerModalProps {
  onClose: () => void;
  currentLocationName?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, currentLocationName = 'Manzanillo Oficina Central' }) => {
  const { bookings, validateTicketQR, checkInPassenger } = useApp();
  const [manualCode, setManualCode] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'valid' | 'already_used' | 'invalid';
    booking?: Booking;
  }>({ status: 'idle' });

  const handleScanCode = (code: string) => {
    if (!code.trim()) return;
    const result = validateTicketQR(code.trim());
    setScanResult(result);
  };

  const handleConfirmCheckin = () => {
    if (scanResult.booking) {
      checkInPassenger(scanResult.booking.id, currentLocationName);
      setScanResult({
        status: 'valid',
        booking: {
          ...scanResult.booking,
          checkInStatus: 'checked_in',
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          checkInLocation: currentLocationName
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md my-auto bg-gradient-to-b from-orange-600 via-orange-600 to-orange-700 text-white rounded-3xl overflow-hidden shadow-2xl border-2 border-orange-400/90 flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-black/90 text-white flex items-center justify-between border-b border-orange-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Escáner Óptico de Boletos</h3>
              <p className="text-[11px] sm:text-xs text-orange-200 font-medium">Validación en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Cerrar escáner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Scanner Body */}
        <div className="p-3.5 sm:p-5 space-y-3.5 overflow-y-auto no-scrollbar text-white">
          {/* Viewfinder Camera Simulation */}
          <div className="relative aspect-square w-full max-w-[190px] sm:max-w-[220px] mx-auto bg-black rounded-3xl border-2 border-orange-300/80 overflow-hidden flex flex-col items-center justify-center shadow-xl">
            {/* Corner brackets in high-visibility bright orange */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-orange-400 rounded-tl-sm"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-orange-400 rounded-tr-sm"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-orange-400 rounded-bl-sm"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-orange-400 rounded-br-sm"></div>

            {/* Laser scanning beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent shadow-[0_0_12px_#C50407] animate-bounce opacity-90"></div>

            <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-orange-500/50 animate-pulse" />
            <p className="text-[11px] sm:text-xs text-orange-100 font-mono mt-2 z-10 font-bold text-center px-2">
              Apunta al código QR del boleto
            </p>
          </div>

          {/* Quick Select from Active Bookings (For Rapid Testing / Demo) */}
          <div className="bg-black/40 p-3 rounded-2xl border border-orange-400/40 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs font-black text-orange-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Boletos de prueba rápida:
            </p>
            <div className="space-y-1.5 max-h-32 sm:max-h-36 overflow-y-auto no-scrollbar">
              {bookings.slice(0, 4).map(b => (
                <button
                  key={b.id}
                  onClick={() => handleScanCode(b.qrCodeData)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
                    scanResult.booking?.id === b.id
                      ? 'bg-white text-neutral-900 font-black border-white shadow-md'
                      : 'bg-black/50 hover:bg-black/70 text-white border-orange-500/30'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-xs font-bold opacity-90">{b.id}</span> • <span className="font-bold">{b.passengerName}</span>
                    <div className={`text-[11px] font-medium truncate ${scanResult.booking?.id === b.id ? 'text-neutral-600' : 'text-orange-200'}`}>
                      Asiento #{b.seatNumbers.join(', ')} • {b.origin} ➔ {b.destination}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase shrink-0 ${
                    b.checkInStatus === 'checked_in' 
                      ? 'bg-emerald-500 text-black' 
                      : 'bg-amber-400 text-black'
                  }`}>
                    {b.checkInStatus === 'checked_in' ? 'Abordó' : 'Pendiente'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual input fallback */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingresar Folio manual (ej. TG-9824)..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleScanCode(manualCode);
              }}
              className="flex-1 bg-black/60 border-2 border-orange-400/60 focus:border-white rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-orange-200/60 font-bold focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleScanCode(manualCode)}
              className="px-4 py-2.5 bg-black hover:bg-neutral-900 text-white border border-orange-400/50 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-md flex items-center gap-1 shrink-0"
            >
              <span>Validar</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>
          </div>

          {/* Verification Result Card */}
          {scanResult.status !== 'idle' && (
            <div className={`p-3.5 sm:p-4 rounded-2xl border-2 text-xs sm:text-sm animate-in zoom-in-95 shadow-xl ${
              scanResult.status === 'valid'
                ? 'bg-black/90 border-emerald-400 text-white'
                : scanResult.status === 'already_used'
                ? 'bg-black/90 border-amber-400 text-white'
                : 'bg-black/90 border-red-400 text-white'
            }`}>
              <div className="flex items-start gap-3">
                {scanResult.status === 'valid' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />}
                {scanResult.status === 'already_used' && <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />}
                {scanResult.status === 'invalid' && <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />}

                <div className="flex-1 min-w-0">
                  <p className={`font-black text-sm sm:text-base ${
                    scanResult.status === 'valid' ? 'text-emerald-300' :
                    scanResult.status === 'already_used' ? 'text-amber-300' : 'text-red-300'
                  }`}>
                    {scanResult.status === 'valid' && '¡Boleto Válido para Abordaje!'}
                    {scanResult.status === 'already_used' && '¡Atención: Boleto Ya Utilizado!'}
                    {scanResult.status === 'invalid' && 'Boleto Inválido o No Encontrado'}
                  </p>

                  {scanResult.booking && (
                    <div className="mt-2 space-y-1 text-neutral-200">
                      <p className="font-black text-white text-base truncate">{scanResult.booking.passengerName}</p>
                      <p className="text-xs">Asiento(s): <span className="font-black text-orange-400">#{scanResult.booking.seatNumbers.join(', #')}</span></p>
                      <p className="text-xs text-neutral-300">Ruta: {scanResult.booking.origin} ➔ {scanResult.booking.destination}</p>
                      <p className="text-xs text-neutral-300">Abordaje: {scanResult.booking.boardingPoint}</p>
                      
                      {scanResult.status === 'already_used' && (
                        <p className="text-xs text-amber-300 font-mono mt-1 font-bold">
                          Registrado a las {scanResult.booking.checkInTime || '06:22 AM'} en {scanResult.booking.checkInLocation || 'Escala Previa'}.
                        </p>
                      )}

                      {scanResult.status === 'valid' && scanResult.booking.checkInStatus !== 'checked_in' && (
                        <button
                          onClick={handleConfirmCheckin}
                          className="mt-3 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4 stroke-[3]" /> Confirmar Abordaje del Pasajero
                        </button>
                      )}

                      {scanResult.status === 'valid' && scanResult.booking.checkInStatus === 'checked_in' && (
                        <div className="mt-2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-black text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Abordaje Registrado Exitosamente
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
