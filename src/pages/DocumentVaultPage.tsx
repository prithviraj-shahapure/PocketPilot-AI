import React, { useState } from 'react';
import { Shield, FileText, Plus, Search, Trash2, ExternalLink, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { DocumentVaultItem } from '../types';

export const DocumentVaultPage: React.FC = () => {
  const { documentVault, addDocument, deleteDocument } = useFinance();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentVaultItem['category']>('Tax Document');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await addDocument({
      title,
      category,
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '1.4 MB',
    });

    setTitle('');
    setIsAddOpen(false);
  };

  const filteredDocs = documentVault.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-brand-400" />
            <span className="text-xs uppercase font-extrabold text-brand-300 tracking-wider">Encrypted Document Vault</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Document Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Secure vault for tax invoices, insurance policies, warranties, bank statements, and loan agreements.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(!isAddOpen)}>
          Upload Document
        </Button>
      </div>

      {/* Add Form */}
      {isAddOpen && (
        <Card className="p-5 space-y-4 border border-brand-500/40">
          <h3 className="text-sm font-bold text-white">Upload New Document to Vault</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Document Title (e.g. FY25 Form 16 Tax File)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Tax Document">Tax Document</option>
              <option value="Insurance">Insurance</option>
              <option value="Receipt">Receipt</option>
              <option value="Invoice">Invoice</option>
              <option value="Warranty">Warranty</option>
              <option value="Bank Statement">Bank Statement</option>
              <option value="Loan Doc">Loan Doc</option>
            </select>
            <Button type="submit" variant="primary">Upload Document</Button>
          </form>
        </Card>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-brand-500"
        />
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} glow="indigo" className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {doc.category}
                </span>
                <button onClick={() => deleteDocument(doc.id)} className="p-1 text-slate-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-base font-bold text-white leading-tight">{doc.title}</h3>
              <p className="text-[10px] text-slate-400">Uploaded {doc.uploadDate} • {doc.fileSize}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold">Encrypted (AES-256)</span>
              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-400 font-bold hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Preview
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
