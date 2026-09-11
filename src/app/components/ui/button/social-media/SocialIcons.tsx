'use client';

import styles from "./SocialIcons.module.css";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaDribbble,
} from "react-icons/fa";
import { SiCastbox } from "react-icons/si";
import React from "react";

/* =========================
   Icon Registry
========================= */
const ICON_MAP = {
  linkedin: FaLinkedin,
  github: FaGithub,
  twitter: FaTwitter,
  dribbble: FaDribbble,
  castbox: SiCastbox,
} as const;

type SocialType = keyof typeof ICON_MAP;

/* =========================
   Types
========================= */

export type SocialItem = {
  type: SocialType;
  href?: string;
  color?: string;
};

type Props = {
  items?: SocialItem[]; // ← safe
  bordered?: boolean;
  className?: string;
};

/* =========================
   Component
========================= */

export default function SocialIcons({
  items = [], // ← ضد کرش
  bordered = true,
  className = "",
}: Props) {
  return (
    <ul className={`${styles.wrapper} ${className}`}>
      {items.map((item) => {
        const Icon = ICON_MAP[item.type];

        return (
          <li
            key={item.type}
            className={`
              ${styles.icon}
              ${!bordered ? styles.noBorder : ""}
            `}
            style={
              {
                "--social-color": item.color ?? "#ffffff",
              } as React.CSSProperties
            }
          >
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
                <Icon />

              <span className={styles.tooltip}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
