'use client';

import { FaFilePdf } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './CTA.module.css';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { getResumeHref } from '@/lib/resume';
import Button from '@/components/ui/Button';

type Props = {
  text?: string;
  href?: string;
  Icon?: typeof FaFilePdf | null;
  fullWidth?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
};

export default function BlockCTA({
  text,
  href,
  Icon = FaFilePdf,
  fullWidth = false,
  gradientFrom = '#ff0000ff',
  gradientTo = '#ff33335b',
  className,
}: Props) {
  const { locale, dict } = useLocale();
  const { about } = dict;
  return (
    <div className={clsx(styles.wrapper, fullWidth && styles.fullWidth, className)}>
      {/* CTA Content */}
      <div className={styles.content}>
        <Button
          text={text ?? about.resume}
          href={href ?? getResumeHref(locale)}
          Icon={Icon}
          fullWidth={fullWidth}
          className={styles.button}
          iconGradientFrom={gradientFrom}
          iconGradientTo={gradientTo}
        />
      </div>
    </div>
  );
}
