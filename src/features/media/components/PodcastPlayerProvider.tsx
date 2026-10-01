'use client';

import dynamic from 'next/dynamic';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CardProps } from '@/types/card';
import { getMedia } from '@/lib/api';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { localizeCard } from '../lib/localizeCard';

const PodcastPlayerDock = dynamic(() =>
  import('./PodcastPlayerDock').then((mod) => mod.PodcastPlayerDock),
);

type PodcastPlayerContextValue = {
  activeId: string | null;
  select: (id: string) => void;
  close: () => void;
};

const PodcastPlayerContext = createContext<PodcastPlayerContextValue | null>(null);

/** Lives in the root layout so the episode keeps playing while the visitor navigates. */
export function PodcastPlayerProvider({ children }: { children: ReactNode }) {
  const dict = useDictionary();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dockMounted, setDockMounted] = useState(false);
  const [podcastCards, setPodcastCards] = useState<CardProps[]>([]);

  useEffect(() => {
    if (!activeId || podcastCards.length > 0) return;
    getMedia('podcast')
      .then(setPodcastCards)
      .catch(() => setPodcastCards([]));
  }, [activeId, podcastCards.length]);

  const value = useMemo<PodcastPlayerContextValue>(
    () => ({
      activeId,
      select: (id: string) => {
        setDockMounted(true);
        setActiveId(id);
      },
      close: () => setActiveId(null),
    }),
    [activeId],
  );

  const activeCard = podcastCards.find((card) => card.id === activeId);

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
      {dockMounted && (
        <PodcastPlayerDock
          card={activeCard && localizeCard(activeCard, dict)}
          onClose={value.close}
        />
      )}
    </PodcastPlayerContext.Provider>
  );
}

export function usePodcastPlayer() {
  const ctx = useContext(PodcastPlayerContext);
  if (!ctx) throw new Error('usePodcastPlayer must be used inside PodcastPlayerProvider');
  return ctx;
}
