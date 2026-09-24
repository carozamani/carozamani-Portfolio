import type { SocialItem } from '@/components/ui/SocialIcons';

export const contactSocialLinks: SocialItem[] = [
  {
    type: 'linkedin',
    href: 'https://linkedin.com/in/carozamani',
    color: 'var(--color-social-linkedin)',
  },
  { type: 'castbox', href: 'https://castbox.fm/carozamani', color: '#ff6b00' },
  { type: 'github', href: 'https://github.com/carozamani', color: '#ffffff' },
];

export const contactDetails = {
  email: 'carozamani@gmail.com',
  location: 'Remote — Available Worldwide',
  responseTime: 'Usually replies within 24 hours',
  messageMaxLength: 500,
};
