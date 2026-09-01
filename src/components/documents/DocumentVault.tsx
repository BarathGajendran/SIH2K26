import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderArchive,
  FileText,
  Download,
  Eye,
  Search,
  Building,
  ShieldCheck,
  Calendar,
  FileCheck,
} from 'lucide-react';

export const DocumentVault: React.FC = () => {
  const { parcels, showNotification } = useApp();
  const [search, setSearch] = useState('');

  const documents = [
    {
      id: 'doc-001',
      title: 'Patta Passbook No. 4821 - SF 142/3A',
      category: 'Patta Record',
      village: 'Thondamuthur',
      owner: 'Ramasamy Gounder',
      fileSize: '2.4 MB',
      updatedAt: '2025-01-14',
    },
    {
      id: 'doc-002',
      title: 'Field Measurement Book (FMB) Sketch - SF 142/3A',
      category: 'FMB Sketch',
      village: 'Thondamuthur',
      owner: 'Ramasamy Gounder',
      fileSize: '4.1 MB',
      updatedAt: '2025-02-18',
    },
    {
      id: 'doc-003',
      title: 'Village Cadastral Revenue Map (Sheet #4)',
      category: 'Village Map',
      village: 'Thondamuthur',
      owner: 'Revenue Department',
      fileSize: '18.2 MB',
      updatedAt: '2024-11-30',
    },
    {
      id: 'doc-004',
      title: 'GNSS RTK Carrier-Phase Raw RINEX Log (TN-CORS-CBTR)',
      category: 'Raw RINEX',
      village: 'Anaimalai',
      owner: 'Survey of India',
      fileSize: '8.6 MB',
      updatedAt: '2025-02-22',
    },
    {
      id: 'doc-005',
      title: '7/12 Extract Record of Rights - SF 88/1',
      category: 'Record of Rights',
      village: 'Alandi',
      owner: 'Dnyaneshwar Patil',
      fileSize: '1.8 MB',
      updatedAt: '2025-02-10',
    },
    {
      id: 'doc-006',
      title: 'RTC Pahani Land Registry - SF 52/2',
      category: 'RTC Pahani',
      village: 'Channarayapatna',
      owner: 'Manjunatha Gowda',
      fileSize: '3.2 MB',
      updatedAt: '2025-01-28',
    },
  ];

  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.village.toLowerCase().includes(q) ||
      d.owner.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  });

  const handleDownload = (title: string) => {
    showNotification(`Downloading digital copy of "${title}"`, 'info');
  };

  return (
    <div className="h-[calc(100vh-61px)] overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 transition-colors">
      {/* Top Banner */}
      <div className="portal-hero-banner p-6 rounded-3xl border border-white/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 font-mono text-[11px] font-bold">
              DIGITAL LAND VAULT
            </span>
            <span className="text-xs text-white/80">| Integrated Land Records & Cadastral Archives</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">Land Records & FMB Document Vault</h1>
          <p className="text-xs text-white/90 mt-0.5">
            Cryptographically signed digital repository of Patta Passbooks, FMB sketches, Revenue Village Maps, and raw GNSS RINEX observation logs.
          </p>
        </div>

        <div className="font-mono text-xs text-white bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
          Total Documents: <span className="text-white font-black text-sm">{filtered.length}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search documents by title, village, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 shadow-xs"
        />
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold">
                  {doc.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">{doc.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Village: {doc.village} • Owner: {doc.owner}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {doc.updatedAt}
              </span>

              <button
                onClick={() => handleDownload(doc.title)}
                className="portal-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
