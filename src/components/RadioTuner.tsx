import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import { X, Radio, Search, Play, Calendar, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import type { RadioChannel } from '../hooks/useRadio';
import type { TVProgram } from '../hooks/useTV';
import moment from 'moment-timezone';

interface RadioTunerProps {
  channels: RadioChannel[];
  loading: boolean;
  onClose: () => void;
  lang: Language;
}

export const RadioTuner: React.FC<RadioTunerProps> = ({ channels, loading, onClose, lang }) => {
  const [filter, setFilter] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<RadioChannel | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [expandedAmbits, setExpandedAmbits] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const currentProgramRef = useRef<HTMLDivElement>(null);

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const groupedChannels = useMemo(() => {
    const groups: Record<string, RadioChannel[]> = {};
    filteredChannels.forEach(channel => {
      if (!groups[channel.ambit]) {
        groups[channel.ambit] = [];
      }
      groups[channel.ambit].push(channel);
    });
    return groups;
  }, [filteredChannels]);

  const ambits = Object.keys(groupedChannels);

  const toggleAmbit = (ambit: string) => {
    setExpandedAmbits(prev => 
      prev.includes(ambit) ? prev.filter(a => a !== ambit) : [...prev, ambit]
    );
  };

  const getCurrentProgram = (channel: RadioChannel): TVProgram | null => {
    if (!channel.epg || channel.epg.length === 0) return null;
    const now = moment().valueOf();
    return channel.epg.find(p => now >= p.start && now < p.end) || null;
  };

  const getNextProgram = (channel: RadioChannel): TVProgram | null => {
    if (!channel.epg || channel.epg.length === 0) return null;
    const now = moment().valueOf();
    return channel.epg.find(p => p.start > now) || null;
  };

  useEffect(() => {
    if (showSchedule && currentProgramRef.current) {
      setTimeout(() => {
        currentProgramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [showSchedule, selectedChannel]);

  useEffect(() => {
    if (selectedChannel && audioRef.current) {
      setIsBuffering(true);
      if (selectedChannel.url.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }
          const hls = new Hls();
          hls.loadSource(selectedChannel.url);
          hls.attachMedia(audioRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audioRef.current?.play().catch(() => setIsBuffering(false));
          });
          hls.on(Hls.Events.FRAG_LOADED, () => setIsBuffering(false));
          hlsRef.current = hls;
        } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          audioRef.current.src = selectedChannel.url;
          audioRef.current.addEventListener('loadedmetadata', () => {
            audioRef.current?.play().catch(() => setIsBuffering(false));
          });
        }
      } else {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        audioRef.current.src = selectedChannel.url;
        audioRef.current.play().catch(() => setIsBuffering(false));
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
          <div className="p-3 bg-purple-500 rounded-2xl shadow-lg shadow-purple-500/20">
            <Radio size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('radio', lang)}</h2>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{channels.length} {t('channels', lang)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={18} />
            <input 
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('searchChannels', lang)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-2.5 text-sm outline-none focus:border-purple-500 w-64 transition-all"
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
      <div className="flex-grow overflow-y-auto p-8 custom-scrollbar space-y-8">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin opacity-20" />
            <p className="text-white/40 font-bold uppercase tracking-widest animate-pulse">Sintonizando emisoras...</p>
          </div>
        ) : (
          ambits.map((ambit) => (
            <div key={ambit} className="space-y-4">
              <button 
                onClick={() => toggleAmbit(ambit)}
                className="flex items-center gap-2 text-lg font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest"
              >
                {expandedAmbits.includes(ambit) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                {ambit}
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full ml-2">{groupedChannels[ambit].length}</span>
              </button>

              <AnimatePresence>
                {(!filter || expandedAmbits.includes(ambit)) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden"
                  >
                    {groupedChannels[ambit].map((channel, index) => {
                      const current = getCurrentProgram(channel);
                      const next = getNextProgram(channel);
                      
                      return (
                        <motion.button
                          key={`${channel.url}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.005 }}
                          onClick={() => setSelectedChannel(channel)}
                          className={`group relative flex flex-col p-4 rounded-3xl border transition-all hover:-translate-y-1 shadow-xl text-left ${selectedChannel?.id === channel.id ? 'bg-purple-500/20 border-purple-500/50 shadow-purple-500/10' : 'bg-white/5 border-white/5 hover:border-purple-500/30 hover:bg-white/10'}`}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 shrink-0 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-white/5 shadow-inner relative text-white">
                              <img 
                                src={channel.logo} 
                                alt={channel.name} 
                                className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/TDTChannels/TDTChannels/main/tdtchannels.png')}
                              />
                              {selectedChannel?.id === channel.id && (
                                <div className="absolute inset-0 bg-purple-500/40 flex items-center justify-center">
                                  <div className="flex gap-1 items-end h-4">
                                    <div className="w-1 bg-white animate-bounce" style={{ animationDuration: '0.5s' }} />
                                    <div className="w-1 bg-white animate-bounce" style={{ animationDuration: '0.8s' }} />
                                    <div className="w-1 bg-white animate-bounce" style={{ animationDuration: '0.6s' }} />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="text-sm font-black text-white group-hover:text-purple-400 truncate uppercase tracking-tighter transition-colors">
                                {channel.name}
                              </p>
                              {current && (
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1">
                                  {t('now', lang)}
                                </p>
                              )}
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
                                      className="h-full bg-purple-500"
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

                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            <div className="bg-purple-500 rounded-full p-2 shadow-lg shadow-blue-500/40">
                              <Play className="text-white ml-0.5" size={14} fill="currentColor" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Mini Player Overlay */}
      <AnimatePresence>
        {selectedChannel && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="p-6 bg-slate-950/80 backdrop-blur-3xl border-t border-white/10 flex items-center justify-between gap-8 relative"
          >
            {/* Spinner de Carga de Audio */}
            {isBuffering && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-purple-600 px-4 py-1 rounded-full flex items-center gap-2 shadow-xl border border-purple-400/30">
                <Loader2 size={12} className="text-white animate-spin" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Bufferizando...</span>
              </div>
            )}

            <div className="flex items-center gap-6 flex-grow max-w-2xl text-white">
              <div className="w-20 h-20 bg-black/40 rounded-3xl overflow-hidden flex items-center justify-center p-3 border border-white/5 shadow-2xl shrink-0">
                <img src={selectedChannel.logo} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate">{selectedChannel.name}</h3>
                  <span className="bg-purple-500 text-[10px] font-black px-2 py-0.5 rounded-full text-white uppercase tracking-widest shadow-lg shadow-purple-500/20">On Air</span>
                </div>
                {getCurrentProgram(selectedChannel) ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-purple-400 truncate">{getCurrentProgram(selectedChannel)?.name}</p>
                    <p className="text-xs text-white/40 line-clamp-1">{getCurrentProgram(selectedChannel)?.description}</p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-white/40 italic">Emisión en directo</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <audio 
                ref={audioRef} 
                controls 
                className="hidden" 
                onPlaying={() => setIsBuffering(false)}
                onWaiting={() => setIsBuffering(true)}
                onCanPlay={() => setIsBuffering(false)}
              />
              
              <button 
                onClick={() => setShowSchedule(!showSchedule)}
                className={`p-4 rounded-2xl transition-all border flex items-center gap-2 font-bold uppercase tracking-widest text-xs ${showSchedule ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/40' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                <Calendar size={20} />
                {t('schedule', lang)}
              </button>

              <button 
                onClick={() => { setSelectedChannel(null); setIsBuffering(false); }}
                className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-2xl transition-all border border-white/10 text-white/40 group"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mini EPG Sidebar */}
            <AnimatePresence>
              {showSchedule && selectedChannel.epg && selectedChannel.epg.length > 0 && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="absolute bottom-32 right-6 w-80 max-h-[60vh] bg-slate-950/90 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
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
                          ref={isNow ? currentProgramRef : null}
                          className={`p-4 rounded-2xl border transition-all ${isNow ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-blue-500/5' : 'bg-white/5 border-white/5'} ${isPast ? 'opacity-30 grayscale' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black text-purple-400 tracking-tighter">
                              {moment(program.start).format('HH:mm')} - {moment(program.end).format('HH:mm')}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{program.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
