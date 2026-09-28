'use client';

import clsx from 'clsx';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { format, useDictionary } from '@/lib/i18n/LocaleProvider';
import type { CaseStudy } from '@/types/caseStudy';
import { CaseStudyHero } from './CaseStudyHero';
import { SectionIndex, type SectionIndexItem } from './SectionIndex';
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
  const description = content?.description ?? caseStudy.description;
  const companyName = content?.companyName ?? caseStudy.companyName;
  const role = content?.role ?? caseStudy.role;
  const duration = content?.duration ?? caseStudy.duration;
  const overview = content?.overview ?? caseStudy.overview;
  const problem = content?.problem ?? caseStudy.problem;
  const process = content?.process ?? caseStudy.process;
  const architectureNotes = content?.architectureNotes ?? caseStudy.architectureNotes;
  const tags =
    content?.tags ??
    (content?.tag ? [content.tag] : undefined) ??
    (caseStudy.tags?.length ? caseStudy.tags : caseStudy.tag ? [caseStudy.tag] : []);

  const cover = caseStudy.image || caseStudy.caseImages?.[0] || '';
  const gallery = (
    caseStudy.caseImages?.length ? caseStudy.caseImages : caseStudy.image ? [caseStudy.image] : []
  ).filter((src) => src !== cover);

  const scope = caseStudy.scope ?? 'ui-ux';
  const scopeLabel = detail.scopeLabels[scope];

  const meta = [
    companyName && { label: detail.client, value: companyName },
    role && { label: detail.role, value: role },
    duration && { label: detail.duration, value: duration },
    caseStudy.year && { label: detail.date, value: caseStudy.year },
  ].filter(Boolean) as { label: string; value: string }[];

  const sections: SectionIndexItem[] = [
    overview && { id: 'case-overview', label: detail.overview },
    problem && { id: 'case-problem', label: detail.problem },
    process?.length && { id: 'case-process', label: detail.processTitle },
    scope !== 'ui-ux' &&
      caseStudy.techStack?.length && { id: 'case-tech', label: detail.techStack },
    scope === 'full-stack' &&
      architectureNotes && { id: 'case-architecture', label: detail.architecture },
    caseStudy.tools?.length && { id: 'case-tools', label: detail.tools },
  ].filter(Boolean) as SectionIndexItem[];

  const numberOf = (id: string) =>
    String(sections.findIndex((section) => section.id === id) + 1).padStart(2, '0');

  const prevTitle = prevStudy && (projects.items[prevStudy.slug]?.title ?? prevStudy.title);
  const nextTitle = nextStudy && (projects.items[nextStudy.slug]?.title ?? nextStudy.title);

  return (
    <div className={styles.page}>
      <SectionIndex items={sections} />

      <CaseStudyHero
        cover={cover}
        title={title}
        description={description}
        tags={tags}
        scopeLabel={scopeLabel}
      />

      <div className={styles.content}>
        {meta.length > 0 && (
          <AnimatedSection id="case-meta">
            <dl className={styles.metaGrid}>
              {meta.map((item) => (
                <div key={item.label} className={styles.metaItem}>
                  <dt className={styles.metaLabel}>{item.label}</dt>
                  <dd className={styles.metaValue}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </AnimatedSection>
        )}

        <div className={styles.body}>
          {overview && (
            <AnimatedSection id="case-overview">
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{numberOf('case-overview')}</span>
                  {detail.overview}
                </Typography>
                <Typography variant="body1" color="text-secondary" className={styles.sectionText}>
                  {overview}
                </Typography>
              </div>
            </AnimatedSection>
          )}

          {problem && (
            <AnimatedSection id="case-problem">
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{numberOf('case-problem')}</span>
                  {detail.problem}
                </Typography>
                <blockquote className={styles.pullQuote}>{problem}</blockquote>
              </div>
            </AnimatedSection>
          )}

          {process && process.length > 0 && (
            <AnimatedSection id="case-process">
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{numberOf('case-process')}</span>
                  {detail.processTitle}
                </Typography>
                <ol className={styles.processList}>
                  {process.map((step, index) => (
                    <li key={index} className={styles.processStep}>
                      <span className={styles.processIndex}>{index + 1}</span>
                      <Typography variant="body1" color="text-secondary">
                        {step}
                      </Typography>
                    </li>
                  ))}
                </ol>
              </div>
            </AnimatedSection>
          )}

          {scope !== 'ui-ux' && caseStudy.techStack && caseStudy.techStack.length > 0 && (
            <AnimatedSection id="case-tech">
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{numberOf('case-tech')}</span>
                  {detail.techStack}
                </Typography>
                <ul className={styles.chipList}>
                  {caseStudy.techStack.map((item) => (
                    <li key={item} className={styles.chip}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          )}

          {scope === 'full-stack' && architectureNotes && (
            <AnimatedSection id="case-architecture">
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{numberOf('case-architecture')}</span>
                  {detail.architecture}
                </Typography>
                <Typography variant="body1" color="text-secondary" className={styles.sectionText}>
                  {architectureNotes}
                </Typography>
              </div>
            </AnimatedSection>
          )}

          {caseStudy.tools && caseStudy.tools.length > 0 && (
            <AnimatedSection id="case-tools">
              <div className={styles.section}>
                <Typography variant="h3" className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{numberOf('case-tools')}</span>
                  {detail.tools}
                </Typography>
                <ul className={styles.chipList}>
                  {caseStudy.tools.map((item) => (
                    <li key={item} className={styles.chip}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          )}
        </div>

        {gallery.length > 0 ? (
          <AnimatedSection id="case-gallery">
            <div className={styles.gallery}>
              {gallery.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={index} src={src} alt="" loading="lazy" className={styles.galleryImage} />
              ))}
            </div>
          </AnimatedSection>
        ) : !cover ? (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>{format(projects.noImageTitle, { title })}</p>
            <p className={styles.placeholderHint}>{projects.noImageHint}</p>
          </div>
        ) : null}

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
