'use client';

import { FaFilePdf } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './CTA.module.css';
import CtaComponent from '@/components/ui/CTA';

type Props = {
  text?: string;
  href?: string;
  Icon?: typeof FaFilePdf | null;
  fullWidth?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  className?: string;
};

export default function BlockCTA({
  text = 'Download Resume',
  href = '/resume.pdf',
  Icon = FaFilePdf,
  fullWidth = false,
  gradientFrom = '#ff0000ff',
  gradientTo = '#ff33335b',
  glowColor = '#ff0000ff',
  className,
}: Props) {
  return (
    <div
      className={clsx(
        styles.wrapper,
        fullWidth && styles.fullWidth,
        className
      )}
    >
      {/* Neon Glow Background */}
      <div
        className={styles.glow}
        style={{ backgroundColor: glowColor, opacity: 0.1 }}
      />

      {/* CTA Content */}
      <div className={styles.content}>
        <CtaComponent
          text={text}
          href={href}
          download
          Icon={Icon}
          fullWidth={fullWidth}
          iconGradientFrom={gradientFrom}
          iconGradientTo={gradientTo}
        />
      </div>
    </div>
  );
}