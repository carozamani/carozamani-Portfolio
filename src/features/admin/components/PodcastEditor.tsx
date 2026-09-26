'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/admin-ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin-ui/dialog';
import { Input } from '@/components/admin-ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin-ui/select';
import { Textarea } from '@/components/admin-ui/textarea';
import type { AdminCard } from '@/types/admin';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { uniqueSlug } from '../lib/slug';
import { ConfirmDialog } from './ConfirmDialog';
import { FormField } from './FormField';
import { ImageUpload } from './ImageUpload';

type Props = {
  initial: AdminCard | null;
  existingIds: string[];
  onSave: (item: AdminCard) => void;
  onClose: () => void;
};

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim());

const today = () => new Date().toISOString().slice(0, 10);

const blank = (): AdminCard => ({
  id: '',
  type: 'podcast',
  title: '',
  summary: '',
  image: '',
  audioSrc: '',
  duration: '',
  date: today(),
  status: 'draft',
});

export function PodcastEditor({ initial, existingIds, onSave, onClose }: Props) {
  const t = useDictionary().admin;
  const { common } = t;
  const [base] = useState(() => initial ?? blank());
  const [draft, setDraft] = useState<AdminCard>(base);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(base);
  const set = <K extends keyof AdminCard>(key: K, value: AdminCard[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));
  const requestClose = () => (dirty ? setConfirmDiscard(true) : onClose());

  // the length is read from the audio file itself once the link is filled in
  const probe = useRef(0);
  const detectDuration = (url: string) => {
    const id = ++probe.current;
    if (!isHttpUrl(url)) return;
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      if (id !== probe.current || !Number.isFinite(audio.duration)) return;
      set('duration', `${Math.max(1, Math.round(audio.duration / 60))} min`);
    };
    audio.src = url;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = format(common.errRequired, { field: common.title });
    if (!draft.summary.trim()) next.summary = format(common.errRequired, { field: common.summary });
    if (!draft.audioSrc) next.audio = t.podcasts.audioRequired;
    else if (!isHttpUrl(draft.audioSrc)) next.audio = t.podcasts.audioUrlInvalid;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({ ...draft, id: initial?.id ?? uniqueSlug(draft.title, existingIds) });
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && requestClose()}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>{initial ? t.podcasts.editTitle : t.podcasts.new}</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submit} noValidate>
            <FormField label={common.title} htmlFor="p-title" error={errors.title}>
              <Input
                id="p-title"
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </FormField>
            <FormField label={common.summary} htmlFor="p-summary" error={errors.summary}>
              <Textarea
                id="p-summary"
                rows={3}
                value={draft.summary}
                onChange={(e) => set('summary', e.target.value)}
              />
            </FormField>
            <FormField
              label={t.podcasts.audioFile}
              htmlFor="p-audio"
              hint={
                draft.duration
                  ? format(t.podcasts.durationDetected, { duration: draft.duration })
                  : t.podcasts.audioUrlHint
              }
              error={errors.audio}
            >
              <Input
                id="p-audio"
                dir="ltr"
                inputMode="url"
                placeholder="https://"
                value={draft.audioSrc ?? ''}
                onChange={(e) => set('audioSrc', e.target.value.trim())}
                onBlur={() => detectDuration(draft.audioSrc ?? '')}
              />
            </FormField>
            <FormField label={common.coverImage}>
              <ImageUpload value={draft.image ?? ''} onChange={(url) => set('image', url)} />
            </FormField>
            <FormField label={common.status} htmlFor="p-status">
              <Select
                value={draft.status}
                onValueChange={(value) => set('status', value as AdminCard['status'])}
              >
                <SelectTrigger id="p-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{common.draft}</SelectItem>
                  <SelectItem value="published">{common.published}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {dirty && <p className="text-muted-foreground text-sm">{common.unsaved}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={requestClose}>
                {common.cancel}
              </Button>
              <Button type="submit">{common.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDiscard}
        title={common.discardTitle}
        description={common.discardText}
        confirmLabel={common.discard}
        onConfirm={onClose}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
}
