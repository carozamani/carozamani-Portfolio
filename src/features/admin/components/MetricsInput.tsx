'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CaseStudyMetric } from '@/types/caseStudy';

type Props = { value: CaseStudyMetric[]; onChange: (metrics: CaseStudyMetric[]) => void };

/** Result metrics as value/label pairs, e.g. "78%" · "task completion rate". */
export function MetricsInput({ value, onChange }: Props) {
  const { common, caseStudies } = useDictionary().admin;

  const update = (index: number, patch: Partial<CaseStudyMetric>) =>
    onChange(value.map((metric, i) => (i === index ? { ...metric, ...patch } : metric)));

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="grid gap-3">
      {value.map((metric, index) => (
        <div key={index} className="border-border flex items-center gap-3 rounded-xl border p-2">
          <Input
            className="w-28 shrink-0"
            placeholder={caseStudies.metricValuePlaceholder}
            value={metric.value}
            onChange={(e) => update(index, { value: e.target.value })}
          />
          <Input
            className="flex-1"
            placeholder={caseStudies.metricLabelPlaceholder}
            value={metric.label}
            onChange={(e) => update(index, { label: e.target.value })}
          />
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
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => onChange([...value, { value: '', label: '' }])}
      >
        <Plus />
        {caseStudies.addMetric}
      </Button>
    </div>
  );
}
