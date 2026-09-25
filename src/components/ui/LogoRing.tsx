import Image from 'next/image';
import clsx from 'clsx';
import styles from './LogoRing.module.css';

type LogoRingProps = { size?: number; className?: string };

export function LogoRing({ size = 72, className }: LogoRingProps) {
  return (
    <div className={clsx(styles.ring, className)}>
      <Image src="/image/LogoPrimary.svg" alt="" aria-hidden="true" width={size} height={size} />
    </div>
  );
}
