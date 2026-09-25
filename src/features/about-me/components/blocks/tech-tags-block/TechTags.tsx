'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

function AutoScrollColumn({ tags, reverse = false, offsetClass = '' }: AutoScrollColumnProps) {
  const infiniteTags = useMemo(() => [...tags, ...tags, ...tags], [tags]);
  const reduceMotion = useReducedMotion();
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
    <motion.div
      className={`${styles.scrollColumn} ${isDragging ? styles.dragging : ''} ${offsetClass}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => (drag.current.hovered = true)}
      onPointerLeave={() => (drag.current.hovered = false)}
    >
      <div ref={targetRef} className={styles.scrollTarget}>
        {infiniteTags.map((tag, index) => (
          <div key={`${tag}-${index}`} className={styles.tagItem}>
            {tag}
            <div className={styles.glowBackground}></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function BlockTechTags() {
  const { about } = useDictionary();
  const allTags = useMemo(() => [...about.tagsLeft, ...about.tagsRight], [about]);

  return (
    <div className={styles.blockContainer}>
      <div className={styles.gridContainer}>
        {/* بخش چپ */}
        <div className={styles.leftSection}>
          <TypographyComponent variant="body2" color="text-secondary" className="mb-2">
            {about.techSubtitle}
          </TypographyComponent>
          <TypographyComponent variant="h2" color="text-primary" className="mb-4">
            {about.techTitle}
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
