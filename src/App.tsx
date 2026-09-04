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
import { SplashScreen } from './components/common/SplashScreen';
import { Booking } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

function AppContent() {
  const { currentRole, setCurrentRole, notification, activeTicket, setActiveTicket } = useApp();
  
  // Splash Screen state on initial launch
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Active Tab state inside current portal
  const [activeTab, setActiveTab] = useState<string>('search');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [modalBooking, setModalBooking] = useState<Booking | null>(activeTicket);
  
  // Sidebar state for tablet / desktop view (toggleable via hamburger button)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Sync tab defaults when user switches role
  useEffect(() => {
    switch (currentRole) {
      case 'pasajero':
        setActiveTab('search');
        break;
      case 'conductor':
        setActiveTab('trip');
        break;
      case 'secretaria':
        setActiveTab('counter');
        break;
      case 'operaciones':
        setActiveTab('dispatch');
        break;
      case 'finanzas':
        setActiveTab('receivables');
        break;
      case 'director':
        setActiveTab('executive');
        break;
      default:
        break;
    }
  }, [currentRole]);

  const handleOpenTicket = (booking: Booking) => {
    setModalBooking(booking);
    setActiveTicket(booking);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white font-sans text-neutral-900">
      
      {/* Top Header - ONLY shown inside portals, HIDDEN on Home */}
      {currentRole !== 'home' && (
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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

      {/* Initial Brand Splash Screen - Shows complete unencapsulated logo */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
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
