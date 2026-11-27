/**
 * Lets code outside the link handler, such as the language switch, play the page transition.
 * PageTransition registers a runner while it is mounted; `runTransition` hands it the change to make
 * under the black screen.
 */

/** Plays the transition around `start`. Returns false when it declines to play. */
export type TransitionRunner = (start: () => void) => boolean;

let runner: TransitionRunner | null = null;

export function registerTransitionRunner(next: TransitionRunner): () => void {
  runner = next;
  return () => {
    if (runner === next) runner = null;
  };
}

/**
 * Covers the screen, runs `start`, and clears the black once the route or language it changes has
 * arrived. Returns false when there is no transition to play (it is not mounted, or the page is the
 * admin panel), so the caller can make the change without one.
 */
export function runTransition(start: () => void): boolean {
  return runner ? runner(start) : false;
}
