// Big enough for the portrait at 2x on a large screen; a power of two so the texture can be mip-mapped
const FACE_SIZE = 512;

const hasPixels = (image: HTMLImageElement) => image.complete && image.naturalWidth > 0;

/**
 * Draws a face image that the page already loaded (the HTML portrait and logo) into a square canvas the
 * renderer can upload, so WebGL costs no extra request and the HTML images stay the single source of
 * truth. Resolves null when the image could not be loaded.
 */
export async function rasterizeFace(image: HTMLImageElement) {
  if (!hasPixels(image)) {
    // Finished loading without pixels: the file is missing or broken
    if (image.complete) return null;
    const loaded = await new Promise<boolean>((resolve) => {
      image.addEventListener('load', () => resolve(true), { once: true });
      image.addEventListener('error', () => resolve(false), { once: true });
    });
    if (!loaded) return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = FACE_SIZE;
  canvas.height = FACE_SIZE;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, FACE_SIZE, FACE_SIZE);
  return canvas;
}
