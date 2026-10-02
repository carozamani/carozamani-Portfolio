'use client';

import type { ReactNode } from 'react';
import { useHasSection, type ContentSection } from '@/lib/ContentProvider';

export function ContentGate({
  section,
  children,
}: {
  section: ContentSection;
  children: ReactNode;
}) {
  return useHasSection(section) ? <>{children}</> : null;
}
