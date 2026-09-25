export const en = {
  meta: {
    title: 'Caro Zamani — UX & Product Designer',
    description:
      'Portfolio of Caro Zamani, a UX/Product Designer crafting seamless, user-centered digital experiences.',
  },
  skipLink: 'Skip to main content',
  language: { code: 'EN', label: 'Select language' },
  nav: {
    aria: 'Main navigation',
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    media: 'Media',
    contact: 'Contact',
  },
  hero: {
    title: 'User Experience Engineer',
    ctaWork: 'See my case studies',
    profileAlt: 'Carozamani profile picture',
    logoAlt: 'Carozamani logo',
  },
  about: {
    title: 'About Me',
    description: `Hi! I’m Caro Zamani, a front-end developer who loves turning complex ideas into sleek, interactive digital experiences.
I specialize in building user-centered interfaces that are both intuitive and visually engaging.
With a keen eye for detail and a passion for clean, modern design, I aim to create products that delight users and drive engagement.
In my free time, I explore new web technologies, experiment with UI animations, and contribute to open-source projects.`,
    highlight: 'Caro Zamani',
    resume: 'Download Resume',
    philosophyTitle: 'Design Philosophy',
    philosophyText:
      'I create clean, user-focused interfaces that solve complex problems with simplicity and thoughtful interactions.',
    techSubtitle: 'Continuously learning and improving',
    techTitle: 'My Tech Stack',
    tagsLeft: ['User Research', 'Wireframing', 'Prototyping', 'Interaction Design'],
    tagsRight: ['Visual Design', 'Figma', 'Usability Testing', 'Design Systems'],
  },
  projects: {
    title: 'Projects',
    description: 'A selection of case studies from my recent work.',
    empty: 'Case studies are coming soon.',
    viewAll: 'View all projects',
    viewOthers: 'View Other Projects',
    noImageTitle: 'No image added yet for “{title}”',
    noImageHint:
      'Add the file to public/case-studies and set its path in caseStudies.ts for this project.',
    notFoundTitle: 'This case study couldn’t be found',
    notFoundText: 'The project you’re looking for doesn’t exist or has moved.',
    backToProjects: 'Back to Projects',
    items: {
      'project-one': {
        description:
          'Redesigning a personal finance app’s onboarding flow to cut drop-off and get first-time users to their "aha moment" faster.',
        tag: 'Product Design',
      },
      'project-two': {
        description:
          'Designing a mobile booking experience for a telehealth service, with accessibility for older adults as the primary constraint.',
        tag: 'Mobile App',
      },
      'project-three': {
        description:
          'Building a componentized design system to replace inconsistent, one-off UI patterns across a multi-team SaaS product.',
        tag: 'Design System',
      },
    } as Record<string, { description: string; tag: string }>,
  },
  media: {
    podcasts: {
      title: 'Podcasts',
      description: 'Episodes about design, UX, product thinking, and challenges.',
      viewMore: 'View all podcasts',
    },
    articles: {
      title: 'Articles',
      description: 'Read insightful articles about UX, UI, and design systems.',
      viewMore: 'View all articles',
    },
    listeners: '{n}K',
    items: {
      pod1: {
        title: 'RTL Design Challenges',
        summary: 'Episode about RTL design challenges...',
        date: 'Dec 2023',
        duration: '28 min',
      },
      pod2: {
        title: 'Why UX Matters',
        summary: 'Episode about UX importance...',
        date: 'Feb 2024',
        duration: '41 min',
      },
      'ui-trends-2024': {
        title: 'UI Trends 2024',
        summary: 'An article about upcoming UI trends...',
        date: 'Nov 2023',
        readTime: '8 min',
        body: [
          'Interfaces are getting calmer: fewer borders, softer depth and more deliberate motion.',
          'This is placeholder content. Real articles will be added from the admin panel.',
        ],
      },
      'design-systems-explained': {
        title: 'Design Systems Explained',
        summary: 'Learn how to build a scalable design system...',
        date: 'Jan 2024',
        readTime: '12 min',
        body: [
          'A design system is a shared language between design and engineering.',
          'This is placeholder content. Real articles will be added from the admin panel.',
        ],
      },
    } as Record<
      string,
      {
        title: string;
        summary: string;
        date: string;
        duration?: string;
        readTime?: string;
        body?: string[];
      }
    >,
  },
  player: {
    nowPlaying: 'Now playing',
    close: 'Close player',
    seek: 'Seek',
    speed: 'Playback speed {n}x',
    rewind: 'Rewind {n} seconds',
    forward: 'Forward {n} seconds',
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute',
    volume: 'Volume',
    unavailable: 'Audio is not available yet',
  },
  contact: {
    pitchBefore: 'Let’s build something ',
    pitchAccent: 'great',
    pitchAfter: ' together.',
    pitchSub: 'Tell me about your project — I’m open to new work.',
    location: 'Remote — Available Worldwide',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    locationLabel: 'Location',
    copyEmail: 'Copy email address',
    copied: 'Email address copied.',
    copyFailed: 'Could not copy — please select the address manually.',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    message: 'Your Message',
    send: 'Send Message',
    sending: 'Sending…',
    sentTitle: 'Message sent',
    sentText: 'Thanks for reaching out — I’ll get back to you shortly.',
    sendAnother: 'Send another message',
    sentToast: 'Message sent — I’ll get back to you shortly.',
    failedToast: 'Something went wrong. Please try again.',
    fixFields: 'Please fix the highlighted fields.',
    errors: {
      name: 'Please enter your name.',
      emailRequired: 'Please enter your email address.',
      emailInvalid: 'Please enter a valid email address.',
      messageRequired: 'Please enter a message.',
      messageShort: 'Your message should be at least 10 characters.',
    },
  },
  footer: { poweredBy: 'POWERED BY', brandFirst: '', brandLast: '' },
  notFound: {
    title: 'This page drifted off-screen',
    text: 'The page you’re looking for doesn’t exist or has moved.',
    home: 'Back to Home',
  },
};

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

export type Dictionary = Widen<typeof en>;
