import styles from './Planet.module.css';

// Everything shares the numeral's 1000 x 340 canvas, so the planet sits exactly between the 4s
const CENTER = { x: 500, y: 170 };
const RADIUS = 112;
const ORBIT = { rx: 236, ry: 58, tilt: -16, seconds: 13 };

const START = `${CENTER.x - ORBIT.rx} ${CENTER.y}`;
const END = `${CENTER.x + ORBIT.rx} ${CENTER.y}`;
const ARC = `A${ORBIT.rx} ${ORBIT.ry} 0 0`;
// The far half of the ellipse passes behind the planet, the near half in front of it
const BACK_ARC = `M${START}${ARC} 1 ${END}`;
const FRONT_ARC = `M${START}${ARC} 0 ${END}`;
const ORBIT_LOOP = `${BACK_ARC}${ARC} 1 ${START}`;

// Meridians and parallels, clipped to the globe: a drafting-table grid over the surface
const PARALLELS = [
  { dy: -70, rx: 87, ry: 11 },
  { dy: -30, rx: 108, ry: 15 },
  { dy: 14, rx: 111, ry: 17 },
  { dy: 58, rx: 96, ry: 13 },
] as const;
const MERIDIANS = [40, 82] as const;

function Satellite({ className }: { className: string }) {
  return (
    <g className={className}>
      <animateMotion
        dur={`${ORBIT.seconds}s`}
        repeatCount="indefinite"
        rotate="auto"
        path={ORBIT_LOOP}
      />
      <line
        x1="-38"
        y1="0"
        x2="0"
        y2="0"
        stroke="url(#nf-tail)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle r="10" fill="url(#nf-spark)" />
      <circle r="3.2" fill="#fff" />
    </g>
  );
}

export function Planet({ className }: { className?: string }) {
  const { x, y } = CENTER;

  return (
    <svg
      className={className}
      viewBox="0 0 1000 340"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="nf-body" cx=".32" cy=".28" r=".9">
          <stop offset="0" stopColor="#c4f1ff" />
          <stop offset=".16" stopColor="#35b4ff" />
          <stop offset=".46" stopColor="#0a47e0" />
          <stop offset=".78" stopColor="#081a6e" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="nf-night" cx=".28" cy=".22" r="1.05">
          <stop offset=".5" stopColor="#020617" stopOpacity="0" />
          <stop offset="1" stopColor="#020617" stopOpacity=".92" />
        </radialGradient>
        <linearGradient id="nf-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b6efff" stopOpacity="1" />
          <stop offset=".5" stopColor="#2a7dff" stopOpacity=".5" />
          <stop offset="1" stopColor="#2a7dff" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="nf-orbit"
          gradientUnits="userSpaceOnUse"
          x1={x - ORBIT.rx}
          y1="0"
          x2={x + ORBIT.rx}
          y2="0"
        >
          <stop offset="0" stopColor="#00bfff" stopOpacity="0" />
          <stop offset=".5" stopColor="#8fe3ff" stopOpacity=".9" />
          <stop offset="1" stopColor="#00bfff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nf-tail" gradientUnits="userSpaceOnUse" x1="-38" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#00bfff" stopOpacity="0" />
          <stop offset="1" stopColor="#d2f4ff" stopOpacity=".95" />
        </linearGradient>
        <radialGradient id="nf-spark">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset=".4" stopColor="#5cd6ff" stopOpacity=".4" />
          <stop offset="1" stopColor="#00bfff" stopOpacity="0" />
        </radialGradient>
        <filter id="nf-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <clipPath id="nf-globe">
          <circle cx={x} cy={y} r={RADIUS} />
        </clipPath>
        <clipPath id="nf-behind">
          <rect x="0" y="0" width="1000" height={y} />
        </clipPath>
        <clipPath id="nf-front">
          <rect x="0" y={y} width="1000" height={y} />
        </clipPath>
      </defs>

      <g transform={`rotate(${ORBIT.tilt} ${x} ${y})`}>
        <path
          d={BACK_ARC}
          fill="none"
          stroke="url(#nf-orbit)"
          strokeOpacity=".5"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <g clipPath="url(#nf-behind)">
          <Satellite className={styles.satellite} />
        </g>

        <circle
          cx={x}
          cy={y}
          r={RADIUS}
          fill="none"
          stroke="#00bfff"
          strokeOpacity=".55"
          strokeWidth="14"
          filter="url(#nf-blur)"
        />
        <circle cx={x} cy={y} r={RADIUS} fill="url(#nf-body)" />
        <g clipPath="url(#nf-globe)" fill="none" stroke="#bfeeff" strokeOpacity=".16">
          {PARALLELS.map(({ dy, rx, ry }) => (
            <ellipse
              key={dy}
              cx={x}
              cy={y + dy}
              rx={rx}
              ry={ry}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {MERIDIANS.map((rx) => (
            <ellipse key={rx} cx={x} cy={y} rx={rx} ry={RADIUS} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <circle cx={x} cy={y} r={RADIUS} fill="url(#nf-night)" />
        <circle
          cx={x}
          cy={y}
          r={RADIUS - 0.75}
          fill="none"
          stroke="url(#nf-rim)"
          strokeWidth="1.5"
        />

        <path
          d={FRONT_ARC}
          fill="none"
          stroke="url(#nf-orbit)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <g clipPath="url(#nf-front)">
          <Satellite className={styles.satellite} />
        </g>
      </g>
    </svg>
  );
}
