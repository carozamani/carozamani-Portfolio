'use client';

import { Wordmark } from '@/components/ui/Wordmark';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import styles from './Footer.module.css';

export default function Footer() {
  const { footer } = useDictionary();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.powered}>
          <span className={styles.poweredText}>{footer.poweredBy}</span>
          {footer.brandFirst ? (
            <span className={styles.brandName}>
              <span className={styles.brandFirst}>{footer.brandFirst}</span>
              <span>{footer.brandLast}</span>
            </span>
          ) : (
            <Wordmark className={styles.logo} />
          )}
        </div>
      </div>
    </footer>
  );
}
