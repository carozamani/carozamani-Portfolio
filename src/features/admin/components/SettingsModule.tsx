'use client';

import type { FormEvent } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import FormFields from '@/components/ui/FormFields';
import styles from './Admin.module.css';

export function SettingsModule() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success('Settings saved (demo).');
  };

  return (
    <>
      <h1 className={styles.h1}>Settings</h1>
      <form className={styles.settingsGrid} onSubmit={handleSubmit}>
        <FormFields variant="email" label="Notification email" name="email" required />
        <FormFields variant="password" label="Current password" name="current" />
        <FormFields variant="password" label="New password" name="next" />
        <Button type="submit" text="Save changes" />
      </form>
    </>
  );
}
