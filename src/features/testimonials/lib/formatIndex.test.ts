import { describe, expect, it } from 'vitest';
import { formatIndex } from './formatIndex';

describe('formatIndex', () => {
  it('pads to two digits in English', () => {
    expect(formatIndex(3, 'en')).toBe('03');
    expect(formatIndex(12, 'en')).toBe('12');
  });

  it('uses Persian digits in Farsi', () => {
    expect(formatIndex(3, 'fa')).toBe('۰۳');
    expect(formatIndex(12, 'fa')).toBe('۱۲');
  });

  it('does not add grouping separators', () => {
    expect(formatIndex(1234, 'en')).toBe('1234');
  });
});
