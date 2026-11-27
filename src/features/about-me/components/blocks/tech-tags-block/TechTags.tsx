'use client';

import Image from 'next/image';
import {
  Component,
  Lightbulb,
  MousePointerClick,
  PanelsTopLeft,
  UserSearch,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { techLogos } from '@/data/techLogos';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './TechTags.module.css';
import TypographyComponent from '@/components/ui/Typography';
import { useDictionary } from '@/lib/i18n/LocaleProvider';

interface AutoScrollColumnProps {
  tags: string[];
  reverse?: boolean;
  offsetClass?: string;
}

const LOOP_SECONDS = 90;
const FRICTION = 0.94;
// Intrinsic size handed to next/image; the logos are SVG and are drawn at the height set in the CSS
const LOGO_PX = 64;

// A tag is looked up by its text, which differs by language. The Persian word for Figma is the same
// product, so it takes Figma's logo.
const LOGO_ALIASES: Record<string, string> = {
  فیگما: 'Figma',
};

// The design skills have no product logo, so each gets an icon that shows the idea instead, in both
// languages. Keyed by the tag's text, like techLogos.
const TAG_ICONS: Record<string, LucideIcon> = {
  // Product thinking: an idea
  'Product Thinking': Lightbulb,
  'تفکر محصول': Lightbulb,
  // User research: looking into a person
  'User Research': UserSearch,
  'پژوهش کاربر': UserSearch,
  // UX flows: steps joined into a path
  'UX Flows': Workflow,
  'مسیرهای UX': Workflow,
  // UI design: a screen laid out in panels
  'UI Design': PanelsTopLeft,
  'طراحی UI': PanelsTopLeft,
  // Prototyping: an interface you click through
  Prototyping: MousePointerClick,
  نمونه‌سازی: MousePointerClick,
  // Design systems: reusable components
  'Design Systems': Component,
  'سیستم طراحی': Component,
};

function AutoScrollColumn({ tags, reverse = false, offsetClass = '' }: AutoScrollColumnProps) {
  const infiniteTags = useMemo(() => [...tags, ...tags, ...tags], [tags]);
  const reduceMotion = usePrefersReducedMotion();
  const targetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // offset lives in refs: it changes every frame and must not re-render React
  const offset = useRef(0);
  const velocity = useRef(0);
  const drag = useRef({ active: false, lastY: 0, hovered: false });

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;

      const loop = target.scrollHeight / 3;
      if (loop > 0) {
        const autoSpeed = reduceMotion || drag.current.hovered ? 0 : loop / LOOP_SECONDS;
        if (!drag.current.active) {
          offset.current += (reverse ? -autoSpeed : autoSpeed) * dt + velocity.current;
          velocity.current *= FRICTION;
          if (Math.abs(velocity.current) < 0.01) velocity.current = 0;
        }
        offset.current = ((offset.current % loop) + loop) % loop;
        target.style.transform = `translateY(${-offset.current}px)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reverse, reduceMotion]);

  const isMouse = (event: PointerEvent<HTMLDivElement>) => event.pointerType !== 'touch';

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMouse(event)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current.active = true;
    drag.current.lastY = event.clientY;
    velocity.current = 0;
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const delta = event.clientY - drag.current.lastY;
    drag.current.lastY = event.clientY;
    offset.current -= delta;
    velocity.current = -delta;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setIsDragging(false);
  };

  return (
    <div
      className={`${styles.scrollColumn} ${isDragging ? styles.dragging : ''} ${offsetClass}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => (drag.current.hovered = true)}
      onPointerLeave={() => (drag.current.hovered = false)}
    >
      <div ref={targetRef} className={styles.scrollTarget}>
        {infiniteTags.map((tag, index) => {
          const logo = techLogos[LOGO_ALIASES[tag] ?? tag];
          const Icon = logo ? undefined : TAG_ICONS[tag];
          return (
            <div key={`${tag}-${index}`} className={styles.tagItem}>
              {logo || Icon ? (
                // Every tag shows its name first and a picture after it, in one row: the product's logo
                // where there is one, otherwise an icon for the idea. The name carries the meaning, so
                // the picture is decorative.
                <span className={styles.tagContent}>
                  <span className={styles.tagLabel}>{tag}</span>
                  {logo ? (
                    <Image
                      src={logo.src}
                      alt=""
                      width={LOGO_PX}
                      height={LOGO_PX}
                      className={styles.tagLogo}
                      draggable={false}
                    />
                  ) : (
                    Icon && (
                      <Icon className={styles.tagIcon} strokeWidth={1.75} aria-hidden="true" />
                    )
                  )}
                </span>
              ) : (
                tag
              )}
              <div className={styles.glowBackground}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const LONG_WORD_LENGTH = 10;

export default function BlockTechTags() {
  const { about } = useDictionary();
  const allTags = useMemo(() => [...about.tagsLeft, ...about.tagsRight], [about]);

  return (
    <div className={`cardFrame cardFrameFaint ${styles.blockContainer}`}>
      <div className={styles.gridContainer}>
        {/* بخش چپ */}
        <div className={styles.leftSection}>
          <TypographyComponent variant="body2" color="text-secondary" className="mb-2">
            {about.techSubtitle}
          </TypographyComponent>
          {/* خط‌چین با فلش دو سر، بین ساب‌تایتل و تایتل */}
          <div className={styles.measure} aria-hidden="true">
            <span className={styles.measureLine} />
          </div>
          <TypographyComponent variant="h2" color="text-primary" className="mb-4">
            {about.techTitle.split(' ').map((word, index) => (
              <span key={index}>
                {index > 0 && ' '}
                {word.length >= LONG_WORD_LENGTH ? (
                  <span className={styles.longWord}>{word}</span>
                ) : (
                  word
                )}
              </span>
            ))}
          </TypographyComponent>
        </div>

        {/* ستون راست */}
        <div className={styles.rightSection}>
          <AutoScrollColumn tags={about.tagsLeft} offsetClass={styles.wideOnly} />
          <AutoScrollColumn
            tags={about.tagsRight}
            reverse
            offsetClass={`${styles.offsetTop} ${styles.wideOnly}`}
          />
          <AutoScrollColumn tags={allTags} offsetClass={styles.narrowOnly} />
        </div>
      </div>
    </div>
  );
}
