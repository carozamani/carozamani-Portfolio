'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminEmailMasked } from '@/data/admin';
import { Wordmark } from '@/components/ui/Wordmark';
import Button from '@/components/ui/Button';
import FormFields from '@/components/ui/FormFields';
import styles from './Admin.module.css';

type Step = 'login' | 'forgot' | 'code' | 'reset';

const COPY: Record<Step, { title: string; hint: string; action: string }> = {
  login: { title: 'Admin Login', hint: 'Sign in with your email and password.', action: 'Sign in' },
  forgot: {
    title: 'Forgot password',
    hint: `A 6-digit code will be sent to your admin email (${adminEmailMasked}).`,
    action: 'Send code to my email',
  },
  code: {
    title: 'Enter code',
    hint: 'Check your inbox. The code expires in 10 minutes.',
    action: 'Verify',
  },
  reset: {
    title: 'New password',
    hint: 'Choose a new password to finish signing in.',
    action: 'Save & sign in',
  },
};

export function AdminLoginModule() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError('');

    if (step === 'login') {
      router.push('/admin');
    } else if (step === 'forgot') {
      toast.success('Code sent to your admin email.');
      setStep('code');
    } else if (step === 'code') {
      if (String(data.get('code')).length !== 6) return setError('Enter the 6-digit code.');
      setStep('reset');
    } else {
      if (data.get('password') !== data.get('confirm')) return setError('Passwords do not match.');
      toast.success('Password updated.');
      router.push('/admin');
    }
  };

  const { title, hint, action } = COPY[step];

  return (
    <div className={`${styles.theme} ${styles.authPage}`} dir="ltr">
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
          {step === 'login' && <FormFields variant="email" label="Email" name="email" required />}
          {step === 'login' && (
            <FormFields variant="password" label="Password" name="password" required />
          )}
          {step === 'code' && (
            <FormFields variant="text" label="6-digit code" name="code" maxLength={6} required />
          )}
          {step === 'reset' && (
            <>
              <FormFields variant="password" label="New password" name="password" required />
              <FormFields variant="password" label="Confirm password" name="confirm" required />
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
            Forgot password?
          </button>
        ) : (
          <button type="button" className={styles.linkBtn} onClick={() => setStep('login')}>
            Back to login
          </button>
        )}
      </div>
    </div>
  );
}
