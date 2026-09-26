'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { AdminCard } from '@/types/admin';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { articleStore, useArticles } from '../lib/articleStore';
import { useSelection } from '../hooks/useSelection';
import { useTableState } from '../hooks/useTableState';
import { ConfirmDialog } from './ConfirmDialog';
import { ContentList } from './ContentList';

const searchKeys: (keyof AdminCard)[] = ['title', 'summary', 'date'];

export function ArticlesAdminModule() {
  const t = useDictionary().admin;
  const copy = t.articles;
  const router = useRouter();
  const items = useArticles();
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const table = useTableState(items, { searchKeys });
  const selection = useSelection();

  const sortDir = (key: keyof AdminCard) => (table.sort?.key === key ? table.sort.dir : null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    articleStore.remove(pendingDelete);
    selection.clear();
    toast.success(format(t.common.deletedCount, { count: pendingDelete.length }));
    setPendingDelete(null);
  };

  return (
    <>
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
        onToggleStatus={articleStore.toggleStatus}
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
    </>
  );
}
