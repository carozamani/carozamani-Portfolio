'use client';

import CtaComponent from '../../components/ui/Cta/CTA.component';
import type { CaseStudy } from '../../data/caseStudies';
import styles from './CaseStudyDetail.module.css';

export default function CaseStudyDetail({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <div className={styles.page}>
      <div className={styles.pageBackground} aria-hidden="true" />

      <div className={styles.content}>
        {caseStudy.image ? (
          <img
            src={caseStudy.image}
            alt={caseStudy.title}
            className={styles.caseStudyImage}
          />
        ) : (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>
              No image added yet for &ldquo;{caseStudy.title}&rdquo;
            </p>
            <p className={styles.placeholderHint}>
              Add the file to public/case-studies and set its path in
              caseStudies.ts for this project.
            </p>
          </div>
        )}

        <div className={styles.viewOthers}>
          <CtaComponent
            as="a"
            href="/#projects"
            text="View Other Projects"
            Icon={null}
          />
        </div>
      </div>
    </div>
  );
}
