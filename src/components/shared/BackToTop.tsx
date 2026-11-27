'use client';

import clsx from 'clsx';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { FiArrowUp } from 'react-icons/fi';
import { scrollToTarget } from '@/lib/scroll/scrollEngine';
import styles from './BackToTop.module.css';

type BackToTopProps = { label: string };

const SHOW_AFTER_PX = 400;

const subscribeNever = () => () => {};

export function BackToTop({ label }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  // false on the server and during hydration, true once the page is in the browser
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // <main> is its own stacking context (z-20) and sits below <SiteFooter> (also z-20, later in the DOM),
  // so a button rendered inside it can never rise above the footer whatever its own z-index is.
  // Portalling to <body> puts it in the root stacking context, where its z-index beats the footer.
  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      className={clsx(styles.button, visible && styles.visible)}
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      // Animated: scrollToTarget flies over every ScrollHold on the way up, so nothing dwells
      onClick={() => void scrollToTarget(0)}
    >
      <FiArrowUp aria-hidden="true" />
    </button>,
    document.body,
  );
}
