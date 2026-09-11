'use client';

import { ElementType } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './CTA.module.css';
import TypographyComponent from '../typography/Typography.component';

type Props = {
  as?: ElementType;
  text?: string;
  href?: string;
  Icon?: typeof FaFilePdf | null;
  fullWidth?: boolean;
  fullWidthMobile?: boolean;
  iconHasBg?: boolean;
  iconGradientFrom?: string;
  iconGradientTo?: string;
  iconGlowColor?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  iconPosition?: 'left' | 'right';
};

export default function CtaComponent({
  as,
  text = 'Download Resume',
  href,
  Icon = FaFilePdf,
  fullWidth = false,
  fullWidthMobile = true,
  iconHasBg = true,
  iconGradientFrom = '#ff0000ff',
  iconGradientTo = '#ff33335b',
  className,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  iconPosition = 'left',
}: Props) {
  const Component = as || (href && !onClick ? 'a' : 'button');
  const isLink = Component === 'a';

  const iconStyle = iconHasBg
    ? {
        background: `linear-gradient(135deg, ${iconGradientFrom}, ${iconGradientTo})`,

      }
    : undefined;

  return (
    <Component
      href={isLink ? href : undefined}
      type={isLink ? undefined : type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        styles.button,
        fullWidth && styles.buttonFullWidthDesktop,
        fullWidthMobile && styles.buttonFullWidthMobile,
        disabled && styles.buttonDisabled,
        loading && styles.buttonLoading,
        className
      )}
    >
      {/* لودینگ اسپینر */}
      {loading && <span className={styles.loader}>Loading...</span>}

      {/* آیکون سمت چپ */}
      {Icon && iconPosition === 'left' && !loading && (
        <span className={styles.icon} style={iconStyle}>
          <Icon size={20} />
        </span>
      )}

      {/* متن دکمه */}
      {!loading && (
        <TypographyComponent variant="button" color="text-primary">
          {text}
        </TypographyComponent>
      )}

      {/* آیکون سمت راست */}
      {Icon && iconPosition === 'right' && !loading && (
        <span className={styles.icon} style={iconStyle}>
          <Icon size={20} />
        </span>
      )}
    </Component>
  );
}
