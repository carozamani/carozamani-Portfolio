export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
  archived?: boolean;
};

export const adminNav = [
  { href: '/admin', key: 'dashboard' },
  { href: '/admin/messages', key: 'messages' },
  { href: '/admin/case-studies', key: 'caseStudies' },
  { href: '/admin/articles', key: 'articles' },
  { href: '/admin/podcasts', key: 'podcasts' },
  { href: '/admin/settings', key: 'settings' },
] as const;

/** 60 days of daily visits, oldest first; the last 30 are the "current" period. */
export const adminVisitsDaily = [
  38, 41, 35, 44, 52, 47, 39, 42, 46, 51, 49, 43, 40, 45, 53, 58, 50, 44, 47, 55, 61, 57, 48, 46,
  52, 59, 63, 54, 49, 51, 56, 62, 58, 47, 44, 53, 60, 67, 72, 65, 55, 50, 58, 66, 71, 64, 57, 52,
  61, 69, 75, 82, 74, 63, 59, 68, 77, 85, 79, 70,
];

export const adminVisitsEnd = '2026-09-25';

export const adminMessages: AdminMessage[] = [
  {
    id: '1',
    name: 'Sara Ahmadi',
    email: 'sara@example.com',
    message:
      'Hi Caro, loved your FinFlow case study. Are you available for a freelance project next month?',
    date: '2026-09-24',
    read: false,
  },
  {
    id: '2',
    name: 'Daniel Moore',
    email: 'daniel@studio.io',
    message: 'We are hiring a Product Designer and would love to chat about your experience.',
    date: '2026-09-22',
    read: false,
  },
  {
    id: '3',
    name: 'Neda Karimi',
    email: 'neda@example.com',
    message: 'Thanks for the great podcast episode! One question about your research process.',
    date: '2026-09-18',
    read: true,
  },
];

export const adminStats = [
  { key: 'messages', value: 24 },
  { key: 'unread', value: 2 },
  { key: 'caseStudies', value: 3 },
  { key: 'visits', value: 1284 },
] as const;

// Placeholder until the real admin email is configured on the backend.
export const adminEmailMasked = 'c***@gmail.com';
