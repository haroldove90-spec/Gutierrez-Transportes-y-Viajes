import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Share2, Download, CheckCircle2, MapPin, Calendar, Clock, Bus, User, ShieldCheck, Navigation, ExternalLink } from 'lucide-react';
import { Logo } from '../common/Logo';

interface TicketModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  const { routeStops } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (booking?.qrCodeData) {
      QRCode.toDataURL(booking.qrCodeData, {
        width: 240,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [booking]);

  if (!booking) return null;

  const matchingStop = routeStops.find(s => 
    booking.boardingPoint.toLowerCase().includes(s.name.toLowerCase()) || 
    booking.boardingPoint.toLowerCase().includes(s.landmark.toLowerCase()) ||
    s.name.toLowerCase().includes(booking.boardingPoint.toLowerCase()) ||
    booking.boardingPoint.toLowerCase().includes(s.city.toLowerCase())
  );

  const handleShareWhatsApp = () => {
    const text = `*Transportes Gutiérrez - Boleto Digital*\n\n` +
      `🎫 Folio: ${booking.id}\n` +
      `👤 Pasajero: ${booking.passengerName}\n` +
      `📍 Ruta: ${booking.origin} ➔ ${booking.destination}\n` +
      `📅 Fecha: ${booking.date} | ⏰ ${booking.departureTime}\n` +
      `💺 Asiento(s): ${booking.seatNumbers.join(', ')}\n` +
      `🚐 Unidad: ${booking.unitNumber}\n` +
      `📌 Abordaje: ${booking.boardingPoint}\n\n` +
      `¡Presenta tu código QR al operador antes de subir!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md my-auto bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-neutral-300 flex flex-col max-h-[90dvh]">
        {/* Modal Top Header */}
        <div className="bg-black px-4 py-3.5 sm:px-5 sm:py-4 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            <span className="text-sm font-black tracking-wider uppercase text-white">Boleto Digital Oficial</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Ticket Card */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* Logo & Status */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <Logo compact />
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
              </span>
              <p className="text-xs text-neutral-500 font-mono font-bold mt-1">Folio: {booking.id}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-3xl p-4 flex flex-col items-center text-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Boleto" className="w-44 h-44 rounded-2xl bg-white p-2 shadow-sm border border-neutral-200" />
            ) : (
              <div className="w-44 h-44 bg-neutral-200 animate-pulse rounded-2xl flex items-center justify-center text-xs text-neutral-500">
                Generando QR...
              </div>
            )}
            <p className="text-sm font-black text-neutral-900 mt-3">Muestra este código al conductor</p>
            <p className="text-xs text-neutral-500 font-medium">Check-in óptico directo al abordar</p>
          </div>

          {/* Trip Details Grid */}
          <div className="space-y-3 text-sm text-neutral-700">
            {/* Passenger */}
            <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
              <User className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-500 uppercase font-black">Pasajero</p>
                <p className="font-black text-base text-neutral-900 truncate">{booking.passengerName}</p>
              </div>
            </div>

            {/* Route */}
            <div className="bg-neutral-50 p-3.5 rounded-2xl space-y-2 border border-neutral-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-neutral-900 font-black text-base">
                    <span>{booking.origin}</span>
                    <span className="text-orange-600">➔</span>
                    <span>{booking.destination}</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">Abordaje: <span className="font-bold text-neutral-900">{booking.boardingPoint}</span></p>

                  {matchingStop?.mapsUrl && (
                    <a
                      href={matchingStop.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-100" />
                      <span>Abrir Punto de Partida en Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-emerald-200" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Date, Time, Seats & Vehicle */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 p-3 rounded-2xl flex items-center gap-2.5 border border-neutral-200">
                <Calendar className="w-5 h-5 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold">Fecha</p>
                  <p className="font-black text-neutral-900 text-xs md:text-sm">{booking.date}</p>
                </div>
              </div>
              <div className="bg-neutral-50 p-3 rounded-2xl flex items-center gap-2.5 border border-neutral-200">
                <Clock className="w-5 h-5 text-neutral-400 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold">Salida</p>
                  <p className="font-black text-neutral-900 text-xs md:text-sm">{booking.departureTime}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 border-2 border-orange-200 p-3 rounded-2xl text-center">
                <p className="text-xs text-orange-700 font-black uppercase">Asiento(s)</p>
                <p className="text-xl font-black text-orange-600">#{booking.seatNumbers.join(', #')}</p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-2xl flex items-center gap-2.5 border border-neutral-200">
                <Bus className="w-5 h-5 text-neutral-400 shrink-0" />
                <div className="truncate">
                  <p className="text-xs text-neutral-500 uppercase font-bold">Unidad</p>
                  <p className="font-black text-neutral-900 text-xs md:text-sm truncate">{booking.unitNumber}</p>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 px-1 text-neutral-900">
              <span className="text-sm font-bold">Total Pagado:</span>
              <span className="text-lg font-black text-orange-600">${booking.totalAmount} MXN</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 grid grid-cols-2 gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="py-3 px-4 bg-black hover:bg-neutral-900 text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
          >
            <Download className="w-4 h-4 text-orange-500" /> Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  );
};
