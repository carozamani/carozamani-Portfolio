'use client';

import Button from '@/components/ui/Button';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CaseStudy } from '@/types/caseStudy';
import styles from './CaseStudyDetail.module.css';

export default function CaseStudyDetail({ caseStudy }: { caseStudy: CaseStudy }) {
  const { projects } = useDictionary();
  const images = caseStudy.caseImages?.length
    ? caseStudy.caseImages
    : caseStudy.image
      ? [caseStudy.image]
      : [];

  return (
    <div className={styles.page}>
      <div className={styles.pageBackground} aria-hidden="true" />

      <div className={styles.content}>
        {images.length > 0 ? (
          <div className={styles.imageStack}>
            {images.map((src, index) => (
              // Plain img: the stack keeps each image's own proportions, whatever the source.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={src}
                alt={index === 0 ? caseStudy.title : ''}
                loading={index === 0 ? 'eager' : 'lazy'}
                className={styles.stackImage}
              />
            ))}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>
              {format(projects.noImageTitle, { title: caseStudy.title })}
            </p>
            <p className={styles.placeholderHint}>{projects.noImageHint}</p>
          </div>
        )}

        <div className={styles.viewOthers}>
          <Button href="/#projects" text={projects.viewOthers} />
        </div>
      </div>
    </div>
  );
}
