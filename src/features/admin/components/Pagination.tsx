'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';

type Props = { page: number; pageCount: number; total: number; onChange: (page: number) => void };

export function Pagination({ page, pageCount, total, onChange }: Props) {
  const { common } = useDictionary().admin;
  if (pageCount <= 1) return null;

  return (
    <div className="border-border flex items-center justify-between border-t px-4 py-3">
      <span className="text-muted-foreground text-sm">
        {format(common.items, { count: total })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={common.prev}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="rtl:rotate-180" />
        </Button>
        <span className="text-muted-foreground text-sm">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={common.next}
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
