/**
 * Copies the sky as it looks right now onto a 2D canvas, scaled to `width` x `height`. Returns false
 * when there is no sky to copy (no WebGL, or a route that has none).
 */
export type StarfieldSnapshot = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => boolean;

let current: StarfieldSnapshot | null = null;

/**
 * The page-wide sky registers itself here so other layers, such as the page transition, can paint
 * the same stars without owning the WebGL canvas. Returns the function that unregisters it.
 */
export function registerStarfieldSnapshot(snapshot: StarfieldSnapshot) {
  current = snapshot;
  return () => {
    if (current === snapshot) current = null;
  };
}

export const snapshotStarfield: StarfieldSnapshot = (ctx, width, height) =>
  current?.(ctx, width, height) ?? false;
