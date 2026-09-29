'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { PROJECTS_PREVIEW_LIMIT } from '@/data/caseStudies';
import type { CaseStudy } from '@/types/caseStudy';
import { getCaseStudies } from '@/lib/api';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import styles from './QuantumCarousel.module.css';

export default function QuantumCarousel({ preview = false }: { preview?: boolean }) {
  const { locale, dict } = useLocale();
  const { projects } = dict;
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    getCaseStudies()
      .then((data) => {
        setCaseStudies(data);
        const visible = preview ? data.slice(-PROJECTS_PREVIEW_LIMIT) : data;
        setActiveSlug(visible[0]?.slug ?? null);
      })
      .catch(() => setCaseStudies([]));
  }, [preview]);

  const visibleStudies = preview ? caseStudies.slice(-PROJECTS_PREVIEW_LIMIT) : caseStudies;
  const hasMore = preview && caseStudies.length > PROJECTS_PREVIEW_LIMIT;

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>{projects.title}</h2>
        <p className={styles.sectionDescription}>{projects.description}</p>
        {hasMore && (
          <Button
            text={projects.viewAll}
            variant="ghost"
            href="/case-studies"
            iconRight={locale === 'fa' ? <FiArrowLeft /> : <FiArrowRight />}
            className={styles.viewAll}
          />
        )}
      </div>

      {caseStudies.length > 0 ? (
        <div className={styles.listWrapper}>
          <div className={styles.centerGlow} aria-hidden="true" />

          <ul className={styles.list}>
            {visibleStudies.map((caseStudy) => {
              const isActive = activeSlug === caseStudy.slug;
              const content = projects.items[caseStudy.slug];
              const title = content?.title ?? caseStudy.title;
              const description = content?.description ?? caseStudy.description;
              const subtitle = [
                content?.tags?.[0] ?? content?.tag ?? caseStudy.tags?.[0] ?? caseStudy.tag,
                caseStudy.year,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <li key={caseStudy.slug} className={styles.listItem}>
                  <Link
                    href={`/case-studies/${caseStudy.slug}`}
                    className={styles.row}
                    data-active={isActive}
                    onMouseEnter={() => setActiveSlug(caseStudy.slug)}
                  >
                    <span className={styles.rowLogoColumn}>
                      <span className={styles.rowLogo} title={caseStudy.companyName}>
                        {caseStudy.companyLogo ? (
                          <Image
                            src={caseStudy.companyLogo}
                            alt={caseStudy.companyName ?? ''}
                            width={28}
                            height={28}
                            className={styles.rowLogoImage}
                          />
                        ) : (
                          <span className={styles.rowLogoGlyph}>
                            {(caseStudy.companyName ?? title).charAt(0)}
                          </span>
                        )}
                      </span>
                    </span>

                    <span className={styles.rowTitleWrap}>
                      <span className={styles.rowThumb} aria-hidden="true">
                        {caseStudy.image ? (
                          <Image
                            src={caseStudy.image}
                            alt=""
                            fill
                            sizes="(max-width: 900px) 100vw, 0px"
                            className={styles.rowPreviewImage}
                          />
                        ) : (
                          <span className={styles.rowPreviewPlaceholder}>{title.charAt(0)}</span>
                        )}
                      </span>
                      <span className={styles.rowTitle}>{title}</span>
                      {description && <span className={styles.rowSummary}>{description}</span>}
                      {subtitle && <span className={styles.rowSubtitle}>{subtitle}</span>}
                    </span>

                    <span className={styles.rowPreviewCell} aria-hidden="true">
                      <span className={styles.rowPreview}>
                        {caseStudy.image ? (
                          <Image
                            src={caseStudy.image}
                            alt=""
                            fill
                            sizes="384px"
                            className={styles.rowPreviewImage}
                          />
                        ) : (
                          <div className={styles.rowPreviewPlaceholder}>
                            <span>{title.charAt(0)}</span>
                          </div>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className={styles.emptyState}>{projects.empty}</p>
      )}
    </div>
  );
}
