import type { CardProps } from '@/types/card';
import type { CaseStudy } from '@/types/caseStudy';

export type PublishStatus = 'draft' | 'published';

/** `password` is write-only: sent when set or changed, never returned by the API. */
export type AdminCaseStudy = CaseStudy & { status: PublishStatus; password?: string };

export type AdminCard = CardProps & { status: PublishStatus };
