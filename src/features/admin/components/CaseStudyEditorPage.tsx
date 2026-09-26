'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/admin-ui/textarea';
import type { AdminCaseStudy } from '@/types/admin';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import { caseStudyStore, useCaseStudies } from '../lib/caseStudyStore';
import { useHydrated } from '../lib/entityStore';
import { uniqueSlug } from '../lib/slug';
import { BackButton } from './BackButton';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { FormField } from './FormField';
import { GalleryUpload } from './GalleryUpload';
import { ImageUpload } from './ImageUpload';
import { TagInput } from './TagInput';

const LIST_HREF = '/admin/case-studies';

const blank = (): AdminCaseStudy => ({
  slug: '',
  title: '',
  image: '',
  caseImages: [],
  description: '',
  tags: [],
  year: String(new Date().getFullYear()),
  overview: '',
  status: 'draft',
});

type FormProps = { initial: AdminCaseStudy | null };

function CaseStudyForm({ initial }: FormProps) {
  const t = useDictionary().admin;
  const { common } = t;
  const router = useRouter();
  const [draft, setDraft] = useState<AdminCaseStudy>(() =>
    initial ? { ...initial, tags: initial.tags ?? (initial.tag ? [initial.tag] : []) } : blank(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const existingSlugs = useCaseStudies().map((study) => study.slug);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof AdminCaseStudy>(key: K, value: AdminCaseStudy[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const goBack = () => (dirty ? setConfirmLeave(true) : router.push(LIST_HREF));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = format(common.errRequired, { field: common.title });
    if (!/^\d{4}$/.test(draft.year ?? '')) {
      next.year = format(common.errRequired, { field: common.year });
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const tags = draft.tags ?? [];
    // the link stays stable after the first save
    const slug = initial?.slug ?? uniqueSlug(draft.title, existingSlugs);
    const stored = caseStudyStore.upsert(
      { ...draft, slug, tags, tag: tags.join(' · ') },
      initial?.slug,
    );
    toast.success(initial ? common.saved : common.created);
    if (!stored) toast.warning(t.editor.saveFailedStorage);
    setDirty(false);
    if (!initial) router.replace(`${LIST_HREF}/${slug}`);
  };

  return (
    <form className="mx-auto grid w-full max-w-4xl gap-6" onSubmit={submit} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton label={t.caseStudies.back} href={LIST_HREF} onClick={goBack} />
          <h1 className="text-foreground text-2xl font-bold">
            {initial ? t.caseStudies.editTitle : t.caseStudies.new}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={draft.status}
            onValueChange={(value) => set('status', value as AdminCaseStudy['status'])}
          >
            <SelectTrigger size="sm" className="w-36" aria-label={common.status}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{common.draft}</SelectItem>
              <SelectItem value="published">{common.published}</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={Boolean(initial) && !dirty}>
            {common.save}
          </Button>
        </div>
      </div>

      <FormField label={common.title} htmlFor="cs-title" error={errors.title}>
        <Input
          id="cs-title"
          className="h-12 text-lg font-semibold"
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <FormField label={common.tags} htmlFor="cs-tags" hint={common.tagsHint}>
          <TagInput id="cs-tags" value={draft.tags ?? []} onChange={(tags) => set('tags', tags)} />
        </FormField>
        <FormField label={common.year} htmlFor="cs-year" error={errors.year}>
          <Input
            id="cs-year"
            inputMode="numeric"
            value={draft.year ?? ''}
            onChange={(e) => set('year', e.target.value)}
          />
        </FormField>
      </div>

      <FormField label={common.description} htmlFor="cs-desc">
        <Textarea
          id="cs-desc"
          rows={3}
          value={draft.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
        />
      </FormField>

      <FormField label={t.caseStudies.overview} htmlFor="cs-overview">
        <Textarea
          id="cs-overview"
          rows={8}
          value={draft.overview ?? ''}
          onChange={(e) => set('overview', e.target.value)}
        />
      </FormField>

      <FormField label={common.coverImage} hint={t.caseStudies.coverHint}>
        <ImageUpload value={draft.image} onChange={(url) => set('image', url)} />
      </FormField>

      <FormField label={t.caseStudies.imagesTitle} hint={t.caseStudies.imagesHint}>
        <GalleryUpload
          value={draft.caseImages ?? []}
          onChange={(images) => set('caseImages', images)}
        />
      </FormField>

      {dirty && <p className="text-muted-foreground text-sm">{common.unsaved}</p>}

      <ConfirmDialog
        open={confirmLeave}
        title={common.discardTitle}
        description={common.discardText}
        confirmLabel={common.discard}
        onConfirm={() => router.push(LIST_HREF)}
        onCancel={() => setConfirmLeave(false)}
      />
    </form>
  );
}

export function CaseStudyEditorPage({ slug }: { slug?: string }) {
  const { caseStudies } = useDictionary().admin;
  const hydrated = useHydrated();
  const studies = useCaseStudies();
  const existing = slug ? studies.find((study) => study.slug === slug) : undefined;

  if (!hydrated) {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-4" aria-busy="true">
        <div className="bg-muted h-9 w-48 animate-pulse rounded-xl" />
        <div className="bg-muted h-96 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (slug && !existing) {
    return (
      <>
        <div>
          <BackButton label={caseStudies.back} href={LIST_HREF} />
        </div>
        <EmptyState title={caseStudies.notFound} />
      </>
    );
  }

  return <CaseStudyForm key={existing?.slug ?? 'new'} initial={existing ?? null} />;
}
