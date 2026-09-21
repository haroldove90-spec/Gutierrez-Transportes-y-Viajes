import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { AppLayout } from './components/common/AppLayout';
import { HomeRoleSelector } from './components/home/HomeRoleSelector';
import { PassengerPortal } from './components/passenger/PassengerPortal';
import { DriverPortal } from './components/driver/DriverPortal';
import { SecretaryPortal } from './components/secretary/SecretaryPortal';
import { OperationsPortal } from './components/operations/OperationsPortal';
import { FinancePortal } from './components/finance/FinancePortal';
import { DirectorPortal } from './components/director/DirectorPortal';
import { TicketModal } from './components/modals/TicketModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { DriverAcceptedNotificationModal } from './components/modals/DriverAcceptedNotificationModal';
import { SplashScreen } from './components/common/SplashScreen';
import { Booking } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function AppContent() {
  const { 
    currentRole, 
    setCurrentRole, 
    notification, 
    activeTicket, 
    setActiveTicket,
    activeDriverAcceptedNotification,
    dismissDriverAcceptedNotification
  } = useApp();
  
  // Splash Screen state on initial launch - ONLY show if not already logged in to a role
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      const savedRole = localStorage.getItem('gutierrez_current_role_v1');
      if (savedRole && savedRole !== 'home') {
        return false; // Skip splash screen on reload when user has an active session!
      }
      const alreadyShown = sessionStorage.getItem('gutierrez_splash_seen');
      if (alreadyShown) return false;
    } catch {}
    return true;
  });

  const getDefaultTabForRole = (role: string): string => {
    switch (role) {
      case 'pasajero':
        return 'search';
      case 'conductor':
        return 'trip';
      case 'secretaria':
        return 'counter';
      case 'operaciones':
        return 'dispatch';
      case 'finanzas':
        return 'receivables';
      case 'director':
        return 'executive';
      default:
        return 'search';
    }
  };

  const getInitialTab = (): string => {
    try {
      const savedRole = localStorage.getItem('gutierrez_current_role_v1') || currentRole;
      if (savedRole && savedRole !== 'home') {
        const savedTab = localStorage.getItem(`gutierrez_tab_${savedRole}`);
        if (savedTab) return savedTab;
        return getDefaultTabForRole(savedRole);
      }
    } catch {}
    return getDefaultTabForRole(currentRole);
  };

  // Active Tab state inside current portal with persistent memory
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      if (currentRole !== 'home') {
        localStorage.setItem(`gutierrez_tab_${currentRole}`, tab);
      }
    } catch {}
  };

  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [modalBooking, setModalBooking] = useState<Booking | null>(activeTicket);
  
  // Sidebar state for tablet / desktop view (persisted in localStorage)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gutierrez_sidebar_open_v1');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('gutierrez_sidebar_open_v1', String(next));
      } catch {}
      return next;
    });
  };

  // Sync tab defaults when user switches role (remembering last visited tab per role)
  const prevRoleRef = React.useRef<string>(currentRole);

  useEffect(() => {
    if (prevRoleRef.current !== currentRole) {
      prevRoleRef.current = currentRole;
      if (currentRole !== 'home') {
        try {
          const savedTab = localStorage.getItem(`gutierrez_tab_${currentRole}`);
          if (savedTab) {
            setActiveTabState(savedTab);
            return;
          }
        } catch {}
        setActiveTabState(getDefaultTabForRole(currentRole));
      }
    }
  }, [currentRole]);

  const handleOpenTicket = (booking: Booking) => {
    setModalBooking(booking);
    setActiveTicket(booking);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden bg-white font-sans text-neutral-900">
      
      {/* Top Header - ONLY shown inside portals, HIDDEN on Home */}
      {currentRole !== 'home' && (
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenTicket={() => {
            if (activeTicket) {
              setModalBooking(activeTicket);
              setIsTicketModalOpen(true);
            }
          }}
        />
      )}

      {/* Main Content: Pure White Home Role Selector OR Portal Layout */}
      {currentRole === 'home' ? (
        <HomeRoleSelector onSelectRole={(role) => setCurrentRole(role)} />
      ) : (
        <AppLayout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isSidebarOpen={isSidebarOpen}
        >
          {/* Active Role Portal */}
          {currentRole === 'pasajero' && (
            <PassengerPortal
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenTicket={handleOpenTicket}
            />
          )}

          {currentRole === 'conductor' && (
            <DriverPortal
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {currentRole === 'secretaria' && (
            <SecretaryPortal
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenTicket={handleOpenTicket}
            />
          )}

          {currentRole === 'operaciones' && (
            <OperationsPortal
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {currentRole === 'finanzas' && (
            <FinancePortal
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {currentRole === 'director' && (
            <DirectorPortal
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Global Bottom Navigation (Visible on mobile, hidden on md: and up) */}
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </AppLayout>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className={`px-4 py-2.5 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-600'
              : notification.type === 'error'
              ? 'bg-neutral-950 text-orange-200 border-orange-600'
              : 'bg-black text-white border-neutral-700'
          }`}>
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />}
            {notification.type === 'info' && <Info className="w-5 h-5 text-orange-400 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Ticket Pass Modal */}
      {isTicketModalOpen && (
        <TicketModal
          booking={modalBooking}
          onClose={() => setIsTicketModalOpen(false)}
        />
      )}

      {/* Optical QR Scanner Modal */}
      {isScannerOpen && (
        <QRScannerModal
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Driver Accepted Trip / Tour Notification Modal for Admin & Operations */}
      {activeDriverAcceptedNotification && (
        <DriverAcceptedNotificationModal
          notification={activeDriverAcceptedNotification}
          onClose={dismissDriverAcceptedNotification}
          onViewTrip={(notif) => {
            dismissDriverAcceptedNotification();
            if (notif.type === 'tour') {
              setCurrentRole('director');
              setActiveTab('tours');
            } else {
              setCurrentRole('director');
              setActiveTab('agenda');
            }
          }}
        />
      )}

      {/* Initial Brand Splash Screen - Shows complete unencapsulated logo */}
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            try {
              sessionStorage.setItem('gutierrez_splash_seen', 'true');
            } catch {}
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
