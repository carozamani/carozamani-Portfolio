'use client';

import { memo, useRef, type PointerEvent } from 'react';
import { FiSend, FiCopy, FiMail, FiMapPin } from 'react-icons/fi';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import styles from './ContactModule.module.css';
import SocialIcons from '@/components/ui/SocialIcons';
import Button from '@/components/ui/Button';
import FormFields from '@/components/ui/FormFields';
import { contactSocialLinks, contactDetails } from '@/data/contact';
import { useContactForm } from '../lib/useContactForm';

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(contactDetails.email);
    toast.success('Email address copied.');
  } catch {
    toast.error('Could not copy — please select the address manually.');
  }
}

function ContactModuleComponent() {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const { errors, isSubmitting, isSent, resetSent, handleSubmit } = useContactForm();

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || reduceMotion) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <motion.div
          ref={cardRef}
          className={styles.card}
          onPointerMove={handlePointerMove}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 50 }}
          whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
        >
          <div className={styles.gridPattern} aria-hidden="true" />
          <div className={styles.spotlight} aria-hidden="true" />

          <div className={styles.info}>
            <h2 className={styles.title}>Get in Touch</h2>
            <p className={styles.subtitle}>
              Have a project in mind or a question? Send a message and I&apos;ll get back to you
              shortly.
            </p>

            <dl className={styles.meta}>
              <div className={styles.metaRow}>
                <dt className={styles.label}>
                  <FiMail aria-hidden="true" />
                  <span className={styles.srOnly}>Email</span>
                </dt>
                <dd className={styles.value}>
                  <a href={`mailto:${contactDetails.email}`} className={styles.link}>
                    {contactDetails.email}
                  </a>
                  <Button
                    variant="icon"
                    text="Copy email address"
                    iconLeft={<FiCopy aria-hidden="true" />}
                    onClick={copyEmail}
                    className={styles.copyButton}
                  />
                </dd>
              </div>
              <div className={styles.metaRow}>
                <dt className={styles.label}>
                  <FiMapPin aria-hidden="true" />
                  <span className={styles.srOnly}>Location</span>
                </dt>
                <dd className={styles.value}>{contactDetails.location}</dd>
              </div>
            </dl>

            <p className={styles.response}>
              <span className={styles.pulse} aria-hidden="true" />
              {contactDetails.responseTime}
            </p>

            <SocialIcons items={contactSocialLinks} bordered={false} />
          </div>

          <div className={styles.formColumn}>
            {isSent ? (
              <div className={styles.success} role="status">
                <svg
                  className={styles.successIcon}
                  viewBox="0 0 52 52"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="26" cy="26" r="24" className={styles.successRing} />
                  <path d="M15 27l8 8 14-16" className={styles.successCheck} />
                </svg>
                <h3 className={styles.successTitle}>Message sent</h3>
                <p className={styles.successText}>
                  Thanks for reaching out — I&apos;ll get back to you shortly.
                </p>
                <Button variant="glass" text="Send another message" onClick={resetSent} />
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <FormFields
                  name="name"
                  variant="text"
                  label="Full Name"
                  autoComplete="name"
                  required
                  error={errors.name}
                />
                <FormFields
                  name="email"
                  variant="email"
                  label="Email Address"
                  autoComplete="email"
                  required
                  error={errors.email}
                />
                <FormFields
                  name="message"
                  variant="textarea"
                  label="Your Message"
                  rows={4}
                  maxLength={contactDetails.messageMaxLength}
                  required
                  error={errors.message}
                />

                <Button
                  type="submit"
                  text="Send Message"
                  loadingText="Sending…"
                  Icon={FiSend}
                  loading={isSubmitting}
                  fullWidth
                  iconGradientFrom="var(--color-brand-primary)"
                  iconGradientTo="var(--color-brand-secondary)"
                />
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export const ContactModule = memo(ContactModuleComponent);
