const GATED_PATH = /^\/(?:uploads\/.+|case-studies\/[a-z0-9-]+\.html)$/;

/** Adds the visitor's unlock token to files the server will not serve anonymously. */
export function withAssetAccess(url: string, token: string | null | undefined) {
  if (!token || !url) return url;

  let pathname = url;
  try {
    pathname = new URL(url, 'http://assets.local').pathname;
  } catch {
    return url;
  }
  if (!GATED_PATH.test(pathname)) return url;

  const hashAt = url.indexOf('#');
  const hash = hashAt >= 0 ? url.slice(hashAt) : '';
  const withoutHash = hashAt >= 0 ? url.slice(0, hashAt) : url;
  if (/[?&]access=/.test(withoutHash)) return url;
  const join = withoutHash.includes('?') ? '&' : '?';
  return `${withoutHash}${join}access=${encodeURIComponent(token)}${hash}`;
}

/** Points upload URLs inside an HTML export at the same file grant. Data URIs stay untouched. */
export function rewriteUploadUrls(html: string, token: string) {
  if (!token) return html;
  const encoded = encodeURIComponent(token);
  const add = (url: string) => {
    if (!url.startsWith('/uploads/') || /[?&]access=/.test(url)) return url;
    return `${url}${url.includes('?') ? '&' : '?'}access=${encoded}`;
  };
  return html
    .replace(
      /(\s(?:src|href|poster)\s*=\s*["'])([^"']+)(["'])/gi,
      (_, before, url, after) => `${before}${add(url)}${after}`,
    )
    .replace(
      /url\(\s*(['"]?)(\/uploads\/[^)'"]+)\1\s*\)/gi,
      (_, quote, url) => `url(${quote}${add(url)}${quote})`,
    );
}
