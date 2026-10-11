'use client';

import { useCallback, useEffect, useState } from 'react';
import { ApiError, getCaseStudyContent, unlockCaseStudy, type CaseContent } from '@/lib/api';

type Access =
  { status: 'checking' } | { status: 'locked' } | { status: 'open'; content: CaseContent | null };

const storageKey = (slug: string) => `case-access:${slug}`;

const readToken = (slug: string) => {
  try {
    return window.sessionStorage.getItem(storageKey(slug));
  } catch {
    return null;
  }
};

const writeToken = (slug: string, token: string | null) => {
  try {
    if (token) window.sessionStorage.setItem(storageKey(slug), token);
    else window.sessionStorage.removeItem(storageKey(slug));
  } catch {
    // storage can be blocked; the visitor just has to re-enter the password on reload
  }
};

/** Open case studies pass straight through; protected ones stay locked until the server accepts a password. */
export function useCaseAccess(slug: string, passwordProtected: boolean) {
  const [state, setState] = useState<{ slug: string; access: Access }>({
    slug,
    access: { status: 'checking' },
  });

  useEffect(() => {
    if (!passwordProtected) return;
    let cancelled = false;
    const settle = (access: Access) => !cancelled && setState({ slug, access });
    // Every state change happens in a promise callback, never synchronously in the effect body.
    Promise.resolve(readToken(slug))
      .then((token) => (token ? getCaseStudyContent(slug, token) : Promise.reject(new Error())))
      .then((content) => settle({ status: 'open', content }))
      .catch(() => {
        writeToken(slug, null);
        settle({ status: 'locked' });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, passwordProtected]);

  /** Resolves to true when the password was accepted, false when it was wrong. */
  const unlock = useCallback(
    async (password: string) => {
      try {
        const { token, content } = await unlockCaseStudy(slug, password);
        if (token) writeToken(slug, token);
        setState({ slug, access: { status: 'open', content } });
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) return false;
        throw error;
      }
    },
    [slug],
  );

  const access: Access = !passwordProtected
    ? { status: 'open', content: null }
    : state.slug === slug
      ? state.access
      : { status: 'checking' };

  return { access, unlock };
}
