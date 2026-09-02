import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, 
  Bus, 
  CheckCircle2, 
  Shield, 
  CheckCheck
} from 'lucide-react';

interface DirectorPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DirectorPortal: React.FC<DirectorPortalProps> = ({ activeTab }) => {
  const { 
    bookings, 
    quotes, 
    expenses, 
    vehicles, 
    trips, 
    auditLogs, 
    exceptions, 
    approveException 
  } = useApp();

  const totalSalesMonth = bookings.reduce((sum, b) => sum + b.totalAmount, 0) + quotes.reduce((sum, q) => sum + q.totalPrice, 0);
  const totalIncomeToday = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalApprovedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const totalReceivables = quotes.reduce((sum, q) => sum + (q.balanceRemaining || 0), 0);
  const netMarginPercent = Math.round(((totalIncomeToday - totalApprovedExpenses) / (totalIncomeToday || 1)) * 100);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Executive Header Banner */}
      <div className="max-w-5xl mx-auto w-full bg-black text-white p-6 md:p-8 rounded-3xl border-2 border-neutral-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-orange-500" />
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-white">Dirección General</h3>
              <p className="text-xs md:text-sm text-neutral-400">Supervisión Ejecutiva y Control de Negocio</p>
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

      {/* Tab 1: KPIs Hoy & Resumen General */}
      {activeTab === 'executive' && (
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Active Fleet Health */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base md:text-lg font-black text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-5 h-5" /> Estado Operativo de la Flota
              </span>
              <span className="text-xs md:text-sm text-neutral-600 font-bold">{vehicles.length} unidades registradas</span>
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
                <p className="text-2xl md:text-3xl font-black">{vehicles.filter(v => v.status === 'reserved_rent').length}</p>
                <p className="text-xs md:text-sm font-bold mt-1">En Renta</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-100 text-neutral-800 border border-neutral-300">
                <p className="text-2xl md:text-3xl font-black">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                <p className="text-xs md:text-sm font-bold mt-1">Taller</p>
              </div>
            </div>
          </div>

          {/* Today's Active Corridas */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-3">
            <h4 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Ocupación de Corridas de Hoy</h4>
            <div className="space-y-3">
              {trips.map(t => (
                <div key={t.id} className="p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm">
                  <div>
                    <span className="font-black text-sm md:text-base text-neutral-900">{t.departureTime} • {t.routeTitle}</span>
                    <p className="text-xs md:text-sm text-neutral-500 font-bold">Ingreso Total: ${t.totalRevenue} MXN</p>
                  </div>
                  <span className="text-xs md:text-sm font-black bg-white border-2 border-neutral-200 px-3 py-1.5 rounded-xl text-neutral-900 self-start sm:self-auto">
                    {t.occupiedSeatsCount} / 19 Plazas Ocupadas
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rentabilidad Multidimensional P&L */}
      {activeTab === 'profit_deep' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-2">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-orange-600 flex items-center gap-2">
              <Layers className="w-5 h-5" /> Rentabilidad por Unidad y Ruta (P&L)
            </h3>
            <p className="text-sm text-neutral-600">
              Desglose de Ingresos vs. Costos Operativos (Combustible, Casetas, Nómina) por vehículo.
            </p>
          </div>

          <div className="space-y-3">
            {vehicles.map(v => {
              const unitTrips = trips.filter(t => t.vehicleId === v.id);
              const unitIncome = unitTrips.reduce((s, t) => s + t.totalRevenue, 0) + (v.status === 'reserved_rent' ? 24150 : 0);
              const unitExpenses = expenses.filter(e => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0) || 1200;
              const unitMargin = unitIncome - unitExpenses;

              return (
                <div key={v.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base md:text-lg font-black text-neutral-900">{v.unitNumber} ({v.model})</h4>
                      <p className="text-xs text-neutral-500 font-mono font-bold">Placas: {v.plate}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base md:text-lg font-black text-emerald-700">+${unitMargin.toLocaleString()} MXN</span>
                      <p className="text-xs text-neutral-400 font-bold">Utilidad Neta</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-2xl text-xs md:text-sm">
                    <div>
                      <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Ingresos Generados:</span>
                      <p className="font-black text-neutral-900">${unitIncome.toLocaleString()} MXN</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Gastos Operativos:</span>
                      <p className="font-black text-orange-600">-${unitExpenses.toLocaleString()} MXN</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Auditoría Forense Integral */}
      {activeTab === 'forensic' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Historial Forense de Auditoría</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Registro inmutable de cambios y transacciones del sistema</p>
            </div>
          </div>

          <div className="space-y-3">
            {auditLogs.map(log => (
              <div key={log.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs space-y-2 text-xs md:text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs md:text-sm text-orange-600 uppercase">{log.action}</span>
                  <span className="text-xs font-mono text-neutral-400 font-bold">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                </div>
                <p className="font-bold text-neutral-900 text-sm md:text-base">{log.userName}</p>
                <div className="bg-neutral-50 p-3 rounded-2xl text-xs text-neutral-700 space-y-1 border border-neutral-200">
                  <p><strong>Entidad:</strong> {log.entity} ({log.entityId})</p>
                  {log.previousValue && <p className="text-neutral-500"><strong>Anterior:</strong> {log.previousValue}</p>}
                  {log.newValue && <p className="text-emerald-800 font-bold"><strong>Nuevo:</strong> {log.newValue}</p>}
                </div>
                <p className="text-xs font-mono text-neutral-400 text-right">IP Registrada: {log.ipAddress}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Aprobación de Excepciones y Cortesías */}
      {activeTab === 'exceptions' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Aprobación de Excepciones</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Cancelaciones, cortesías, descuentos y reembolsos especiales</p>
            </div>
            <span className="text-xs md:text-sm font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-xl">
              {exceptions.filter(e => e.status === 'pending').length} pendientes
            </span>
          </div>

          <div className="space-y-3">
            {exceptions.map(exc => (
              <div key={exc.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                      {exc.type.toUpperCase()}
                    </span>
                    <h4 className="text-base md:text-lg font-black text-neutral-900 mt-2">Boleto / Folio: {exc.bookingId}</h4>
                    <p className="text-xs md:text-sm text-neutral-500">Solicitado por: <strong className="text-neutral-800">{exc.requestedBy}</strong></p>
                  </div>
                  <div className="text-right">
                    <span className="text-base md:text-lg font-black text-neutral-900">${exc.amount} MXN</span>
                    <p className={`text-xs font-black ${
                      exc.status === 'approved' ? 'text-emerald-700' : 'text-orange-600'
                    }`}>
                      {exc.status === 'approved' ? '✓ Aprobado' : 'Pendiente'}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 p-3.5 rounded-2xl text-xs md:text-sm text-neutral-800 border border-neutral-200">
                  <p className="font-medium italic">"{exc.reason}"</p>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Fecha: {exc.createdAt}</span>
                  {exc.status === 'pending' ? (
                    <button
                      onClick={() => approveException(exc.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-black shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Autorizar Excepción
                    </button>
                  ) : (
                    <span className="text-xs md:text-sm text-emerald-800 font-black flex items-center gap-1">
                      <CheckCheck className="w-4 h-4" /> Autorizado por Dirección
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
