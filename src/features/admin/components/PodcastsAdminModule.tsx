'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { podcastCards } from '@/data/media';
import { podcastHub } from '@/data/podcastHub';
import type { AdminCard } from '@/types/admin';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { useSelection } from '../hooks/useSelection';
import { useTableState } from '../hooks/useTableState';
import { ConfirmDialog } from './ConfirmDialog';
import { ContentList } from './ContentList';
import { PodcastEditor } from './PodcastEditor';

const searchKeys: (keyof AdminCard)[] = ['title', 'summary', 'date'];

const seed: AdminCard[] = podcastCards.map((c) => ({ ...c, status: 'published' }));

export function PodcastsAdminModule() {
  const t = useDictionary().admin;
  const copy = t.podcasts;
  const [items, setItems] = useState(seed);
  const [editing, setEditing] = useState<AdminCard | 'new' | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const table = useTableState(items, { searchKeys });
  const selection = useSelection();

  const sortDir = (key: keyof AdminCard) => (table.sort?.key === key ? table.sort.dir : null);

  const save = (item: AdminCard) => {
    const original = editing !== 'new' ? editing?.id : undefined;
    setItems((prev) =>
      original ? prev.map((c) => (c.id === original ? item : c)) : [...prev, item],
    );
    toast.success(original ? t.common.saved : t.common.created);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setItems((prev) => prev.filter((c) => !pendingDelete.includes(c.id)));
    selection.clear();
    toast.success(format(t.common.deletedCount, { count: pendingDelete.length }));
    setPendingDelete(null);
  };

  const toggleStatus = (id: string) =>
    setItems((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'draft' ? 'published' : 'draft' } : c,
      ),
    );

  return (
    <>
      <ContentList
        heading={copy.title}
        note={format(copy.siteNote, { platform: podcastHub.name })}
        newLabel={copy.new}
        onNew={() => setEditing('new')}
        searchLabel={copy.search}
        emptyTitle={table.query ? t.common.noMatches : copy.empty}
        emptyHint={table.query ? t.common.tryAnother : copy.emptyHint}
        query={table.query}
        onQuery={table.setQuery}
        sorts={[
          {
            label: t.common.title,
            dir: sortDir('title'),
            onToggle: () => table.toggleSort('title'),
          },
          { label: t.common.date, dir: sortDir('date'), onToggle: () => table.toggleSort('date') },
        ]}
        rows={table.pageItems.map((c) => ({
          id: c.id,
          title: c.title,
          meta: `${c.date} · ${c.duration ?? ''}`,
          status: c.status,
        }))}
        selected={selection.selected}
        onToggleSelect={selection.toggle}
        onSelectAll={selection.setAll}
        onDeleteSelected={() => setPendingDelete([...selection.selected])}
        onEdit={(id) => setEditing(items.find((c) => c.id === id) ?? null)}
        onDelete={(id) => setPendingDelete([id])}
        onToggleStatus={toggleStatus}
        page={table.page}
        pageCount={table.pageCount}
        total={table.total}
        onPage={table.setPage}
      />
      {editing && (
        <PodcastEditor
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? null : editing}
          existingIds={items.map((c) => c.id)}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.deleteTitle}
        description={format(copy.deleteText, { count: pendingDelete?.length ?? 0 })}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
