'use client';

import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Textarea } from '@/components/admin-ui/textarea';
import { useDictionary } from '@/lib/i18n/LocaleProvider';

type Props = { value: string[]; onChange: (steps: string[]) => void };

/** Ordered list of design-process steps, each its own textarea. */
export function ProcessStepsInput({ value, onChange }: Props) {
  const { common, caseStudies } = useDictionary().admin;

  const update = (index: number, text: string) =>
    onChange(value.map((step, i) => (i === index ? text : step)));

  const move = (from: number, to: number) => {
    const next = [...value];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="grid gap-3">
      {value.map((step, index) => (
        <div key={index} className="border-border flex items-start gap-3 rounded-xl border p-3">
          <span className="text-muted-foreground mt-2 w-5 shrink-0 text-sm font-medium">
            {index + 1}
          </span>
          <Textarea
            rows={2}
            className="flex-1"
            value={step}
            onChange={(e) => update(index, e.target.value)}
          />
          <div className="flex shrink-0 flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={common.moveUp}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <ArrowUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={common.moveDown}
              disabled={index === value.length - 1}
              onClick={() => move(index, index + 1)}
            >
              <ArrowDown />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={common.remove}
              onClick={() => remove(index)}
            >
              <X />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => onChange([...value, ''])}
      >
        <Plus />
        {caseStudies.addStep}
      </Button>
    </div>
  );
}
