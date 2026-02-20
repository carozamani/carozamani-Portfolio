'use client';

import { memo } from "react";
import { motion } from "framer-motion";
import styles from "./ContactSection.module.css";
import SocialIcons, { SocialItem } from "../button/social media/SocialIcons";

const socialLinks: SocialItem[] = [
  { type: "linkedin", href: "https://linkedin.com/in/username", color: "#00f0ff" },
  { type: "castbox", href: "https://castbox.fm/username", color: "#ff6b00" },
  { type: "github", href: "https://github.com/username", color: "#ffffff" },
];

function ContactSectionComponent() {
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

            <SocialIcons items={socialLinks}  bordered={false} />
          </div>

          {/* FORM SIDE */}
          <form className={styles.form}>
            {[
              { type: "text", label: "Full Name" },
              { type: "email", label: "Email Address" },
            ].map((field) => (
              <div className={styles.field} key={field.label}>
                <input type={field.type} placeholder=" " required />
                <label>{field.label}</label>
              </div>
            ))}

            <div className={styles.field}>
              <textarea rows={4} placeholder=" " required />
              <label>Your Message</label>
            </div>

            <button type="submit" className={styles.button}>
              TRANSMIT
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

// Memoization برای جلوگیری از re-render غیرضروری
export default memo(ContactSectionComponent);