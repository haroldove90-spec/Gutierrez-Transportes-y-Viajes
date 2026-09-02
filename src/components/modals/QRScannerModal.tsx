import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, QrCode, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-neutral-900 text-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 border-neutral-700 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-black border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-orange-500" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Escáner Óptico de Boletos</h3>
              <p className="text-xs text-neutral-400">Validación en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Camera Simulation */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          <div className="relative aspect-square w-full max-w-[260px] mx-auto bg-black rounded-3xl border-2 border-neutral-700 overflow-hidden flex flex-col items-center justify-center shadow-inner">
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-orange-500 rounded-tl-sm"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-orange-500 rounded-tr-sm"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-orange-500 rounded-bl-sm"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-orange-500 rounded-br-sm"></div>

            {/* Laser scanning beam */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-bounce opacity-80"></div>

            <QrCode className="w-16 h-16 text-neutral-700 opacity-40 animate-pulse" />
            <p className="text-xs text-neutral-400 font-mono mt-2 z-10">Apunta al código QR del boleto</p>
          </div>

          {/* Quick Select from Active Bookings (For Rapid Testing / Demo) */}
          <div className="bg-neutral-800/60 p-3 rounded-2xl border border-neutral-700">
            <p className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Boletos de prueba rápida:
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {bookings.slice(0, 4).map(b => (
                <button
                  key={b.id}
                  onClick={() => handleScanCode(b.qrCodeData)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    scanResult.booking?.id === b.id
                      ? 'bg-orange-600 text-white font-black'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono text-xs opacity-80 font-bold">{b.id}</span> • {b.passengerName}
                    <div className="text-xs text-neutral-400 font-medium">Asiento #{b.seatNumbers.join(', ')} • {b.origin} ➔ {b.destination}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase shrink-0 ${
                    b.checkInStatus === 'checked_in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
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
              className="flex-1 bg-neutral-800 border-2 border-neutral-700 rounded-2xl px-3.5 py-2.5 text-xs md:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 font-bold"
            />
            <button
              onClick={() => handleScanCode(manualCode)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs md:text-sm font-black transition-colors cursor-pointer"
            >
              Validar
            </button>
          </div>

          {/* Verification Result Card */}
          {scanResult.status !== 'idle' && (
            <div className={`p-4 rounded-3xl border-2 text-xs md:text-sm animate-in zoom-in-95 ${
              scanResult.status === 'valid'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : scanResult.status === 'already_used'
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                : 'bg-red-950/60 border-red-500/50 text-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {scanResult.status === 'valid' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />}
                {scanResult.status === 'already_used' && <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />}
                {scanResult.status === 'invalid' && <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />}

                <div className="flex-1">
                  <p className="font-black text-sm md:text-base">
                    {scanResult.status === 'valid' && '¡Boleto Válido para Abordaje!'}
                    {scanResult.status === 'already_used' && '¡Atención: Boleto Ya Utilizado!'}
                    {scanResult.status === 'invalid' && 'Boleto Inválido o No Encontrado'}
                  </p>

                  {scanResult.booking && (
                    <div className="mt-2 space-y-1 text-neutral-300">
                      <p className="font-bold text-white text-base">{scanResult.booking.passengerName}</p>
                      <p className="text-xs">Asiento(s): <span className="font-black text-orange-400">#{scanResult.booking.seatNumbers.join(', #')}</span></p>
                      <p className="text-xs text-neutral-400">Ruta: {scanResult.booking.origin} ➔ {scanResult.booking.destination}</p>
                      <p className="text-xs text-neutral-400">Abordaje: {scanResult.booking.boardingPoint}</p>
                      
                      {scanResult.status === 'already_used' && (
                        <p className="text-xs text-amber-300 font-mono mt-1 font-bold">
                          Registrado a las {scanResult.booking.checkInTime || '06:22 AM'} en {scanResult.booking.checkInLocation || 'Escala Previa'}.
                        </p>
                      )}

                      {scanResult.status === 'valid' && scanResult.booking.checkInStatus !== 'checked_in' && (
                        <button
                          onClick={handleConfirmCheckin}
                          className="mt-3 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs md:text-sm shadow-md transition-colors cursor-pointer"
                        >
                          Confirmar Abordaje del Pasajero
                        </button>
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
