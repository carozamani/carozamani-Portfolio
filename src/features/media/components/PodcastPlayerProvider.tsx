'use client';

import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useContent } from '@/lib/ContentProvider';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { localizeCard } from '../lib/localizeCard';
import type { CardProps } from '@/types/card';

const PodcastPlayerDock = dynamic(() =>
  import('./PodcastPlayerDock').then((mod) => mod.PodcastPlayerDock),
);

const SKIP_SECONDS = 10;
const SPEEDS = [1, 1.25, 1.5, 2] as const;

export type RepeatMode = 'off' | 'one' | 'all';

type PodcastPlayerContextValue = {
  activeId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  unavailable: boolean;
  volume: number;
  speed: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  activeCard: CardProps | undefined;
  select: (id: string) => void;
  toggle: () => void;
  skip: (deltaSeconds?: number) => void;
  seek: (time: number) => void;
  playPrevious: () => void;
  playNext: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  cycleSpeed: () => void;
  setVolume: (volume: number) => void;
  close: () => void;
};

const PodcastPlayerContext = createContext<PodcastPlayerContextValue | null>(null);

const REPEAT_ORDER: RepeatMode[] = ['off', 'all', 'one'];

function pickRandomId(ids: string[], exclude: string | null): string | null {
  const pool = exclude ? ids.filter((id) => id !== exclude) : ids;
  if (pool.length === 0) return ids[0] ?? null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

/** Lives in the root layout so the episode keeps playing while the visitor navigates. */
export function PodcastPlayerProvider({ children }: { children: ReactNode }) {
  const dict = useDictionary();
  const { podcasts: podcastCards } = useContent();
  const audioRef = useRef<HTMLAudioElement>(null);
  const speedIndexRef = useRef(0);
  const volumeRef = useRef(1);
  const activeIdRef = useRef<string | null>(null);
  const positionsRef = useRef<Record<string, number>>({});
  const shuffleRef = useRef(false);
  const repeatModeRef = useRef<RepeatMode>('off');
  const playNextRef = useRef<() => void>(() => {});

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  useEffect(() => {
    activeIdRef.current = activeId;
    shuffleRef.current = shuffle;
    repeatModeRef.current = repeatMode;
  }, [activeId, shuffle, repeatMode]);

  const activeCard = useMemo(() => {
    const card = podcastCards.find((item) => item.id === activeId);
    return card ? localizeCard(card, dict) : undefined;
  }, [activeId, dict, podcastCards]);

  const playlist = useMemo(
    () => podcastCards.filter((card) => Boolean(card.audioSrc)).map((card) => card.id),
    [podcastCards],
  );

  const rememberPosition = useCallback((id: string | null) => {
    const audio = audioRef.current;
    // After close(), src is cleared — skip so we don't overwrite the saved resume point with 0.
    if (!id || !audio || !audio.getAttribute('src')) return;
    if (!Number.isFinite(audio.currentTime)) return;
    positionsRef.current[id] = audio.currentTime;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const id = activeCard?.id;
    const src = activeCard?.audioSrc;
    if (!audio || !id || !src) return;

    const resumeAt = positionsRef.current[id] ?? 0;

    audio.src = src;
    audio.load();
    audio.playbackRate = SPEEDS[speedIndexRef.current];
    audio.volume = volumeRef.current;

    const onReady = () => {
      const max = Number.isFinite(audio.duration) ? audio.duration : 0;
      const nearEnd = max > 0 && max - resumeAt < 1;
      const startAt = resumeAt > 0 && !nearEnd ? Math.min(resumeAt, Math.max(max - 0.25, 0)) : 0;
      audio.currentTime = startAt;
      setCurrentTime(startAt);
      setDuration(max);
      void audio.play().catch(() => setUnavailable(true));
    };

    audio.addEventListener('loadedmetadata', onReady);
    return () => {
      rememberPosition(id);
      audio.removeEventListener('loadedmetadata', onReady);
    };
  }, [activeCard?.id, activeCard?.audioSrc, rememberPosition]);

  useEffect(() => {
    const root = document.documentElement;
    if (activeId) root.dataset.podcastDock = 'open';
    else delete root.dataset.podcastDock;
    return () => {
      delete root.dataset.podcastDock;
    };
  }, [activeId]);

  const select = useCallback(
    (id: string) => {
      if (id !== activeId) {
        rememberPosition(activeId);
        setUnavailable(false);
        setCurrentTime(positionsRef.current[id] ?? 0);
        setDuration(0);
        setIsPlaying(false);
      }
      setActiveId(id);
    },
    [activeId, rememberPosition],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeId) return;
    if (audio.paused) void audio.play().catch(() => setUnavailable(true));
    else audio.pause();
  }, [activeId]);

  const skip = useCallback(
    (deltaSeconds = SKIP_SECONDS) => {
      const audio = audioRef.current;
      if (!audio) return;
      const max = duration || audio.duration || 0;
      audio.currentTime = Math.min(Math.max(audio.currentTime + deltaSeconds, 0), max);
    },
    [duration],
  );

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const playAtOffset = useCallback(
    (offset: number) => {
      if (!activeId || playlist.length === 0) return;
      const index = playlist.indexOf(activeId);
      if (index < 0) return;
      const nextIndex = (index + offset + playlist.length) % playlist.length;
      select(playlist[nextIndex]);
    },
    [activeId, playlist, select],
  );

  const playNext = useCallback(() => {
    if (!activeId || playlist.length === 0) return;
    if (shuffle && playlist.length > 1) {
      const nextId = pickRandomId(playlist, activeId);
      if (nextId) select(nextId);
      return;
    }
    playAtOffset(1);
  }, [activeId, playlist, playAtOffset, select, shuffle]);

  const playPrevious = useCallback(() => {
    if (!activeId || playlist.length === 0) return;
    if (shuffle && playlist.length > 1) {
      const prevId = pickRandomId(playlist, activeId);
      if (prevId) select(prevId);
      return;
    }
    playAtOffset(-1);
  }, [activeId, playlist, playAtOffset, select, shuffle]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const toggleShuffle = useCallback(() => {
    setShuffle((current) => !current);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((current) => {
      const index = REPEAT_ORDER.indexOf(current);
      return REPEAT_ORDER[(index + 1) % REPEAT_ORDER.length];
    });
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedIndex((current) => {
      const next = (current + 1) % SPEEDS.length;
      speedIndexRef.current = next;
      if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
      return next;
    });
  }, []);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    volumeRef.current = clamped;
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    rememberPosition(activeIdRef.current);
    audio?.pause();
    if (audio) audio.removeAttribute('src');
    setActiveId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setUnavailable(false);
  }, [rememberPosition]);

  const handleEnded = useCallback(() => {
    const id = activeIdRef.current;
    if (id) positionsRef.current[id] = 0;
    setCurrentTime(0);

    const mode = repeatModeRef.current;
    if (mode === 'one') {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      void audio.play().catch(() => setUnavailable(true));
      return;
    }

    if (mode === 'all') {
      playNextRef.current();
      return;
    }

    // Play once: stop at the end of the current episode.
    setIsPlaying(false);
  }, []);

  const value = useMemo<PodcastPlayerContextValue>(
    () => ({
      activeId,
      isPlaying,
      currentTime,
      duration,
      unavailable,
      volume,
      speed: SPEEDS[speedIndex],
      shuffle,
      repeatMode,
      activeCard,
      select,
      toggle,
      skip,
      seek,
      playPrevious,
      playNext,
      toggleShuffle,
      cycleRepeatMode,
      cycleSpeed,
      setVolume,
      close,
    }),
    [
      activeId,
      isPlaying,
      currentTime,
      duration,
      unavailable,
      volume,
      speedIndex,
      shuffle,
      repeatMode,
      activeCard,
      select,
      toggle,
      skip,
      seek,
      playPrevious,
      playNext,
      toggleShuffle,
      cycleRepeatMode,
      cycleSpeed,
      setVolume,
      close,
    ],
  );

  return (
    <PodcastPlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          rememberPosition(activeIdRef.current);
          setIsPlaying(false);
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          const time = event.currentTarget.currentTime;
          setCurrentTime(time);
          const id = activeIdRef.current;
          if (id) positionsRef.current[id] = time;
        }}
        onEnded={handleEnded}
        onError={() => setUnavailable(true)}
      />
      {children}
      <PodcastPlayerDock />
    </PodcastPlayerContext.Provider>
  );
}

export function usePodcastPlayer() {
  const ctx = useContext(PodcastPlayerContext);
  if (!ctx) throw new Error('usePodcastPlayer must be used inside PodcastPlayerProvider');
  return ctx;
}

export { SKIP_SECONDS };
