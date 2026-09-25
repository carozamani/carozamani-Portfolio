type FlagProps = { className?: string };

export function IranFlag({ className }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 60 40" aria-hidden="true" focusable="false">
      <rect width="60" height="40" fill="#fff" />
      <rect width="60" height="13.33" fill="#239f40" />
      <rect y="26.67" width="60" height="13.33" fill="#da0000" />
    </svg>
  );
}

export function UkFlag({ className }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 60 30" aria-hidden="true" focusable="false">
      <clipPath id="uk-flag-cut">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath="url(#uk-flag-cut)"
        stroke="#c8102e"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}
