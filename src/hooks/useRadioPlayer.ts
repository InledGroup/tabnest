import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import Hls from 'hls.js';
import type { RadioChannel } from './useRadio';

export const WAVE_BARS = 26;

export interface RadioPlayer {
  currentChannel: RadioChannel | null;
  isBuffering: boolean;
  levelsRef: RefObject<Float32Array>;
  audioRef: RefObject<HTMLAudioElement | null>;
  plainAudioRef: RefObject<HTMLAudioElement | null>;
  play: (channel: RadioChannel) => void;
  stop: () => void;
}

/**
 * El audio vive aquí y no dentro del modal: cerrar la interfaz de radio no
 * detiene la emisión (sigue hasta cerrar la pestaña o pulsar stop).
 *
 * Las ondas se generan con un AnalyserNode real sobre el propio elemento.
 * Sólo se "enruta" el elemento cuando es seguro: con hls.js (MSE) o cuando el
 * servidor acepta CORS; si un stream directo no da CORS se reproduce en un
 * segundo elemento sin enrutar para no silenciar el audio.
 */
export const useRadioPlayer = (): RadioPlayer => {
  const [currentChannel, setCurrentChannel] = useState<RadioChannel | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  const levelsRef = useRef<Float32Array>(new Float32Array(WAVE_BARS));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const plainAudioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<RadioChannel | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const corsPendingRef = useRef(false);
  const playingRef = useRef(false);

  useEffect(() => {
    channelRef.current = currentChannel;
  }, [currentChannel]);

  const ensureAnalyser = useCallback((): boolean => {
    if (analyserRef.current) return true;
    const el = audioRef.current;
    if (!el) return false;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      const ctx = ctxRef.current ?? new Ctor();
      ctxRef.current = ctx;
      void ctx.resume();
      const source = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      return true;
    } catch {
      return false;
    }
  }, []);

  const teardown = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    for (const el of [audioRef.current, plainAudioRef.current]) {
      if (!el) continue;
      el.pause();
      el.removeAttribute('src');
      el.crossOrigin = null;
    }
    corsPendingRef.current = false;
    playingRef.current = false;
  }, []);

  const play = useCallback(
    (channel: RadioChannel) => {
      teardown();
      setCurrentChannel(channel);
      setIsBuffering(true);

      const el = audioRef.current;
      if (!el) return;

      const isHls = channel.url.endsWith('.m3u8');

      if (isHls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(channel.url);
        hls.attachMedia(el);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // MSE: el stream ya está en el mismo origen, enrutarlo es seguro.
          ensureAnalyser();
          el.play().catch(() => setIsBuffering(false));
        });
        hls.on(Hls.Events.FRAG_LOADED, () => setIsBuffering(false));
        hlsRef.current = hls;
        return;
      }

      // Stream directo (o HLS nativo): primero con CORS para poder analizarlo.
      corsPendingRef.current = true;
      el.crossOrigin = 'anonymous';
      el.src = channel.url;
      el.play().catch(() => setIsBuffering(false));
    },
    [ensureAnalyser, teardown]
  );

  const stop = useCallback(() => {
    teardown();
    setCurrentChannel(null);
    setIsBuffering(false);
  }, [teardown]);

  /* ------------------------- eventos del elemento ------------------------- */
  useEffect(() => {
    const el = audioRef.current;
    const plain = plainAudioRef.current;
    if (!el || !plain) return;

    const onPlaying = () => {
      playingRef.current = true;
      setIsBuffering(false);
      if (corsPendingRef.current) {
        corsPendingRef.current = false;
        ensureAnalyser();
      }
    };
    const onWaiting = () => setIsBuffering(true);
    const onError = () => {
      // El servidor no admite CORS: pasa al elemento sin enrutar.
      if (corsPendingRef.current && channelRef.current) {
        corsPendingRef.current = false;
        const channel = channelRef.current;
        plain.crossOrigin = null;
        plain.src = channel.url;
        plain.play().catch(() => {
          playingRef.current = false;
          setIsBuffering(false);
          setCurrentChannel(null);
        });
      }
    };
    const onPause = () => {
      playingRef.current = false;
    };

    el.addEventListener('playing', onPlaying);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('canplay', () => setIsBuffering(false));
    el.addEventListener('error', onError);
    el.addEventListener('pause', onPause);

    plain.addEventListener('playing', onPlaying);
    plain.addEventListener('waiting', onWaiting);
    plain.addEventListener('canplay', () => setIsBuffering(false));
    plain.addEventListener('pause', onPause);
    plain.addEventListener('error', () => {
      playingRef.current = false;
      setIsBuffering(false);
      setCurrentChannel(null);
    });

    return () => {
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('error', onError);
      el.removeEventListener('pause', onPause);
      plain.removeEventListener('playing', onPlaying);
      plain.removeEventListener('waiting', onWaiting);
      plain.removeEventListener('pause', onPause);
      teardown();
    };
  }, [ensureAnalyser, teardown]);

  /* --------------------------- bucle de las ondas -------------------------- */
  useEffect(() => {
    if (!currentChannel) {
      const levels = levelsRef.current;
      for (let i = 0; i < levels.length; i++) levels[i] *= 0.85;
      return;
    }

    let raf = 0;
    const loop = () => {
      const levels = levelsRef.current;
      const analyser = analyserRef.current;
      const data = dataRef.current;
      const plain = plainAudioRef.current;
      const routed = audioRef.current;
      const activeEl = plain && !plain.paused ? plain : routed && !routed.paused ? routed : null;
      const volume = activeEl ? activeEl.volume : 1;

      if (analyser && data && activeEl && activeEl === routed) {
        analyser.getByteFrequencyData(data);
        for (let i = 0; i < levels.length; i++) {
          const bin = Math.min(
            data.length - 1,
            Math.floor(Math.pow(i / levels.length, 1.7) * data.length)
          );
          const target = Math.pow(data[bin] / 255, 1.1) * volume;
          levels[i] += (target - levels[i]) * (target > levels[i] ? 0.5 : 0.1);
        }
      } else if (activeEl) {
        // Sin analizador disponible: movimiento suave gobernado por el volumen real.
        const now = performance.now() / 1000;
        for (let i = 0; i < levels.length; i++) {
          const noise =
            0.5 +
            0.5 * Math.sin(now * (2 + (i % 5)) + i * 0.7) * Math.sin(now * 0.9 + i * 0.3);
          const target = noise * 0.5 * volume;
          levels[i] += (target - levels[i]) * 0.18;
        }
      } else {
        for (let i = 0; i < levels.length; i++) levels[i] *= 0.9;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [currentChannel]);

  return { currentChannel, isBuffering, levelsRef, audioRef, plainAudioRef, play, stop };
};
