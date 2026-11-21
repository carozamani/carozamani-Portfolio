import { readFile } from 'node:fs/promises';
import { join, normalize, sep } from 'node:path';
import { NextResponse } from 'next/server';
import { rewriteUploadUrls } from '@/features/case-studies/lib/assetUrl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROOT = join(process.cwd(), 'private', 'case-studies');
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

type Policy = { access?: string; embedToken?: string | null };

function denied() {
  return new NextResponse('Access denied', {
    status: 403,
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/** Serves the shipped case-study HTML after the API decides whether the password still applies. */
export async function GET(request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  if (!/^[a-z0-9-]+\.html$/.test(file)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const full = normalize(join(ROOT, file));
  if (!full.startsWith(normalize(ROOT + sep))) {
    return new NextResponse('Not found', { status: 404 });
  }

  const incoming = new URL(request.url);
  const policyUrl = new URL(`${API_URL}/case-studies/asset-policy`);
  policyUrl.searchParams.set('path', `/case-studies/${file}`);
  const access = incoming.searchParams.get('access');
  if (access) policyUrl.searchParams.set('access', access);

  const headers = new Headers();
  const cookie = request.headers.get('cookie');
  const authorization = request.headers.get('authorization');
  if (cookie) headers.set('cookie', cookie);
  if (authorization) headers.set('authorization', authorization);

  let policy: Policy;
  try {
    const res = await fetch(policyUrl, { headers, cache: 'no-store' });
    if (res.status === 403) return denied();
    if (!res.ok) {
      return new NextResponse('The case study file is unavailable.', { status: 502 });
    }
    policy = (await res.json()) as Policy;
  } catch {
    return new NextResponse('The case study file is unavailable.', { status: 502 });
  }

  let html: string;
  try {
    html = await readFile(full, 'utf8');
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  if (policy.embedToken) html = rewriteUploadUrls(html, policy.embedToken);
  const isPublic = policy.access === 'public';

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Direct visits must not run this export as the portfolio origin.
      'Content-Security-Policy': 'sandbox allow-scripts allow-popups',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': isPublic ? 'private, max-age=3600' : 'private, no-store',
    },
  });
}
