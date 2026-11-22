import type { JSONContent } from '@tiptap/react';

export interface CardProps {
  id: string;
  type: 'podcast' | 'article';
  title: string;
  summary: string;
  image?: string;
  audioSrc?: string;
  href?: string;
  /** Plain body paragraphs (legacy articles/podcasts). */
  body?: string[];
  /** Rich-text body from the admin editor; takes precedence over `body`. */
  content?: JSONContent;
  date: string;
  listeners?: number;
  duration?: string;
  readTime?: string;
}
