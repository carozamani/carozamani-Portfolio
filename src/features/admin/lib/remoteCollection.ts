import { useSyncExternalStore } from 'react';
import { getToken } from '@/lib/api';
import type { PublishStatus } from '@/types/admin';
import { refreshSiteContent } from './refreshSiteContent';

export type CollectionStatus = 'loading' | 'ready' | 'error';
type Snapshot<T> = { items: T[]; status: CollectionStatus };

type Source<T> = {
  list: () => Promise<T[]>;
  save: (item: T, originalId?: string) => Promise<T>;
  remove: (id: string) => Promise<void>;
  reorder?: (ids: string[]) => Promise<void>;
};

type Options<T> = { getId: (item: T) => string; source: Source<T> };

const flip = (status: PublishStatus): PublishStatus => (status === 'draft' ? 'published' : 'draft');

/** An admin collection backed by the API, loaded once and kept in sync after each write. */
export function createRemoteCollection<T extends { status: PublishStatus }>({
  getId,
  source,
}: Options<T>) {
  const serverSnapshot: Snapshot<T> = { items: [], status: 'loading' };
  let snapshot = serverSnapshot;
  let loading: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const set = (next: Partial<Snapshot<T>>) => {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((listener) => listener());
  };

  const touchSite = () => void refreshSiteContent(getToken()).catch(() => undefined);

  const store = {
    load() {
      loading ??= source.list().then(
        (items) => set({ items, status: 'ready' }),
        () => {
          loading = null;
          set({ status: 'error' });
        },
      );
      return loading;
    },
    retry() {
      set({ status: 'loading' });
      return store.load();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      void store.load();
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    async upsert(item: T, originalId?: string) {
      const saved = await source.save(item, originalId);
      const exists =
        originalId !== undefined && snapshot.items.some((i) => getId(i) === originalId);
      set({
        items: exists
          ? snapshot.items.map((i) => (getId(i) === originalId ? saved : i))
          : [...snapshot.items, saved],
      });
      touchSite();
      return saved;
    },
    async remove(ids: string[]) {
      const results = await Promise.allSettled(ids.map((id) => source.remove(id)));
      const removed = ids.filter((_, index) => results[index].status === 'fulfilled');
      set({ items: snapshot.items.filter((i) => !removed.includes(getId(i))) });
      if (removed.length > 0) touchSite();
      const failure = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (failure) throw failure.reason;
    },
    async toggleStatus(id: string) {
      const item = snapshot.items.find((i) => getId(i) === id);
      if (item) await store.upsert({ ...item, status: flip(item.status) }, id);
    },
    async reorder(fromId: string, toId: string) {
      if (!source.reorder) return;
      const previous = snapshot.items;
      const from = previous.findIndex((i) => getId(i) === fromId);
      const to = previous.findIndex((i) => getId(i) === toId);
      if (from < 0 || to < 0) return;
      const next = [...previous];
      next.splice(to, 0, next.splice(from, 1)[0]);
      set({ items: next });
      try {
        await source.reorder(next.map(getId));
        touchSite();
      } catch (error) {
        set({ items: previous });
        throw error;
      }
    },
  };

  const useCollection = () =>
    useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  return { store, useCollection };
}
