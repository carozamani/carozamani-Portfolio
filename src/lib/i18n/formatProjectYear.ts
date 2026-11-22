import type { Locale } from './config';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function parseYear(raw: string): number | null {
  const normalized = raw.replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)));
  const year = Number.parseInt(normalized, 10);
  return Number.isFinite(year) ? year : null;
}

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

/** Mid-year Gregorian date → Jalali year via Intl (after Nowruz). */
function jalaliFromGregorian(gregorianYear: number): number {
  const formatted = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric' }).format(
    new Date(Date.UTC(gregorianYear, 6, 1)),
  );
  return Number.parseInt(formatted, 10);
}

/** Jalali year mid-point ≈ Gregorian year + 621. */
function gregorianFromJalali(jalaliYear: number): number {
  return jalaliYear + 621;
}

function isJalaliYear(year: number): boolean {
  return year >= 1200 && year < 1600;
}

/**
 * Project years: Gregorian for English, Jalali (Persian digits) for Farsi.
 * Accepts either calendar as input (admin stores Gregorian; some preview data is Jalali).
 */
export function formatProjectYear(year: string | undefined, locale: Locale): string {
  if (!year) return '';
  const parsed = parseYear(year);
  if (parsed === null) return year;

  if (locale === 'fa') {
    const jalali = isJalaliYear(parsed) ? parsed : jalaliFromGregorian(parsed);
    return toPersianDigits(String(jalali));
  }

  const gregorian = isJalaliYear(parsed) ? gregorianFromJalali(parsed) : parsed;
  return String(gregorian);
}
