'use client';

import { useRef, useState, type DragEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { cn } from '@/lib/utils';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { IMAGE_TYPES, MAX_IMAGE_BYTES, uploadImage } from '../lib/adminApi';

type Props = { value: string; onChange: (url: string) => void };

export function ImageUpload({ value, onChange }: Props) {
  const { common } = useDictionary().admin;
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);

  const load = (file?: File) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return setError(common.errImageType);
    if (file.size > MAX_IMAGE_BYTES) return setError(common.errImageSize);
    setError(common.uploading);
    uploadImage(file).then(
      (url) => {
        setError('');
        onChange(url);
      },
      (err: Error) => setError(err.message),
    );
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
          accept={IMAGE_TYPES.join(',')}
          hidden
          onChange={(e) => load(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
    </div>
  );
}
