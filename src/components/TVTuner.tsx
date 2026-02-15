import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { X, Tv, Search, Play, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import type { TVChannel, TVProgram } from '../hooks/useTV';
import moment from 'moment-timezone';

interface TVTunerProps {
  channels: TVChannel[];
  loading: boolean;
  onClose: () => void;
  lang: Language;
}

export const TVTuner: React.FC<TVTunerProps> = ({ channels, loading, onClose, lang }) => {
  const [filter, setFilter] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getCurrentProgram = (channel: TVChannel): TVProgram | null => {
    if (!channel.epg || channel.epg.length === 0) return null;
    const now = moment().valueOf();
    return channel.epg.find(p => now >= p.start && now < p.end) || null;
  };

  const getNextProgram = (channel: TVChannel): TVProgram | null => {
    if (!channel.epg || channel.epg.length === 0) return null;
    const now = moment().valueOf();
    return channel.epg.find(p => p.start > now) || null;
  };

  useEffect(() => {
    if (selectedChannel && !selectedChannel.isWeb && videoRef.current) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls();
        hls.loadSource(selectedChannel.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play();
        });
        hlsRef.current = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = selectedChannel.url;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play();
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [selectedChannel]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
            <Tv size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('tv', lang)}</h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{channels.length} {t('channels', lang)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('searchChannels', lang)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-2.5 text-sm outline-none focus:border-blue-500 w-64 transition-all"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/60 hover:text-white border border-white/5"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-white/40 font-bold uppercase tracking-widest animate-pulse">Sintonizando canales...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChannels.map((channel, index) => {
              const current = getCurrentProgram(channel);
              const next = getNextProgram(channel);
              
              return (
                <motion.button
                  key={`${channel.url}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedChannel(channel)}
                  className="group relative flex flex-col p-4 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/50 transition-all hover:bg-white/10 hover:-translate-y-1 shadow-xl text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 shrink-0 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-white/5 shadow-inner">
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/TDTChannels/TDTChannels/main/tdtchannels.png')}
                      />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-sm font-black text-white group-hover:text-blue-400 truncate uppercase tracking-tighter transition-colors">
                        {channel.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {channel.isWeb && <span className="text-[8px] bg-white/10 text-white/40 px-1 rounded uppercase">Web</span>}
                        {current && (
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                            {t('now', lang)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {current ? (
                      <div className="min-h-[40px]">
                        <p className="text-xs font-bold text-white/80 line-clamp-2 leading-snug">
                          {current.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(0, ((moment().valueOf() - current.start) / (current.end - current.start)) * 100))}%` }}
                              className="h-full bg-blue-500"
                            />
                          </div>
                          <span className="text-[9px] text-white/30 font-mono">
                            {moment(current.end).format('HH:mm')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[40px] flex items-center">
                        <p className="text-[10px] text-white/20 italic font-medium">Sin información EPG</p>
                      </div>
                    )}

                    {next && (
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                          {t('next', lang)}: {moment(next.start).format('HH:mm')}
                        </p>
                        <p className="text-[10px] font-medium text-white/40 truncate">
                          {next.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-blue-500 rounded-full p-2 shadow-lg shadow-blue-500/40">
                      <Play className="text-white ml-0.5" size={14} fill="currentColor" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {!loading && filteredChannels.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <Tv size={64} className="mx-auto mb-4" />
            <p className="text-xl font-bold">{t('noChannels', lang)}</p>
          </div>
        )}
      </div>

      {/* Fullscreen Player Overlay */}
      <AnimatePresence>
        {selectedChannel && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[70] bg-black flex flex-col"
          >
            {/* Player Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedChannel(null); setShowSchedule(false); }}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-md border border-white/10"
                >
                  <X size={24} className="text-white" />
                </button>
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-2 pr-6 rounded-2xl border border-white/10 shadow-2xl">
                  <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center p-1.5 border border-white/5">
                    <img src={selectedChannel.logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tighter leading-none">{selectedChannel.name}</p>
                    {getCurrentProgram(selectedChannel) && (
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">En directo</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSchedule(!showSchedule)}
                className={`p-3 rounded-2xl transition-all backdrop-blur-md border flex items-center gap-2 font-bold uppercase tracking-widest text-xs ${showSchedule ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/40' : 'bg-white/10 border-white/10 text-white/60 hover:text-white hover:bg-white/20'}`}
              >
                <Calendar size={18} />
                {t('schedule', lang)}
              </button>
            </div>
            
            <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-black">
              {selectedChannel.isWeb ? (
                <iframe 
                  src={selectedChannel.url} 
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <video 
                  ref={videoRef}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                />
              )}

              {/* EPG Sidebar */}
              <AnimatePresence>
                {showSchedule && selectedChannel.epg && selectedChannel.epg.length > 0 && (
                  <motion.div 
                    initial={{ x: 320 }}
                    animate={{ x: 0 }}
                    exit={{ x: 320 }}
                    className="absolute top-24 right-6 bottom-6 w-80 bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('schedule', lang)}</h3>
                      <button onClick={() => setShowSchedule(false)} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {selectedChannel.epg.map((program, idx) => {
                        const isNow = moment().valueOf() >= program.start && moment().valueOf() < program.end;
                        const isPast = moment().valueOf() >= program.end;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-2xl border transition-all ${isNow ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-white/5 border-white/5'} ${isPast ? 'opacity-30 grayscale' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-black text-blue-400 tracking-tighter">
                                {moment(program.start).format('HH:mm')} - {moment(program.end).format('HH:mm')}
                              </span>
                              {isNow && (
                                <span className="bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">En vivo</span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-white leading-tight">{program.name}</p>
                            {program.description && (
                              <p className="text-[10px] text-white/40 line-clamp-2 mt-2 leading-relaxed">{program.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
