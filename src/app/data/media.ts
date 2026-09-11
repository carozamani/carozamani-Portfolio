import type { CardProps } from '../components/ui/Media/card/Card';

export const podcastCards: CardProps[] = [
  {
    id: 'pod1',
    type: 'podcast',
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
    id: 'art1',
    type: 'article',
    title: 'UI Trends 2024',
    summary: 'An article about upcoming UI trends...',
    image: '/images/article1.jpg',
    date: 'Nov 2023',
    readTime: '8 min',
  },
  {
    id: 'art2',
    type: 'article',
    title: 'Design Systems Explained',
    summary: 'Learn how to build a scalable design system...',
    image: '/images/article2.jpg',
    date: 'Jan 2024',
    readTime: '12 min',
  },
];
