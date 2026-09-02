import React from 'react';
import { UserRole } from '../../types';
import { Logo } from '../common/Logo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { 
  User, 
  Truck, 
  Briefcase, 
  Compass, 
  DollarSign, 
  ShieldCheck
} from 'lucide-react';

interface HomeRoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export const HomeRoleSelector: React.FC<HomeRoleSelectorProps> = ({ onSelectRole }) => {
  const roles: { id: UserRole; name: string; icon: React.ReactNode }[] = [
    {
      id: 'pasajero',
      name: 'Pasajero / Cliente',
      icon: <User className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />,
    },
    {
      id: 'conductor',
      name: 'Conductor / Operador',
      icon: <Truck className="w-10 h-10 md:w-12 md:h-12 text-black" />,
    },
    {
      id: 'secretaria',
      name: 'Secretaría / Mostrador',
      icon: <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />,
    },
    {
      id: 'operaciones',
      name: 'Operaciones y Taller',
      icon: <Compass className="w-10 h-10 md:w-12 md:h-12 text-black" />,
    },
    {
      id: 'finanzas',
      name: 'Finanzas y Control',
      icon: <DollarSign className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />,
    },
    {
      id: 'director',
      name: 'Dirección General',
      icon: <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-black" />,
    },
  ];

  return (
    <div className="flex-1 w-full min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 overflow-y-auto">
      <div className="w-full max-w-4xl flex flex-col items-center my-auto py-6 sm:py-10">
        
        {/* Brand Logo Header - Centered on Top */}
        <div className="mb-8 sm:mb-12 text-center flex flex-col items-center">
          <Logo theme="light" size="lg" />
          <div className="h-1.5 w-24 bg-orange-600 rounded-full mt-5 mb-3"></div>
          <p className="text-sm sm:text-base md:text-lg font-black text-neutral-600 uppercase tracking-widest">
            Selecciona tu Perfil de Acceso
          </p>
        </div>

        {/* 2-Column Grid on Mobile, 2 or 3 Columns on Tablet/Desktop with larger cards */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="group flex flex-col items-center justify-center p-5 sm:p-7 rounded-3xl bg-neutral-50 hover:bg-orange-50 border-2 border-neutral-200 hover:border-orange-600 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-orange-600/15 active:scale-95 text-center cursor-pointer min-h-[150px] sm:min-h-[180px]"
            >
              {/* Icon Centered on Top */}
              <div className="p-4 rounded-2xl bg-white border-2 border-neutral-200 group-hover:border-orange-500 group-hover:bg-orange-600/10 transition-all mb-4 group-hover:scale-110 shadow-xs">
                {role.icon}
              </div>

              {/* Role Name Underneath */}
              <span className="font-black text-sm sm:text-base md:text-lg text-neutral-900 group-hover:text-orange-600 transition-colors leading-snug">
                {role.name}
              </span>
            </button>
          ))}
        </div>

        {/* PWA Install Button with Orange Styling */}
        <div className="flex flex-col items-center gap-2">
          <PWAInstallButton variant="home" />
        </div>

      </div>

      {/* Footer info note */}
      <footer className="text-center text-xs sm:text-sm font-bold text-neutral-500 pb-2">
        Gutierrez Transportes y Viajes &copy; {new Date().getFullYear()} &bull; Sistema Operativo de Rutas
      </footer>
    </div>
  );
};
