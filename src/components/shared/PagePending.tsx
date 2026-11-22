/**
 * Stands in for something that is still loading: while it is in the DOM, the page transition keeps its
 * black screen up (see `lib/transition/pageReady.ts`). Use it as the `loading` of a `next/dynamic`
 * block, or put `data-page-pending` on any element that stands in for unfinished content.
 */
export function PagePending() {
  return <span data-page-pending="" hidden aria-hidden="true" />;
}
