'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/admin-ui/badge';
import { cn } from '@/lib/utils';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';

type Props = {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
};

const MAX_TAG_LENGTH = 30;
// Enter, the Latin comma and the Persian comma all finish a tag
const SEPARATORS = new Set(['Enter', ',', '،']);

export function TagInput({ id, value, onChange }: Props) {
  const { common } = useDictionary().admin;
  const [text, setText] = useState('');

  const add = (raw: string) => {
    setText('');
    const seen = new Set(value.map((tag) => tag.toLowerCase()));
    const fresh = raw
      .split(/[,،]/)
      .map((part) => part.trim().slice(0, MAX_TAG_LENGTH))
      .filter((tag) => tag && !seen.has(tag.toLowerCase()) && seen.add(tag.toLowerCase()));
    if (fresh.length > 0) onChange([...value, ...fresh]);
  };

  // pasted lists and mobile keyboards deliver commas as text rather than as key events
  const onText = (next: string) => {
    if (/[,،]/.test(next)) add(next);
    else setText(next);
  };

  const remove = (tag: string) => onChange(value.filter((existing) => existing !== tag));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (SEPARATORS.has(event.key)) {
      // Enter must not submit the surrounding form
      event.preventDefault();
      add(text);
    } else if (event.key === 'Backspace' && !text && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div
      className={cn(
        'admin-field flex min-h-10 flex-wrap items-center gap-1.5 px-2 py-1.5',
        'focus-within:border-(--color-brand-emphasis) focus-within:shadow-(--shadow-focus)',
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="outline" className="gap-1 py-1 ps-2.5 pe-1 text-sm">
          {tag}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
            aria-label={format(common.removeTag, { tag })}
            onClick={() => remove(tag)}
          >
            <X className="size-3.5" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        className="placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
        placeholder={value.length === 0 ? common.tagPlaceholder : ''}
        value={text}
        onChange={(e) => onText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(text)}
      />
    </div>
  );
}
