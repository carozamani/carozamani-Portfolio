'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import type { CardProps } from '@/types/card';
import { SectionRulerNav } from '@/components/shared/SectionRulerNav';
import { useSectionHeadings } from '@/hooks/useSectionHeadings';
import { renderRichText } from '@/lib/rich-text/render';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { ProseSections } from './ProseSections';
import styles from './ArticleDetail.module.css';
import '@/styles/rich-content.css';

export default function ArticleDetail({ article }: { article: CardProps }) {
  const { locale, dict } = useLocale();
  const meta = [article.date, article.readTime].filter(Boolean).join(' · ');
  const proseRef = useRef<HTMLDivElement>(null);
  const richHtml = article.content ? renderRichText(article.content) : '';
  const revision = article.content ? richHtml : (article.body ?? []).join('\n');
  const sections = useSectionHeadings(proseRef, revision);

  return (
    <article className={styles.page}>
      <SectionRulerNav items={sections} ariaLabel={dict.media.sections} />

      <div className={styles.content}>
        <Link href="/articles" className={styles.back}>
          {locale === 'fa' ? (
            <FiArrowRight aria-hidden="true" />
          ) : (
            <FiArrowLeft aria-hidden="true" />
          )}
          {dict.media.articles.title}
        </Link>

        <div className={styles.textPanel}>
          {meta && <p className={styles.meta}>{meta}</p>}
          <h1 className={styles.title}>{article.title}</h1>
          {article.summary && <p className={styles.summary}>{article.summary}</p>}

          {article.content ? (
            <div
              ref={proseRef}
              className={`rich-content ${styles.richBody}`}
              dangerouslySetInnerHTML={{ __html: richHtml }}
            />
          ) : article.body?.length ? (
            <div ref={proseRef}>
              <ProseSections paragraphs={article.body} className={styles.body} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
