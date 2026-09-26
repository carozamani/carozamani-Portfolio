const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Persian and other non-Latin titles slugify to nothing, so fall back to a short unique id. */
export const uniqueSlug = (title: string, taken: string[]) => {
  const base = slugify(title) || `item-${Date.now().toString(36)}`;
  let slug = base;
  for (let n = 2; taken.includes(slug); n += 1) slug = `${base}-${n}`;
  return slug;
};
