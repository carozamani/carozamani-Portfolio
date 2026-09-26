'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/admin-ui/button';
import { Checkbox } from '@/components/admin-ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin-ui/dialog';
import { Input } from '@/components/admin-ui/input';
import { Label } from '@/components/admin-ui/label';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { FormField } from './FormField';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const normalizeUrl = (value: string) => {
  const url = value.trim();
  if (!url) return null;
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  return /^[\w-]+(\.[\w-]+)+/.test(url) ? `https://${url}` : null;
};

export type LinkValues = { href: string; newTab: boolean };

type LinkDialogProps = {
  initial: LinkValues | null;
  onApply: (values: LinkValues) => void;
  onRemove: () => void;
  onClose: () => void;
};

export function LinkDialog({ initial, onApply, onRemove, onClose }: LinkDialogProps) {
  const { editor: t } = useDictionary().admin;
  const [href, setHref] = useState(initial?.href ?? '');
  const [newTab, setNewTab] = useState(initial?.newTab ?? true);
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const url = normalizeUrl(href);
    if (!url) return setError(t.link.urlInvalid);
    onApply({ href: url, newTab });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t.link.title}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <FormField label={t.link.url} htmlFor="link-url" error={error}>
            <Input
              id="link-url"
              dir="ltr"
              autoFocus
              placeholder="https://"
              value={href}
              onChange={(e) => setHref(e.target.value)}
            />
          </FormField>
          <div className="flex items-center gap-2">
            <Checkbox
              id="link-new-tab"
              checked={newTab}
              onCheckedChange={(on) => setNewTab(on === true)}
            />
            <Label htmlFor="link-new-tab">{t.link.newTab}</Label>
          </div>
          <DialogFooter>
            {initial && (
              <Button type="button" variant="destructive" onClick={onRemove}>
                {t.link.remove}
              </Button>
            )}
            <Button type="submit">{t.link.apply}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type ImageDialogProps = {
  onInsert: (values: { src: string; alt: string }) => void;
  onClose: () => void;
};

export function ImageDialog({ onInsert, onClose }: ImageDialogProps) {
  const { editor: t, common } = useDictionary().admin;
  const input = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');

  const pick = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError(common.errImageType);
    if (file.size > MAX_IMAGE_BYTES) return setError(common.errImageSize);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!src) return setError(t.image.required);
    onInsert({ src, alt: alt.trim() });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t.image.title}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <FormField label={t.image.file} error={error}>
            <div className="border-input flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4">
              {src && (
                // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
                <img src={src} alt="" className="max-h-40 max-w-full rounded-sm object-cover" />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => input.current?.click()}
              >
                {src ? common.replace : t.image.choose}
              </Button>
              <input
                ref={input}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </div>
          </FormField>
          <FormField label={t.image.alt} htmlFor="image-alt" hint={t.image.altHint}>
            <Input id="image-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="submit">{t.image.insert}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
