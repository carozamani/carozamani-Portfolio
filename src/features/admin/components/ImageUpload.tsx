'use client';

import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/LocaleProvider';

type Props = { value: string; onChange: (url: string) => void };

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUpload({ value, onChange }: Props) {
  const { common } = useDictionary().admin;
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);

  const load = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError(common.errImageType);
    if (file.size > MAX_BYTES) return setError(common.errImageSize);
    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    load(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <div
        className={cn(
          'border-input flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4',
          over && 'border-primary',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-selected data URL preview
          <img
            src={value}
            alt={common.coverPreviewAlt}
            className="max-h-40 max-w-full rounded-sm object-cover"
          />
        ) : (
          <>
            <ImagePlus className="text-muted-foreground size-6" />
            <span className="text-muted-foreground text-sm">{common.dropImage}</span>
          </>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
            {value ? common.replace : common.browse}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              {common.remove}
            </Button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => load(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
    </div>
  );
}
