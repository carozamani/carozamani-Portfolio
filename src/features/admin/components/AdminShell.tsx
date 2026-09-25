'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { adminNav } from '@/data/admin';
import styles from './Admin.module.css';

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={`${styles.theme} ${styles.shell}`} dir="ltr">
      <aside className={styles.sidebar}>
        <Image src="/image/LogoPrimary.svg" alt="Caro Zamani" width={56} height={56} />
        <span className={styles.brand}>Admin</span>
        <nav className={styles.nav} aria-label="Admin">
          {adminNav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(styles.navLink, pathname === href && styles.navActive)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/admin/login" className={styles.navLink}>
          Log out
        </Link>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
