'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { podcastCards } from '@/data/media';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { localizeCard } from '../lib/localizeCard';
import { PodcastPlayerDock } from './PodcastPlayerDock';

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

  const value = useMemo<PodcastPlayerContextValue>(
    () => ({ activeId, select: setActiveId, close: () => setActiveId(null) }),
    [activeId],
  );

  const activeCard = podcastCards.find((card) => card.id === activeId);

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
      <PodcastPlayerDock
        card={activeCard && localizeCard(activeCard, dict)}
        onClose={value.close}
      />
    </PodcastPlayerContext.Provider>
  );
}

export function usePodcastPlayer() {
  const ctx = useContext(PodcastPlayerContext);
  if (!ctx) throw new Error('usePodcastPlayer must be used inside PodcastPlayerProvider');
  return ctx;
}
