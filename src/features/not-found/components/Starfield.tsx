import clsx from 'clsx';
import { createStarShadows } from '../lib/starfield';
import styles from './Starfield.module.css';

const shadows = createStarShadows();

export function Starfield() {
  return (
    <div className={styles.field} aria-hidden="true">
      <div className={clsx(styles.layer, styles.far)} style={{ boxShadow: shadows.far }} />
      <div className={clsx(styles.layer, styles.mid)} style={{ boxShadow: shadows.mid }} />
      <div className={clsx(styles.layer, styles.near)} style={{ boxShadow: shadows.near }} />
      <span className={styles.meteor} />
      <span className={clsx(styles.meteor, styles.meteorLate)} />
    </div>
  );
}
