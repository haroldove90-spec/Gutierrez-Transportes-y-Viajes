import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowDownUp, 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Fuel, 
  Receipt, 
  Ticket, 
  Palmtree, 
  DollarSign, 
  Calendar,
  X
} from 'lucide-react';
import { Booking, RentalQuote, TripExpense, Vehicle, Driver } from '../../types';

interface CashFlowLedgerProps {
  bookings: Booking[];
  quotes: RentalQuote[];
  expenses: TripExpense[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onAddExpense: (expense: Omit<TripExpense, 'id' | 'status'>) => void;
  onApproveExpense: (expenseId: string) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface CashFlowItem {
  id: string;
  flowType: 'inflow' | 'outflow';
  category: 'ticket_sale' | 'charter_advance' | 'fuel' | 'toll' | 'maintenance' | 'viatics' | 'other';
  title: string;
  detail: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: 'reconciled' | 'pending';
  rawExpenseId?: string;
  receiptImage?: string;
}

export const CashFlowLedger: React.FC<CashFlowLedgerProps> = ({
  bookings,
  quotes,
  expenses,
  vehicles,
  drivers,
  onAddExpense,
  onApproveExpense,
  showNotification
}) => {
  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Form for Direct Office Expense
  const [newExpenseForm, setNewExpenseForm] = useState({
    type: 'fuel' as TripExpense['type'],
    amount: '',
    vehicleId: vehicles[0]?.id || '',
    driverId: drivers[0]?.id || '',
    location: 'Oficina Central Manzanillo',
    ticketFolio: '',
    liters: '',
    notes: ''
  });

  // Consolidate all entries
  const allFlowItems = useMemo<CashFlowItem[]>(() => {
    const items: CashFlowItem[] = [];

    // 1. Ticket sales (Inflows)
    bookings.forEach(b => {
      items.push({
        id: `flow-b-${b.id}`,
        flowType: 'inflow',
        category: 'ticket_sale',
        title: `Venta Pasaje Boleto ${b.ticketNumber}`,
        detail: `Pasajero: ${b.passengerName} • ${b.origin} ➔ ${b.destination} • Asientos: #${b.seatNumbers.join(', #')}`,
        date: b.bookingDate || '2026-03-24 10:00',
        amount: b.totalAmount,
        paymentMethod: b.paymentMethod === 'stripe' ? 'Tarjeta (Stripe)' : b.paymentMethod === 'transfer' ? 'SPEI' : 'Efectivo Taquilla',
        status: b.paymentStatus === 'paid' ? 'reconciled' : 'pending'
      });
    });

    // 2. Charter / Rental Advance & Settlements (Inflows)
    quotes.forEach(q => {
      if (q.advancePaid > 0) {
        items.push({
          id: `flow-q-${q.id}`,
          flowType: 'inflow',
          category: 'charter_advance',
          title: `Anticipo Contrato Turístico ${q.id}`,
          detail: `Cliente: ${q.clientName} • Destino: ${q.destination} • Unidad: ${q.vehicleModel}`,
          date: q.createdAt,
          amount: q.advancePaid,
          paymentMethod: 'Transferencia SPEI',
          status: 'reconciled'
        });
      }
    });

    // 3. Operational Expenses (Outflows)
    expenses.forEach(exp => {
      const v = vehicles.find(veh => veh.id === exp.vehicleId);
      const d = drivers.find(drv => drv.id === exp.driverId);
      const isFuel = exp.type === 'fuel';
      const isToll = exp.type === 'toll';
      const isMaint = exp.type === 'maintenance_emergency';

      items.push({
        id: `flow-exp-${exp.id}`,
        flowType: 'outflow',
        category: isFuel ? 'fuel' : isToll ? 'toll' : isMaint ? 'maintenance' : 'viatics',
        title: isFuel ? 'Carga de Diésel / Gasolina' : isToll ? 'Peaje Caseta de Autopista' : isMaint ? 'Mantenimiento / Taller' : 'Viáticos Operador',
        detail: `${exp.location} • Unidad: ${v?.unitNumber || 'S/N'} • Chofer: ${d?.name || 'Oficina'} ${exp.liters ? `• ${exp.liters}L` : ''} ${exp.ticketFolio ? `• Folio: ${exp.ticketFolio}` : ''}`,
        date: exp.date,
        amount: exp.amount,
        paymentMethod: 'Efectivo / Vale Operativo',
        status: exp.status === 'approved' ? 'reconciled' : 'pending',
        rawExpenseId: exp.id,
        receiptImage: exp.receiptImage
      });
    });

    // Sort by date descending
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [bookings, quotes, expenses, vehicles, drivers]);

  // Totals calculations
  const totalInflows = useMemo(() => {
    return allFlowItems
      .filter(i => i.flowType === 'inflow')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [allFlowItems]);

  const totalOutflows = useMemo(() => {
    return allFlowItems
      .filter(i => i.flowType === 'outflow')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [allFlowItems]);

  const netCashFlow = totalInflows - totalOutflows;

  // Filtered list
  const filteredItems = useMemo(() => {
    return allFlowItems.filter(item => {
      if (filterType !== 'all' && item.flowType !== filterType) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDetail = item.detail.toLowerCase().includes(query);
        const matchesAmount = item.amount.toString().includes(query);
        if (!matchesTitle && !matchesDetail && !matchesAmount) return false;
      }
      return true;
    });
  }, [allFlowItems, filterType, categoryFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tipo', 'Categoría', 'Concepto', 'Detalle', 'Fecha', 'Monto MXN', 'Metodo Pago', 'Estado'];
    const rows = filteredItems.map(i => [
      i.id,
      i.flowType === 'inflow' ? 'ENTRADA' : 'SALIDA',
      i.category,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.detail.replace(/"/g, '""')}"`,
      i.date,
      i.flowType === 'inflow' ? i.amount : -i.amount,
      `"${i.paymentMethod}"`,
      i.status === 'reconciled' ? 'Conciliado' : 'Pendiente'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flujo_de_caja_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Reporte de Flujo de Caja descargado en formato CSV.', 'success');
  };

  const handleCreateDirectExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseForm.amount || Number(newExpenseForm.amount) <= 0) {
      showNotification('Ingresa un monto válido.', 'error');
      return;
    }

    onAddExpense({
      tripId: 'gasto-directo-oficina',
      vehicleId: newExpenseForm.vehicleId,
      driverId: newExpenseForm.driverId,
      type: newExpenseForm.type,
      amount: Number(newExpenseForm.amount),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      location: newExpenseForm.location,
      liters: newExpenseForm.type === 'fuel' ? Number(newExpenseForm.liters) || undefined : undefined,
      ticketFolio: newExpenseForm.ticketFolio,
      notes: newExpenseForm.notes
    });

    setShowAddExpenseModal(false);
    setNewExpenseForm({
      type: 'fuel',
      amount: '',
      vehicleId: vehicles[0]?.id || '',
      driverId: drivers[0]?.id || '',
      location: 'Oficina Central Manzanillo',
      ticketFolio: '',
      liters: '',
      notes: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Header and Quick Stats */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600/30 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
                <ArrowDownUp className="w-3.5 h-3.5" /> Flujo de Efectivo en Vivo
              </span>
              <span className="text-xs text-neutral-400 font-bold">
                Caja General & Bancos
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">
              Registro Visual de Ingresos y Egresos
            </h2>
            <p className="text-xs md:text-sm text-neutral-400">
              Control centralizado de venta de boletos, contratos turísticos y gastos operativos en ruta.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Registrar Egreso Directo
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-700"
              title="Descargar libro diario a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Inflows */}
          <div className="bg-neutral-800/80 p-5 rounded-2xl border border-neutral-700/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> Entradas (Ingresos)
              </span>
              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full">
                {allFlowItems.filter(i => i.flowType === 'inflow').length} Movimientos
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-emerald-400">
              +${totalInflows.toLocaleString()} <span className="text-xs font-bold text-neutral-400">MXN</span>
            </p>
            <p className="text-[11px] text-neutral-400">
              Boletos Ruta + Anticipos de Tours
            </p>
          </div>

          {/* Outflows */}
          <div className="bg-neutral-800/80 p-5 rounded-2xl border border-neutral-700/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-rose-400 flex items-center gap-1">
                <ArrowDownLeft className="w-4 h-4" /> Salidas (Egresos)
              </span>
              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full">
                {allFlowItems.filter(i => i.flowType === 'outflow').length} Comprobantes
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-rose-400">
              -${totalOutflows.toLocaleString()} <span className="text-xs font-bold text-neutral-400">MXN</span>
            </p>
            <p className="text-[11px] text-neutral-400">
              Diésel, Casetas, Viáticos y Mantto
            </p>
          </div>

          {/* Net Flow */}
          <div className="bg-neutral-800/80 p-5 rounded-2xl border border-orange-500/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-orange-400 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Balance Neto Operativo
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                netCashFlow >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}>
                {netCashFlow >= 0 ? '✓ Superávit' : 'Déficit'}
              </span>
            </div>
            <p className={`text-2xl md:text-3xl font-black ${
              netCashFlow >= 0 ? 'text-white' : 'text-rose-400'
            }`}>
              ${netCashFlow.toLocaleString()} <span className="text-xs font-bold text-neutral-400">MXN</span>
            </p>
            <p className="text-[11px] text-neutral-400">
              Margen de conversión: {totalInflows > 0 ? Math.round((netCashFlow / totalInflows) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Visual Comparison Bar */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-800">
          <div className="flex justify-between text-xs font-bold text-neutral-400">
            <span>Distribución de Flujo (Ingresos vs Egresos)</span>
            <span>
              {totalInflows + totalOutflows > 0 ? Math.round((totalInflows / (totalInflows + totalOutflows)) * 100) : 50}% Entradas • {totalInflows + totalOutflows > 0 ? Math.round((totalOutflows / (totalInflows + totalOutflows)) * 100) : 50}% Salidas
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden flex">
            <div 
              style={{ width: `${totalInflows + totalOutflows > 0 ? (totalInflows / (totalInflows + totalOutflows)) * 100 : 50}%` }}
              className="bg-emerald-500 h-full transition-all"
              title="Ingresos"
            />
            <div 
              style={{ width: `${totalInflows + totalOutflows > 0 ? (totalOutflows / (totalInflows + totalOutflows)) * 100 : 50}%` }}
              className="bg-rose-500 h-full transition-all"
              title="Egresos"
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Flow Type Toggle */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Todos ({allFlowItems.length})
            </button>
            <button
              onClick={() => setFilterType('inflow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'inflow'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Solo Entradas (+${totalInflows.toLocaleString()})
            </button>
            <button
              onClick={() => setFilterType('outflow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                filterType === 'outflow'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Solo Salidas (-${totalOutflows.toLocaleString()})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por folio, cliente, chofer o concepto..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs md:text-sm font-medium focus:outline-hidden focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Subcategory Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          <span className="text-neutral-500 font-bold text-[11px] uppercase flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categoría:
          </span>
          {[
            { id: 'all', label: 'Todas las Categorías' },
            { id: 'ticket_sale', label: '🎟️ Boletos Ruta' },
            { id: 'charter_advance', label: '🌴 Contratos Tours' },
            { id: 'fuel', label: '⛽ Combustible (PEMEX)' },
            { id: 'toll', label: '🛣️ Peajes de Autopista' },
            { id: 'maintenance', label: '🔧 Taller Mecánico' },
            { id: 'viatics', label: '🥪 Viáticos Operador' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Transaction List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-600">
            Movimientos Registrados ({filteredItems.length})
          </span>
          <span className="text-xs text-neutral-500">
            Orden cronológico más reciente primero
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-neutral-200 space-y-2">
            <p className="text-sm font-black text-neutral-700">No se encontraron movimientos con los filtros aplicados</p>
            <p className="text-xs text-neutral-400">Prueba cambiando el tipo de flujo o limpiando el texto de búsqueda.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isInflow = item.flowType === 'inflow';
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isInflow 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {isInflow ? (
                      item.category === 'charter_advance' ? <Palmtree className="w-5 h-5" /> : <Ticket className="w-5 h-5" />
                    ) : (
                      item.category === 'fuel' ? <Fuel className="w-5 h-5" /> : <Receipt className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        isInflow
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {isInflow ? '+ ENTRADA' : '- SALIDA'}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-400">
                        {item.date}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {item.paymentMethod}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-neutral-900 truncate">
                      {item.title}
                    </h4>

                    <p className="text-xs text-neutral-600 line-clamp-1">
                      {item.detail}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                  <div className="text-left sm:text-right">
                    <p className={`text-base sm:text-lg font-black ${
                      isInflow ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isInflow ? `+$${item.amount.toLocaleString()}` : `-$${item.amount.toLocaleString()}`} <span className="text-xs font-bold text-neutral-400">MXN</span>
                    </p>
                    <p className={`text-[10px] font-black uppercase ${
                      item.status === 'reconciled' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {item.status === 'reconciled' ? '✓ Conciliado' : '⏳ Pendiente'}
                    </p>
                  </div>

                  {item.rawExpenseId && item.status === 'pending' && (
                    <button
                      onClick={() => onApproveExpense(item.rawExpenseId!)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                      title="Conciliar y aprobar comprobante"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Registrar Egreso Directo */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 p-5 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">
                    Registrar Egreso Directo
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    Salida de dinero de caja o comprobante de gasto administrativo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectExpense} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Tipo de Gasto</label>
                  <select
                    value={newExpenseForm.type}
                    onChange={e => setNewExpenseForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900"
                  >
                    <option value="fuel">⛽ Combustible / Diésel</option>
                    <option value="toll">🛣️ Casetas de Peaje</option>
                    <option value="maintenance_emergency">🔧 Mantenimiento / Taller</option>
                    <option value="viatics">🥪 Viáticos Operador</option>
                    <option value="driver_pay">💼 Pago de Honorarios Chofer</option>
                    <option value="parking">🅿️ Estacionamiento / Pensión</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Monto ($ MXN)</label>
                  <input
                    type="number"
                    value={newExpenseForm.amount}
                    onChange={e => setNewExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Ej. 1200"
                    required
                    min="1"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Unidad Asignada</label>
                  <select
                    value={newExpenseForm.vehicleId}
                    onChange={e => setNewExpenseForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.unitNumber} - {v.model} ({v.plate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Responsable / Chofer</label>
                  <select
                    value={newExpenseForm.driverId}
                    onChange={e => setNewExpenseForm(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900"
                  >
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Ubicación / Establecimiento</label>
                  <input
                    type="text"
                    value={newExpenseForm.location}
                    onChange={e => setNewExpenseForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej. Gasolinera PEMEX Tecomán"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Folio del Ticket / Factura</label>
                  <input
                    type="text"
                    value={newExpenseForm.ticketFolio}
                    onChange={e => setNewExpenseForm(prev => ({ ...prev, ticketFolio: e.target.value }))}
                    placeholder="Ej. PEMEX-9981"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900"
                  />
                </div>
              </div>

              {newExpenseForm.type === 'fuel' && (
                <div>
                  <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Litros de Combustible</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newExpenseForm.liters}
                    onChange={e => setNewExpenseForm(prev => ({ ...prev, liters: e.target.value }))}
                    placeholder="Ej. 45.5"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-black uppercase text-neutral-700 block mb-1">Notas / Justificación</label>
                <textarea
                  value={newExpenseForm.notes}
                  onChange={e => setNewExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detalles adicionales del gasto..."
                  rows={2}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Registrar Salida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
