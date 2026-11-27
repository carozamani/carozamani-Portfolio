import { describe, expect, it } from 'vitest';
import { suggestRoute, type RouteCandidate } from './suggestRoute';

const candidates: RouteCandidate[] = [
  { id: 'about', terms: ['about'] },
  { id: 'projects', terms: ['projects'] },
  { id: 'media', terms: ['testimonials', 'media'] },
  { id: 'contact', terms: ['contact'] },
];

describe('suggestRoute', () => {
  it('finds a section from a typo', () => {
    expect(suggestRoute('/projcts', candidates)).toBe('projects');
    expect(suggestRoute('/conatct', candidates)).toBe('contact');
  });

  it('finds a section from a longer or singular path', () => {
    expect(suggestRoute('/about-me', candidates)).toBe('about');
    expect(suggestRoute('/contact-us/', candidates)).toBe('contact');
    expect(suggestRoute('/project', candidates)).toBe('projects');
  });

  it('matches on the last segment, whatever comes before it', () => {
    expect(suggestRoute('/old/site/projcts', candidates)).toBe('projects');
  });

  it('matches an alternate term to its own destination', () => {
    expect(suggestRoute('/media', candidates)).toBe('media');
  });

  it('suggests nothing when nothing is close', () => {
    expect(suggestRoute('/pricing', candidates)).toBeNull();
    expect(suggestRoute('/', candidates)).toBeNull();
    expect(suggestRoute('/صفحه', candidates)).toBeNull();
    expect(suggestRoute('/123', candidates)).toBeNull();
  });
});
