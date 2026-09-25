'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { adminMessages } from '@/data/admin';
import styles from './Admin.module.css';

type Filter = 'all' | 'unread';

export function MessagesModule() {
  const [messages, setMessages] = useState(adminMessages);
  const [filter, setFilter] = useState<Filter>('all');

  const visible = filter === 'unread' ? messages.filter((m) => !m.read) : messages;

  const toggleRead = (id: string) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: !m.read } : m)));
  const remove = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id));

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.h1}>Messages</h1>
        <div className={styles.filters}>
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={clsx(styles.chip, filter === f && styles.chipActive)}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.panel}>
        {visible.length === 0 && (
          <div className={styles.row}>
            <span className={styles.rowText}>No messages.</span>
          </div>
        )}
        {visible.map((m) => (
          <div key={m.id} className={styles.row}>
            <div className={styles.rowMain}>
              <span className={clsx(styles.rowTitle, !m.read && styles.unread)}>
                {m.name} · <span className={styles.rowMeta}>{m.email}</span>
              </span>
              <span className={styles.rowText}>{m.message}</span>
              <span className={styles.rowMeta}>{m.date}</span>
            </div>
            <div className={styles.actions}>
              <a className={styles.chip} href={`mailto:${m.email}`}>
                Reply
              </a>
              <button type="button" className={styles.chip} onClick={() => toggleRead(m.id)}>
                {m.read ? 'Mark unread' : 'Mark read'}
              </button>
              <button
                type="button"
                className={clsx(styles.chip, styles.danger)}
                onClick={() => remove(m.id)}
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
