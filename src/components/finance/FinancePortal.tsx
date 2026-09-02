import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, 
  TrendingUp, 
  CheckCircle2, 
  CheckCheck, 
  Download, 
  FileSpreadsheet, 
  Fuel, 
  Building
} from 'lucide-react';

interface FinancePortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FinancePortal: React.FC<FinancePortalProps> = ({ activeTab, setActiveTab }) => {
  const { 
    expenses, 
    approveExpense, 
    quotes, 
    invoices, 
    requestInvoice, 
    bookings, 
    showNotification 
  } = useApp();

  // CFDI 4.0 Form state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [rfc, setRfc] = useState('MEL850410XX9');
  const [clientName, setClientName] = useState('MARIA ELENA LOPEZ');
  const [taxRegime, setTaxRegime] = useState('612 - Personas Físicas con Actividades Empresariales');
  const [cfdiUsage, setCfdiUsage] = useState('G03 - Gastos en general');
  const [postalCode, setPostalCode] = useState('28000');
  const [email, setEmail] = useState('factura@cliente.com');
  const [invoiceAmount, setInvoiceAmount] = useState('450.00');

  const totalReceivables = quotes.reduce((sum, q) => sum + (q.balanceRemaining || 0), 0);
  const totalIncome = bookings.reduce((sum, b) => sum + b.totalAmount, 0) + quotes.reduce((sum, q) => sum + q.advancePaid, 0);
  const totalApprovedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = totalIncome - totalApprovedExpenses;

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = Number((Number(invoiceAmount) / 1.16).toFixed(2));
    const iva = Number((Number(invoiceAmount) - subtotal).toFixed(2));

    requestInvoice({
      clientName,
      rfc,
      taxRegime,
      cfdiUsage,
      postalCode,
      email,
      subtotal,
      iva,
      total: Number(invoiceAmount)
    });

    setShowInvoiceModal(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-neutral-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Financial KPI Summary */}
      <div className="max-w-5xl mx-auto w-full bg-black text-white p-6 md:p-8 rounded-3xl border-2 border-neutral-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm font-black uppercase tracking-wider text-neutral-400">Balance Contable en Tiempo Real</span>
          <span className="text-xs md:text-sm bg-orange-600/30 text-orange-400 font-black px-3 py-1 rounded-full border border-orange-500/30">
            Conciliado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center">
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
            <p className="text-xs text-neutral-400 uppercase font-black">Ingresos Totales</p>
            <p className="text-lg md:text-2xl font-black text-emerald-400 mt-1">${totalIncome.toLocaleString()} MXN</p>
          </div>
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
            <p className="text-xs text-neutral-400 uppercase font-black">Gastos Auditados</p>
            <p className="text-lg md:text-2xl font-black text-orange-400 mt-1">${totalApprovedExpenses.toLocaleString()} MXN</p>
          </div>
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
            <p className="text-xs text-neutral-400 uppercase font-black">Por Cobrar (Saldos)</p>
            <p className="text-lg md:text-2xl font-black text-amber-400 mt-1">${totalReceivables.toLocaleString()} MXN</p>
          </div>
        </div>
      </div>

