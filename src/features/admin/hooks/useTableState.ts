import { useMemo, useState } from 'react';

type SortDir = 'asc' | 'desc';

type Options<T> = {
  searchKeys: (keyof T)[];
  pageSize?: number;
};

export function useTableState<T>(items: T[], { searchKeys, pageSize = 5 }: Options<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: keyof T; dir: SortDir } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? items.filter((item) =>
          searchKeys.some((k) =>
            String(item[k] ?? '')
              .toLowerCase()
              .includes(q),
          ),
        )
      : items;
    if (!sort) return base;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...base].sort(
      (a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? '')) * factor,
    );
  }, [items, query, sort, searchKeys]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: keyof T) =>
    setSort((prev) =>
      prev?.key === key ? (prev.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' },
    );

  return {
    query,
    setQuery: (value: string) => {
      setQuery(value);
      setPage(1);
    },
    sort,
    toggleSort,
    page: safePage,
    setPage,
    pageCount,
    pageItems,
    total: filtered.length,
  };
}
