'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { AdminCard } from '@/types/admin';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { articleStore, useArticles } from '../lib/articleStore';
import { reportFailure } from '../lib/reportFailure';
import { useSelection } from '../hooks/useSelection';
import { useTableState } from '../hooks/useTableState';
import { CollectionState } from './CollectionState';
import { ConfirmDialog } from './ConfirmDialog';
import { ContentList } from './ContentList';

const searchKeys: (keyof AdminCard)[] = ['title', 'summary', 'date'];

export function ArticlesAdminModule() {
  const t = useDictionary().admin;
  const copy = t.articles;
  const router = useRouter();
  const { items, status } = useArticles();
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const table = useTableState(items, { searchKeys });
  const selection = useSelection();

  const sortDir = (key: keyof AdminCard) => (table.sort?.key === key ? table.sort.dir : null);

  const onFailure = reportFailure(t.common.requestFailed);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const ids = pendingDelete;
    setPendingDelete(null);
    articleStore
      .remove(ids)
      .then(() => toast.success(format(t.common.deletedCount, { count: ids.length })))
      .catch(onFailure)
      .finally(selection.clear);
  };

  return (
    <CollectionState status={status} onRetry={articleStore.retry}>
      <ContentList
        heading={copy.title}
        newLabel={copy.new}
        onNew={() => router.push('/admin/articles/new')}
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
          meta: `${c.date} · ${c.readTime ?? ''}`,
          status: c.status,
        }))}
        selected={selection.selected}
        onToggleSelect={selection.toggle}
        onSelectAll={selection.setAll}
        onDeleteSelected={() => setPendingDelete([...selection.selected])}
        onEdit={(id) => router.push(`/admin/articles/${id}`)}
        onDelete={(id) => setPendingDelete([id])}
        onToggleStatus={(id) => articleStore.toggleStatus(id).catch(onFailure)}
        page={table.page}
        pageCount={table.pageCount}
        total={table.total}
        onPage={table.setPage}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.deleteTitle}
        description={format(copy.deleteText, { count: pendingDelete?.length ?? 0 })}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </CollectionState>
  );
}
