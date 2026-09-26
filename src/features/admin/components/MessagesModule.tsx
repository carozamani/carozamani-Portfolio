'use client';

import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/admin-ui/badge';
import { Button } from '@/components/admin-ui/button';
import { Card } from '@/components/admin-ui/card';
import { Checkbox } from '@/components/admin-ui/checkbox';
import { Input } from '@/components/admin-ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/admin-ui/toggle-group';
import { adminMessages, type AdminMessage } from '@/data/admin';
import { cn } from '@/lib/utils';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { useSelection } from '../hooks/useSelection';
import { useTableState } from '../hooks/useTableState';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

type Filter = 'all' | 'unread' | 'archived';

const searchKeys: (keyof AdminMessage)[] = ['name', 'email', 'message'];
const filters: Filter[] = ['all', 'unread', 'archived'];

export function MessagesModule() {
  const t = useDictionary().admin;
  const m18n = t.messages;
  const filterLabels: Record<Filter, string> = {
    all: m18n.filterAll,
    unread: m18n.filterUnread,
    archived: m18n.filterArchived,
  };
  const [messages, setMessages] = useState(adminMessages);
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const selection = useSelection();

  const scoped = messages.filter((m) =>
    filter === 'archived' ? m.archived : !m.archived && (filter === 'all' || !m.read),
  );
  const table = useTableState(scoped, { searchKeys });
  const pageIds = table.pageItems.map((m) => m.id);
  const unreadCount = messages.filter((m) => !m.read && !m.archived).length;

  const patch = (ids: string[], change: Partial<AdminMessage>) =>
    setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, ...change } : m)));

  const open = (id: string) => {
    setOpenId(id);
    patch([id], { read: true });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setMessages((prev) => prev.filter((m) => !pendingDelete.includes(m.id)));
    if (openId && pendingDelete.includes(openId)) setOpenId(null);
    selection.clear();
    toast.success(format(t.common.deletedCount, { count: pendingDelete.length }));
    setPendingDelete(null);
  };

  const bulk = (change: Partial<AdminMessage>, label: string) => {
    patch([...selection.selected], change);
    toast.success(label);
    selection.clear();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-foreground flex items-center gap-3 text-3xl font-bold">
          {t.nav.messages}
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </h1>
        <ToggleGroup
          type="single"
          variant="outline"
          value={filter}
          onValueChange={(value) => {
            if (!value) return;
            setFilter(value as Filter);
            selection.clear();
          }}
        >
          {filters.map((f) => (
            <ToggleGroupItem key={f} value={f}>
              {filterLabels[f]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="search"
            className="ps-9"
            placeholder={m18n.search}
            aria-label={m18n.search}
            value={table.query}
            onChange={(e) => table.setQuery(e.target.value)}
          />
        </div>
        {selection.selected.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulk({ read: true }, m18n.markedRead)}
            >
              {m18n.markRead}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulk({ archived: filter !== 'archived' }, m18n.updated)}
            >
              {filter === 'archived' ? m18n.unarchive : m18n.archive}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setPendingDelete([...selection.selected])}
            >
              {t.common.delete}
            </Button>
          </div>
        )}
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        {table.pageItems.length === 0 ? (
          <EmptyState title={m18n.noMessages} hint={m18n.nothingHere} />
        ) : (
          <>
            <label className="border-border text-muted-foreground flex items-center gap-3 border-b px-4 py-2 text-sm">
              <Checkbox
                checked={pageIds.every((id) => selection.selected.has(id))}
                onCheckedChange={(on) => selection.setAll(pageIds, on === true)}
              />
              {t.common.selectPage}
            </label>
            {table.pageItems.map((m) => {
              const isOpen = openId === m.id;
              return (
                <div
                  key={m.id}
                  className={cn('border-border border-b last:border-b-0', isOpen && 'bg-muted')}
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Checkbox
                      className="mt-1"
                      aria-label={m.name}
                      checked={selection.selected.has(m.id)}
                      onCheckedChange={() => selection.toggle(m.id)}
                    />
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 text-start"
                      onClick={() => (isOpen ? setOpenId(null) : open(m.id))}
                    >
                      <span className="text-foreground flex items-center gap-2 font-medium">
                        {!m.read && <span className="bg-primary size-2 rounded-full" />}
                        {m.name}
                      </span>
                      {!isOpen && (
                        <span className="text-muted-foreground truncate text-sm">{m.message}</span>
                      )}
                      <span className="text-muted-foreground/70 text-xs">{m.date}</span>
                    </button>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'text-muted-foreground mt-1 size-4 shrink-0 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </div>
                  {isOpen && (
                    <div className="flex flex-col gap-3 px-4 ps-11 pb-4">
                      <span className="text-muted-foreground text-sm" dir="ltr">
                        {m.email}
                      </span>
                      <p className="text-foreground leading-relaxed">{m.message}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                          <a href={`mailto:${m.email}`}>{m18n.reply}</a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => patch([m.id], { read: !m.read })}
                        >
                          {m.read ? m18n.markUnread : m18n.markRead}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => patch([m.id], { archived: !m.archived })}
                        >
                          {m.archived ? m18n.unarchive : m18n.archive}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPendingDelete([m.id])}
                        >
                          {t.common.delete}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          total={table.total}
          onChange={table.setPage}
        />
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={m18n.deleteTitle}
        description={format(m18n.deleteText, { count: pendingDelete?.length ?? 0 })}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
