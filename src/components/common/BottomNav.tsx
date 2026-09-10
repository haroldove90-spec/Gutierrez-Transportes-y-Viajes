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
  CalendarDays
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole } = useApp();

  const getNavItems = () => {
    switch (currentRole) {
      case 'pasajero':
        return [
          { id: 'search', label: 'Itinerarios', icon: <Search className="w-5 h-5 text-white" /> },
          { id: 'seats', label: 'Asientos', icon: <Grid className="w-5 h-5 text-white" /> },
          { id: 'tickets', label: 'Mis Boletos', icon: <Ticket className="w-5 h-5 text-white" /> },
          { id: 'routes', label: 'Tarifario', icon: <Map className="w-5 h-5 text-white" /> },
        ];
      case 'conductor':
        return [
          { id: 'trip', label: 'Mi Viaje', icon: <Bus className="w-5 h-5 text-white" /> },
          { id: 'manifest', label: 'Manifiesto', icon: <Users className="w-5 h-5 text-white" /> },
          { id: 'expenses', label: 'Gastos Ruta', icon: <Receipt className="w-5 h-5 text-white" /> },
          { id: 'timeline', label: 'Bitácora', icon: <History className="w-5 h-5 text-white" /> },
        ];
      case 'secretaria':
        return [
          { id: 'counter', label: 'Ventanilla', icon: <PlusCircle className="w-5 h-5 text-white" /> },
          { id: 'quotes', label: 'Cotizador', icon: <FileText className="w-5 h-5 text-white" /> },
          { id: 'crm', label: 'CRM Leads', icon: <Users className="w-5 h-5 text-white" /> },
          { id: 'calendar', label: 'Flota', icon: <Calendar className="w-5 h-5 text-white" /> },
        ];
      case 'operaciones':
        return [
          { id: 'dispatch', label: 'Despacho', icon: <Bus className="w-5 h-5 text-white" /> },
          { id: 'fares_manager', label: 'Tarifas', icon: <DollarSign className="w-5 h-5 text-white" /> },
          { id: 'charter_schedule', label: 'Agenda Tours', icon: <CalendarDays className="w-5 h-5 text-white" /> },
          { id: 'maintenance', label: 'Taller & Km', icon: <Wrench className="w-5 h-5 text-white" /> },
          { id: 'routes_config', label: 'Puntos Maps', icon: <Map className="w-5 h-5 text-white" /> },
        ];
      case 'finanzas':
        return [
          { id: 'receivables', label: 'Cobranza', icon: <DollarSign className="w-5 h-5 text-white" /> },
          { id: 'audit_expenses', label: 'Auditoría', icon: <Receipt className="w-5 h-5 text-white" /> },
          { id: 'cfdi', label: 'CFDI 4.0', icon: <FileText className="w-5 h-5 text-white" /> },
          { id: 'pl_reports', label: 'P&L Utilidad', icon: <TrendingUp className="w-5 h-5 text-white" /> },
        ];
      case 'director':
        return [
          { id: 'executive', label: 'KPIs Hoy', icon: <TrendingUp className="w-5 h-5 text-white" /> },
          { id: 'fares_manager', label: 'Tarifas', icon: <DollarSign className="w-5 h-5 text-white" /> },
          { id: 'charter_schedule', label: 'Agenda Tours', icon: <CalendarDays className="w-5 h-5 text-white" /> },
          { id: 'fleet_photos', label: 'Flota & Fotos', icon: <Bus className="w-5 h-5 text-white" /> },
          { id: 'profit_deep', label: 'Rentabilidad', icon: <Layers className="w-5 h-5 text-white" /> },
          { id: 'routes_config', label: 'Puntos Maps', icon: <Map className="w-5 h-5 text-white" /> },
          { id: 'exceptions', label: 'Aprobaciones', icon: <ShieldCheck className="w-5 h-5 text-white" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (navItems.length === 0) return null;

  return (
    <nav className="md:hidden bg-orange-600 border-t border-orange-700 px-2 py-1.5 shrink-0 z-30 shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-black/30 text-white font-extrabold shadow-inner ring-1 ring-white/30 scale-105'
                  : 'text-white/85 hover:text-white hover:bg-orange-700/60 font-medium'
              }`}
            >
              <div className="p-1 rounded-lg">
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap text-white font-bold">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white absolute -bottom-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
