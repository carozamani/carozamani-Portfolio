export interface CardProps {
  id: string;
  type: 'podcast' | 'article';
  title: string;
  summary: string;
  image?: string;
  audioSrc?: string;
  href?: string;
  /** Article body paragraphs (articles only). */
  body?: string[];
  date: string;
  listeners?: number;
  duration?: string;
  readTime?: string;
}
