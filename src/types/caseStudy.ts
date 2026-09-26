export type CaseStudyMetric = {
  value: string;
  label: string;
};

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
};
