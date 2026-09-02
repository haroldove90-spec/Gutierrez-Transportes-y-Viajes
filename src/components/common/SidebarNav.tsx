import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Grid, 
  Ticket, 
  Map, 
  Bus, 
  Users, 
  FileText, 
  DollarSign, 
  PlusCircle, 
  Calendar, 
  Wrench, 
  FileSpreadsheet, 
  Receipt, 
  TrendingUp, 
  ShieldCheck, 
  History, 
  Layers,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, setActiveTab, isOpen = true }) => {
  const { currentRole, setCurrentRole } = useApp();

  const getRoleConfig = () => {
    switch (currentRole) {
      case 'pasajero':
        return {
          title: 'Portal Pasajero',
          badge: 'Viajes & Boletos',
          items: [
            { id: 'search', label: 'Buscar Itinerarios', icon: <Search className="w-5 h-5" /> },
            { id: 'seats', label: 'Selección de Asientos', icon: <Grid className="w-5 h-5" /> },
            { id: 'tickets', label: 'Mis Boletos Digitales', icon: <Ticket className="w-5 h-5" /> },
            { id: 'routes', label: 'Tarifario y Paradas', icon: <Map className="w-5 h-5" /> },
          ]
        };
      case 'conductor':
        return {
          title: 'Portal Conductor',
          badge: 'Operación en Ruta',
          items: [
            { id: 'trip', label: 'Mi Viaje Asignado', icon: <Bus className="w-5 h-5" /> },
            { id: 'manifest', label: 'Manifiesto de Pasaje', icon: <Users className="w-5 h-5" /> },
            { id: 'expenses', label: 'Gastos de Ruta', icon: <Receipt className="w-5 h-5" /> },
            { id: 'timeline', label: 'Bitácora de Paradas', icon: <History className="w-5 h-5" /> },
          ]
        };
      case 'secretaria':
        return {
          title: 'Portal Ventanilla',
          badge: 'Ventas y Cotizaciones',
          items: [
            { id: 'counter', label: 'Venta en Ventanilla', icon: <PlusCircle className="w-5 h-5" /> },
            { id: 'quotes', label: 'Cotizador de Rentas', icon: <FileText className="w-5 h-5" /> },
            { id: 'crm', label: 'CRM Leads & Clientes', icon: <Users className="w-5 h-5" /> },
            { id: 'calendar', label: 'Disponibilidad Flota', icon: <Calendar className="w-5 h-5" /> },
          ]
        };
      case 'operaciones':
        return {
          title: 'Portal Operaciones',
          badge: 'Despacho y Flota',
          items: [
            { id: 'dispatch', label: 'Despacho & Asignación', icon: <Bus className="w-5 h-5" /> },
            { id: 'maintenance', label: 'Taller & Kilometraje', icon: <Wrench className="w-5 h-5" /> },
            { id: 'manifests', label: 'Descarga Manifiestos', icon: <FileSpreadsheet className="w-5 h-5" /> },
            { id: 'routes_config', label: 'Configuración Rutas', icon: <Map className="w-5 h-5" /> },
          ]
        };
      case 'finanzas':
        return {
          title: 'Portal Finanzas',
          badge: 'Cobranza y Gastos',
          items: [
            { id: 'receivables', label: 'Control de Cobranza', icon: <DollarSign className="w-5 h-5" /> },
            { id: 'audit_expenses', label: 'Auditoría de Gastos', icon: <Receipt className="w-5 h-5" /> },
            { id: 'cfdi', label: 'Facturación CFDI 4.0', icon: <FileText className="w-5 h-5" /> },
            { id: 'pl_reports', label: 'Utilidad Neta (P&L)', icon: <TrendingUp className="w-5 h-5" /> },
          ]
        };
      case 'director':
        return {
          title: 'Dirección General',
          badge: 'Control Ejecutivo',
          items: [
            { id: 'executive', label: 'KPIs en Tiempo Real', icon: <TrendingUp className="w-5 h-5" /> },
            { id: 'profit_deep', label: 'Rentabilidad Detallada', icon: <Layers className="w-5 h-5" /> },
            { id: 'forensic', label: 'Auditoría Forense', icon: <History className="w-5 h-5" /> },
            { id: 'exceptions', label: 'Aprobación de Cortesías', icon: <ShieldCheck className="w-5 h-5" /> },
          ]
        };
      default:
        return { title: '', badge: '', items: [] };
    }
  };

  const roleConfig = getRoleConfig();
  if (roleConfig.items.length === 0) return null;

  // If closed in tablet / desktop, hide completely
  if (!isOpen) return null;

  return (
    <aside className="hidden md:flex flex-col w-72 lg:w-80 bg-black text-white border-r-2 border-neutral-900 shrink-0 select-none shadow-2xl transition-all duration-300">
      {/* Role Header Info */}
      <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
        <div>
          <h2 className="text-base lg:text-lg font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            {roleConfig.title}
          </h2>
          <p className="text-xs font-black text-orange-400 mt-1 uppercase tracking-wider">{roleConfig.badge}</p>
        </div>
      </div>

      {/* Navigation List with Larger Fonts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-neutral-400 px-3 py-1">
          Módulos del Rol
        </p>

        {roleConfig.items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm lg:text-base font-extrabold transition-all text-left cursor-pointer border ${
                isActive
                  ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-950/60 ring-2 ring-orange-400/50'
                  : 'text-neutral-200 hover:text-white hover:bg-neutral-900 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-black/30 text-white' : 'bg-neutral-900 text-orange-500'}`}>
                  {item.icon}
                </div>
                <span className="tracking-tight">{item.label}</span>
              </div>
              {isActive && (
                <ChevronRight className="w-5 h-5 text-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer: Cerrar Sesión Prominente */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950">
        <button
          onClick={() => setCurrentRole('home')}
          className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-neutral-900 hover:bg-orange-600 text-white text-sm font-black border border-neutral-700 hover:border-orange-500 transition-all cursor-pointer shadow-md active:scale-95 group"
        >
          <LogOut className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
          <span>Cerrar Sesión / Salir</span>
        </button>
      </div>
    </aside>
  );
};
