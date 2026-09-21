import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bus, 
  Shield, 
  Camera,
  TrendingUp,
  CalendarDays,
  Users,
  Palmtree,
  Car
} from 'lucide-react';
import { RouteLocationsManager } from '../common/RouteLocationsManager';
import { RouteFaresManager } from '../common/RouteFaresManager';
import { FleetPhotosManager } from './FleetPhotosManager';
import { TripsCalendarAgenda } from './TripsCalendarAgenda';
import { DriversManager } from './DriversManager';
import { ToursManager } from './ToursManager';
import { SeatLayoutBuilder } from './SeatLayoutBuilder';
import { SalesManager } from './SalesManager';
import { LiveTripSupervisionModal } from '../modals/LiveTripSupervisionModal';

interface DirectorPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DirectorPortal: React.FC<DirectorPortalProps> = ({ activeTab, setActiveTab }) => {
  const { 
    bookings, 
    quotes, 
    expenses, 
    vehicles, 
    trips,
    setActiveTicket
  } = useApp();

  const [selectedSupervisionTripId, setSelectedSupervisionTripId] = React.useState<string | null>(null);

  const totalSalesMonth = bookings.reduce((sum, b) => sum + b.totalAmount, 0) + quotes.reduce((sum, q) => sum + q.totalPrice, 0);
  const totalIncomeToday = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalApprovedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const totalReceivables = quotes.reduce((sum, q) => sum + (q.balanceRemaining || 0), 0);
  const netMarginPercent = Math.round(((totalIncomeToday - totalApprovedExpenses) / (totalIncomeToday || 1)) * 100);

