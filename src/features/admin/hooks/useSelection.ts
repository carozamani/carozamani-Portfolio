import { useState } from 'react';

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const setAll = (ids: string[], on: boolean) => setSelected(on ? new Set(ids) : new Set());
  const clear = () => setSelected(new Set());

  return { selected, toggle, setAll, clear };
}
