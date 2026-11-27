'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import type { CardProps } from '@/types/card';
import { SectionRulerNav } from '@/components/shared/SectionRulerNav';
import { useSectionHeadings } from '@/hooks/useSectionHeadings';
import { renderRichText } from '@/lib/rich-text/render';
import { format, useLocale } from '@/lib/i18n/LocaleProvider';
import { PodcastSuggestions } from './PodcastSuggestions';
import { PodcastTransport } from './PodcastTransport';
import { ProseSections } from './ProseSections';
import styles from './PodcastDetail.module.css';
import '@/styles/rich-content.css';

type Props = {
  episode: CardProps;
  /** Other episodes to listen to next; the box is left out when there are none. */
  suggestions?: CardProps[];
};

export function PodcastDetail({ episode, suggestions = [] }: Props) {
  const { locale, dict } = useLocale();
  const meta = [
    episode.date,
    episode.duration,
    episode.listeners && episode.listeners > 0
      ? format(dict.media.listeners, {
          n: episode.listeners.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en'),
        })
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const proseRef = useRef<HTMLDivElement>(null);
  const richHtml = episode.content ? renderRichText(episode.content) : '';
  const revision = episode.content ? richHtml : (episode.body ?? []).join('\n');
  const sections = useSectionHeadings(proseRef, revision);

  return (
    <div className={styles.page}>
      <SectionRulerNav items={sections} ariaLabel={dict.media.sections} />

      <div className={styles.layout}>
        <header className={styles.intro}>
          <Link href="/podcasts" className={styles.back}>
            {locale === 'fa' ? (
              <FiArrowRight aria-hidden="true" />
            ) : (
              <FiArrowLeft aria-hidden="true" />
            )}
            {dict.media.podcasts.title}
          </Link>

          {meta && <p className={styles.meta}>{meta}</p>}
        </header>

        <div className={`${styles.textPanel} ${styles.textHeading}`}>
          <h1 className={styles.title}>{episode.title}</h1>

          {episode.summary && (
            <section className={styles.about} aria-label={dict.media.podcasts.about}>
              <h2 className={styles.aboutLabel}>{dict.media.podcasts.about}</h2>
              <blockquote className={styles.aboutText}>{episode.summary}</blockquote>
            </section>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.cover}>
            {episode.image ? (
              <Image
                src={episode.image}
                alt={episode.title}
                fill
                sizes="(max-width: 900px) 100vw, 22rem"
                className={styles.coverImage}
                priority
              />
            ) : (
              <span className={styles.coverGlyph}>{episode.title.charAt(0)}</span>
            )}
          </div>

          <PodcastTransport
            episodeId={episode.id}
            disabled={!episode.audioSrc}
            className={styles.sidebarTransport}
          />

          <PodcastSuggestions episodes={suggestions} className={styles.suggestionsDesktop} />
        </aside>

        <article
          className={`${styles.content} ${episode.content || episode.body?.length ? styles.textPanel : ''}`}
        >
          {episode.content ? (
            <div
              ref={proseRef}
              className={`rich-content ${styles.richBody}`}
              dangerouslySetInnerHTML={{ __html: richHtml }}
            />
          ) : episode.body?.length ? (
            <div ref={proseRef}>
              <ProseSections paragraphs={episode.body} className={styles.body} />
            </div>
          ) : null}
        </article>

        {/* Narrow screens: the sidebar sits above the text, so the suggestions go after it instead */}
        <PodcastSuggestions episodes={suggestions} className={styles.suggestionsMobile} />
      </div>
    </div>
  );
}
