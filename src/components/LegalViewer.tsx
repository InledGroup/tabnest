import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ShieldCheck, Scale, FileText, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// @ts-ignore
import disclaimerContent from '../legal/Disclaimer.md?raw';
// @ts-ignore
import privacyContent from '../legal/PrivacyPolicy.md?raw';
// @ts-ignore
import termsContent from '../legal/TermsOfService.md?raw';

type LegalType = 'disclaimer' | 'privacy' | 'terms' | 'tdtchannels';

interface LegalViewerProps {
  onClose: () => void;
  initialView?: LegalType;
}

export const LegalViewer: React.FC<LegalViewerProps> = ({ onClose, initialView = 'disclaimer' }) => {
  const [activeTab, setActiveTab] = useState<LegalType>(initialView);
  const [tdtReadme, setTdtReadme] = useState('');

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/LaQuay/TDTChannels/refs/heads/master/README.md')
      .then(res => res.text())
      .then(setTdtReadme)
      .catch(() => setTdtReadme('Error cargando README de TDTChannels.'));
  }, []);

  const getContent = () => {
    switch (activeTab) {
      case 'disclaimer': return disclaimerContent;
      case 'privacy': return privacyContent;
      case 'terms': return termsContent;
      case 'tdtchannels': return tdtReadme;
      default: return '';
    }
  };

  const tabs = [
    { id: 'disclaimer', label: 'Aviso Legal', icon: Info },
    { id: 'privacy', label: 'Privacidad', icon: ShieldCheck },
    { id: 'terms', label: 'Términos', icon: Scale },
    { id: 'tdtchannels', label: 'TDTChannels', icon: FileText },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900/90 border border-white/10 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-2">
          <h2 className="text-sm font-black text-white/30 uppercase tracking-widest mb-4">Información Legal</h2>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LegalType)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
          <div className="mt-auto pt-6 hidden md:block">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 rounded-2xl text-sm font-bold border border-white/5 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 md:p-12 custom-scrollbar bg-black/10">
          <div className="absolute top-6 right-6 md:hidden">
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
          </div>
          <article className="prose prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-white/60 prose-strong:text-white prose-a:text-blue-400">
            <ReactMarkdown>{getContent()}</ReactMarkdown>
          </article>
        </div>
      </motion.div>
    </motion.div>
  );
};
