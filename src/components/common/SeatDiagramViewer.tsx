import React, { useState } from 'react';
import { Seat, SeatLayoutTemplate, SeatLayoutCell } from '../../types';
import { DEFAULT_SEAT_TEMPLATES } from '../../data/seatLayoutTemplates';
import { User, ShieldCheck, Check, AlertCircle, Info, X } from 'lucide-react';

interface SeatDiagramViewerProps {
  // Either a full Trip with concrete seats OR a template for preview
  seats?: Seat[];
  template?: SeatLayoutTemplate;
  selectedSeatNumbers?: number[];
  onSeatClick?: (seatNumber: number, seat?: Seat) => void;
  isAdminView?: boolean;
  interactive?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SeatDiagramViewer: React.FC<SeatDiagramViewerProps> = ({
  seats,
  template,
  selectedSeatNumbers = [],
  onSeatClick,
  isAdminView = false,
  interactive = true,
  title,
  subtitle,
  className = ''
}) => {
  // Selected seat for admin inspection modal / popup (especially helpful on mobile touch screens)
  const [inspectedSeat, setInspectedSeat] = useState<{
    number: number;
    status: string;
    passengerName?: string;
    ticketId?: string;
  } | null>(null);

  // Resolve effective template
  const effectiveTemplate = React.useMemo(() => {
    if (template) return template;
    const seatCount = seats && seats.length > 0 
      ? seats.filter(s => s.type === 'standard' || (!s.type && s.number > 0)).length 
      : 20;
    const match = DEFAULT_SEAT_TEMPLATES.find(t => t.totalSeats === seatCount) 
      || DEFAULT_SEAT_TEMPLATES.find(t => t.id === 'template-sprinter-20')
      || DEFAULT_SEAT_TEMPLATES[0];
    return match;
  }, [template, seats]);

  // Determine grid dimensions
  const maxRow = effectiveTemplate.rows;
  const maxCol = effectiveTemplate.cols;

  // Build a lookup map by `${row}-${col}`
  const seatGrid = React.useMemo(() => {
    const map = new Map<string, {
      type: 'seat' | 'driver' | 'door' | 'walkway' | 'empty';
      number?: number;
      status?: 'available' | 'locked' | 'sold';
      passengerName?: string;
      ticketId?: string;
      originalSeat?: Seat;
    }>();

    // Map existing seats by seat number for fast and accurate status lookup
    const seatByNum = new Map<number, Seat>();
    if (seats && seats.length > 0) {
      seats.forEach(s => {
        if (s.number > 0) {
          seatByNum.set(s.number, s);
        }
      });
    }

    // Populate every cell defined in the template
    effectiveTemplate.cells.forEach(cell => {
      const seatData = cell.seatNumber ? seatByNum.get(cell.seatNumber) : undefined;
      map.set(`${cell.row}-${cell.col}`, {
        type: cell.type,
        number: cell.seatNumber,
        status: seatData?.status || 'available',
        passengerName: seatData?.passengerName,
        ticketId: seatData?.ticketId,
        originalSeat: seatData || (cell.seatNumber ? {
          id: `seat-${cell.seatNumber}`,
          number: cell.seatNumber,
          row: cell.row,
          col: cell.col,
          type: 'standard',
          status: 'available'
        } : undefined)
      });
    });

    return map;
  }, [effectiveTemplate, seats]);

  // Compute statistics
  const stats = React.useMemo(() => {
    const total = effectiveTemplate.totalSeats;
    let occupied = 0;
    if (seats && seats.length > 0) {
      const passengerSeats = seats.filter(s => s.type === 'standard' || (!s.type && s.number > 0));
      occupied = passengerSeats.filter(s => s.status === 'sold' || s.status === 'locked').length;
    }
    const available = Math.max(0, total - occupied);
    return { total, available, occupied };
  }, [effectiveTemplate, seats]);

  const rowsArray = Array.from({ length: maxRow }, (_, i) => i + 1);
  const colsArray = Array.from({ length: maxCol }, (_, i) => i + 1);

  return (
    <div className={`bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200 shadow-sm ${className}`}>
      {/* Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-4">
        <div>
          {title && <h4 className="text-base font-black text-neutral-900">{title}</h4>}
          {subtitle ? (
            <p className="text-xs text-neutral-500 font-medium">{subtitle}</p>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-neutral-600">
                Capacidad: <strong className="text-neutral-900">{stats.total} asientos</strong>
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {stats.available} Libres
              </span>
              <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {stats.occupied} Ocupados
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-2xl border border-neutral-200">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600 shadow-2xs"></span>
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 border border-rose-600 shadow-2xs"></span>
            Ocupado
          </span>
          {interactive && (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-orange-500 border border-orange-600 shadow-2xs"></span>
              Seleccionado
            </span>
          )}
        </div>
      </div>

      {/* Vehicle Outline Frame */}
      <div className="relative max-w-sm mx-auto bg-neutral-100/80 p-4 sm:p-5 rounded-[2.5rem] border-4 border-neutral-300 shadow-inner">
        {/* Front Windshield & Headlights */}
        <div className="relative mb-4">
          <div className="w-40 mx-auto bg-gradient-to-b from-sky-200 to-sky-100 border-2 border-sky-300 text-sky-900 text-[10px] font-black text-center py-1.5 rounded-2xl shadow-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span>PARABRISAS FRONTAL</span>
          </div>
          {/* Headlights */}
          <div className="absolute top-1 left-2 w-3 h-2 rounded-full bg-amber-300 border border-amber-400 shadow-xs"></div>
          <div className="absolute top-1 right-2 w-3 h-2 rounded-full bg-amber-300 border border-amber-400 shadow-xs"></div>
        </div>

        {/* Grid Body */}
        <div className="bg-white/95 p-3.5 sm:p-4 rounded-3xl border border-neutral-200 shadow-xs space-y-2.5">
          {rowsArray.map(row => (
            <div 
              key={row} 
              className="grid gap-2 justify-center items-center"
              style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}
            >
              {colsArray.map(col => {
                const cell = seatGrid.get(`${row}-${col}`);

                // Empty cell
                if (!cell || cell.type === 'empty') {
                  return <div key={`${row}-${col}`} className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12"></div>;
                }

                // Walkway / Aisle
                if (cell.type === 'walkway') {
                  return (
                    <div 
                      key={`${row}-${col}`} 
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center"
                      title="Pasillo"
                    >
                      <div className="w-1 h-8 bg-neutral-200/80 rounded-full"></div>
                    </div>
                  );
                }

                // Driver Position
                if (cell.type === 'driver') {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl bg-neutral-800 text-white flex flex-col items-center justify-center text-[9px] font-black shadow-xs border border-neutral-700"
                      title="Asiento de Conductor / Operador"
                    >
                      <span className="text-[14px] leading-none mb-0.5">☸</span>
                      <span>CHOFER</span>
                    </div>
                  );
                }

                // Door / Entry
                if (cell.type === 'door') {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 flex flex-col items-center justify-center text-[9px] font-bold"
                      title="Puerta de Ascenso y Descenso"
                    >
                      <span className="text-[11px] leading-none mb-0.5">🚪</span>
                      <span>ACCESO</span>
                    </div>
                  );
                }

                // Standard Passenger Seat
                const seatNum = cell.number || 0;
                const isSelected = selectedSeatNumbers.includes(seatNum);
                const isOccupied = cell.status === 'sold' || (cell.status === 'locked' && !isSelected);

                return (
                  <div key={`${row}-${col}`} className="relative group">
                    <button
                      type="button"
                      disabled={!interactive || (isOccupied && !isAdminView)}
                      onClick={() => {
                        if (isAdminView && isOccupied) {
                          setInspectedSeat({
                            number: seatNum,
                            status: cell.status || 'sold',
                            passengerName: cell.passengerName,
                            ticketId: cell.ticketId
                          });
                          return;
                        }
                        if (interactive && onSeatClick && (!isOccupied || isAdminView)) {
                          onSeatClick(seatNum, cell.originalSeat);
                        }
                      }}
                      className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl font-black text-xs md:text-sm flex flex-col items-center justify-center transition-all shadow-xs cursor-pointer relative ${
                        isSelected
                          ? 'bg-orange-500 text-white border-2 border-orange-600 scale-105 shadow-md ring-2 ring-orange-300'
                          : isOccupied
                          ? 'bg-rose-500 text-white border-2 border-rose-600 shadow-rose-200'
                          : 'bg-emerald-500 text-white border-2 border-emerald-600 shadow-emerald-200 hover:scale-105 hover:bg-emerald-600'
                      } ${!interactive && !isAdminView ? 'cursor-default' : ''}`}
                    >
                      <span className="leading-none">{seatNum}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 mt-0.5" />
                      ) : isOccupied ? (
                        <User className="w-3 h-3 mt-0.5 opacity-90" />
                      ) : (
                        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-90 mt-0.5">Libre</span>
                      )}
                    </button>

                    {/* Tooltip for Occupied Seat on Desktop Hover */}
                    {isOccupied && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                        <div className="bg-neutral-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap border border-neutral-700">
                          <p className="text-rose-400 font-black">Asiento {seatNum}: VENDIDO</p>
                          {cell.passengerName && (
                            <p className="text-neutral-200">Pasajero: {cell.passengerName}</p>
                          )}
                          {cell.ticketId && (
                            <p className="text-neutral-400">Folio: {cell.ticketId}</p>
                          )}
                        </div>
                        <div className="w-2 h-2 bg-neutral-900 rotate-45 -mt-1 border-r border-b border-neutral-700"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Rear Bumper Indicator */}
        <div className="w-28 mx-auto mt-4 bg-neutral-200 text-neutral-500 text-[9px] font-black text-center py-1 rounded-full uppercase tracking-widest border border-neutral-300">
          PARTE TRASERA
        </div>
      </div>

      {/* Admin Mobile / Touch Seat Inspection Modal */}
      {inspectedSeat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border-2 border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <h5 className="font-black text-sm text-neutral-900">Asiento #{inspectedSeat.number}</h5>
              </div>
              <button 
                onClick={() => setInspectedSeat(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                Estatus: Ocupado / Vendido
              </div>
              {inspectedSeat.passengerName && (
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-400">Pasajero</span>
                  <p className="font-bold text-neutral-800 text-sm">{inspectedSeat.passengerName}</p>
                </div>
              )}
              {inspectedSeat.ticketId && (
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-400">Folio de Boleto</span>
                  <p className="font-mono font-black text-orange-600">{inspectedSeat.ticketId}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setInspectedSeat(null)}
              className="mt-4 w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-neutral-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
