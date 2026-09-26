import type { JSONContent } from '@tiptap/react';

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
  /** Rich-text article body written in the admin editor; takes precedence over `body`. */
  content?: JSONContent;
  date: string;
  listeners?: number;
  duration?: string;
  readTime?: string;
}
