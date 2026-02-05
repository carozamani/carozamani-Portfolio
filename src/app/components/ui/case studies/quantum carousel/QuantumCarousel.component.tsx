'use client';
import React from 'react';

// Reusable Feature Item Component با پس‌زمینه و آیکون
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
    <div className="relative flex flex-col items-center text-center p-6 z-10 max-w-sm mx-auto group">
      {/* Container با پس‌زمینه */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden z-0">
        {/* پس‌زمینه */}
        <img 
          src={backgroundImage} 
          alt={`${title} background`}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        />
        {/* Overlay برای خوانایی بهتر */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/70 to-slate-900/90"></div>
      </div>

      {/* محتوا */}
      <div className="relative z-10">
        {/* آیکون */}
        <div className="mb-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 shadow-inner shadow-purple-900/20 backdrop-blur-sm inline-flex">
          <img src={iconImage} alt={title} className="w-10 h-10 object-contain" />
        </div>

        <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed font-light">{description}</p>
      </div>
    </div>
  );
};

const QuantumCarousel = () => {
  // داده‌های نمونه - شما می‌توانید این‌ها را با داده‌های واقعی جایگزین کنید
  const features = [
    {
      backgroundImage: "/backgrounds/cloak-bg.jpg", // عکس کیس استادی
      iconImage: "/icons/cloak.png", // لوگوی شرکت
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
    <div className="min-h-screen w-full flex items-center justify-center relative py-12">
      
      {/* ---------- Background Lines + Glow ---------- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent -translate-y-1/2" />
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-400/50 to-transparent -translate-x-1/2" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* ---------- Main Grid Layout ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10 px-4">
        
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`
              flex justify-center
              ${index === 0 ? 'md:justify-end md:pr-6' : ''}
              ${index === 1 ? 'md:justify-start md:pl-6' : ''}
              ${index === 2 ? 'md:justify-end md:pr-6 md:pt-8' : ''}
              ${index === 3 ? 'md:justify-start md:pl-6 md:pt-8' : ''}
            `}
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

      {/* ---------- Center Rectangle با افکت بهتر ---------- */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
        <div className="relative">
          {/* Outer Glow Effect */}
          <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-blue-400/30 rounded-2xl shadow-[0_0_60px_20px_rgba(59,130,246,0.15)]"></div>
        </div>
      </div>
    </div>
  );
};

export default QuantumCarousel;
export const SwiperShowcase = QuantumCarousel;