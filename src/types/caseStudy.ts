export type CaseStudy = {
  slug: string;
  title: string;
  /** Cover shown on the landing page carousel and at the top of the case study page. */
  image: string;
  /** Case study images, stacked on the case study page in this order. */
  caseImages?: string[];
  /** Titles for `caseImages`, same order; labels the side navigation on the case study page. */
  caseImageTitles?: string[];
  description?: string;
  tag?: string;
  /** Editable list behind `tag`, which stays as the joined display string. */
  tags?: string[];
  year?: string;
  companyName?: string;
  companyLogo?: string;
};
