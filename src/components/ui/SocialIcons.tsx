'use client';

import styles from './SocialIcons.module.css';
import { FaLinkedin, FaGithub, FaTwitter, FaDribbble } from 'react-icons/fa';
import { SiCastbox } from 'react-icons/si';
import React from 'react';
import clsx from 'clsx';

const ICON_MAP = {
  linkedin: FaLinkedin,
  github: FaGithub,
  twitter: FaTwitter,
  dribbble: FaDribbble,
  castbox: SiCastbox,
} as const;

type SocialType = keyof typeof ICON_MAP;

export type SocialItem = {
  type: SocialType;
  href?: string;
  color?: string;
};

type Props = {
  items?: SocialItem[];
  bordered?: boolean;
  className?: string;
};

export default function SocialIcons({ items = [], bordered = true, className = '' }: Props) {
  return (
    <ul className={clsx(styles.wrapper, className)}>
      {items.map((item) => {
        const Icon = ICON_MAP[item.type];
        const label = item.type.charAt(0).toUpperCase() + item.type.slice(1);

        return (
          <li
            key={item.type}
            className={clsx(styles.icon, !bordered && styles.noBorder)}
            style={{ '--social-color': item.color ?? '#ffffff' } as React.CSSProperties}
          >
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={styles.link}
              aria-label={label}
            >
              <Icon aria-hidden="true" />
              <span className={styles.tooltip}>{label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
