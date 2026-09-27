export type CaseStudyMetric = {
  value: string;
  label: string;
};

/** How much of the project this case study covers — shapes which sections apply. */
export type ProjectScope = 'ui-ux' | 'ui-ux-frontend' | 'full-stack';

export type CaseStudy = {
  slug: string;
  title: string;
  /** Cover shown on the landing page carousel. */
  image: string;
  /** Full case study images, stacked on the case study page in this order. */
  caseImages?: string[];
  description?: string;
  tag?: string;
  /** Editable list behind `tag`, which stays as the joined display string. */
  tags?: string[];
  year?: string;
  companyName?: string;
  companyLogo?: string;
  role?: string;
  duration?: string;
  tools?: string[];
  overview?: string;
  problem?: string;
  process?: string[];
  results?: CaseStudyMetric[];
  /** Defaults to 'ui-ux' for case studies created before this field existed. */
  scope?: ProjectScope;
  /** Shown when scope includes frontend work, e.g. Next.js, Framer Motion. */
  techStack?: string[];
  /** Shown only for full-stack scope — architecture, API/data decisions, backend challenges. */
  architectureNotes?: string;
};
