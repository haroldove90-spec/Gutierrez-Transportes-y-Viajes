import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'color' | 'header';
  compact?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', theme = 'color', compact = false }) => {
  const isDark = theme === 'dark';
  const isHeader = theme === 'header';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          {/* Badge TG */}
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black tracking-tight text-xs border border-white/30 shadow-xs">
            <span className="text-orange-500 font-extrabold">T</span>
            <span className="text-white font-extrabold">G</span>
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-black tracking-tight text-white text-sm">
            GUTIERREZ
          </span>
          <span className="text-[9px] font-extrabold text-orange-200 tracking-wider uppercase">
            Transportes y Viajes
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none">
      {/* Silhouettes of Sprinter Van & Orange Car */}
      <div className="flex items-end justify-center gap-2 mb-2">
        {/* Sprinter Van Vector (Dark Slate / Black) */}
        <svg
          className="h-8 sm:h-9 w-auto text-slate-900 transition-all drop-shadow-xs"
          viewBox="0 0 100 50"
          fill="currentColor"
        >
          <path d="M 5 40 L 5 22 Q 5 12 18 10 L 72 10 Q 82 10 88 18 L 94 28 Q 96 32 96 40 L 88 40 A 6 6 0 0 1 76 40 L 32 40 A 6 6 0 0 1 20 40 Z" />
          <circle cx="26" cy="40" r="5" fill="#000000" />
          <circle cx="26" cy="40" r="2.5" fill="#f97316" />
          <circle cx="82" cy="40" r="5" fill="#000000" />
          <circle cx="82" cy="40" r="2.5" fill="#f97316" />
          {/* Windows */}
          <path d="M 22 14 L 46 14 L 46 25 L 22 25 Z" fill="#ffffff" opacity="0.95" />
          <path d="M 50 14 L 72 14 L 72 25 L 50 25 Z" fill="#ffffff" opacity="0.95" />
          <path d="M 76 15 L 86 20 L 86 25 L 76 25 Z" fill="#ffffff" opacity="0.95" />
        </svg>

        {/* Orange Sport Car Vector */}
        <svg
          className="h-7 sm:h-8 w-auto text-orange-600 drop-shadow-sm -ml-3"
          viewBox="0 0 90 45"
          fill="currentColor"
        >
          <path d="M 6 36 L 6 24 Q 6 18 16 16 L 36 12 Q 46 8 60 12 L 78 20 Q 86 24 86 36 L 76 36 A 6 6 0 0 1 64 36 L 28 36 A 6 6 0 0 1 16 36 Z" />
          <circle cx="22" cy="36" r="5" fill="#000000" />
          <circle cx="22" cy="36" r="2.5" fill="#fed7aa" />
          <circle cx="70" cy="36" r="5" fill="#000000" />
          <circle cx="70" cy="36" r="2.5" fill="#fed7aa" />
          {/* Car Windows */}
          <path d="M 32 15 L 52 14 L 52 24 L 28 24 Z" fill="#ffffff" opacity="0.9" />
          <path d="M 56 14 L 70 19 L 70 24 L 56 24 Z" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {/* GUTIERREZ Custom Bold Font typography */}
      <div className="flex flex-col items-center text-center">
        <span
          className="font-black tracking-tight italic uppercase text-2xl sm:text-3xl leading-none text-black"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          GUTIERREZ
        </span>
        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-600 mt-1">
          TRANSPORTES Y VIAJES
        </span>
      </div>
    </div>
  );
};
