'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/admin-ui/command';
import { adminNav } from '@/data/admin';
import { useDictionary } from '@/lib/i18n/LocaleProvider';

export function CommandPalette() {
  const { nav, common } = useDictionary().admin;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={common.jumpTo}
      description={common.jumpPlaceholder}
    >
      <CommandInput placeholder={common.jumpPlaceholder} />
      <CommandList>
        <CommandEmpty>{common.noMatches}</CommandEmpty>
        <CommandGroup heading={common.jumpTo}>
          {adminNav.map((n) => (
            <CommandItem key={n.href} value={nav[n.key]} onSelect={() => go(n.href)}>
              {nav[n.key]}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
