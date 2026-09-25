'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { caseStudies } from '@/data/caseStudies';
import styles from './Admin.module.css';

export function CaseStudiesAdminModule() {
  const [items, setItems] = useState(caseStudies);

  const remove = (slug: string) => {
    setItems((prev) => prev.filter((c) => c.slug !== slug));
    toast.success('Case study removed (demo).');
  };

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Case Studies</h1>
        <Button text="New case study" onClick={() => toast('Editor coming soon.')} />
      </div>
      <div className={styles.panel}>
        {items.map((c) => (
          <div key={c.slug} className={styles.row}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>{c.title}</span>
              <span className={styles.rowText}>
                {c.tag} · {c.year}
              </span>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.chip}
                onClick={() => toast('Editor coming soon.')}
              >
                Edit
              </button>
              <button
                type="button"
                className={clsx(styles.chip, styles.danger)}
                onClick={() => remove(c.slug)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
