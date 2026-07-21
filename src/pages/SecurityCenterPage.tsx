import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Smartphone, HardDrive, Trash2, Download, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { securityService, SecurityConfig } from '../services/securityService';
import { backupService } from '../services/backupService';

export const SecurityCenterPage: React.FC = () => {
  const { transactions, budgets, goals, subscriptions, netWorthAssets } = useFinance();
  const { user } = useAuth();

  const [secConfig, setSecConfig] = useState<SecurityConfig>(() => securityService.getConfig());
  const [pinInput, setPinInput] = useState(secConfig.pinCode);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleTogglePin = () => {
    const updated = { ...secConfig, pinLockEnabled: !secConfig.pinLockEnabled };
    setSecConfig(updated);
    securityService.saveConfig(updated);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...secConfig, pinCode: pinInput, pinLockEnabled: true };
    setSecConfig(updated);
    securityService.saveConfig(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleFullBackup = () => {
    backupService.createBackup({
      user,
      transactions,
      budgets,
      goals,
      subscriptions,
      netWorthAssets,
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">Zero-Trust Vault</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Security & Privacy Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            App PIN Lock, biometric readiness, trusted session management, data backups, and privacy controls.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Security Index</span>
          <h3 className="text-2xl font-extrabold text-emerald-400">{secConfig.securityScore} / 100</h3>
        </div>
      </div>

      {/* App PIN Lock Section */}
      <Card glow="indigo" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/40 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">App PIN Lock & Biometrics</h3>
              <p className="text-xs text-slate-400">Require 4-digit PIN or fingerprint/Face ID when launching app</p>
            </div>
          </div>

          <button
            onClick={handleTogglePin}
            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
              secConfig.pinLockEnabled ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              secConfig.pinLockEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {secConfig.pinLockEnabled && (
          <form onSubmit={handleSavePin} className="pt-3 border-t border-slate-800 flex items-center gap-3">
            <input
              type="password"
              maxLength={4}
              placeholder="Set 4-digit PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white tracking-widest outline-none focus:border-brand-500"
            />
            <Button type="submit" variant="primary" size="sm">Save PIN</Button>
            {savedMsg && <span className="text-xs font-bold text-emerald-400">PIN Saved!</span>}
          </form>
        )}
      </Card>

      {/* Cloud & Local Data Backup */}
      <Card glow="emerald" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Data Backup & Export Center</h3>
              <p className="text-xs text-slate-400">Download complete encrypted JSON payload of all transactions and goals</p>
            </div>
          </div>

          <Button variant="secondary" icon={Download} onClick={handleFullBackup}>
            Create Full Backup
          </Button>
        </div>
      </Card>
    </div>
  );
};
