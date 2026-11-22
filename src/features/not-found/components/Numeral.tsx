import clsx from 'clsx';
import { Planet } from './Planet';
import styles from './Numeral.module.css';

// The 4 is drawn rather than typeset: the planet has to sit exactly between two glyphs, and a path
// keeps that true at every size, in every language, with or without the webfont
const GLYPH = 'M118 0H170V168H200V214H170V260H118V214H0V176ZM118 64V168H48Z';
const GLYPH_TOP = 40;
const GLYPH_LEFTS = [60, 740] as const;

type DigitsProps = {
  variant: 'outline' | 'ghost' | 'fill';
  className: string;
  /** Ghost layers only: the colour of the offset copy. */
  color?: string;
};

function Digits({ variant, className, color }: DigitsProps) {
  const isOutline = variant === 'outline';
  const isFill = variant === 'fill';

  return (
    <svg className={className} viewBox="0 0 1000 340" aria-hidden="true" focusable="false">
      <defs>
        {isOutline && (
          <>
            <pattern
              id="nf-hatch"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="8" height="8" fill="rgba(0, 40, 140, 0.16)" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(0, 191, 255, 0.16)" strokeWidth="1" />
            </pattern>
            <linearGradient
              id="nf-stroke"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="0"
              y2="260"
            >
              <stop offset="0" stopColor="#5cd6ff" />
              <stop offset="1" stopColor="#1f58ff" stopOpacity=".7" />
            </linearGradient>
          </>
        )}
        {isFill && (
          <linearGradient id="nf-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="260">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".45" stopColor="#94e4ff" />
            <stop offset="1" stopColor="#0a5cff" />
          </linearGradient>
        )}
      </defs>
      {GLYPH_LEFTS.map((left) => (
        <path
          key={left}
          d={GLYPH}
          transform={`translate(${left} ${GLYPH_TOP})`}
          fillRule="evenodd"
          fill={isOutline ? 'url(#nf-hatch)' : isFill ? 'url(#nf-fill)' : 'none'}
          stroke={isFill ? 'none' : isOutline ? 'url(#nf-stroke)' : color}
          strokeWidth="1.6"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/**
 * "404", with a planet and its satellite for the zero. Four layers of the same two glyphs: a
 * blueprint outline, two offset copies that snap together once as the signal locks, and a lit fill
 * that is only visible inside a spotlight the stage steers.
 */
export function Numeral() {
  return (
    <div className={styles.parallax} role="img" aria-label="404">
      <div className={styles.numeral} data-numeral>
        <Digits variant="outline" className={clsx(styles.layer, styles.outline)} />
        <Digits variant="ghost" color="#00e5ff" className={clsx(styles.layer, styles.ghostCyan)} />
        <Digits variant="ghost" color="#2b5bff" className={clsx(styles.layer, styles.ghostBlue)} />
        <div className={styles.planetShift}>
          <Planet className={clsx(styles.layer, styles.planet)} />
        </div>
        <Digits variant="fill" className={clsx(styles.layer, styles.fill)} />
        <span className={styles.scan} />
      </div>
    </div>
  );
}
