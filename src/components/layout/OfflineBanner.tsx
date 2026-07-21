import React from 'react';
import { WifiOff } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const OfflineBanner: React.FC = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600/90 text-slate-950 font-bold text-xs py-1.5 px-4 text-center backdrop-blur-md flex items-center justify-center gap-2 shadow-lg">
      <WifiOff className="w-4 h-4" />
      <span>You are currently offline. PocketPilot AI is using cached local storage data.</span>
    </div>
  );
};
