'use client';

import { Reveal } from '@/components/shared/Reveal';
import MediaSection from './MediaSection';
import { MEDIA_PREVIEW_LIMIT } from '@/data/media';
import { podcastHub } from '@/data/podcastHub';
import { useContent } from '@/lib/ContentProvider';
import { format, useLocale } from '@/lib/i18n/LocaleProvider';
import { localizeCard } from '../lib/localizeCard';
import styles from './MediaModule.module.css';
import TypographyComponent from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

export function MediaModule() {
  const { locale, dict } = useLocale();
  const { media } = dict;
  const isRtl = locale === 'fa';
  const { podcasts: podcastCards, articles: articleCards } = useContent();

  const podcasts = podcastCards.slice(-MEDIA_PREVIEW_LIMIT).map((card) => localizeCard(card, dict));
  const articles = articleCards.slice(-MEDIA_PREVIEW_LIMIT).map((card) => localizeCard(card, dict));
  const hasMoreArticles = articleCards.length > MEDIA_PREVIEW_LIMIT;

  return (
    <section className={styles.section}>
      <GridBackground />
      <GlowEffect />

      {podcasts.length > 0 && (
        <AnimatedBlock delay={0.1}>
          <MediaSection
            type="podcast"
            layoutDirection="cardsLeft"
            content={
              <ContentBlock
                title={media.podcasts.title}
                description={media.podcasts.description}
                href={podcastHub.url}
                linkText={format(media.podcasts.viewMore, { platform: podcastHub.name })}
                iconRight={<FiArrowUpRight />}
              />
            }
            cards={podcasts}
          />
        </AnimatedBlock>
      )}

      {articles.length > 0 && (
        <AnimatedBlock delay={0.3}>
          <MediaSection
            type="article"
            layoutDirection="cardsRight"
            content={
              <ContentBlock
                title={media.articles.title}
                description={media.articles.description}
                href={hasMoreArticles ? '/articles' : undefined}
                linkText={media.articles.viewMore}
                iconRight={isRtl ? <FiArrowLeft /> : <FiArrowRight />}
              />
            }
            cards={articles}
          />
        </AnimatedBlock>
      )}
    </section>
  );
}

/* ----------------- Helper Components ----------------- */

const AnimatedBlock = ({ children, delay }: { children: React.ReactNode; delay: number }) => (
  <Reveal distance={20} duration={0.6} delay={delay} className={styles.animatedBlock}>
    {children}
  </Reveal>
);

interface ContentBlockProps {
  title: string;
  description: string;
  href?: string;
  linkText: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const ContentBlock = ({
  title,
  description,
  href,
  linkText,
  iconLeft,
  iconRight,
}: ContentBlockProps) => (
  <div className={styles.contentBlock}>
    <TypographyComponent variant="h2" color="text-primary" className={styles.title}>
      {title}
    </TypographyComponent>

    <TypographyComponent variant="body1" color="text-secondary" className={styles.description}>
      {description}
    </TypographyComponent>

    {href && (
      <Button
        text={linkText}
        variant="ghost"
        href={href}
        iconLeft={iconLeft}
        iconRight={iconRight}
        className={styles.viewMore}
      />
    )}
  </div>
);

const GridBackground = () => <div className={styles.gridBackground} />;
const GlowEffect = () => <div className={styles.glowEffect} />;
