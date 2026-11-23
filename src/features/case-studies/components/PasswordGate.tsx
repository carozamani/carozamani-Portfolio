'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { FiLock } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import FormFields from '@/components/ui/FormFields';
import { LogoRing } from '@/components/ui/LogoRing';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import styles from './PasswordGate.module.css';

type PasswordGateProps = {
  /** The public cover, shown blurred behind the form; the protected content itself is never sent. */
  image?: string;
  onUnlock: (password: string) => Promise<boolean>;
};

export function PasswordGate({ image, onUnlock }: PasswordGateProps) {
  const { projects, fields } = useDictionary();
  const { gate } = projects.detail;
  const titleId = useId();
  const form = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password') ?? '');
    if (!password || busy) return;
    setBusy(true);
    setMessage('');
    onUnlock(password)
      .then((ok) => {
        if (!ok) {
          setMessage(gate.denied);
          form.current?.reset();
        }
      })
      .catch(() => setMessage(gate.error))
      .finally(() => setBusy(false));
  };

  return (
    <div className={styles.backdrop}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" aria-hidden="true" className={styles.cover} />
      )}
      <div
        className={`glassPanel ${styles.card}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.gridPattern} aria-hidden="true" />
        <div className={styles.brandBlock}>
          <LogoRing className={styles.lockRing}>
            <FiLock aria-hidden="true" className={styles.lockIcon} />
          </LogoRing>
          <h2 id={titleId} className={styles.title}>
            {gate.title}
          </h2>
          <p className={styles.hint}>{gate.text}</p>
        </div>
        <form ref={form} className={styles.form} onSubmit={submit} noValidate>
          <FormFields
            variant="password"
            label={gate.label}
            name="password"
            revealLabels={{ show: fields.showPassword, hide: fields.hidePassword }}
            autoComplete="off"
            autoFocus
            required
            error={message}
            onInput={() => message && setMessage('')}
          />
          <Button type="submit" fullWidth text={gate.submit} disabled={busy} />
        </form>
        <Link href="/#projects" className={styles.linkBtn}>
          {gate.back}
        </Link>
      </div>
    </div>
  );
}
