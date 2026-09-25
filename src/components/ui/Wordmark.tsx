import clsx from 'clsx';
import styles from './Wordmark.module.css';

/** The "carozamani" logotype, set in abeatbyKai. Size it with `font-size` on the parent or className. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(styles.wordmark, className)}
      dir="ltr"
      lang="en"
      role="img"
      aria-label="Carozamani"
    >
      <span aria-hidden="true" className={styles.caro}>
        caro
      </span>
      <span aria-hidden="true">zamani</span>
    </span>
  );
}
