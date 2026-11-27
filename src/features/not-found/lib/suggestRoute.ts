export type RouteCandidate = {
  id: string;
  /** Words a visitor might type for this destination */
  terms: readonly string[];
};

// Only Latin letters can be compared: a Persian or numeric path never maps to a section
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');

function editDistance(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = row;
  }

  return previous[b.length];
}

/**
 * The destination a mistyped path most likely meant, or null when nothing is close enough to
 * suggest. Compares the last path segment, so `/en/projcts` and `/projcts/` both find Projects.
 */
export function suggestRoute(pathname: string, candidates: readonly RouteCandidate[]) {
  const segment = normalize(pathname.split('/').filter(Boolean).at(-1) ?? '');
  if (!segment) return null;

  let best: { id: string; score: number } | null = null;

  for (const { id, terms } of candidates) {
    for (const raw of terms) {
      const term = normalize(raw);
      if (!term) continue;

      const contains = segment.length >= 4 && (term.includes(segment) || segment.includes(term));
      const distance = editDistance(segment, term);
      const close = distance <= Math.max(1, Math.floor(term.length * 0.34));
      if (!contains && !close) continue;

      const score = contains ? Math.min(distance, 1) : distance;
      if (!best || score < best.score) best = { id, score };
    }
  }

  return best?.id ?? null;
}
