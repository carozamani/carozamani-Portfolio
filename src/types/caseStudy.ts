export type CaseStudyMetric = {
  value: string;
  label: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  image: string;
  description?: string;
  tag?: string;
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
