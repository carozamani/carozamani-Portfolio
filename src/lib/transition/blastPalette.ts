export type Rgb = readonly [number, number, number];

export type BlastPalette = {
  /** A spark at its hottest. */
  core: Rgb;
  /** A spark as it cools. */
  primary: Rgb;
  /** A spark about to go out. */
  secondary: Rgb;
  /** A fragment once it has gone dark. */
  ash: Rgb;
};

/**
 * The blast is plain black, white and grey: sparks cool from white to grey as they die, with no
 * brand colour tinting the screen.
 */
export const BLAST_PALETTE: BlastPalette = {
  core: [255, 255, 255],
  primary: [226, 228, 234],
  secondary: [128, 131, 140],
  ash: [24, 24, 26],
};

export const rgbCss = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;
