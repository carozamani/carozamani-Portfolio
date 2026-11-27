import type { Locale } from '@/lib/i18n/config';

type Localized = Record<Locale, string>;

export interface Testimonial {
  id: string;
  name: Localized;
  role: Localized;
  /** What the person wrote about working with Caro. */
  quote: Localized;
  /** Path of a square photo under /public. Without one the card shows the person's initials. */
  avatar?: string;
}

// PLACEHOLDERS: the names and the words below are stand-ins so the section can be built and judged. Replace
// them with real recommendations (and drop each person's photo in /public/image/testimonials, then set
// `avatar`) before the site goes live.
export const testimonials: Testimonial[] = [
  {
    id: 'placeholder-1',
    name: { en: 'Sara Moradi', fa: 'سارا مرادی' },
    role: { en: 'Product Manager', fa: 'مدیر محصول' },
    quote: {
      en: 'Caro turned a vague idea into a clear, usable product. Working with him felt effortless from the first week.',
      fa: 'کارو یک ایده‌ی مبهم را به محصولی روشن و قابل‌استفاده تبدیل کرد. از همان هفته‌ی اول همکاری با او ساده و روان بود.',
    },
  },
  {
    id: 'placeholder-2',
    name: { en: 'Daniel Reyes', fa: 'دانیال رضایی' },
    role: { en: 'Engineering Lead', fa: 'سرپرست مهندسی' },
    quote: {
      en: 'He designs with the implementation in mind, so handoff was never a negotiation. Engineers trusted his specs.',
      fa: 'او با در نظر گرفتن پیاده‌سازی طراحی می‌کند، برای همین تحویل کار هیچ‌وقت بحث‌برانگیز نبود. مهندس‌ها به مشخصاتش اعتماد داشتند.',
    },
  },
  {
    id: 'placeholder-3',
    name: { en: 'Mina Hosseini', fa: 'مینا حسینی' },
    role: { en: 'Founder', fa: 'بنیان‌گذار' },
    quote: {
      en: 'He asked the questions we had been avoiding, and the product got simpler because of it.',
      fa: 'او همان سؤال‌هایی را پرسید که از آن‌ها فرار می‌کردیم، و محصول به‌خاطر همین ساده‌تر شد.',
    },
  },
  {
    id: 'placeholder-4',
    name: { en: 'Omid Karimi', fa: 'امید کریمی' },
    role: { en: 'Design Director', fa: 'مدیر طراحی' },
    quote: {
      en: 'Rare mix of design judgement and front-end skill. He closes the gap between a mockup and what ships.',
      fa: 'ترکیب کمیاب قضاوت طراحی و مهارت فرانت‌اند. او فاصله‌ی میان ماکت و چیزی را که منتشر می‌شود از میان برمی‌دارد.',
    },
  },
  {
    id: 'placeholder-5',
    name: { en: 'Laleh Ahmadi', fa: 'لاله احمدی' },
    role: { en: 'Operations Manager', fa: 'مدیر عملیات' },
    quote: {
      en: 'Complex, multi-role workflows became something our whole team could follow without training.',
      fa: 'گردش‌کارهای پیچیده و چندنقشی به چیزی تبدیل شد که کل تیم بدون آموزش می‌توانست دنبالش کند.',
    },
  },
];
