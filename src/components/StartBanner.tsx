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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
        >
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="shrink-0">
              <img 
                src="https://hosted.inled.es/start-simple-blanco-sinfondo.png" 
                alt="Start Logo" 
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
              />
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="bg-blue-500/10 text-blue-400/80 text-[10px] font-medium px-1.5 py-0.5 rounded">Nuevo</span>
                <h4 className="text-sm font-semibold text-white/90">Inled presenta Start</h4>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Motor de búsqueda <span className="text-white/70">español</span>, <span className="text-white/70">anónimo</span> y <span className="text-white/70">privado</span>.
              </p>
              
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-white/30">
                  <ShieldCheck size={12} />
                  Privado
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/30">
                  <span className="text-xs">🇪🇸</span>
                  España
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a 
                href="https://start.inled.es" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl text-xs font-medium transition-colors"
              >
                Probar
                <ExternalLink size={12} />
              </a>
              <button 
                onClick={onDismiss}
                className="p-1.5 hover:bg-white/10 text-white/30 hover:text-white/60 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
