'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { AdminCaseStudy } from '@/types/admin';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { caseStudyStore, useCaseStudies } from '../lib/caseStudyStore';
import { useSelection } from '../hooks/useSelection';
import { useTableState } from '../hooks/useTableState';
import { ConfirmDialog } from './ConfirmDialog';
import { ContentList } from './ContentList';

const searchKeys: (keyof AdminCaseStudy)[] = ['title', 'tag', 'year'];

export function CaseStudiesAdminModule() {
  const t = useDictionary().admin;
  const cs = t.caseStudies;
  const router = useRouter();
  const items = useCaseStudies();
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const table = useTableState(items, { searchKeys });
  const selection = useSelection();

  const canReorder = table.query === '' && table.sort === null;
  const sortDir = (key: keyof AdminCaseStudy) => (table.sort?.key === key ? table.sort.dir : null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    caseStudyStore.remove(pendingDelete);
    selection.clear();
    toast.success(format(t.common.deletedCount, { count: pendingDelete.length }));
    setPendingDelete(null);
  };

  return (
    <>
      <ContentList
        heading={cs.title}
        newLabel={cs.new}
        onNew={() => router.push('/admin/case-studies/new')}
        searchLabel={cs.search}
        emptyTitle={table.query ? t.common.noMatches : cs.empty}
        emptyHint={table.query ? t.common.tryAnother : cs.emptyHint}
        query={table.query}
        onQuery={table.setQuery}
        sorts={[
          {
            label: t.common.title,
            dir: sortDir('title'),
            onToggle: () => table.toggleSort('title'),
          },
          { label: t.common.year, dir: sortDir('year'), onToggle: () => table.toggleSort('year') },
        ]}
        rows={table.pageItems.map((c) => ({
          id: c.slug,
          title: c.title,
          meta: `${(c.tags ?? (c.tag ? [c.tag] : [])).join(', ')} · ${c.year ?? ''}`,
          status: c.status,
        }))}
        selected={selection.selected}
        onToggleSelect={selection.toggle}
        onSelectAll={selection.setAll}
        onDeleteSelected={() => setPendingDelete([...selection.selected])}
        onEdit={(slug) => router.push(`/admin/case-studies/${slug}`)}
        onDelete={(slug) => setPendingDelete([slug])}
        onToggleStatus={caseStudyStore.toggleStatus}
        onReorder={canReorder ? caseStudyStore.reorder : undefined}
        page={table.page}
        pageCount={table.pageCount}
        total={table.total}
        onPage={table.setPage}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={cs.deleteTitle}
        description={format(cs.deleteText, { count: pendingDelete?.length ?? 0 })}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
