'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/admin-ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/admin-ui/card';
import { Input } from '@/components/admin-ui/input';
import { ApiError, getToken, setToken } from '@/lib/api';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import {
  deleteResume,
  getAdminSettings,
  saveAdminAccount,
  uploadResume,
  type SiteResumes,
} from '../lib/adminApi';
import { refreshSiteContent } from '../lib/refreshSiteContent';
import { FormField } from './FormField';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

type ResumeLocale = 'en' | 'fa';
type SettingsCopy = ReturnType<typeof useDictionary>['admin']['settings'];

const fileLabel = (url: string) => {
  const name = url.split('/').pop() || url;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

const accountMessage = (error: unknown, t: SettingsCopy) => {
  const code = error instanceof ApiError ? error.message : '';
  if (code === 'wrong-password') return t.wrongPassword;
  if (code === 'password-short') return t.passwordShort;
  if (code === 'email-invalid') return t.emailInvalid;
  if (code === 'current-password-required') return t.currentRequired;
  return t.saveFailed;
};

function ResumeUploadCard({
  locale,
  titleId,
  title,
  url,
  busy,
  t,
  onUpload,
  onRemove,
}: {
  locale: ResumeLocale;
  titleId: string;
  title: string;
  url: string;
  busy: boolean;
  t: SettingsCopy;
  onUpload: (locale: ResumeLocale, file: File) => void;
  onRemove: (locale: ResumeLocale) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const custom = url.startsWith('/uploads/');

  const pickResume = (file?: File) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) return setError(t.resumeType);
    if (file.size > MAX_PDF_BYTES) return setError(t.resumeSize);
    setError('');
    onUpload(locale, file);
  };

  return (
    <Card className="max-w-2xl" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="border-border flex items-center gap-3 rounded-sm border p-3">
          <FileText className="text-muted-foreground size-5" />
          <div className="min-w-0">
            <div className="text-foreground truncate text-sm">{fileLabel(url)}</div>
            <div className="text-muted-foreground text-xs">{t.resumeCurrent}</div>
          </div>
        </div>
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <input
          ref={input}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          lang={locale}
          onChange={(e) => {
            pickResume(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          {custom ? t.resumeReplace : t.resumeChoose}
        </Button>
        <Button asChild variant="outline">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t.resumeView}
          </a>
        </Button>
        {custom && (
          <Button
            variant="ghost"
            className="text-destructive"
            disabled={busy}
            onClick={() => onRemove(locale)}
          >
            {t.resumeRemove}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function SettingsModule() {
  const t = useDictionary().admin.settings;
  const [email, setEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [resumes, setResumes] = useState<SiteResumes | null>(null);
  const [busy, setBusy] = useState<'account' | ResumeLocale | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminSettings()
      .then((settings) => {
        if (cancelled) return;
        setEmail(settings.notificationEmail);
        setLoginEmail(settings.email);
        setResumes(settings.resumes);
      })
      .catch(() => {
        if (!cancelled) toast.error(t.saveFailed);
      });
    return () => {
      cancelled = true;
    };
  }, [t.saveFailed]);

  const publishResumes = (next: SiteResumes) => {
    setResumes(next);
    void refreshSiteContent(getToken()).catch(() => undefined);
  };

  const handleUpload = (locale: ResumeLocale, file: File) => {
    setBusy(locale);
    uploadResume(locale, file)
      .then(({ resumes: next }) => {
        publishResumes(next);
        toast.success(t.resumeUploaded);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 413) toast.error(t.resumeSize);
        else if (error instanceof ApiError && error.status === 415) toast.error(t.resumeType);
        else toast.error(t.saveFailed);
      })
      .finally(() => setBusy(null));
  };

  const handleRemove = (locale: ResumeLocale) => {
    setBusy(locale);
    deleteResume(locale)
      .then(({ resumes: next }) => {
        publishResumes(next);
        toast.success(t.resumeRemoved);
      })
      .catch(() => toast.error(t.saveFailed))
      .finally(() => setBusy(null));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPassword) return setAccountError(t.currentRequired);
    if (newPassword && newPassword.length < 8) return setAccountError(t.passwordShort);
    setAccountError('');
    setBusy('account');
    saveAdminAccount({
      notificationEmail: email.trim(),
      currentPassword,
      newPassword,
    })
      .then((saved) => {
        if (saved.token) setToken(saved.token);
        setEmail(saved.notificationEmail);
        setCurrentPassword('');
        setNewPassword('');
        toast.success(t.saved);
      })
      .catch((error: unknown) => setAccountError(accountMessage(error, t)))
      .finally(() => setBusy(null));
  };

  return (
    <>
      <h1 className="text-foreground text-3xl font-bold">{t.title}</h1>

      <div className="grid max-w-2xl gap-1">
        <h2 className="text-foreground text-lg font-semibold">{t.resumeTitle}</h2>
        <p className="text-muted-foreground text-sm">{t.resumeHint}</p>
      </div>

      {resumes ? (
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <ResumeUploadCard
            locale="en"
            titleId="resume-title-en"
            title={t.resumeTitleEn}
            url={resumes.en}
            busy={busy !== null}
            t={t}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />
          <ResumeUploadCard
            locale="fa"
            titleId="resume-title-fa"
            title={t.resumeTitleFa}
            url={resumes.fa}
            busy={busy !== null}
            t={t}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{t.loading}</p>
      )}

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <CardHeader>
            <CardTitle>{t.account}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField label={t.notificationEmail} htmlFor="s-email">
              <Input
                id="s-email"
                name="email"
                type="email"
                dir="ltr"
                value={email}
                placeholder={loginEmail}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
            <FormField label={t.currentPassword} htmlFor="s-current" error={accountError}>
              <Input
                id="s-current"
                name="current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </FormField>
            <FormField label={t.newPassword} htmlFor="s-next" hint={t.passwordHint}>
              <Input
                id="s-next"
                name="next"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </FormField>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={busy !== null || !resumes}>
              {t.saveChanges}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
