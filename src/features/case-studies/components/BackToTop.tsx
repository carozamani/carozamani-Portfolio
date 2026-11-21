'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import styles from './BackToTop.module.css';

type BackToTopProps = { label: string };

const SHOW_AFTER_PX = 400;

export function BackToTop({ label }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <button
      type="button"
      className={clsx(styles.button, visible && styles.visible)}
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <FiArrowUp aria-hidden="true" />
    </button>
  );
}
