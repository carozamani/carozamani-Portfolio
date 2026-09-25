'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CaseStudy } from '@/types/caseStudy';
import styles from './CaseStudyDetail.module.css';

export default function CaseStudyDetail({ caseStudy }: { caseStudy: CaseStudy }) {
  const { projects } = useDictionary();

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
