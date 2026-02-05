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
    <div className={styles.card}>
      {/* Icon Section */}
      <div className={styles.iconBox}>
        <img 
          src={feature.iconSrc} 
          alt={feature.title} 
          className={styles.featureImage} 
        />
      </div>

      {/* Main Image 16:9 */}
      <div
        className={styles.imageWrapper}
        style={{ backgroundImage: `url(${feature.imageSrc})` }}
      />

      {/* Text Content */}
      <div className="text-center p-4">
        <h3 className={styles.title}>{feature.title}</h3>
        <p className={styles.description}>
          {feature.description}
        </p>
      </div>
      
      {/* Decorative Bottom Line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}