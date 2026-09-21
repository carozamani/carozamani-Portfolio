'use client';

interface GlassButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export default function GlassButton({ text, onClick, className }: GlassButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative
        px-6 py-3
        rounded-xl
        bg-white/10           /* شفافیت روی پس زمینه تاریک */
        backdrop-blur-lg       /* افکت مات بیشتر */
        border border-white/20
        text-white
        font-semibold
        hover:bg-white/20
        hover:scale-105
        transition
        duration-300
        ${className || ''}
      `}
    >
      {text}
      {/* افکت نور ملایم برای پس زمینه تاریک */}
      <span className="absolute inset-0 rounded-xl shadow-[0_0_40px_8px_rgba(255,255,255,0.25)] opacity-0 hover:opacity-100 transition duration-300 pointer-events-none"></span>
    </button>
  );
}
