import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StartBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const StartBanner: React.FC<StartBannerProps> = ({ isVisible, onDismiss }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl px-4"
        >
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-6 overflow-hidden relative group">
            {/* Brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <img 
                src="https://hosted.inled.es/start-simple-blanco-sinfondo.png" 
                alt="Start Logo" 
                className="w-16 h-16 md:w-20 md:h-20 object-contain relative drop-shadow-2xl"
              />
            </div>

            {/* Texto */}
            <div className="flex-grow text-center md:text-left relative">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-blue-500/20">Nuevo</span>
                <h4 className="text-lg font-black text-white tracking-tight">¡Inled presenta Start!</h4>
              </div>
              <p className="text-sm text-white/70 font-medium leading-relaxed">
                Descubre el motor de búsqueda <span className="text-white font-bold">Español</span>, <span className="text-white font-bold">anónimo</span> y <span className="text-white font-bold">privado</span> que respeta tus datos.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400/80 uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  100% Privado
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest">
                  <span className="text-sm">🇪🇸</span>
                  Hecho en España
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 relative shrink-0">
              <a 
                href="https://start.inled.es" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                Probar ahora
                <ExternalLink size={14} />
              </a>
              <button 
                onClick={onDismiss}
                className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-2xl transition-all border border-white/5"
                title="Cerrar para siempre"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
