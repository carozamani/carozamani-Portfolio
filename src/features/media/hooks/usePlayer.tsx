'use client';

import { createContext, useContext, useState, useRef } from 'react';

interface PlayerContextType {
  currentId: string | null;
  play: (id: string, audioRef: React.RefObject<HTMLAudioElement | null>) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const play = (id: string, audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (currentAudioRef.current && currentId !== id) {
      currentAudioRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.play();
      currentAudioRef.current = audioRef.current;
      setCurrentId(id);
    }
  };

  const stop = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setCurrentId(null);
    }
  };

  return (
    <PlayerContext.Provider value={{ currentId, play, stop }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
