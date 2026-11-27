import { describe, expect, it } from 'vitest';

import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('takes one letter from each of the first two words', () => {
    expect(getInitials('Sara Moradi')).toBe('SM');
    expect(getInitials('Mary Jane Watson')).toBe('MJ');
  });

  it('works for a single word and for extra spaces', () => {
    expect(getInitials('Caro')).toBe('C');
    expect(getInitials('  Sara   Moradi  ')).toBe('SM');
  });

  it('works for Persian names', () => {
    expect(getInitials('سارا مرادی')).toBe('سم');
  });

  it('does not split a letter that takes two code units', () => {
    expect(getInitials('😀 Smile')).toBe('😀S');
  });

  it('gives nothing for an empty name', () => {
    expect(getInitials('   ')).toBe('');
  });
});
