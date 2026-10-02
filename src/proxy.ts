import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Serves the admin panel from admin.<domain> instead of <domain>/admin.
 * Set ADMIN_SUBDOMAIN_HOST (e.g. "admin.carozamani.com") once the domain/DNS is live;
 * until then this proxy is a no-op and /admin/* keeps working on the main host.
 */
const ADMIN_HOST = process.env.ADMIN_SUBDOMAIN_HOST;

export function proxy(request: NextRequest) {
  if (!ADMIN_HOST) return NextResponse.next();

  const host = request.headers.get('host')?.split(':')[0];
  if (host !== ADMIN_HOST) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Already an /admin/* route (e.g. a hardcoded internal Link) — let it resolve as-is.
  if (pathname.startsWith('/admin')) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|image|uploads|resume-en.pdf|resume-fa.pdf).*)',
  ],
};
