/** A two-digit counter in the digits of the language: 3 gives "03", and "۰۳" in Persian. */
export function formatIndex(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);
}
