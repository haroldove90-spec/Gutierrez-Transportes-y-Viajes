import React, { useEffect, useState } from 'react';
import { GUTIERREZ_LOGO_URL } from './Logo';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onFinish,
  duration = 1600 
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
    }, duration - 400);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div 
      onClick={() => onFinish && onFinish()}
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 select-none transition-opacity duration-400 cursor-pointer ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-xl flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        {/* Full Logo - Completely Unencapsulated and 100% visible */}
        <div className="w-full flex items-center justify-center px-4">
          <img
            src={GUTIERREZ_LOGO_URL}
            alt="Gutiérrez Transportes y Viajes"
            className="w-auto max-h-36 sm:max-h-48 md:max-h-60 max-w-[92vw] object-contain transition-transform duration-500 hover:scale-102"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/gutierrezlogo.png';
            }}
          />
        </div>

        {/* Elegant Minimalist Loading Indicator in #C50407 */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 w-full max-w-xs px-4">
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-600 rounded-full animate-pulse transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-black tracking-widest uppercase text-neutral-400">
            <span>Gutiérrez Rutas</span>
            <span className="text-orange-600 font-bold">18 Años</span>
          </div>
        </div>
      </div>

      {/* Discreet footer prompt */}
      <div className="absolute bottom-6 text-center text-xs font-semibold text-neutral-400">
        Toca en cualquier parte para continuar
      </div>
    </div>
  );
};
