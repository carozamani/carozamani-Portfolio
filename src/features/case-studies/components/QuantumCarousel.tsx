'use client';
import React from 'react';
import styles from './QuantumCarousel.module.css';

// Reusable Feature Item Component
const FeatureItem = ({
  backgroundImage,
  iconImage,
  title,
  description,
}: {
  backgroundImage: string;
  iconImage: string;
  title: string;
  description: string;
}) => {
  return (
    <div className={styles.featureItem}>
      <div className={styles.featureBackground}>
        <img 
          src={backgroundImage} 
          alt={`${title} background`}
          className={styles.backgroundImage}
        />
        <div className={styles.backgroundOverlay}></div>
      </div>

      <div className={styles.featureContent}>
        <div className={styles.iconWrapper}>
          <img src={iconImage} alt={title} className={styles.iconImage} />
        </div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
};

const QuantumCarousel = () => {
  const features = [
    {
      backgroundImage: "/backgrounds/cloak-bg.jpg",
      iconImage: "/icons/cloak.png",
      title: "Cloak Mode",
      description: "Overcomes VPN blocks by disguising your VPN traffic as regular web traffic."
    },
    {
      backgroundImage: "/backgrounds/split-bg.jpg",
      iconImage: "/icons/split.png",
      title: "Split Tunneling",
      description: "Split traffic by country, apps, and IPs to save data and boost speed."
    },
    {
      backgroundImage: "/backgrounds/dns-bg.jpg",
      iconImage: "/icons/dns.png",
      title: "Private DNS",
      description: "Manage how website addresses resolve using Private DNS configuration."
    },
    {
      backgroundImage: "/backgrounds/kill-bg.jpg",
      iconImage: "/icons/kill.png",
      title: "Kill Switch",
      description: "Automatically blocks all internet traffic if the VPN disconnects."
    }
  ];

  return (
    <div className={styles.carouselContainer}>
      {/* Background Lines + Glow */}
      <div className={styles.backgroundEffects}>
        <div className={styles.horizontalLine}></div>
        <div className={styles.verticalLine}></div>
        <div className={styles.centerGlow}></div>
      </div>

      {/* Main Grid */}
      <div className={styles.gridLayout}>
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`${styles.gridItem} ${styles[`item${index}`]}`}
          >
            <FeatureItem
              backgroundImage={feature.backgroundImage}
              iconImage={feature.iconImage}
              title={feature.title}
              description={feature.description}
            />
          </div>
        ))}
      </div>

      {/* Center Rectangle Glow */}
      <div className={styles.centerRectangle}>
        <div className={styles.rectangleGlow}></div>
      </div>
    </div>
  );
};

export default QuantumCarousel;
