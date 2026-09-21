export interface CardProps {
  id: string;
  type: 'podcast' | 'article';
  title: string;
  summary: string;
  image?: string;
  audioSrc?: string;
  href?: string;
  date: string;
  listeners?: number;
  duration?: string;
  readTime?: string;
}
