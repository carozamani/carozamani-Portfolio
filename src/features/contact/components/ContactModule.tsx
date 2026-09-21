'use client';

import { memo } from "react";
import { motion } from "framer-motion";
import styles from "./ContactModule.module.css";
import SocialIcons from '@/components/ui/SocialIcons';
import FormFields from '@/components/ui/FormFields';
import { contactSocialLinks } from '@/data/contact';

function ContactModuleComponent() {
  return (
    <section className={styles.wrapper}>
      {/* Background effects */}
      <div className={styles.backgroundStars}></div>
      <div className={styles.glowOrb}></div>
      <div className={styles.neonLines}></div>

      <div className={styles.container}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Grid Pattern Layer */}
          <div className={styles.gridPattern}></div>

          {/* INFO SIDE */}
          <div className={styles.info}>
            <h2 className={styles.title}>INITIATE CONTACT</h2>
            <p className={styles.subtitle}>
              Establish secure communication and transmit your signal across the galaxy.
            </p>

            <div className={styles.meta}>
              <div>
                <span className={styles.label}>EMAIL</span>
                <span>email@example.com</span>
              </div>
              <div>
                <span className={styles.label}>LOCATION</span>
                <span>Your City, Earth</span>
              </div>
            </div>

            <SocialIcons items={contactSocialLinks} bordered={false} />
          </div>

          {/* FORM SIDE */}
          <form className={styles.form}>
            {/* استفاده از کامپوننت با واریانت‌های مختلف */}
            <FormFields 
              variant="text" 
              label="Full Name" 
              required 
            />
            
            <FormFields 
              variant="email" 
              label="Email Address" 
              required 
            />
            
            <FormFields 
              variant="textarea" 
              label="Your Message" 
              rows={4}
              required 
            />
            

            <button type="submit" className={styles.button}>
              TRANSMIT
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export const ContactModule = memo(ContactModuleComponent);