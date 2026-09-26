'use client';

import { useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { cn } from '@/lib/utils';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';

type Props = { value: string[]; onChange: (images: string[]) => void };

const MAX_BYTES = 5 * 1024 * 1024;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

/** A stack of images kept in the order they are shown on the page, like a Behance project. */
export function GalleryUpload({ value, onChange }: Props) {
  const { common } = useDictionary().admin;
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    const list = [...files];
    const images = list.filter((file) => file.type.startsWith('image/'));
    if (images.length < list.length) setError(common.errImageType);
    else setError('');
    const fit = images.filter((file) => file.size <= MAX_BYTES);
    if (fit.length < images.length) setError(common.errImageSize);
    if (fit.length === 0) return;
    onChange([...value, ...(await Promise.all(fit.map(readAsDataUrl)))]);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void addFiles(event.dataTransfer.files);
  };

  const move = (from: number, to: number) => {
    const next = [...value];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };

  return (
    <div className="grid gap-3">
      {value.map((src, index) => (
        <div key={index} className="border-border flex items-center gap-3 rounded-xl border p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview of an uploaded file */}
          <img
            src={src}
            alt={format(common.imageNumber, { n: index + 1 })}
            className="h-16 w-24 shrink-0 rounded-sm object-cover"
          />
          <span className="text-muted-foreground min-w-0 flex-1 text-sm">
            {format(common.imageNumber, { n: index + 1 })}
          </span>
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
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <X />
          </Button>
        </div>
      ))}
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
        <ImagePlus className="text-muted-foreground size-6" />
        <span className="text-muted-foreground text-sm">{common.dropImages}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
          {common.addImages}
        </Button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
