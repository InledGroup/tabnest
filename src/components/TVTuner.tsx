import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import { X, Tv, Search, Play, Calendar, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import type { TVChannel, TVProgram } from '../hooks/useTV';
import moment from 'moment-timezone';
import { ScrollingText } from './ScrollingText';

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
  const [isBuffering, setIsBuffering] = useState(false);
  const [expandedAmbits, setExpandedAmbits] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const currentProgramRef = useRef<HTMLDivElement>(null);

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  const groupedChannels = useMemo(() => {
    const groups: Record<string, TVChannel[]> = {};
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
    if (showSchedule && currentProgramRef.current) {
      setTimeout(() => {
        currentProgramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [showSchedule, selectedChannel]);

  useEffect(() => {
    if (selectedChannel) {
      setIsBuffering(true);
      if (!selectedChannel.isWeb && videoRef.current) {
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }
          const hls = new Hls();
          hls.loadSource(selectedChannel.url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play().catch(() => setIsBuffering(false));
          });
          hls.on(Hls.Events.FRAG_LOADED, () => setIsBuffering(false));
          hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = selectedChannel.url;
          videoRef.current.addEventListener('loadedmetadata', () => {
            videoRef.current?.play().catch(() => setIsBuffering(false));
          });
        }
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
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Tv size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">{t('tv', lang)}</h2>
            <p className="text-xs text-white/50">{channels.length} {t('channels', lang)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('searchChannels', lang)}
              className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 w-56 transition-colors"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto p-6 custom-scrollbar space-y-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500/30 animate-spin" />
            <p className="text-white/40 text-sm">Sintonizando canales...</p>
          </div>
        ) : (
          ambits.map((ambit) => (
            <div key={ambit} className="space-y-3">
              <button
                onClick={() => toggleAmbit(ambit)}
                className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                {expandedAmbits.includes(ambit) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {ambit}
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded ml-1">{groupedChannels[ambit].length}</span>
              </button>

              <AnimatePresence>
                {(!filter || expandedAmbits.includes(ambit)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-hidden"
                  >
                    {groupedChannels[ambit].map((channel, index) => {
                      const current = getCurrentProgram(channel);
                      const next = getNextProgram(channel);

                      return (
                        <button
                          key={`${channel.url}-${index}`}
                          onClick={() => setSelectedChannel(channel)}
                          className="group relative flex flex-col p-3 bg-black/30 backdrop-blur-md rounded-xl border border-white/8 hover:bg-black/40 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 shrink-0 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-1.5 border border-white/5">
                              <img
                                src={channel.logo}
                                alt={channel.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/TDTChannels/TDTChannels/main/tdtchannels.png')}
                              />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <ScrollingText className="text-sm font-medium text-white/90 group-hover:text-blue-400 transition-colors">
                                {channel.name}
                              </ScrollingText>
                              <div className="flex items-center gap-2 mt-0.5">
                                {channel.isWeb && <span className="text-[8px] bg-white/10 text-white/50 px-1 rounded">Web</span>}
                                {current && (
                                  <p className="text-[10px] text-blue-400/80">{t('now', lang)}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {current ? (
                              <div className="min-h-[36px]">
                                <p className="text-xs text-white/70 line-clamp-2 leading-snug">
                                  {current.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-grow h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${Math.min(100, Math.max(0, ((moment().valueOf() - current.start) / (current.end - current.start)) * 100))}%` }}
                                      className="h-full bg-blue-500"
                                    />
                                  </div>
                                  <span className="text-[9px] text-white/40 font-mono">
                                    {moment(current.end).format('HH:mm')}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-[36px] flex items-center">
                                <p className="text-[10px] text-white/25 italic">Sin información EPG</p>
                              </div>
                            )}

                            {next && (
                              <div className="pt-1.5 border-t border-white/5">
                                <p className="text-[10px] text-white/40">
                                  {t('next', lang)}: {moment(next.start).format('HH:mm')}
                                </p>
                                <ScrollingText className="text-[10px] text-white/40">
                                  {next.name}
                                </ScrollingText>
                              </div>
                            )}
                          </div>

                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-blue-500 rounded-full p-1.5">
                              <Play className="text-white ml-0.5" size={12} fill="currentColor" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}

        {!loading && filteredChannels.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <Tv size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('noChannels', lang)}</p>
          </div>
        )}
      </div>

      {/* Fullscreen Player Overlay */}
      <AnimatePresence>
        {selectedChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black flex flex-col"
          >
            {/* Loading spinner */}
            <AnimatePresence>
              {isBuffering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60"
                >
                  <Loader2 className="w-12 h-12 text-blue-500/50 animate-spin mb-3" />
                  <p className="text-white/60 text-xs">Cargando emisión...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Player Header */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedChannel(null); setShowSchedule(false); setIsBuffering(false); }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm p-2 pr-4 rounded-lg border border-white/10">
                  <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center p-1">
                    <img src={selectedChannel.logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <ScrollingText className="text-sm font-medium text-white leading-none">{selectedChannel.name}</ScrollingText>
                    {getCurrentProgram(selectedChannel) && (
                      <p className="text-[10px] text-blue-400 mt-0.5">En directo</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs ${showSchedule ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}`}
              >
                <Calendar size={16} />
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
                  onLoad={() => setIsBuffering(false)}
                />
              ) : (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                  onPlaying={() => setIsBuffering(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onCanPlay={() => setIsBuffering(false)}
                />
              )}

              {/* EPG Sidebar */}
              <AnimatePresence>
                {showSchedule && selectedChannel.epg && selectedChannel.epg.length > 0 && (
                  <motion.div
                    initial={{ x: 320 }}
                    animate={{ x: 0 }}
                    exit={{ x: 320 }}
                    className="absolute top-16 right-4 bottom-4 w-80 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 flex flex-col z-40"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">{t('schedule', lang)}</h3>
                      <button onClick={() => setShowSchedule(false)} className="text-white/40 hover:text-white transition-colors"><X size={16} /></button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
                      {selectedChannel.epg.map((program, idx) => {
                        const isNow = moment().valueOf() >= program.start && moment().valueOf() < program.end;
                        const isPast = moment().valueOf() >= program.end;

                        return (
                          <div
                            key={idx}
                            ref={isNow ? currentProgramRef : null}
                            className={`p-3 rounded-lg border transition-colors ${isNow ? 'bg-blue-500/15 border-blue-500/30' : 'bg-white/5 border-white/5'} ${isPast ? 'opacity-30' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] text-blue-400 font-mono">
                                {moment(program.start).format('HH:mm')} - {moment(program.end).format('HH:mm')}
                              </span>
                              {isNow && (
                                <span className="bg-blue-500/80 text-white text-[8px] px-1.5 py-0.5 rounded">En vivo</span>
                              )}
                            </div>
                            <p className="text-xs text-white/80 leading-tight">{program.name}</p>
                            {program.description && (
                              <p className="text-[10px] text-white/40 line-clamp-2 mt-1.5 leading-relaxed">{program.description}</p>
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
