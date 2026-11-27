import Image from 'next/image';

import type { Testimonial } from '@/data/testimonials';
import { localeDirection, type Locale } from '@/lib/i18n/config';

import { getInitials } from '../lib/getInitials';
import styles from './TestimonialsModule.module.css';

const AVATAR_PX = 192;

interface TestimonialCardProps {
  testimonial: Testimonial;
  locale: Locale;
  /** A copy laid out only so the row can loop: hidden from screen readers, which hear each message once */
  repeated?: boolean;
}

// One recommendation as a glass card: a quote mark, the words, then a rule and the person's round photo
// (or their initials) beside their name and job position. Each card sets its own reading direction, so
// in Persian everything mirrors. The carousel (TestimonialsModule) scales the card through the --focus
// variable it sets on this <li>.
export function TestimonialCard({ testimonial, locale, repeated = false }: TestimonialCardProps) {
  const name = testimonial.name[locale];

  return (
    <li className={styles.slide} dir={localeDirection[locale]} aria-hidden={repeated || undefined}>
      <figure className={styles.card}>
        <span className={styles.rim} aria-hidden="true" />
        <span className={styles.mark} aria-hidden="true" />
        <blockquote className={styles.quote}>
          <p>{testimonial.quote[locale]}</p>
        </blockquote>
        <figcaption className={styles.author}>
          <span className={styles.avatar}>
            {testimonial.avatar ? (
              <Image
                src={testimonial.avatar}
                alt=""
                width={AVATAR_PX}
                height={AVATAR_PX}
                draggable={false}
                className={styles.avatarImage}
              />
            ) : (
              <span aria-hidden="true">{getInitials(name)}</span>
            )}
          </span>
          <span className={styles.who}>
            <span className={styles.name}>{name}</span>
            <span className={styles.role}>{testimonial.role[locale]}</span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}
