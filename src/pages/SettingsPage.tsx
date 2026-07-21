import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Smartphone, Database, Lock, ShieldCheck, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { isInstalled, isOffline, installApp } = usePWA();

  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(user.theme || 'dark');
  const [language, setLanguage] = useState('English');
  const [dataMsg, setDataMsg] = useState<string | null>(null);

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PocketPilot_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDataMsg('Full local data JSON backup downloaded successfully.');
    setTimeout(() => setDataMsg(null), 4000);
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to reset local storage? Mock data will be reloaded.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System & PWA Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure application theme, local storage backups, offline PWA caches, and security.
          </p>
        </div>
      </div>

      {dataMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          {dataMsg}
        </div>
      )}

      {/* Appearance Section */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-brand-400" /> Appearance & Interface Theme
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === 'dark' ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 text-brand-400" />
            <span className="text-xs font-bold">Dark Mode</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === 'light' ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-bold">Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              theme === 'system' ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Monitor className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">System Theme</span>
          </button>
        </div>
      </Card>

      {/* PWA Settings */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" /> Progressive Web App (PWA) Controls
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-white block">App Installation State</span>
              <span className="text-slate-400">{isInstalled ? 'Running in Standalone App Mode' : 'Browser Web Mode'}</span>
            </div>
            {!isInstalled && (
              <Button variant="primary" size="sm" onClick={installApp}>Install PWA</Button>
            )}
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Offline Capability</span>
              <span className="text-slate-400">{isOffline ? 'Offline Mode Active' : 'Service Worker Active (v1.0.0)'}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Active</span>
          </div>
        </div>
      </Card>

      {/* Data Backup & Privacy */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" /> Data Backup & Security
        </h3>

        <div className="flex flex-wrap gap-3">
          <Button variant="glass" icon={Download} onClick={handleBackup}>
            Export Full JSON Backup
          </Button>
          <Button variant="danger" icon={Trash2} onClick={handleClearCache}>
            Reset Local Storage Cache
          </Button>
        </div>
      </Card>
    </div>
  );
};
