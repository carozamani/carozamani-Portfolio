'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Wordmark } from '@/components/ui/Wordmark';
import Button from '@/components/ui/Button';
import FormFields from '@/components/ui/FormFields';
import { adminEmailMasked } from '@/data/admin';
import { localeDirection } from '@/lib/i18n/config';
import { format, useLocale } from '@/lib/i18n/LocaleProvider';
import styles from './AdminLogin.module.css';

type Step = 'login' | 'forgot' | 'code' | 'reset';

export function AdminLoginModule() {
  const { locale, dict } = useLocale();
  const t = dict.admin.login;
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [error, setError] = useState('');

  const COPY: Record<Step, { title: string; hint: string; action: string }> = {
    login: { title: t.loginTitle, hint: t.loginHint, action: t.loginAction },
    forgot: {
      title: t.forgotTitle,
      hint: format(t.forgotHint, { email: adminEmailMasked }),
      action: t.forgotAction,
    },
    code: { title: t.codeTitle, hint: t.codeHint, action: t.codeAction },
    reset: { title: t.resetTitle, hint: t.resetHint, action: t.resetAction },
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError('');

    if (step === 'login') {
      router.push('/admin');
    } else if (step === 'forgot') {
      toast.success(t.codeSent);
      setStep('code');
    } else if (step === 'code') {
      if (String(data.get('code')).length !== 6) return setError(t.codeInvalid);
      setStep('reset');
    } else {
      if (data.get('password') !== data.get('confirm')) return setError(t.mismatch);
      toast.success(t.updated);
      router.push('/admin');
    }
  };

  const { title, hint, action } = COPY[step];

  return (
    <div className={`${styles.theme} ${styles.authPage}`} dir={localeDirection[locale]}>
      <div className={styles.langCorner}>
        <LanguageSwitcher />
      </div>
      <div className={styles.card}>
        <div className={styles.gridPattern} aria-hidden="true" />
        <div className={styles.brandBlock}>
          <div className={styles.logoRing}>
            <Image
              src="/image/LogoPrimary.svg"
              alt=""
              aria-hidden="true"
              width={72}
              height={72}
              priority
            />
          </div>
          <Wordmark className={styles.wordmark} />
        </div>
        {step === 'login' ? (
          <h1 className="sr-only">{title}</h1>
        ) : (
          <>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.hint}>{hint}</p>
          </>
        )}
        <form className={styles.form} onSubmit={handleSubmit} key={step}>
          {step === 'login' && <FormFields variant="email" label={t.email} name="email" required />}
          {step === 'login' && (
            <FormFields variant="password" label={t.password} name="password" required />
          )}
          {step === 'code' && (
            <FormFields variant="text" label={t.code} name="code" maxLength={6} required />
          )}
          {step === 'reset' && (
            <>
              <FormFields variant="password" label={t.newPassword} name="password" required />
              <FormFields variant="password" label={t.confirmPassword} name="confirm" required />
            </>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth text={action} />
        </form>
        {step === 'login' ? (
          <button type="button" className={styles.linkBtn} onClick={() => setStep('forgot')}>
            {t.forgotLink}
          </button>
        ) : (
          <button type="button" className={styles.linkBtn} onClick={() => setStep('login')}>
            {t.backLink}
          </button>
        )}
      </div>
    </div>
  );
}
