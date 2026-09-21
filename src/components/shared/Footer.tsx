'use client';

import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

          <div className={styles.powered}>
            <span className={styles.poweredText}>POWERED BY</span>
            <Image
              src="/image/carozamani.png"
              alt="Logo"
              width={146}
              height={27}
              className={styles.logo}
            />
          </div>
      </div>
    </footer>
  );
}