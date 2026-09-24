'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { caseStudies } from '@/data/caseStudies';
import styles from './QuantumCarousel.module.css';

const DEFAULT_ACTIVE_SLUG = caseStudies[0]?.slug ?? null;

export default function QuantumCarousel() {
  const [activeSlug, setActiveSlug] = useState<string | null>(DEFAULT_ACTIVE_SLUG);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        <p className={styles.sectionDescription}>
          A selection of case studies from my recent work.
        </p>
      </div>

      {caseStudies.length > 0 ? (
        <div className={styles.listWrapper}>
          <div className={styles.centerGlow} aria-hidden="true" />

          <ul className={styles.list}>
            {caseStudies.map((caseStudy) => {
              const isActive = activeSlug === caseStudy.slug;
              const subtitle = [caseStudy.tag, caseStudy.year].filter(Boolean).join(' · ');

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
                            {(caseStudy.companyName ?? caseStudy.title).charAt(0)}
                          </span>
                        )}
                      </span>
                    </span>

                    <span className={styles.rowTitleWrap}>
                      <span className={styles.rowTitle}>{caseStudy.title}</span>
                      {caseStudy.description && (
                        <span className={styles.rowSummary}>{caseStudy.description}</span>
                      )}
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
                            <span>{caseStudy.title.charAt(0)}</span>
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
        <p className={styles.emptyState}>Case studies are coming soon.</p>
      )}
    </div>
  );
}
