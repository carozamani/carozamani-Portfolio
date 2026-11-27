import type { EarthHorizonConfig, Rgb } from '@/data/earthHorizon';

// A real limb is not one colour at three brightnesses. Seen edge-on from orbit the air is thinnest and
// brightest at the very edge, where the light has crossed the most atmosphere and washes out to a
// pale, almost white blue; a little higher it is a clear sky blue, and the wide halo above fades
// through deep royal blue into black. The deep layer is the menu's active blue (rgb(0, 81, 255)),
// pushed above 1.0 on the blue channel because the shader weights and tone-maps it down again.
const HORIZON_LAYERS: { deep: Rgb; core: Rgb; hot: Rgb } = {
  /** Wide halo above the limb: royal blue, the same hue as the active menu border (--color-secondary) */
  deep: [0.0, 0.4, 1.45],
  /** Tight shoulder just above the line: brighter, lighter sky blue */
  core: [0.18, 0.62, 1.3],
  /** The thin line on the limb itself: pale blue-white */
  hot: [0.62, 0.86, 1.0],
};

export function resolveEarthHorizonConfig(config: EarthHorizonConfig): EarthHorizonConfig {
  return {
    ...config,
    colors: {
      ...config.colors,
      ...HORIZON_LAYERS,
    },
  };
}
