import { useSyncExternalStore } from 'react';
import type { PublishStatus } from '@/types/admin';

type Options<T> = {
  key: string;
  seed: T[];
  getId: (item: T) => string;
};

/**
 * A small localStorage-backed collection shared between admin pages until a real backend exists.
 * Every write returns false when the browser refused it (quota), e.g. with many inline images.
 */
export function createEntityStore<T extends { status: PublishStatus }>({
  key,
  seed,
  getId,
}: Options<T>) {
  let items = seed;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) items = JSON.parse(raw) as T[];
    } catch {
      // corrupted or blocked storage: fall back to the seed
    }
  };

  const commit = (next: T[]) => {
    items = next;
    listeners.forEach((listener) => listener());
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  };

  const store = {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      load();
      return items;
    },
    getServerSnapshot: () => seed,
    upsert(item: T, originalId?: string) {
      load();
      const exists = originalId !== undefined && items.some((a) => getId(a) === originalId);
      return commit(
        exists ? items.map((a) => (getId(a) === originalId ? item : a)) : [...items, item],
      );
    },
    remove(ids: string[]) {
      load();
      return commit(items.filter((a) => !ids.includes(getId(a))));
    },
    toggleStatus(id: string) {
      load();
      return commit(
        items.map((a) =>
          getId(a) === id ? { ...a, status: a.status === 'draft' ? 'published' : 'draft' } : a,
        ),
      );
    },
    reorder(fromId: string, toId: string) {
      load();
      const from = items.findIndex((a) => getId(a) === fromId);
      const to = items.findIndex((a) => getId(a) === toId);
      if (from < 0 || to < 0) return true;
      const next = [...items];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return commit(next);
    },
  };

  const useItems = () =>
    useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  return { store, useItems };
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards; lets pages wait for client-only stored data. */
export const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
