import type { CardProps } from '@/types/card';

export const podcastCards: CardProps[] = [
  {
    id: 'pod1',
    type: 'podcast',
    href: '/podcasts/pod1',
    title: 'RTL Design Challenges',
    summary: 'Episode about RTL design challenges...',
    image: '/images/podcast1.jpg',
    audioSrc: '/audio/ep1.mp3',
    date: 'Dec 2023',
    listeners: 3.2,
    duration: '28 min',
  },
  {
    id: 'pod2',
    type: 'podcast',
    href: '/podcasts/pod2',
    title: 'Why UX Matters',
    summary: 'Episode about UX importance...',
    image: '/images/podcast2.jpg',
    audioSrc: '/audio/ep2.mp3',
    date: 'Feb 2024',
    listeners: 5.8,
    duration: '41 min',
  },
];

export const articleCards: CardProps[] = [
  {
    id: 'ui-trends-2024',
    type: 'article',
    href: '/articles/ui-trends-2024',
    body: [
      '## Calmer interfaces',
      'Interfaces are getting calmer: fewer borders, softer depth and more deliberate motion.',
      '## What to watch',
      'This is placeholder content. Real articles will be added from the admin panel.',
      '## Takeaways',
      'Keep hierarchy clear, reduce competing accents, and let motion explain state changes instead of decorating every tile.',
    ],
    title: 'UI Trends 2024',
    summary: 'An article about upcoming UI trends...',
    image: '/images/article1.jpg',
    date: 'Nov 2023',
    readTime: '8 min',
  },
  {
    id: 'design-systems-explained',
    type: 'article',
    href: '/articles/design-systems-explained',
    body: [
      '## Shared language',
      'A design system is a shared language between design and engineering.',
      '## Tokens and components',
      'This is placeholder content. Real articles will be added from the admin panel.',
      '## Scaling',
      'Start with tokens, document decisions, and only promote patterns that survive more than one product surface.',
    ],
    title: 'Design Systems Explained',
    summary: 'Learn how to build a scalable design system...',
    image: '/images/article2.jpg',
    date: 'Jan 2024',
    readTime: '12 min',
  },
];

export const getArticleBySlug = (slug: string) =>
  articleCards.find((article) => article.id === slug);

/** The landing page shows the latest (last) N cards per section; "View more" only appears beyond this. */
export const MEDIA_PREVIEW_LIMIT = 2;
