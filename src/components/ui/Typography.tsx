import { type PropsWithChildren, type ReactElement, type ElementType } from 'react';
import clsx from 'clsx';
import styles from './Typography.module.css';
import { ColorType } from '@/types/color';

type VariantType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button';

const VARIANT_TAG_MAP: Record<VariantType, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'p',
  subtitle2: 'p',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
  button: 'span',
};

type TypographyColorType = ColorType | 'text-primary' | 'text-secondary' | 'text-disabled';

type Props = PropsWithChildren<{
  ellipsis?: boolean;
  variant: VariantType;
  color?: TypographyColorType;
  className?: string;
  id?: string;
  as?: ElementType;
}>;

export default function TypographyComponent({
  ellipsis = false,
  variant,
  color = 'text-primary',
  className,
  id,
  as,
  children,
}: Props): ReactElement {
  const Tag = as ?? VARIANT_TAG_MAP[variant];

  return (
    <Tag
      id={id}
      className={clsx(
        styles.typography,
        ellipsis && styles.ellipsis,
        variant,
        color,
        styles[color],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
