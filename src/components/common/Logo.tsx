import React from 'react';

export const GUTIERREZ_LOGO_URL = 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/log/gutierrezlogo2.png';
export const GUTIERREZ_ICON_URL = 'https://lyjuhvqpvomryytxyztr.supabase.co/storage/v1/object/public/log/gutierrezicono.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'splash' | 'header';
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
  // In compact/header mode: Show ONLY the unencapsulated rectangular logo (NO text, NO white box)
  if (compact || size === 'header') {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <img
          src={GUTIERREZ_LOGO_URL}
          alt="Gutiérrez Transportes y Viajes"
          className="h-7 sm:h-8 md:h-9.5 w-auto max-w-[140px] sm:max-w-[200px] md:max-w-[260px] object-contain transition-all"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/gutierrezlogo2.png';
          }}
        />
      </div>
    );
  }

  // Size mapping with natural rectangular aspect ratio (unencapsulated, 100% visible)
  const sizeClasses = {
    sm: 'h-8 sm:h-10',
    md: 'h-12 sm:h-16 md:h-20',
    lg: 'h-18 sm:h-22 md:h-26',
    xl: 'h-20 sm:h-28 md:h-32',
    splash: 'max-h-32 sm:max-h-44 md:max-h-56 max-w-[92vw]',
    header: 'h-8 sm:h-9 md:h-10'
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Complete Official Logo - Unencapsulated, 100% visible, no bounding box */}
      <img
        src={GUTIERREZ_LOGO_URL}
        alt="Gutiérrez Transportes y Viajes"
        className={`${sizeClasses} w-auto object-contain transition-all duration-300`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/gutierrezlogo2.png';
        }}
      />
    </div>
  );
};
