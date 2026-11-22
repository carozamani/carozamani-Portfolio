import { describe, expect, it } from 'vitest';
import { formatProjectYear } from './formatProjectYear';

describe('formatProjectYear', () => {
  it('shows Gregorian years in English', () => {
    expect(formatProjectYear('2026', 'en')).toBe('2026');
    expect(formatProjectYear('1404', 'en')).toBe('2025');
    expect(formatProjectYear('۱۴۰۵', 'en')).toBe('2026');
  });

  it('shows Jalali years with Persian digits in Farsi', () => {
    expect(formatProjectYear('2026', 'fa')).toBe('۱۴۰۵');
    expect(formatProjectYear('1404', 'fa')).toBe('۱۴۰۴');
    expect(formatProjectYear('۱۴۰۵', 'fa')).toBe('۱۴۰۵');
  });

  it('passes through empty or non-year values', () => {
    expect(formatProjectYear(undefined, 'en')).toBe('');
    expect(formatProjectYear('n/a', 'fa')).toBe('n/a');
  });
});
