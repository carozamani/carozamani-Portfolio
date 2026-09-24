'use client';

import { FaFilePdf } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './CTA.module.css';
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
  text = 'Download Resume',
  href = '/resume.pdf',
  Icon = FaFilePdf,
  fullWidth = false,
  gradientFrom = '#ff0000ff',
  gradientTo = '#ff33335b',
  className,
}: Props) {
  return (
    <div className={clsx(styles.wrapper, fullWidth && styles.fullWidth, className)}>
      {/* CTA Content */}
      <div className={styles.content}>
        <Button
          text={text}
          href={href}
          download
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
