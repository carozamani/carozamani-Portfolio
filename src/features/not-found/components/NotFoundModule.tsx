import type { CSSProperties } from 'react';
import { getDictionary } from '@/lib/i18n/server';
import { NotFoundActions } from './NotFoundActions';
import { NotFoundStage } from './NotFoundStage';
import { Numeral } from './Numeral';
import { Starfield } from './Starfield';
import styles from './NotFoundModule.module.css';

// Position in the entrance sequence; CSS turns it into a delay
const step = (index: number): CSSProperties & Record<'--step', number> => ({ '--step': index });

export async function NotFoundModule() {
  const { notFound } = await getDictionary();

  return (
    <NotFoundStage>
      <Starfield />
      <div className={styles.content}>
        <Numeral />

        <div className={styles.copy}>
          <h1 className={styles.title} style={step(0)}>
            {notFound.title}
          </h1>
          <p className={styles.text} style={step(1)}>
            {notFound.text}
          </p>
          <div className={styles.actionsRow} style={step(2)}>
            <NotFoundActions />
          </div>
        </div>
      </div>
    </NotFoundStage>
  );
}
