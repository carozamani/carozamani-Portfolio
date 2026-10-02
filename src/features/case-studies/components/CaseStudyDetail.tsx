'use client';

import clsx from 'clsx';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CaseStudy } from '@/types/caseStudy';
import styles from './CaseStudyDetail.module.css';

type CaseStudyDetailProps = {
  caseStudy: CaseStudy;
  prevStudy?: CaseStudy;
  nextStudy?: CaseStudy;
};

export default function CaseStudyDetail({ caseStudy, prevStudy, nextStudy }: CaseStudyDetailProps) {
  const { projects } = useDictionary();
  const { detail } = projects;

  const content = projects.items[caseStudy.slug];
  const title = content?.title ?? caseStudy.title;
  const image = content?.image ?? caseStudy.image;
  const caseImages = content?.caseImages ?? caseStudy.caseImages ?? [];

  const images = [image, ...caseImages].filter(
    (src, index, all) => Boolean(src) && all.indexOf(src) === index,
  );

  const prevTitle = prevStudy && (projects.items[prevStudy.slug]?.title ?? prevStudy.title);
  const nextTitle = nextStudy && (projects.items[nextStudy.slug]?.title ?? nextStudy.title);

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>{title}</h1>

      <div className={styles.content}>
        {images.length > 0 ? (
          <AnimatedSection id="case-gallery" viewAmount={0}>
            {/* Not lazy: before loading these images have no height, and a 0px lazy image can stay unloaded. */}
            <div className={styles.stack}>
              {images.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={index === 0 ? title : ''}
                  decoding="async"
                  className={styles.stackImage}
                />
              ))}
            </div>
          </AnimatedSection>
        ) : (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>{format(projects.noImageTitle, { title })}</p>
          </div>
        )}

        <nav className={styles.pager} aria-label={detail.allProjects}>
          {prevStudy ? (
            <div className={styles.pagerItem}>
              <span className={styles.pagerLabel}>{detail.prevProject}</span>
              <Button
                text={prevTitle ?? ''}
                href={`/case-studies/${prevStudy.slug}`}
                iconLeft={<FiArrowLeft aria-hidden="true" />}
                fullWidth
              />
            </div>
          ) : (
            <span />
          )}
          {nextStudy ? (
            <div className={clsx(styles.pagerItem, styles.pagerItemEnd)}>
              <span className={styles.pagerLabel}>{detail.nextProject}</span>
              <Button
                text={nextTitle ?? ''}
                href={`/case-studies/${nextStudy.slug}`}
                iconRight={<FiArrowRight aria-hidden="true" />}
                fullWidth
              />
            </div>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
