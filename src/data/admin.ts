export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
};

export const adminNav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/case-studies', label: 'Case Studies' },
  { href: '/admin/settings', label: 'Settings' },
] as const;

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
  { label: 'Total messages', value: '24' },
  { label: 'Unread', value: '2' },
  { label: 'Case studies', value: '3' },
  { label: 'Visits (30d)', value: '1,284' },
];

// Placeholder until the real admin email is configured on the backend.
export const adminEmailMasked = 'c***@gmail.com';
