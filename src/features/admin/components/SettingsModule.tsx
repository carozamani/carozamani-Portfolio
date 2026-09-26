'use client';

import { useRef, useState, type FormEvent } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/admin-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/admin-ui/card';
import { Input } from '@/components/admin-ui/input';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { FormField } from './FormField';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

type Resume = { name: string; size: number; url: string };

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export function SettingsModule() {
  const t = useDictionary().admin.settings;
  const input = useRef<HTMLInputElement>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(t.savedDemo);
  };

  const pickResume = (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return setError(t.resumeType);
    if (file.size > MAX_PDF_BYTES) return setError(t.resumeSize);
    setError('');
    if (resume) URL.revokeObjectURL(resume.url);
    setResume({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
    toast.success(t.resumeUploaded);
  };

  const removeResume = () => {
    if (resume) URL.revokeObjectURL(resume.url);
    setResume(null);
    toast.success(t.resumeRemoved);
  };

  return (
    <>
      <h1 className="text-foreground text-3xl font-bold">{t.title}</h1>

      <Card className="max-w-2xl" aria-labelledby="resume-title">
        <CardHeader>
          <CardTitle id="resume-title">{t.resumeTitle}</CardTitle>
          <CardDescription>{t.resumeHint}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {resume ? (
            <div className="border-border flex items-center gap-3 rounded-sm border p-3">
              <FileText className="text-muted-foreground size-5" />
              <div className="min-w-0">
                <div className="text-foreground truncate text-sm">{resume.name}</div>
                <div className="text-muted-foreground text-xs">
                  {t.resumeCurrent} · {formatSize(resume.size)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t.resumeNone}</p>
          )}
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
          <input
            ref={input}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              pickResume(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => input.current?.click()}>
            {resume ? t.resumeReplace : t.resumeChoose}
          </Button>
          {resume && (
            <>
              <Button asChild variant="outline">
                <a href={resume.url} target="_blank" rel="noopener noreferrer">
                  {t.resumeView}
                </a>
              </Button>
              <Button variant="ghost" className="text-destructive" onClick={removeResume}>
                {t.resumeRemove}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <CardHeader>
            <CardTitle>{t.account}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField label={t.notificationEmail} htmlFor="s-email">
              <Input id="s-email" name="email" type="email" required dir="ltr" />
            </FormField>
            <FormField label={t.currentPassword} htmlFor="s-current">
              <Input
                id="s-current"
                name="current"
                type="password"
                autoComplete="current-password"
              />
            </FormField>
            <FormField label={t.newPassword} htmlFor="s-next">
              <Input id="s-next" name="next" type="password" autoComplete="new-password" />
            </FormField>
          </CardContent>
          <CardFooter>
            <Button type="submit">{t.saveChanges}</Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
