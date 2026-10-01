'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Toaster = dynamic(() => import('sonner').then((mod) => mod.Toaster), { ssr: false });

export function LazyToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  return ready ? <Toaster richColors position="bottom-right" /> : null;
}
