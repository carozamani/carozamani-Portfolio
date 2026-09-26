'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/admin-ui/badge';
import { Button } from '@/components/admin-ui/button';
import { Card } from '@/components/admin-ui/card';
import { Checkbox } from '@/components/admin-ui/checkbox';
import { Input } from '@/components/admin-ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin-ui/table';
import type { PublishStatus } from '@/types/admin';
import { cn } from '@/lib/utils';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export type ContentRow = { id: string; title: string; meta: string; status: PublishStatus };

type SortOption = { label: string; dir: 'asc' | 'desc' | null; onToggle: () => void };

type Props = {
  heading: string;
  note?: string;
  newLabel: string;
  onNew: () => void;
  searchLabel: string;
  emptyTitle: string;
  emptyHint: string;
  query: string;
  onQuery: (value: string) => void;
  sorts: SortOption[];
  rows: ContentRow[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[], on: boolean) => void;
  onDeleteSelected: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onReorder?: (fromId: string, toId: string) => void;
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
};

export function ContentList(props: Props) {
  const { common } = useDictionary().admin;
  const { rows, selected, onReorder } = props;
  const [dragId, setDragId] = useState<string | null>(null);

  const ids = rows.map((r) => r.id);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-foreground text-3xl font-bold">{props.heading}</h1>
        <Button onClick={props.onNew}>
          <Plus /> {props.newLabel}
        </Button>
      </div>
      {props.note && <p className="text-muted-foreground text-sm">{props.note}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="search"
            className="ps-9"
            placeholder={props.searchLabel}
            aria-label={props.searchLabel}
            value={props.query}
            onChange={(e) => props.onQuery(e.target.value)}
          />
        </div>
        {props.sorts.map((sort) => (
          <Button key={sort.label} variant="ghost" size="sm" onClick={sort.onToggle}>
            {sort.label}
            {sort.dir === 'asc' && <ArrowUp />}
            {sort.dir === 'desc' && <ArrowDown />}
          </Button>
        ))}
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={props.onDeleteSelected}>
            {format(common.deleteSelected, { count: selected.size })}
          </Button>
        )}
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        {rows.length === 0 ? (
          <EmptyState title={props.emptyTitle} hint={props.emptyHint} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 ps-4">
                  <Checkbox
                    aria-label={common.selectPage}
                    checked={allSelected}
                    onCheckedChange={(on) => props.onSelectAll(ids, on === true)}
                  />
                </TableHead>
                <TableHead>
                  {common.title}
                  {onReorder && props.query === '' && (
                    <span className="text-muted-foreground ms-2 text-xs font-normal">
                      · {common.dragHint}
                    </span>
                  )}
                </TableHead>
                <TableHead>{common.status}</TableHead>
                <TableHead className="pe-4 text-end" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  draggable={Boolean(onReorder)}
                  className={cn(dragId === row.id && 'opacity-40')}
                  onDragStart={() => setDragId(row.id)}
                  onDragOver={(e) => onReorder && e.preventDefault()}
                  onDrop={() => {
                    if (dragId && dragId !== row.id) onReorder?.(dragId, row.id);
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                >
                  <TableCell className="ps-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        aria-label={row.title}
                        checked={selected.has(row.id)}
                        onCheckedChange={() => props.onToggleSelect(row.id)}
                      />
                      {onReorder && (
                        <GripVertical className="text-muted-foreground size-4 cursor-grab" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground font-medium">{row.title}</div>
                    <div className="text-muted-foreground text-sm">{row.meta}</div>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      aria-label={`${row.title}: ${common.status}`}
                      onClick={() => props.onToggleStatus(row.id)}
                    >
                      <Badge variant={row.status === 'published' ? 'default' : 'outline'}>
                        {row.status === 'published' ? common.published : common.draft}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="pe-4 text-end">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => props.onEdit(row.id)}>
                        {common.edit}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:border-destructive hover:text-destructive"
                        onClick={() => props.onDelete(row.id)}
                      >
                        {common.delete}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Pagination
          page={props.page}
          pageCount={props.pageCount}
          total={props.total}
          onChange={props.onPage}
        />
      </Card>
    </>
  );
}
