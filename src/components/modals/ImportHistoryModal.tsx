import React from 'react';
import { History, FileSpreadsheet, FileText, MessageSquare, Bell, Mail, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { importService } from '../../services/importService';

interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ isOpen, onClose }) => {
  const history = importService.getImportHistory();

  const getSourceIcon = (src: string) => {
    switch (src) {
      case 'CSV': return FileSpreadsheet;
      case 'PDF': return FileText;
      case 'SMS': return MessageSquare;
      case 'Notification': return Bell;
      case 'Gmail': return Mail;
      default: return History;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statement Import Audit History"
      subtitle="Complete chronological log of imported CSV, PDF, and automated ingestion vectors"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No import history recorded yet.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
            {history.map((record) => {
              const IconComp = getSourceIcon(record.source);
              return (
                <div key={record.id} className="p-3.5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{record.fileName || `${record.source} Ingestion Batch`}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{record.date}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-950 font-mono">{record.source}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-extrabold text-emerald-400 block">
                      +{record.importedCount} Imported
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {record.skippedCount} Skipped • {record.failedCount} Failed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
