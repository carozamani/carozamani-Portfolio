import { adminEn } from './admin.en';

export type ProjectItemContent = {
  title?: string;
  description?: string;
  tag?: string;
  tags?: string[];
  year?: string;
  image?: string;
  caseImages?: string[];
  caseImageTitles?: string[];
  htmlFile?: string;
};

export const en = {
  meta: {
    title: 'Caro Zamani — Product Designer',
    description:
      'Caro Zamani is a product designer focused on UX/UI, with front-end skills in React, Next.js, and TypeScript.',
  },
  fields: { showPassword: 'Show password', hidePassword: 'Hide password' },
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
    title: 'Product Designer',
    ctaWork: 'See my case studies',
    profileAlt: 'Carozamani profile picture',
    logoAlt: 'Carozamani logo',
  },
  about: {
    title: 'About Me',
    description: `I’m Caro Zamani, a product designer focused on clear, useful digital products. I work across UX and UI—from framing problems and mapping user flows to interaction design, prototyping, and design systems.
I also build front ends with React, Next.js, and TypeScript, and I’m familiar with Express and MongoDB. This technical background helps me collaborate closely with engineers and design with implementation in mind.`,
    highlight: 'Caro Zamani',
    resume: 'Download Resume',
    philosophyTitle: 'Design Philosophy',
    philosophyText:
      'I turn complex workflows into clear, usable experiences by balancing user needs, business goals, and implementation realities.',
    techSubtitle:
      'Product design is my focus; my technical background helps me take ideas further.',
    techTitle: 'Product Design & Development',
    tagsLeft: [
      'Product Thinking',
      'User Research',
      'UX Flows',
      'UI Design',
      'Prototyping',
      'Figma',
      'Design Systems',
    ],
    tagsRight: ['React', 'Next.js', 'TypeScript', 'Express.js', 'MongoDB'],
  },
  projects: {
    title: 'Projects',
    description: 'A selection of case studies from my recent work.',
    empty: 'Case studies are coming soon.',
    viewAll: 'View all projects',
    viewOthers: 'View Other Projects',
    noImageTitle: 'No image added yet for “{title}”',
    notFoundTitle: 'This case study couldn’t be found',
    notFoundText: 'The project you’re looking for doesn’t exist or has moved.',
    backToProjects: 'Back to Projects',
    detail: {
      prevProject: 'Previous',
      nextProject: 'Next',
      allProjects: 'All projects',
      sections: 'Case study sections',
      section: 'Section {n}',
      backToTop: 'Back to top',
      gate: {
        title: 'Protected case study',
        text: 'This case study is locked and password protected. Enter the password to continue.',
        label: 'Password',
        submit: 'Open case study',
        checking: 'Checking…',
        denied: 'You don’t have permission to access this file.',
        error: 'Something went wrong. Please try again.',
        back: 'Back to projects',
      },
    },
    items: {
      jabedee: {
        title: 'jabeDee',
        image: '/image/jabedee/cover-en.webp',
        htmlFile: '/case-studies/jabedee-en.html',
        description:
          'A marketing assistant that turns a WooCommerce store’s data into a short, ranked list of tasks, each with the tool to get it done.',
        tags: ['Product design & build'],
        year: '2026',
      },
      karvita: {
        title: 'Karvita',
        image: '/image/karvita/cover-en.webp',
        description:
          'One right-to-left platform for theory, skills training and internship management, serving eleven roles.',
        tags: ['Product & UI design'],
        year: '2026',
      },
    } as Record<string, ProjectItemContent>,
  },
  media: {
    podcasts: {
      title: 'Podcasts',
      description: 'Episodes about design, UX, product thinking, and challenges.',
      viewMore: 'All episodes on {platform}',
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
  admin: adminEn,
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
