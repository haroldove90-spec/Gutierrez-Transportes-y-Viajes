import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone, CheckCircle } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'home' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGenericModal, setShowGenericModal] = useState(false);

  // If already running inside installed standalone PWA, hide or show installed badge if in home
  if (isInstalled) {
    if (variant === 'home') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Instalada</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowGenericModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className="p-2 sm:px-2.5 sm:py-1.5 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-bold transition-all shadow-md border border-white/20 active:scale-95 shrink-0 flex items-center gap-1.5"
          title="Instalar aplicación en tu dispositivo"
          aria-label="Instalar aplicación"
        >
          <Download className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
          <span className="hidden md:inline">Instalar</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all border border-orange-400/40 shrink-0"
          title="Instalar App"
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      {variant === 'home' && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 px-5 py-3 bg-black hover:bg-slate-900 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-black/10 border-2 border-slate-900 hover:scale-[1.02] active:scale-98 cursor-pointer"
        >
          <Download className="w-4 h-4 text-orange-500" />
          <span>Instalar Aplicación (PWA)</span>
        </button>
      )}

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-500 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Instalar en iPhone / iPad</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 shrink-0">1</span>
                <p>Toca el botón <Share2 className="w-3.5 h-3.5 inline mx-1 text-orange-400" /> <strong>Compartir</strong> en la barra inferior de Safari.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 shrink-0">2</span>
                <p>Baja en el menú y selecciona <strong>"Agregar a Inicio"</strong> (Add to Home Screen).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400 shrink-0">3</span>
                <p>Presiona <strong>"Agregar"</strong> para usar Gutiérrez Transportes como app nativa sin barras de navegación.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white hover:bg-orange-500"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Generic Browser Installation Info Modal */}
      {showGenericModal && !isIOS && !isInstallable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white relative">
            <button
              onClick={() => setShowGenericModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-500 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Instalar Gutiérrez Transportes</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Puedes instalar esta aplicación haciendo clic en el ícono de instalar en la barra de direcciones de tu navegador (Chrome, Edge) o seleccionando <strong>"Instalar aplicación"</strong> en el menú de 3 puntos.
            </p>
            <button
              onClick={() => setShowGenericModal(false)}
              className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 border border-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