  return (
    <div className="flex-1 min-w-0 w-full max-w-full flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar bg-neutral-100 p-3 sm:p-4 md:p-6 lg:p-8 space-y-6">
      {/* Tab 1: Métricas (Las métricas ejecutivas ahora son exclusivas de este módulo) */}
      {(activeTab === 'executive' || activeTab === 'metricas') && (
        <div className="max-w-6xl mx-auto w-full space-y-6">
          {/* Executive Header Banner con los 4 KPIs principales */}
          <div className="bg-black text-white p-6 md:p-8 rounded-3xl border-2 border-neutral-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-white">Panel Admin</h3>
                  <p className="text-xs md:text-sm text-neutral-400">Supervisión Ejecutiva e Indicadores Financieros</p>
                </div>
              </div>
              <span className="text-xs md:text-sm bg-orange-600/30 text-orange-400 font-black px-3 py-1 rounded-full border border-orange-500/30">
                Acceso Total
              </span>
            </div>

            {/* 4 Core Executive KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                <p className="text-xs text-neutral-400 uppercase font-black">Ingresos del Día</p>
                <p className="text-lg md:text-2xl font-black text-emerald-400 mt-1">${totalIncomeToday.toLocaleString()} MXN</p>
                <p className="text-xs text-neutral-500 mt-0.5">{bookings.length} boletos emitidos</p>
              </div>
              <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                <p className="text-xs text-neutral-400 uppercase font-black">Ventas del Mes</p>
                <p className="text-lg md:text-2xl font-black text-white mt-1">${totalSalesMonth.toLocaleString()} MXN</p>
                <p className="text-xs text-neutral-500 mt-0.5">Pasajes + Rentas</p>
              </div>
              <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                <p className="text-xs text-neutral-400 uppercase font-black">Margen Neto</p>
                <p className="text-lg md:text-2xl font-black text-orange-400 mt-1">{netMarginPercent}%</p>
                <p className="text-xs text-emerald-400 mt-0.5">+5.2% vs mes anterior</p>
              </div>
              <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                <p className="text-xs text-neutral-400 uppercase font-black">Saldo por Cobrar</p>
                <p className="text-lg md:text-2xl font-black text-amber-400 mt-1">${totalReceivables.toLocaleString()} MXN</p>
                <p className="text-xs text-neutral-500 mt-0.5">{quotes.filter(q => q.balanceRemaining > 0).length} clientes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">Tablero Central</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900">
              Métricas del Negocio
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-medium">
              Indicadores clave de rendimiento, ocupación de unidades y corridas activas.
            </p>
          </div>

          {/* Active Fleet Health */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-base md:text-lg font-black text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-5 h-5" /> Estado Operativo de la Flota
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-neutral-600 font-bold">{vehicles.length} unidades registradas</span>
                <button
                  onClick={() => setActiveTab('fleet_photos')}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Car className="w-3.5 h-3.5 text-orange-400" /> Catálogo de Renta
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs md:text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <p className="text-2xl md:text-3xl font-black">{vehicles.filter(v => v.status === 'active' || v.status === 'in_route').length}</p>
                <p className="text-xs md:text-sm font-bold mt-1">Activas</p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-50 text-orange-800 border border-orange-200">
                <p className="text-2xl md:text-3xl font-black">{vehicles.filter(v => v.status === 'in_route').length}</p>
                <p className="text-xs md:text-sm font-bold mt-1">En Ruta</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 text-purple-800 border border-purple-200">
                <p className="text-2xl md:text-3xl font-black">{vehicles.filter(v => v.status === 'tour_contract' || v.status === 'reserved_rent').length}</p>
                <p className="text-xs md:text-sm font-bold mt-1">En Tour / Renta</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-100 text-neutral-800 border border-neutral-300">
                <p className="text-2xl md:text-3xl font-black">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                <p className="text-xs md:text-sm font-bold mt-1">Taller</p>
              </div>
            </div>
          </div>

          {/* Today's Active Corridas */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Ocupación de Corridas de Hoy</h4>
              <span className="text-xs text-neutral-400 font-bold">Haz clic en cualquier viaje para monitorear en vivo</span>
            </div>
            <div className="space-y-3">
              {trips.map(t => {
                const totalSeats = t.seats.filter(s => s.type === 'standard' || (!s.type && s.number > 0)).length || t.totalSeats || 19;
                return (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedSupervisionTripId(t.id)}
                    className="p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200 hover:border-orange-500 hover:bg-orange-50/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm md:text-base text-neutral-900 group-hover:text-orange-600 transition-colors">
                          {t.departureTime} • {t.routeTitle}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          🔍 Monitorear
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-500 font-bold">
                        Ingreso: ${t.totalRevenue.toLocaleString()} MXN • Unidad: {t.unitNumber || 'Sprinter'} • Chofer: {t.driverName || 'Por asignar'}
                      </p>
                    </div>
                    <span className="text-xs md:text-sm font-black bg-white border-2 border-neutral-200 px-3 py-1.5 rounded-xl text-neutral-900 self-start sm:self-auto group-hover:border-orange-400">
                      {t.occupiedSeatsCount} / {totalSeats} Plazas Ocupadas
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Ventas & Monitoreo de Boletos */}
      {activeTab === 'sales' && (
        <div className="max-w-6xl mx-auto w-full">
          <SalesManager 
            onSelectTrip={t => setSelectedSupervisionTripId(t.id)} 
            onOpenTicket={b => setActiveTicket(b)} 
          />
        </div>
      )}

      {/* Tab: Agenda (Calendario de Próximos Viajes) */}
      {(activeTab === 'agenda' || activeTab === 'charter_schedule') && (
        <div className="max-w-6xl mx-auto w-full">
          <TripsCalendarAgenda />
        </div>
      )}

      {/* Tab: Choferes (Alta y Gestión de Operadores) */}
      {activeTab === 'drivers' && (
        <div className="max-w-6xl mx-auto w-full">
          <DriversManager />
        </div>
      )}

      {/* Tab: Tours (Registro y Gestión de Viajes Especiales) */}
      {activeTab === 'tours' && (
        <div className="max-w-6xl mx-auto w-full">
          <ToursManager />
        </div>
      )}

      {/* Tab: Gestión Integral de Tarifas y Precios Oficiales (Intacto) */}
      {activeTab === 'fares_manager' && (
        <div className="max-w-6xl mx-auto w-full">
          <RouteFaresManager />
        </div>
      )}

      {/* Tab: Configuración de Puntos de Partida y Ubicaciones GPS (Intacto) */}
      {activeTab === 'routes_config' && (
        <div className="max-w-6xl mx-auto w-full">
          <RouteLocationsManager />
        </div>
      )}

      {/* Tab: Gestión de Flotilla y Fotos */}
      {activeTab === 'fleet_photos' && (
        <div className="max-w-6xl mx-auto w-full">
          <FleetPhotosManager />
        </div>
      )}

      {/* Tab: Diagramas de Asientos de Autos y Camionetas */}
      {activeTab === 'seat_layouts' && (
        <div className="max-w-6xl mx-auto w-full">
          <SeatLayoutBuilder />
        </div>
      )}

      {/* Live Trip Supervision Modal */}
      {selectedSupervisionTripId && (
        <LiveTripSupervisionModal
          tripId={selectedSupervisionTripId}
          onClose={() => setSelectedSupervisionTripId(null)}
          onOpenTicket={b => setActiveTicket(b)}
        />
      )}
    </div>
  );
};
