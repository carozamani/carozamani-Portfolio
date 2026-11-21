'use client';

import { useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import { cn } from '@/lib/utils';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { IMAGE_TYPES, MAX_IMAGE_BYTES, uploadImage } from '../lib/adminApi';

type Props = {
  value: string[];
  titles: string[];
  onChange: (images: string[], titles: string[]) => void;
};

/** A stack of images kept in the order they are shown on the page, like a Behance project. */
export function GalleryUpload({ value, titles, onChange }: Props) {
  const { common } = useDictionary().admin;
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);

  // titles are stored as a parallel array, so pad it to stay aligned with the images
  const titleAt = value.map((_, index) => titles[index] ?? '');

  const addFiles = async (files: FileList | File[]) => {
    const list = [...files];
    const images = list.filter((file) => IMAGE_TYPES.includes(file.type));
    if (images.length < list.length) setError(common.errImageType);
    else setError('');
    const fit = images.filter((file) => file.size <= MAX_IMAGE_BYTES);
    if (fit.length < images.length) setError(common.errImageSize);
    if (fit.length === 0) return;
    try {
      const uploaded = await Promise.all(fit.map(uploadImage));
      onChange([...value, ...uploaded], [...titleAt, ...uploaded.map(() => '')]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void addFiles(event.dataTransfer.files);
  };

  const move = (from: number, to: number) => {
    const reorder = (list: string[]) => {
      const next = [...list];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    };
    onChange(reorder(value), reorder(titleAt));
  };

  const setTitle = (index: number, title: string) =>
    onChange(
      value,
      titleAt.map((current, i) => (i === index ? title : current)),
    );

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
          <Input
            className="min-w-0 flex-1"
            value={titleAt[index]}
            placeholder={format(common.imageNumber, { n: index + 1 })}
            aria-label={`${format(common.imageNumber, { n: index + 1 })} — ${common.imageTitle}`}
            onChange={(e) => setTitle(index, e.target.value)}
          />
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
            onClick={() =>
              onChange(
                value.filter((_, i) => i !== index),
                titleAt.filter((_, i) => i !== index),
              )
            }
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
          accept={IMAGE_TYPES.join(',')}
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
