import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  MessageSquare, 
  Bell, 
  Mail, 
  FileText, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Power, 
  FileSpreadsheet, 
  History, 
  Download, 
  Plus 
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { CSVImportModal } from '../components/modals/CSVImportModal';
import { PDFImportModal } from '../components/modals/PDFImportModal';
import { ImportHistoryModal } from '../components/modals/ImportHistoryModal';
import { importService } from '../services/importService';

export const SmartSyncPage: React.FC = () => {
  const { smartSyncSources, toggleSmartSync } = useFinance();

  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const history = importService.getImportHistory();
  const totalImportedAllTime = history.reduce((sum, r) => sum + r.importedCount, 0);

  const getSourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return MessageSquare;
      case 'Bell': return Bell;
      case 'Mail': return Mail;
      case 'FileText': return FileText;
      default: return Edit3;
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-5xl mx-auto">
      {/* Privacy Guarantee Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-brand-950/30 flex items-start gap-4 shadow-xl">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/40">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Privacy Protection Guarantee</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            PocketPilot AI only processes financial information after user consent. All bank statements, SMS parsing, and email receipt extraction occur 100% locally in your web browser.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-5 h-5 text-brand-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">Automated Ingestion Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Smart Sync & Statement Imports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage real-time permission vectors, upload bank statements, and review import logs.
          </p>
        </div>

        {/* Quick Import Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="glass" size="sm" icon={FileSpreadsheet} onClick={() => setIsCSVOpen(true)}>
            Import CSV / Excel
          </Button>

          <Button variant="glass" size="sm" icon={FileText} onClick={() => setIsPDFOpen(true)}>
            Upload PDF Statement
          </Button>

          <Button variant="primary" size="sm" icon={History} onClick={() => setIsHistoryOpen(true)}>
            Import History ({history.length})
          </Button>
        </div>
      </div>

      {/* Sync Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {smartSyncSources.map((source) => {
          const IconComp = getSourceIcon(source.icon);
          const isConnected = source.permissionStatus === 'Connected';

          return (
            <Card key={source.id} glow={isConnected ? 'indigo' : 'none'} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isConnected ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{source.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500">{source.type} Vector</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                          <span className="text-[10px] text-slate-400">{isConnected ? 'Active Listener' : 'Idle'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {source.permissionStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {source.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span>Last Sync: <strong className="text-slate-200">{source.lastSync}</strong></span>
                  {source.type === 'Bank Statement' && (
                    <span className="block text-[10px] text-brand-400 font-semibold">{totalImportedAllTime} items imported total</span>
                  )}
                </div>

                {source.type === 'Bank Statement' ? (
                  <div className="flex gap-1.5">
                    <Button variant="glass" size="sm" onClick={() => setIsCSVOpen(true)}>CSV</Button>
                    <Button variant="primary" size="sm" onClick={() => setIsPDFOpen(true)}>PDF</Button>
                  </div>
                ) : (
                  <Button
                    variant={isConnected ? 'ghost' : 'primary'}
                    size="sm"
                    icon={Power}
                    onClick={() => toggleSmartSync(source.id)}
                  >
                    {isConnected ? 'Disconnect' : 'Grant Permission'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sync Activity Timeline */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" /> Recent Ingestion Activity Timeline
          </h3>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-xs text-brand-400 font-semibold hover:text-brand-300"
          >
            View Full Log →
          </button>
        </div>

        <div className="space-y-3">
          {history.slice(0, 3).map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">{item.fileName || `${item.source} Auto Sync`}</span>
                  <span className="text-[10px] text-slate-400">{item.date}</span>
                </div>
              </div>

              <span className="font-bold text-emerald-400">
                +{item.importedCount} transactions saved
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modals */}
      <CSVImportModal isOpen={isCSVOpen} onClose={() => setIsCSVOpen(false)} />
      <PDFImportModal isOpen={isPDFOpen} onClose={() => setIsPDFOpen(false)} />
      <ImportHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
};
