'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CardProps } from '@/types/card';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import styles from './PodcastSuggestions.module.css';

type Props = {
  episodes: CardProps[];
  /** Lets the parent decide where the box shows (it sets no `display` of its own). */
  className?: string;
};

/** The "suggested episodes" box under an episode: a compact list of other episodes to listen to next. */
export function PodcastSuggestions({ episodes, className }: Props) {
  const dict = useDictionary();
  if (episodes.length === 0) return null;

  const label = dict.media.podcasts.suggested;

  return (
    <section className={`${styles.box} ${className ?? ''}`} aria-label={label}>
      <h2 className={styles.label}>{label}</h2>

      <ul className={styles.list}>
        {episodes.map((item) => {
          const meta = [item.date, item.duration].filter(Boolean).join(' · ');

          return (
            <li key={item.id}>
              <Link href={item.href ?? `/podcasts/${item.id}`} className={styles.item}>
                <span className={styles.thumb}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="2.75rem"
                      className={styles.thumbImage}
                    />
                  ) : (
                    <span className={styles.glyph}>{item.title.charAt(0)}</span>
                  )}
                </span>

                <span className={styles.text}>
                  <span className={styles.title}>{item.title}</span>
                  {meta && <span className={styles.meta}>{meta}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
