'use server';

import { updateTag } from 'next/cache';
import { CONTENT_TAG } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/** Lets an admin save show up on the public site at once instead of after the cache window. */
export async function refreshSiteContent(token: string | null) {
  if (!token) return;
  // Server actions are public endpoints, so only a token the backend accepts may purge the cache.
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (res.ok) updateTag(CONTENT_TAG);
}
