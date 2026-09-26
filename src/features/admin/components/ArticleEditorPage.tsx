'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JSONContent } from '@tiptap/react';
import { toast } from 'sonner';
import { Button } from '@/components/admin-ui/button';
import { Input } from '@/components/admin-ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin-ui/select';
import type { AdminCard } from '@/types/admin';
import { countWords, excerpt, hasContent, readingMinutes } from '@/lib/rich-text/doc';
import { format, useDictionary, useLocale } from '@/lib/i18n/LocaleProvider';
import { articleStore, useArticles } from '../lib/articleStore';
import { useHydrated } from '../lib/entityStore';
import { uniqueSlug } from '../lib/slug';
import { BackButton } from './BackButton';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { FormField } from './FormField';
import { ImageUpload } from './ImageUpload';
import { RichTextEditor } from './RichTextEditor';

const emptyDoc: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

const blankArticle = (): AdminCard => ({
  id: '',
  type: 'article',
  title: '',
  summary: '',
  image: '',
  date: new Date().toISOString().slice(0, 10),
  readTime: '',
  status: 'draft',
  content: emptyDoc,
});

type FormProps = { initial: AdminCard | null; existingIds: string[] };

function ArticleForm({ initial, existingIds }: FormProps) {
  const { locale, dict } = useLocale();
  const t = dict.admin;
  const { common } = t;
  const router = useRouter();
  const [draft, setDraft] = useState<AdminCard>(initial ?? blankArticle());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const doc = draft.content ?? emptyDoc;
  const words = useMemo(() => countWords(doc), [doc]);
  const minutes = readingMinutes(doc);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof AdminCard>(key: K, value: AdminCard[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const goBack = () => (dirty ? setConfirmLeave(true) : router.push('/admin/articles'));

  const save = () => {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = format(common.errRequired, { field: common.title });
    if (!hasContent(doc)) next.content = format(common.errRequired, { field: t.articles.body });
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // the link stays stable after the first save; date, summary and reading time are derived
    const id = initial?.id ?? uniqueSlug(draft.title, existingIds);
    const stored = articleStore.upsert(
      {
        ...draft,
        id,
        href: `/articles/${id}`,
        summary: excerpt(doc),
        readTime: `${minutes} min`,
        body: undefined,
      },
      initial?.id,
    );
    toast.success(initial ? common.saved : common.created);
    if (!stored) toast.warning(t.editor.saveFailedStorage);
    setDirty(false);
    if (!initial) router.replace(`/admin/articles/${id}`);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton label={t.editor.back} href="/admin/articles" onClick={goBack} />
          <h1 className="text-foreground text-2xl font-bold">
            {initial ? t.editor.editTitle : t.editor.newTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={draft.status}
            onValueChange={(value) => set('status', value as AdminCard['status'])}
          >
            <SelectTrigger size="sm" className="w-36" aria-label={common.status}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{common.draft}</SelectItem>
              <SelectItem value="published">{common.published}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={save} disabled={Boolean(initial) && !dirty}>
            {common.save}
          </Button>
        </div>
      </div>

      <FormField label={common.title} htmlFor="article-title" error={errors.title}>
        <Input
          id="article-title"
          className="h-12 text-lg font-semibold"
          placeholder={t.editor.titlePlaceholder}
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </FormField>

      <FormField label={common.coverImage}>
        <ImageUpload value={draft.image ?? ''} onChange={(url) => set('image', url)} />
      </FormField>

      <FormField label={t.articles.body} error={errors.content}>
        <RichTextEditor initialContent={doc} onChange={(next) => set('content', next)} />
      </FormField>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {format(t.editor.stats, { words: number.format(words), minutes: number.format(minutes) })}
        {' · '}
        {t.editor.autoNote}
      </p>

      <ConfirmDialog
        open={confirmLeave}
        title={common.discardTitle}
        description={common.discardText}
        confirmLabel={common.discard}
        onConfirm={() => router.push('/admin/articles')}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  );
}

export function ArticleEditorPage({ id }: { id?: string }) {
  const { editor } = useDictionary().admin;
  const hydrated = useHydrated();
  const articles = useArticles();
  const existing = id ? articles.find((a) => a.id === id) : undefined;

  if (!hydrated) {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-4" aria-busy="true">
        <div className="bg-muted h-9 w-48 animate-pulse rounded-xl" />
        <div className="bg-muted h-96 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (id && !existing) {
    return (
      <>
        <div>
          <BackButton label={editor.back} href="/admin/articles" />
        </div>
        <EmptyState title={editor.notFound} hint={editor.notFoundHint} />
      </>
    );
  }

  return (
    <ArticleForm
      key={existing?.id ?? 'new'}
      initial={existing ?? null}
      existingIds={articles.map((a) => a.id)}
    />
  );
}
