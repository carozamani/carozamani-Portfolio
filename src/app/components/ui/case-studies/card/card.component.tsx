'use client';

import React from 'react';
import styles from './card.module.css';

export interface Feature {
  title: string;
  description: string;
  imageSrc: string;
  iconSrc: string;
}

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className={`${styles.card} group`}>
      {/* Icon */}
      <div className={styles.iconBox}>
        <img src={feature.iconSrc} alt={feature.title} className={styles.iconImage} />
      </div>

      {/* Background Image */}
      <div
        className={styles.imageWrapper}
        style={{ backgroundImage: `url(${feature.imageSrc})` }}
      />

      {/* Text */}
      <div className={styles.content}>
        <h3 className={styles.title}>{feature.title}</h3>
        <p className={styles.description}>{feature.description}</p>
      </div>

      {/* Neon Bottom Line */}
      <div className={styles.neonLine}></div>
    </div>
  );
}