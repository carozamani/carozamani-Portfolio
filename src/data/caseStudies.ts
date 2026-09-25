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
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((caseStudy) => caseStudy.slug === slug);
}

/** The landing page shows the latest (last) N projects; a full listing page only exists beyond it. */
export const PROJECTS_PREVIEW_LIMIT = 3;
