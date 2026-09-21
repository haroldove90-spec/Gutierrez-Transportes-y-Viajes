import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  User, 
  QrCode, 
  Ticket, 
  Shield, 
  Briefcase, 
  Truck, 
  DollarSign, 
  Compass, 
  LogOut,
  Menu,
  X,
  Database,
  Bell
} from 'lucide-react';

interface HeaderProps {
  onOpenScanner?: () => void;
  onOpenTicket?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenScanner, 
  onOpenTicket, 
  isSidebarOpen = true, 
  onToggleSidebar 
}) => {
  const { 
    currentRole, 
    setCurrentRole, 
    activeTicket, 
    setShowSupabaseModal, 
    supabaseConnected,
    saleAlerts,
    markSaleAlertAsRead
  } = useApp();

  const [showAlertsDropdown, setShowAlertsDropdown] = React.useState(false);
  const unreadAlertsCount = saleAlerts.filter(a => !a.read).length;

  const roleOptions: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'pasajero', label: 'Pasajero / Cliente', icon: <User className="w-4 h-4 md:w-5 md:h-5 text-orange-400" /> },
    { id: 'conductor', label: 'Conductor / Operador', icon: <Truck className="w-4 h-4 md:w-5 md:h-5 text-white" /> },
    { id: 'director', label: 'Admin', icon: <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" /> },
  ];

  const currentRoleInfo = roleOptions.find(r => r.id === currentRole) || {
    id: 'home' as UserRole,
    label: 'Inicio',
    icon: <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
  };

  return (
    <header className="bg-orange-600 text-white border-b-2 border-orange-700 shadow-lg shrink-0 sticky top-0 z-40 select-none">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 md:py-2.5 flex items-center justify-between gap-2">
        
        {/* Left Section: Hamburger Toggle (DESKTOP/TABLET ONLY) + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Hamburger Menu Toggle for Tablet / Desktop Sidebar ONLY (Hidden on mobile) */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex p-2 md:p-2.5 rounded-xl bg-black/30 hover:bg-black text-white transition-all border border-white/20 active:scale-95 cursor-pointer items-center justify-center shrink-0"
              title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Menu className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          )}

          {/* Brand Logo - Unencapsulated rectangular logo */}
          <button
            onClick={() => setCurrentRole('home')}
            className="flex items-center cursor-pointer hover:opacity-95 transition-opacity text-left shrink-0"
            title="Ir al Inicio (Menú de Roles)"
          >
            <Logo compact />
          </button>
        </div>

        {/* Right Section: Active Role Badge, Ticket, Scanner, PWA & Logout Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Active Role Indicator Badge (Hidden on mobile and tablet) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-black/40 text-white rounded-xl border border-white/20 text-xs md:text-sm font-black">
            {currentRoleInfo.icon}
            <span className="tracking-wide">{currentRoleInfo.label}</span>
          </div>

          {/* Quick Active Ticket Button */}
          {activeTicket && currentRole === 'pasajero' && (
            <button
              onClick={onOpenTicket}
              className="p-2 sm:px-2.5 sm:py-1.5 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-extrabold transition-all shadow-md border border-white/20 shrink-0 flex items-center gap-1"
              title="Ver mi boleto digital con QR"
            >
              <Ticket className="w-4 h-4 text-orange-400" />
              <span className="hidden md:inline">Mi Boleto</span>
            </button>
          )}

          {/* Sales Alerts Bell for Admin / Staff */}
          {(currentRole === 'director' || currentRole === 'operaciones' || currentRole === 'secretaria') && (
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-black transition-all border shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 ${
                  unreadAlertsCount > 0 
                    ? 'bg-black text-white border-orange-400' 
                    : 'bg-black/60 hover:bg-black text-white border-white/20'
                }`}
                title="Alertas de ventas y reservaciones"
              >
                <Bell className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden xl:inline text-[11px]">Ventas</span>
                {unreadAlertsCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[9px] font-black animate-pulse">
                    {unreadAlertsCount}
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                )}
              </button>

              {/* Alerts Dropdown Popover */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-neutral-200 text-neutral-900 z-50 p-3 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="text-xs font-black uppercase text-neutral-900 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-orange-600" /> Alertas de Ventas en Vivo
                    </span>
                    <button
                      onClick={() => setShowAlertsDropdown(false)}
                      className="text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {saleAlerts.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-4 text-center">No hay alertas recientes.</p>
                    ) : (
                      saleAlerts.slice(0, 8).map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => markSaleAlertAsRead(alert.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            alert.read ? 'bg-neutral-50 border-neutral-200' : 'bg-orange-50 border-orange-200 font-bold'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-neutral-900">{alert.title}</span>
                            <span className="text-[10px] text-neutral-400">{alert.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 mt-0.5">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Supabase Status / SQL Script Button */}
          <button
            onClick={() => setShowSupabaseModal(true)}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-black/60 hover:bg-black text-white rounded-xl text-xs font-black transition-all border border-white/20 shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
            title="Ver estado de conexión Supabase y copiar Script SQL"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline text-[11px]">Supabase</span>
            <span
              className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
              title={supabaseConnected ? 'Conectado a Supabase' : 'Esperando ejecución de SQL'}
            />
          </button>

          {/* Quick QR Scanner (especially for driver/counter) */}
          {(currentRole === 'conductor' || currentRole === 'secretaria' || currentRole === 'operaciones') && (
            <button
              onClick={onOpenScanner}
              className="p-2 sm:px-2.5 sm:py-1.5 bg-black/80 hover:bg-black text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border border-white/20 shrink-0 cursor-pointer"
              title="Abrir Escáner de Boletos"
            >
              <QrCode className="w-4 h-4 text-orange-400" />
              <span className="hidden md:inline">Escanear</span>
            </button>
          )}

          {/* PWA Install Button in Header */}
          <PWAInstallButton variant="header" />

          {/* Cerrar Sesión / Salir Button - Minimized to ICON ONLY on mobile and tablet */}
          <button
            onClick={() => setCurrentRole('home')}
            className="p-2 sm:px-2.5 sm:py-2 bg-black hover:bg-neutral-900 active:scale-95 text-white rounded-xl border border-white/20 hover:border-white text-xs md:text-sm font-black tracking-wide transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Cerrar sesión y volver al menú principal"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="hidden xl:inline">Cerrar Sesión</span>
          </button>

        </div>
      </div>
    </header>
  );
};
