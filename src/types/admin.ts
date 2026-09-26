import type { CardProps } from '@/types/card';
import type { CaseStudy } from '@/types/caseStudy';

export type PublishStatus = 'draft' | 'published';

export type AdminCaseStudy = CaseStudy & { status: PublishStatus };

export type AdminCard = CardProps & { status: PublishStatus };
