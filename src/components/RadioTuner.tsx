import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { RefObject } from 'react';
import { X, Radio, Search, Play, Calendar, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import type { RadioChannel } from '../hooks/useRadio';
import type { TVProgram } from '../hooks/useTV';
import type { RadioPlayer } from '../hooks/useRadioPlayer';
import { WAVE_BARS } from '../hooks/useRadioPlayer';
import moment from 'moment-timezone';
import { ScrollingText } from './ScrollingText';

interface RadioTunerProps {
  channels: RadioChannel[];
  loading: boolean;
  player: RadioPlayer;
  onClose: () => void;
  lang: Language;
}

/** Ondas reales: lee en cada frame los niveles que produce el AnalyserNode. */
const Waveform: React.FC<{ levelsRef: RefObject<Float32Array> }> = ({ levelsRef }) => {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const levels = levelsRef.current;
      for (let i = 0; i < levels.length; i++) {
        const bar = barRefs.current[i];
        if (bar) bar.style.transform = `scaleY(${Math.max(0.06, Math.min(1, levels[i]))})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [levelsRef]);

  return (
    <div className="flex items-end gap-[3px] h-9 w-36 shrink-0" aria-hidden="true">
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <div
          key={i}
          ref={el => {
            barRefs.current[i] = el;
          }}
          className="w-1.5 h-full bg-blue-400/85 rounded-full origin-bottom"
          style={{ transform: 'scaleY(0.06)' }}
        />
      ))}
    </div>
  );
};

export const RadioTuner: React.FC<RadioTunerProps> = ({ channels, loading, player, onClose, lang }) => {
  const [filter, setFilter] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [expandedAmbits, setExpandedAmbits] = useState<string[]>([]);
  const currentProgramRef = useRef<HTMLDivElement>(null);

  const nowPlaying = player.currentChannel;

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
  }, [showSchedule, nowPlaying]);

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
            <Radio size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">{t('radio', lang)}</h2>
            <p className="text-xs text-white/55">{channels.length} {t('channels', lang)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/55" size={16} />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('searchChannels', lang)}
              className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 w-56 transition-colors"
            />
          </div>
          {/* Cerrar sólo oculta la interfaz: la radio sigue sonando */}
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
            <p className="text-white/60 text-sm">Sintonizando emisoras...</p>
          </div>
        ) : (
          ambits.map((ambit) => (
            <div key={ambit} className="space-y-3">
              <button
                onClick={() => toggleAmbit(ambit)}
                className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
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
                      const isPlaying = nowPlaying?.id === channel.id;

                      return (
                        <button
                          key={`${channel.url}-${index}`}
                          onClick={() => player.play(channel)}
                          className={`group relative flex flex-col p-3 rounded-xl border transition-colors text-left ${isPlaying ? 'bg-blue-500/15 border-blue-500/30' : 'bg-black/30 backdrop-blur-md border-white/8 hover:bg-black/40'}`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 shrink-0 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-1.5 border border-white/5 relative">
                              <img
                                src={channel.logo}
                                alt={channel.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/TDTChannels/TDTChannels/main/tdtchannels.png')}
                              />
                              {isPlaying && (
                                <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                  <div className="flex gap-0.5 items-end h-3">
                                    <div className="w-0.5 bg-white animate-bounce" style={{ animationDuration: '0.5s' }} />
                                    <div className="w-0.5 bg-white animate-bounce" style={{ animationDuration: '0.8s' }} />
                                    <div className="w-0.5 bg-white animate-bounce" style={{ animationDuration: '0.6s' }} />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-grow">
                              <ScrollingText className="text-sm font-medium text-white/90 group-hover:text-blue-400 transition-colors">
                                {channel.name}
                              </ScrollingText>
                              {current && (
                                <p className="text-[10px] text-blue-400/90 mt-0.5">
                                  {t('now', lang)}
                                </p>
                              )}
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
                                  <span className="text-[9px] text-white/60 font-mono">
                                    {moment(current.end).format('HH:mm')}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-[36px] flex items-center">
                                <p className="text-[10px] text-white/55 italic">Sin información EPG</p>
                              </div>
                            )}

                            {next && (
                              <div className="pt-1.5 border-t border-white/5">
                                <p className="text-[10px] text-white/60">
                                  {t('next', lang)}: {moment(next.start).format('HH:mm')}
                                </p>
                                <ScrollingText className="text-[10px] text-white/60">
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
      </div>

      {/* Mini Player Overlay */}
      <AnimatePresence>
        {nowPlaying && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="p-4 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-6 relative"
          >
            {/* Loading indicator */}
            {player.isBuffering && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600/90 px-3 py-1 rounded-full flex items-center gap-2">
                <Loader2 size={12} className="text-white animate-spin" />
                <span className="text-[10px] text-white">Bufferizando...</span>
              </div>
            )}

            <div className="flex items-center gap-4 flex-grow max-w-2xl text-white">
              <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-white/5 shrink-0">
                <img src={nowPlaying.logo} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <ScrollingText className="text-base font-medium text-white">{nowPlaying.name}</ScrollingText>
                  <span className="bg-blue-500/80 text-[9px] px-1.5 py-0.5 rounded text-white">On Air</span>
                </div>
                {getCurrentProgram(nowPlaying) ? (
                  <div>
                    <ScrollingText className="text-sm text-blue-400">{getCurrentProgram(nowPlaying)?.name}</ScrollingText>
                    <ScrollingText className="text-xs text-white/60">{getCurrentProgram(nowPlaying)?.description}</ScrollingText>
                  </div>
                ) : (
                  <p className="text-sm text-white/60 italic">Emisión en directo</p>
                )}
              </div>
            </div>

            {/* Ondas de volumen reales de la emisión */}
            <Waveform levelsRef={player.levelsRef} />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className={`p-3 rounded-lg transition-colors flex items-center gap-2 text-xs ${showSchedule ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'}`}
              >
                <Calendar size={16} />
                {t('schedule', lang)}
              </button>

              <button
                onClick={() => { player.stop(); setShowSchedule(false); }}
                className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-white/60"
                title={t('close', lang)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mini EPG Sidebar */}
            <AnimatePresence>
              {showSchedule && nowPlaying.epg && nowPlaying.epg.length > 0 && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="absolute bottom-24 right-4 w-80 max-h-[60vh] bg-black/80 backdrop-blur-md rounded-xl border border-white/10 flex flex-col"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">{t('schedule', lang)}</h3>
                    <button onClick={() => setShowSchedule(false)} className="text-white/60 hover:text-white transition-colors"><X size={16} /></button>
                  </div>
                  <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {nowPlaying.epg.map((program, idx) => {
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
                          </div>
                          <p className="text-xs text-white/80 leading-tight">{program.name}</p>
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
