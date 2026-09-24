'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import type { CaseStudy } from '@/types/caseStudy';
import styles from './CaseStudyDetail.module.css';

export default function CaseStudyDetail({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageBackground} aria-hidden="true" />

      <div className={styles.content}>
        {caseStudy.image ? (
          <div className={styles.caseStudyImageWrapper}>
            <Image
              src={caseStudy.image}
              alt={caseStudy.title}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className={styles.caseStudyImage}
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>
              No image added yet for &ldquo;{caseStudy.title}&rdquo;
            </p>
            <p className={styles.placeholderHint}>
              Add the file to public/case-studies and set its path in caseStudies.ts for this
              project.
            </p>
          </div>
        )}

        <div className={styles.viewOthers}>
          <Button href="/#projects" text="View Other Projects" />
        </div>
      </div>
    </div>
  );
}
