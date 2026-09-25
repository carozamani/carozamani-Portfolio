'use client';

import { memo, useRef, type PointerEvent } from 'react';
import { FiSend, FiCopy, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import styles from './ContactModule.module.css';
import SocialIcons from '@/components/ui/SocialIcons';
import Button from '@/components/ui/Button';
import FormFields from '@/components/ui/FormFields';
import { contactSocialLinks, contactDetails } from '@/data/contact';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { useContactForm } from '../lib/useContactForm';

function ContactModuleComponent() {
  const { contact } = useDictionary();
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const { errors, isSubmitting, isSent, resetSent, handleSubmit } = useContactForm();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactDetails.email);
      toast.success(contact.copied);
    } catch {
      toast.error(contact.copyFailed);
    }
  };

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
            <div className={styles.brandBlock}>
              <div className={styles.brandRow}>
                <div className={styles.logoRing}>
                  <Image
                    src="/image/LogoPrimary.svg"
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                  />
                </div>
                <h2 className={styles.pitch}>
                  {contact.pitchBefore}
                  <span className={styles.pitchAccent}>{contact.pitchAccent}</span>
                  {contact.pitchAfter}
                </h2>
              </div>
              <p className={styles.pitchSub}>{contact.pitchSub}</p>
            </div>

            <dl className={styles.meta}>
              <div className={styles.metaRow}>
                <dt className={styles.label}>
                  <FiMail aria-hidden="true" />
                  <span className={styles.srOnly}>{contact.emailLabel}</span>
                </dt>
                <dd className={styles.value}>
                  <a href={`mailto:${contactDetails.email}`} className={styles.link}>
                    {contactDetails.email}
                  </a>
                  <Button
                    variant="icon"
                    text={contact.copyEmail}
                    iconLeft={<FiCopy aria-hidden="true" />}
                    onClick={copyEmail}
                    className={styles.copyButton}
                  />
                </dd>
              </div>
              <div className={styles.metaRow}>
                <dt className={styles.label}>
                  <FiPhone aria-hidden="true" />
                  <span className={styles.srOnly}>{contact.phoneLabel}</span>
                </dt>
                <dd className={styles.value}>
                  <a href={`tel:${contactDetails.phone}`} className={styles.link} dir="ltr">
                    {contactDetails.phone}
                  </a>
                </dd>
              </div>
              <div className={styles.metaRow}>
                <dt className={styles.label}>
                  <FiMapPin aria-hidden="true" />
                  <span className={styles.srOnly}>{contact.locationLabel}</span>
                </dt>
                <dd className={styles.value}>{contact.location}</dd>
              </div>
            </dl>

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
                <h3 className={styles.successTitle}>{contact.sentTitle}</h3>
                <p className={styles.successText}>{contact.sentText}</p>
                <Button variant="glass" text={contact.sendAnother} onClick={resetSent} />
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <FormFields
                  name="name"
                  variant="text"
                  label={contact.fullName}
                  autoComplete="name"
                  required
                  error={errors.name}
                />
                <FormFields
                  name="email"
                  variant="email"
                  label={contact.emailAddress}
                  autoComplete="email"
                  required
                  error={errors.email}
                />
                <FormFields
                  name="message"
                  variant="textarea"
                  label={contact.message}
                  rows={4}
                  maxLength={contactDetails.messageMaxLength}
                  required
                  error={errors.message}
                />

                <Button
                  type="submit"
                  text={contact.send}
                  loadingText={contact.sending}
                  iconLeft={
                    isSubmitting ? undefined : (
                      <FiSend className={styles.sendIcon} aria-hidden="true" />
                    )
                  }
                  loading={isSubmitting}
                  fullWidth
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
