import clsx from 'clsx';
import styles from './Wordmark.module.css';

/**
 * The "carozamani" logotype, set in abeatbyKai. Size it with `font-size` on the parent or className.
 * `uniform` drops the logotype's fixed dim "caro" and its shadow: the word takes the colour it inherits,
 * and "caro" a different one if a parent sets --wordmark-caro-color.
 */
export function Wordmark({
  className,
  uniform = false,
}: {
  className?: string;
  uniform?: boolean;
}) {
  return (
    <span
      className={clsx(styles.wordmark, uniform && styles.uniform, className)}
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
