'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { navItems } from '@/data/navigation';
import { useHasSection } from '@/lib/ContentProvider';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { suggestRoute } from '../lib/suggestRoute';
import styles from './NotFoundActions.module.css';

const JUMP_ITEMS = navItems.filter((item) => item.key !== 'home');

export function NotFoundActions() {
  const { notFound, nav } = useDictionary();
  const pathname = usePathname();
  const router = useRouter();
  const hasProjects = useHasSection('projects');
  const hasMedia = useHasSection('media');

  const jumpItems = JUMP_ITEMS.filter(
    (item) => (item.key !== 'projects' || hasProjects) && (item.key !== 'media' || hasMedia),
  );

  const suggestedKey = suggestRoute(
    pathname,
    jumpItems.map((item) => ({ id: item.key, terms: [item.href.replace('#', ''), item.key] })),
  );
  const suggested = jumpItems.find((item) => item.key === suggestedKey);

  // Arriving from outside the site there is nothing to go back to, so back means home
  const goBack = () => (window.history.length > 1 ? router.back() : router.push('/'));

  return (
    <>
      <p className={styles.requested} dir="ltr">
        <span className={styles.label}>{notFound.requested}</span>
        <span className={styles.path}>{pathname}</span>
        <span className={styles.caret} aria-hidden="true" />
      </p>

      {suggested && (
        <p className={styles.suggestion}>
          <span className={styles.jumpLabel}>{notFound.suggest}</span>
          <Link href={`/${suggested.href}`} className={styles.suggestionLink}>
            {nav[suggested.key]}
          </Link>
        </p>
      )}

      <div className={styles.actions}>
        <Button variant="cta" href="/" text={notFound.home} />
        <Button variant="glass" text={notFound.back} onClick={goBack} />
      </div>

      {jumpItems.length > 0 && (
        <nav className={styles.jump} aria-label={notFound.jump}>
          <span className={styles.jumpLabel}>{notFound.jump}</span>
          <ul className={styles.jumpList}>
            {jumpItems.map((item) => (
              <li key={item.key}>
                <Link href={`/${item.href}`} className={styles.jumpLink}>
                  {nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
