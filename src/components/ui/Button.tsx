'use client';

import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import styles from './Button.module.css';
import TypographyComponent from './Typography';

type ButtonVariant = 'cta' | 'glass' | 'ghost' | 'icon';

type ButtonProps = {
  /** Visible label; for the icon variant it becomes the accessible name. */
  text: string;
  variant?: ButtonVariant;
  href?: string;
  download?: boolean | string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  className?: string;
  /** Icon rendered inside a gradient tile (cta variant). */
  Icon?: ComponentType<{ size?: number }> | null;
  iconPosition?: 'left' | 'right';
  iconGradientFrom?: string;
  iconGradientTo?: string;
  /** Free-form icon nodes placed beside the label. */
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  cta: styles.button,
  glass: styles.glass,
  ghost: styles.ghost,
  icon: styles.iconButton,
};

const isInternal = (href: string) => href.startsWith('/') || href.startsWith('#');

export default function Button({
  text,
  variant = 'cta',
  href,
  download,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  loadingText = 'Loading…',
  fullWidth = false,
  className,
  Icon = null,
  iconPosition = 'left',
  iconGradientFrom = 'var(--color-brand-primary)',
  iconGradientTo = 'var(--color-brand-secondary)',
  iconLeft,
  iconRight,
}: ButtonProps) {
  const classes = clsx(
    VARIANT_CLASS[variant],
    variant === 'cta' && fullWidth && styles.buttonFullWidthDesktop,
    disabled && styles.buttonDisabled,
    loading && styles.buttonLoading,
    className,
  );

  const iconTile = Icon && !loading && (
    <span
      className={styles.icon}
      style={{ background: `linear-gradient(135deg, ${iconGradientFrom}, ${iconGradientTo})` }}
    >
      <Icon size={20} />
    </span>
  );

  const label =
    variant === 'icon' ? null : variant === 'cta' ? (
      <TypographyComponent variant="button" color="text-primary">
        {loading ? loadingText : text}
      </TypographyComponent>
    ) : (
      text
    );

  const content = (
    <>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {iconPosition === 'left' && iconTile}
      {iconLeft}
      {label}
      {iconRight}
      {iconPosition === 'right' && iconTile}
    </>
  );

  if (href) {
    if (isInternal(href) && !download) {
      return (
        <Link href={href} className={classes} aria-label={variant === 'icon' ? text : undefined}>
          {content}
        </Link>
      );
    }

    return (
      <a
        href={href}
        download={download}
        className={classes}
        aria-label={variant === 'icon' ? text : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={variant === 'icon' ? text : undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {content}
    </button>
  );
}
