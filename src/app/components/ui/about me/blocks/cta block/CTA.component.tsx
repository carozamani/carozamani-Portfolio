'use client';

import { FaFilePdf } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './CTA.module.css';
import TypographyComponent from '../../../typography/Typography.component';

type Props = {
  text?: string;
  href?: string;
  Icon?: typeof FaFilePdf;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  className?: string;
};

export default function BlockCTA({
  text = 'Download Resume',
  href = '/resume.pdf',
  Icon = FaFilePdf,
  gradientFrom = '#ff0000ff',
  gradientTo = '#ff33335b',
  glowColor = '#ff0000ff',
  className,
}: Props) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {/* Neon Glow Background */}
      <div
        className={styles.glow}
        style={{ backgroundColor: `${glowColor}/10` }}
      />

      {/* CTA Content */}
      <div className={styles.content}>
        <a href={href} download className={styles.button}>
          {/* Icon */}
          <span
            className={styles.icon}
            style={{ background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` }}
          >
            <Icon size={20} />
          </span>

          {/* Button Text via TypographyComponent */}
          <TypographyComponent
            variant="button"
            color="text-primary"
          >
            {text}
          </TypographyComponent>
        </a>
      </div>
    </div>
  );
}
