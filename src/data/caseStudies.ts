import type { CaseStudy } from '@/types/caseStudy';

export const caseStudies: CaseStudy[] = [
  {
    slug: 'project-one',
    title: 'FinFlow',
    image: '',
    description:
      'Redesigning a personal finance app’s onboarding flow to cut drop-off and get first-time users to their "aha moment" faster.',
    tag: 'Product Design',
    year: '2024',
    companyName: 'FinFlow (concept project)',
    companyLogo: '',
    role: 'Product Designer (solo)',
    duration: '6 weeks',
    tools: ['Figma', 'Maze', 'Notion'],
    overview:
      'FinFlow is a self-directed case study exploring how a budgeting app can turn a long, form-heavy signup into a guided experience that proves its value before asking for commitment.',
    problem:
      'In moderated testing on the original 9-step onboarding flow, 6 of 9 participants abandoned before connecting a bank account, most citing unclear value ("why do you need this?") and form fatigue as the reason.',
    process: [
      'Mapped the existing flow and flagged every screen that asked for input before delivering any value in return.',
      'Ran 9 moderated usability sessions on the current flow to time-stamp exact drop-off points and collect verbatim quotes.',
      'Reduced the flow from 9 screens to 4 by deferring non-essential fields and replacing static forms with a progressive, single-question-per-screen pattern.',
      'Added a live preview of the user’s own budget forming in real time as they answered, so value was visible before the account-linking step.',
      'Validated the new flow with a second round of 8 moderated sessions and iterated on copy and error states based on hesitation points.',
    ],
    results: [
      { value: '78%', label: 'task completion rate in round 2 (up from 33%)' },
      { value: '4 screens', label: 'down from 9 in the original flow' },
      { value: '2.1x', label: 'faster time-to-first-value in testing' },
    ],
    scope: 'ui-ux',
  },
  {
    slug: 'project-two',
    title: 'MediBook',
    image: '',
    description:
      'Designing a mobile booking experience for a telehealth service, with accessibility for older adults as the primary constraint.',
    tag: 'Mobile App',
    year: '2024',
    companyName: 'MediBook (concept project)',
    companyLogo: '',
    role: 'UX/UI Designer (solo)',
    duration: '5 weeks',
    tools: ['Figma', 'Figma Prototyping', 'UserTesting'],
    overview:
      'MediBook explores how to design a telehealth booking flow that works for patients aged 55+, a group frequently underserved by dense, small-touch-target medical app UIs.',
    problem:
      'Competitive audits of 4 existing telehealth apps showed touch targets under 40px, low-contrast body text, and multi-step calendar pickers — all known barriers for older users with reduced fine motor control and vision changes.',
    process: [
      'Interviewed 6 participants aged 55–74 about their experience booking medical appointments digitally, including two who had abandoned an app mid-booking.',
      'Set hard design constraints upfront: minimum 48px touch targets, body text no smaller than 16px, and no more than one decision per screen.',
      'Designed a linear, single-column booking flow that replaced a calendar grid with a simple list of available time slots grouped by day.',
      'Prototyped in Figma and tested with 7 participants in the target age range, measuring task success and time-on-task without assistance.',
      'Iterated twice on labeling and confirmation screens after testing revealed uncertainty about whether a booking had actually been confirmed.',
    ],
    results: [
      { value: '100%', label: 'unassisted task completion in final testing round' },
      { value: '48px+', label: 'minimum touch target size across all interactive elements' },
      { value: '3 taps', label: 'to complete a booking, down from 7 in the audited baseline' },
    ],
    scope: 'ui-ux-frontend',
    techStack: ['Next.js', 'React', 'Framer Motion'],
  },
  {
    slug: 'project-three',
    title: 'Nimbus',
    image: '',
    description:
      'Building a componentized design system to replace inconsistent, one-off UI patterns across a multi-team SaaS product.',
    tag: 'Design System',
    year: '2023',
    companyName: 'Nimbus (concept project)',
    companyLogo: '',
    role: 'Design Systems Lead (solo)',
    duration: '8 weeks',
    tools: ['Figma', 'Figma Variables', 'Storybook (reference)'],
    overview:
      'Nimbus is a token-based design system built to demonstrate how a fragmented dashboard product (5+ button styles, 3 different modal patterns) can be consolidated into a single governed source of truth.',
    problem:
      'An audit of the reference product surfaced 5 distinct button styles, 3 modal patterns, and inconsistent spacing values across just 12 screens — a sign that every team was solving the same UI problems from scratch.',
    process: [
      'Audited every screen in the reference product and catalogued duplicate components, inconsistent spacing, and color usage.',
      'Defined a token architecture (color, spacing, typography, radius) so every visual decision traced back to a single source instead of hard-coded values.',
      'Built a core component library (buttons, inputs, modals, tables, badges) with documented states: default, hover, focus, disabled, and error.',
      'Wrote usage guidelines and do/don’t examples for each component to reduce ambiguity for engineers implementing them.',
      'Rebuilt 3 of the product’s most-used screens with the new system to pressure-test it against real layout complexity before calling it done.',
    ],
    results: [
      { value: '5 → 1', label: 'button styles consolidated into one variant-driven component' },
      { value: '40+', label: 'documented component states across the library' },
      { value: '3 screens', label: 'rebuilt end-to-end as a real-world stress test' },
    ],
    scope: 'ui-ux',
  },
  {
    slug: 'portfolio-design-system',
    title: 'Portfolio Design System',
    image: '',
    description:
      'Designing and building the token-based design system behind this portfolio itself — the same product you are looking at right now.',
    tags: ['Design System', 'Frontend'],
    year: '2025',
    companyName: 'Personal Portfolio',
    companyLogo: '',
    role: 'Product Designer & Frontend Developer (solo)',
    duration: 'Ongoing',
    tools: ['Figma', 'VS Code', 'Next.js', 'CSS Custom Properties'],
    overview:
      'Before writing a single section of this portfolio, I built the design system it now runs on: a set of CSS custom-property tokens for color, typography, spacing, shadow and shape, shared UI atoms, and layout rules that every feature (hero, about, case studies, media, contact) has to consume rather than reinvent.',
    problem:
      'Early drafts of individual sections each picked their own font sizes, spacing values and glass/glow effects, which made the site feel like several disconnected demos instead of one product. I needed a single source of truth before the surface area grew past the point where fixing it would mean a full rewrite.',
    process: [
      'Defined a token layer in `src/styles/` — colors, typography, spacing, shadows and shapes — as CSS custom properties, so every visual decision traces back to one file instead of being hard-coded per component.',
      'Built a small set of reusable UI atoms (Typography, GlassButton, CTA, AnimatedGradientText, form fields) on top of those tokens, plus shared composition components (GlassMenu, CursorGlow, Footer, AnimatedSection) for cross-feature layout.',
      'Adopted a feature-sliced structure (features/ isolated from each other, everything shared living in components/ui and components/shared) so new sections could only reuse the system, never fork it.',
      'Established a glass/glow visual language (surface, border, glow tokens) and fluid typography with `clamp()` so the same tokens hold up from mobile to desktop without section-specific overrides.',
      'Extended the token-driven approach into an admin panel for editing content (case studies, media) so the design system also governs the tooling used to maintain the site, not just the public pages.',
    ],
    results: [
      {
        value: '5 token files',
        label: 'covering color, type, spacing, shadow and shape for the whole site',
      },
      {
        value: '1 component set',
        label: 'atoms and shared composition components reused across every feature',
      },
      {
        value: '0 one-off styles',
        label: 'per-feature CSS Modules read from tokens instead of hard-coded values',
      },
    ],
    scope: 'ui-ux-frontend',
    techStack: ['Next.js', 'React', 'CSS Modules', 'CSS Custom Properties', 'Framer Motion'],
  },
  {
    slug: 'karvita',
    title: 'Karvita',
    image: '',
    description:
      'Designing and building the product design system and frontend for Karvita, a Persian/RTL educational-administration platform for internships, approvals and course offerings.',
    tags: ['Design System', 'Frontend', 'Product Design'],
    year: '2025',
    companyName: 'Karvita',
    companyLogo: '',
    role: 'Product Designer & Frontend Developer',
    duration: '4+ months',
    tools: ['Figma', 'Next.js', 'shadcn/ui', 'Tailwind CSS', 'Radix UI'],
    overview:
      'Karvita is a Persian, right-to-left educational-administration platform that manages internships, daily approvals, capacities, onboarding and course offerings for a university-style program. I owned both the product design and the frontend implementation: designing the interface and information architecture, then building it as a governed, token-based design system on top of Next.js and shadcn/ui.',
    problem:
      'The product needed a full RTL, Persian-first interface with a real admin surface (dashboards, tables, multi-step approval flows, CMS) before the backend was ready — and without a design system in place, every screen risked reinventing its own buttons, forms and tables, especially with logical (start/end) CSS properties instead of the left/right assumptions most UI kits ship with.',
    process: [
      'Designed the core flows in Figma first — auth (login, register, forgot password), the admin dashboard, internship and capacity management, daily approvals and the landing CMS — with RTL layout as a first-class constraint, not an afterthought.',
      'Built a two-tier component architecture: raw shadcn/ui + Radix primitives at the base, and a "Kv-" prefixed design-system layer (KvButton, KvCard, KvTable, KvInput, KvDialog and 40+ others) that every feature consumes instead of touching primitives directly.',
      'Defined a semantic design-token layer in `globals.css` (kv-surface, kv-text, kv-border, kv-brand/success/warning/danger/info) on top of a raw HSL brand scale, covering light and dark themes, so color decisions live in one place.',
      'Set up custom lint rules to enforce the system at the code level — banning hardcoded colors outside the token file, banning raw shadcn imports outside the Kv layer, and banning physical (left/right) Tailwind utilities in favor of RTL-safe logical properties.',
      'Built the UI against a local mock-mode API simulator before the NestJS backend existed, so design and frontend delivery were never blocked on backend readiness, then swapped to the real API through a single facade layer once it shipped.',
    ],
    results: [
      {
        value: '40+',
        label: 'reusable "Kv-" design-system components built on shadcn/ui and Radix',
      },
      {
        value: '3 lint rules',
        label: 'enforcing token-only color, RTL-safe layout and design-system-only imports',
      },
      {
        value: '2 API modes',
        label: 'mock and real, so the frontend shipped ahead of the backend',
      },
    ],
    scope: 'full-stack',
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'shadcn/ui',
      'Radix UI',
      'TanStack Query',
      'Zustand',
    ],
    architectureNotes:
      'The frontend never talks to HTTP directly — all data access goes through a services/ facade layer, with a single api-client.ts as the only place that knows about HTTP, and paginated lists standardized on TanStack Query. A dedicated mock mode (localStorage + a fixed OTP simulator) let the entire UI and design system be built and validated before the NestJS backend was available, with production builds refusing to run in mock mode. An internal Next.js API route proxies to the NestJS service (BFF-style) for auth token handling and file uploads, keeping backend URLs and secrets out of client code.',
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((caseStudy) => caseStudy.slug === slug);
}

/** The landing page shows the latest (last) N projects; a full listing page only exists beyond it. */
export const PROJECTS_PREVIEW_LIMIT = 3;
