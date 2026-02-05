'use client';

import { motion } from "framer-motion";
import styles from "./ContactSection.module.css";
import SocialIcons, {
  SocialItem,
} from "../button/social media/SocialIcons";

/* =========================
   Social Links (NEW API)
========================= */
const socialLinks: SocialItem[] = [
  {
    type: "linkedin",
    href: "https://linkedin.com/in/username",
    color: "#0077B5",
  },
  {
    type: "castbox",
    href: "https://castbox.fm/username",
    color: "#FF5E00",
  },
  {
    type: "github",
    href: "https://castbox.fm/username",
    color: "#ffffffff",
  },
];

export default function ContactSection() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>

        {/* =========================
           LEFT SIDE (INFO)
        ========================= */}
        <motion.div
          className={styles.infoBox}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>Get In Touch</h2>

          <p className={styles.subtitle}>
            Let’s connect and create something amazing
          </p>

          {/* Contact Boxes */}
          <div className={styles.contactBoxes}>
            <motion.div
              className={styles.contactBox}
            >
              📧 email@example.com
            </motion.div>

            <motion.div
              className={styles.contactBox}
            >
              📍 Your City, Country
            </motion.div>
          </div>

          {/* =========================
             Social Icons (FIXED ✅)
          ========================= */}
          <SocialIcons
            items={socialLinks}
            size="md"
            bordered={false}
          />
        </motion.div>

        {/* =========================
           RIGHT SIDE (FORM)
        ========================= */}
        <motion.div
          className={styles.formBox}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form className={styles.form}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Name"
                className={styles.input}
              />
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="Email"
                className={styles.input}
              />
            </div>

            <div className={styles.inputWrapper}>
              <textarea
                placeholder="Your Message"
                rows={8}
                className={styles.textarea}
              />
            </div>

            <button
              type="submit"
              className={styles.button}
            >
              Send Message
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
