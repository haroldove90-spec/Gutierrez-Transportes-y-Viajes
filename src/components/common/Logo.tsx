import React from 'react';

export const GUTIERREZ_LOGO_URL = 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/log/gutierrezlogo.png';
export const GUTIERREZ_ICON_URL = 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/log/gutierrezicono.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'splash';
  theme?: 'light' | 'dark' | 'color' | 'header';
  compact?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  theme = 'color', 
  compact = false,
  className = '' 
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={GUTIERREZ_ICON_URL}
          alt="Gutiérrez Icono"
          className="w-8 h-8 md:w-9 md:h-9 object-contain shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/gutierrezicono.png';
          }}
        />
        <div className="flex flex-col leading-tight">
          <span className="font-black tracking-tight text-white text-sm md:text-base leading-none">
            GUTIÉRREZ
          </span>
          <span className="text-[9px] md:text-[10px] font-extrabold text-red-100 tracking-wider uppercase mt-0.5">
            Transportes y Viajes
          </span>
        </div>
      </div>
    );
  }

  // Size mapping with natural aspect ratio (unencapsulated, 100% visible)
  const sizeClasses = {
    sm: 'h-8 sm:h-10',
    md: 'h-14 sm:h-16 md:h-20',
    lg: 'h-20 sm:h-24 md:h-28',
    xl: 'h-24 sm:h-32 md:h-36',
    splash: 'max-h-32 sm:max-h-44 md:max-h-56 max-w-[92vw]'
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Complete Official Logo - Unencapsulated, 100% visible */}
      <img
        src={GUTIERREZ_LOGO_URL}
        alt="Gutiérrez Transportes y Viajes"
        className={`${sizeClasses} w-auto object-contain transition-all duration-300`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/gutierrezlogo.png';
        }}
      />
    </div>
  );
};
