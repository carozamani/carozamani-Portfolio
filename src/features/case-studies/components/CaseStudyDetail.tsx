'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import { format, useDictionary, useLocale } from '@/lib/i18n/LocaleProvider';
import type { CaseStudy } from '@/types/caseStudy';
import { withAssetAccess } from '../lib/assetUrl';
import { useCaseAccess } from '../hooks/useCaseAccess';
import { usePreloadedSources } from '../hooks/usePreloadedSources';
import { BackToTop } from '@/components/shared/BackToTop';
import { CaseImageNav } from './CaseImageNav';
import { HtmlEmbed, type EmbedPlate } from './HtmlEmbed';
import { PasswordGate } from './PasswordGate';
import styles from './CaseStudyDetail.module.css';

type CaseStudyDetailProps = {
  caseStudy: CaseStudy;
  prevStudy?: CaseStudy;
  nextStudy?: CaseStudy;
};

export default function CaseStudyDetail({ caseStudy, prevStudy, nextStudy }: CaseStudyDetailProps) {
  const { projects, backToTop } = useDictionary();
  const { locale } = useLocale();
  const { detail } = projects;
  const isProtected = Boolean(caseStudy.passwordProtected);
  const { access, unlock } = useCaseAccess(caseStudy.slug, isProtected);
  const unlocked = access.status === 'open' ? access.content : null;
  const token = access.status === 'open' ? access.token : null;

  const content = projects.items[caseStudy.slug];
  const title = content?.title ?? caseStudy.title;
  const image = content?.image ?? caseStudy.image;
  // The API value wins, so an upload from the admin replaces the shipped page.
  // The dictionary is only the fallback for projects that have not been given a file yet.
  const source = isProtected ? unlocked : caseStudy;
  const apiImages = source?.caseImages ?? [];
  const caseImages = (
    isProtected ? apiImages : apiImages.length > 0 ? apiImages : (content?.caseImages ?? [])
  ).map((src) => withAssetAccess(src, token));

  const apiTitles = source?.caseImageTitles ?? [];
  const caseImageTitles = isProtected
    ? apiTitles
    : apiTitles.length > 0
      ? apiTitles
      : (content?.caseImageTitles ?? []);

  const entries = [
    { src: image, label: title },
    ...caseImages.map((src, index) => ({ src, label: caseImageTitles[index]?.trim() ?? '' })),
  ]
    .filter(({ src }, index, all) => Boolean(src) && all.findIndex((e) => e.src === src) === index)
    .map((entry, index) => ({
      ...entry,
      id: `case-image-${index}`,
      label: entry.label || format(detail.section, { n: index + 1 }),
    }));
  const images = usePreloadedSources(entries.map(({ src }) => src));
  const rawHtml =
    (locale === 'fa' && source?.htmlFileFa) || source?.htmlFile || content?.htmlFile || '';
  const htmlFile = withAssetAccess(rawHtml, token);
  const [failedHtml, setFailedHtml] = useState('');
  const showHtml = Boolean(htmlFile) && failedHtml !== htmlFile;

  const [plates, setPlates] = useState<EmbedPlate[]>([]);
  const plateEntries = plates.map((plate, index) => ({
    ...plate,
    id: `case-plate-${index}`,
    label: (index === 0 ? title : plate.label) || format(detail.section, { n: index + 1 }),
  }));

  const prevTitle = prevStudy && (projects.items[prevStudy.slug]?.title ?? prevStudy.title);
  const nextTitle = nextStudy && (projects.items[nextStudy.slug]?.title ?? nextStudy.title);

  if (isProtected && access.status !== 'open') {
    return (
      <div className={styles.page}>
        <h1 className={styles.srOnly}>{title}</h1>
        {access.status === 'locked' && <PasswordGate image={image} onUnlock={unlock} />}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>{title}</h1>

      {/* Outside AnimatedSection: a transformed ancestor would break its fixed positioning. */}
      <CaseImageNav items={showHtml ? plateEntries : entries} ariaLabel={detail.sections} />

      <BackToTop label={backToTop} />

      <div className={styles.content}>
        {showHtml ? (
          <div id="case-gallery" className={styles.htmlDocument}>
            <HtmlEmbed
              src={htmlFile}
              title={title}
              onPlates={setPlates}
              onError={() => setFailedHtml(htmlFile)}
            />
            {/* The iframe's content is invisible to the host page, so each plate gets a marker the nav can track. */}
            {plateEntries.map(({ id, top, height }) => (
              <span
                key={id}
                id={id}
                aria-hidden="true"
                className={styles.plateMarker}
                style={{ top, height }}
              />
            ))}
          </div>
        ) : images.length > 0 ? (
          <AnimatedSection id="case-gallery" viewAmount={0}>
            {/* Not lazy: before loading these images have no height, and a 0px lazy image can stay unloaded. */}
            <div className={styles.stack}>
              {entries.map(({ id }, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={id}
                  id={id}
                  src={images[index] ?? entries[index].src}
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
