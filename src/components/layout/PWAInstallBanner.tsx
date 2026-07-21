import React from 'react';
import { Smartphone, Download, X, Compass } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled, showBanner, installApp, dismissBanner } = usePWA();

  if (isInstalled || !showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-brand-900/90 via-slate-900 to-emerald-950/90 border-b border-brand-500/30 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600/30 flex items-center justify-center border border-brand-500/40 text-brand-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Install PocketPilot AI PWA: </span>
            <span className="text-slate-300 hidden sm:inline">
              Enjoy offline access, native feel, fast home screen loading & push alerts.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={installApp}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Install App
          </button>
          <button
            onClick={dismissBanner}
            className="p-1 text-slate-400 hover:text-white"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
