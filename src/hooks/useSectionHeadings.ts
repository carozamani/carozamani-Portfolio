'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';
import type { SectionRulerNavItem } from '@/components/shared/SectionRulerNav';

const HEADING_SELECTOR = 'h2, h3';

const sectionId = (text: string, index: number) => {
  const slug = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug ? `section-${slug}` : `section-${index}`;
};

/**
 * Ensures every h2/h3 inside `rootRef` has an id and returns them for SectionRulerNav.
 * Re-runs when `revision` changes (e.g. after rich-text HTML is injected).
 */
export function useSectionHeadings(
  rootRef: RefObject<HTMLElement | null>,
  revision: string,
): SectionRulerNavItem[] {
  const [items, setItems] = useState<SectionRulerNavItem[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>(HEADING_SELECTOR));
    const used = new Set<string>();
    const next = headings.map((heading, index) => {
      const label = (heading.textContent ?? '').replace(/\s+/g, ' ').trim();
      let id = heading.id || sectionId(label, index);
      if (used.has(id)) id = `${id}-${index}`;
      used.add(id);
      heading.id = id;
      return { id, label: label || `Section ${index + 1}` };
    });

    // DOM scan → ruler items; layout effect is the right place after paint of prose.

    setItems(next);
  }, [rootRef, revision]);

  return items;
}
