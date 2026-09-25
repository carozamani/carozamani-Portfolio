import { adminMessages, adminStats } from '@/data/admin';
import styles from './Admin.module.css';

export function DashboardModule() {
  return (
    <>
      <h1 className={styles.h1}>Dashboard</h1>
      <div className={styles.stats}>
        {adminStats.map(({ label, value }) => (
          <div key={label} className={styles.stat}>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>
      <section aria-labelledby="recent">
        <h2 id="recent" className={styles.rowTitle}>
          Recent messages
        </h2>
        <div className={styles.panel}>
          {adminMessages.map((m) => (
            <div key={m.id} className={styles.row}>
              <div className={styles.rowMain}>
                <span className={`${styles.rowTitle} ${m.read ? '' : styles.unread}`}>
                  {m.name}
                </span>
                <span className={styles.rowText}>{m.message}</span>
              </div>
              <span className={styles.rowMeta}>{m.date}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
