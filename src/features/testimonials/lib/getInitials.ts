/** Up to two initials from a name, one per word: "Sara Moradi" gives "SM", "سارا مرادی" gives "سم". */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('');
}