      {/* Tab 1: Control de Cobranza & Cuentas por Cobrar */}
      {activeTab === 'receivables' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Cuentas por Cobrar</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Monitoreo de anticipos y liquidación de saldos</p>
            </div>
            <span className="text-xs md:text-sm font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-xl">
              ${totalReceivables.toLocaleString()} MXN pendiente
            </span>
          </div>

          <div className="space-y-3">
            {quotes.filter(q => q.balanceRemaining > 0).map(q => (
              <div key={q.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {q.id}
                    </span>
                    <h4 className="text-base md:text-lg font-black text-neutral-900 mt-1">{q.clientName}</h4>
                    <p className="text-xs md:text-sm text-neutral-500">Destino: {q.destination}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-base md:text-lg font-black text-orange-600">${q.balanceRemaining} MXN</span>
                    <p className="text-xs text-neutral-400 font-bold">Saldo por liquidar</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-2xl text-xs md:text-sm">
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Monto Total:</span>
                    <p className="font-black text-neutral-900">${q.totalPrice}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 uppercase font-bold text-[10px] md:text-xs">Anticipo Pagado:</span>
                    <p className="font-black text-emerald-700">${q.advancePaid}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-neutral-500 font-medium">Exigir liquidación antes de la salida</span>
                  <button
                    onClick={() => showNotification(`Recordatorio de cobro enviado a ${q.clientName}`, 'success')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs md:text-sm font-black shadow-md transition-colors cursor-pointer"
                  >
                    Enviar Recordatorio WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Conciliación y Auditoría de Gastos */}
      {activeTab === 'audit_expenses' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Auditoría de Gastos Operativos</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Validación de comprobantes de combustible, peajes y viáticos</p>
            </div>
          </div>

          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-neutral-100 text-neutral-700 shrink-0">
                      {exp.type === 'fuel' ? <Fuel className="w-5 h-5 text-amber-600" /> : <Receipt className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-black text-neutral-900 uppercase">
                        {exp.type === 'fuel' ? `Combustible (${exp.liters} L)` : exp.type === 'toll' ? 'Caseta de Autopista' : 'Viáticos'}
                      </h4>
                      <p className="text-xs md:text-sm text-neutral-500">{exp.location} • Folio: {exp.ticketFolio || 'N/A'}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Fecha: {exp.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base md:text-lg font-black text-neutral-900">${exp.amount} MXN</span>
                    <p className={`text-xs font-black ${
                      exp.status === 'approved' ? 'text-emerald-700' : 'text-orange-600'
                    }`}>
                      {exp.status === 'approved' ? '✓ Conciliado' : 'Pendiente'}
                    </p>
                  </div>
                </div>

                {/* Audit Action button */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Comprobante fotográfico adjunto</span>
                  {exp.status !== 'approved' ? (
                    <button
                      onClick={() => approveExpense(exp.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-black shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Aprobar & Conciliar
                    </button>
                  ) : (
                    <span className="text-xs md:text-sm text-emerald-800 font-black flex items-center gap-1">
                      <CheckCheck className="w-4 h-4" /> Gasto Aprobado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Facturación Electrónica CFDI 4.0 */}
      {activeTab === 'cfdi' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900">Facturación CFDI 4.0</h3>
              <p className="text-xs md:text-sm text-neutral-500 font-bold">Timbrado y gestión tributaria SAT</p>
            </div>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs md:text-sm font-black shadow-md cursor-pointer"
            >
              + Nueva Factura
            </button>
          </div>

          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                      {inv.id}
                    </span>
                    <h4 className="text-base md:text-lg font-black text-neutral-900 mt-1">{inv.clientName}</h4>
                    <p className="text-xs font-mono text-neutral-500 font-bold">RFC: {inv.rfc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base md:text-lg font-black text-neutral-900">${inv.total.toFixed(2)} MXN</span>
                    <p className="text-xs text-emerald-700 font-black">✓ Timbrada SAT</p>
                  </div>
                </div>

                <div className="bg-neutral-50 p-2.5 rounded-xl text-xs font-mono text-neutral-600 truncate border border-neutral-200">
                  UUID: {inv.uuid}
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs md:text-sm">
                  <span className="text-neutral-500">Régimen: {inv.taxRegime.split('-')[0]}</span>
                  <button
                    onClick={() => showNotification(`XML y PDF de factura ${inv.id} descargados`, 'success')}
                    className="flex items-center gap-1.5 font-black text-orange-600 hover:underline cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Descargar XML / PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Reportes Financieros */}
      {activeTab === 'pl_reports' && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-200 space-y-4">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" /> Flujo de Caja y Utilidad Neta
            </h3>

            <div className="space-y-3 pt-1 text-sm md:text-base">
              <div className="flex justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-600 font-medium">Ingresos Totales (Pasajes + Anticipos):</span>
                <span className="font-black text-emerald-700">+${totalIncome.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-600 font-medium">Egresos Operativos (Diésel, Casetas):</span>
                <span className="font-black text-orange-600">-${totalApprovedExpenses.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 text-base md:text-lg font-black">
                <span className="text-neutral-900">Margen Neto Operativo:</span>
                <span className="text-orange-600 font-black">${netOperatingProfit.toLocaleString()} MXN</span>
              </div>
            </div>

            <button
              onClick={() => showNotification('Reporte contable exportado a Excel/PDF', 'success')}
              className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-2xl font-black text-sm md:text-base shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5 text-orange-500" /> Exportar Reporte Contable (Excel / PDF)
            </button>
          </div>
        </div>
      )}

      {/* Modal to create CFDI Invoice */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black uppercase text-neutral-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-600" /> Emisión de Factura CFDI 4.0
              </h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-neutral-500 hover:text-black font-black text-lg p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-3">
              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">RFC del Receptor</label>
                <input
                  type="text"
                  required
                  value={rfc}
                  onChange={e => setRfc(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-mono font-black uppercase text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Nombre o Razón Social</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold uppercase text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Código Postal</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Monto Total ($ MXN)</label>
                  <input
                    type="number"
                    required
                    value={invoiceAmount}
                    onChange={e => setInvoiceAmount(e.target.value)}
                    className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-black text-orange-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-neutral-700 uppercase tracking-wider">Uso de CFDI</label>
                <select
                  value={cfdiUsage}
                  onChange={e => setCfdiUsage(e.target.value)}
                  className="w-full mt-1.5 p-3 bg-neutral-50 border-2 border-neutral-200 rounded-2xl font-bold text-sm"
                >
                  <option value="G03 - Gastos en general">G03 - Gastos en general</option>
                  <option value="D04 - Donativos">D04 - Donativos</option>
                  <option value="CP01 - Pagos">CP01 - Pagos</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm shadow-md transition-colors cursor-pointer"
              >
                Timbrar Factura CFDI 4.0
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
