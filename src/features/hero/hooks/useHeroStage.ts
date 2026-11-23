import { useEffect, type RefObject } from 'react';

import { heroStageConfig, type StageLayerConfig, type StageLayerName } from '@/data/heroStage';

import { createHeroStage, type HeroStage } from '../lib/createHeroStage';
import { layerPose, type StageState } from '../lib/stageMath';

interface TrackedElement {
  element: HTMLElement;
  transform: string;
  opacity: string;
  interactive: boolean;
}

interface TrackedLayer extends TrackedElement {
  config: StageLayerConfig;
}

const isLayerName = (name: string | undefined): name is StageLayerName =>
  name !== undefined && name in heroStageConfig.layers;

const track = (element: HTMLElement): TrackedElement => ({
  element,
  transform: '',
  opacity: '',
  interactive: true,
});

function write(tracked: TrackedElement, transform: string, opacity: string) {
  // Skips the style write on frames where nothing visible changed
  if (tracked.transform !== transform) {
    tracked.element.style.transform = transform;
    tracked.transform = transform;
  }
  if (tracked.opacity !== opacity) {
    tracked.element.style.opacity = opacity;
    tracked.opacity = opacity;
    const interactive = Number(opacity) > 0.02;
    if (tracked.interactive !== interactive) {
      tracked.element.style.pointerEvents = interactive ? '' : 'none';
      tracked.interactive = interactive;
    }
  }
}

function release(tracked: TrackedElement) {
  tracked.element.style.transform = '';
  tracked.element.style.opacity = '';
  tracked.element.style.pointerEvents = '';
  tracked.transform = '';
  tracked.opacity = '';
  tracked.interactive = true;
}

/**
 * Drives the hero's camera. The pointer turns the view, which slides the background (the planet) so the
 * scene looks where the pointer points; the HTML layers never follow the pointer. The scroll position flies
 * the lens forward, magnifying and fading each layer as it passes. The planet and the portrait read the same
 * stage from `stageRef`, so the DOM and WebGL halves of the hero move as one scene. Layers opt in with
 * `data-stage-layer`. The grid floor (`data-stage-grid`) is plain CSS and is not driven from here: it stays
 * put regardless of scroll or pointer position.
 */
export function useHeroStage(
  sectionRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HeroStage | null>,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !heroStageConfig.enabled) return;

    const config = heroStageConfig;
    const stage = createHeroStage(config);
    stageRef.current = stage;

    const layers: TrackedLayer[] = [];
    section.querySelectorAll<HTMLElement>('[data-stage-layer]').forEach((element) => {
      const name = element.dataset.stageLayer;
      if (isLayerName(name)) layers.push({ ...track(element), config: config.layers[name] });
    });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId = 0;
    let visible = true;

    // Layers fly towards the middle of the hero, so each one scales about that point rather than its own
    // centre. offsetLeft/offsetTop ignore transforms, so the fly-past cannot skew the measurement.
    const measure = () => {
      stage.setViewport({
        width: section.clientWidth,
        height: section.clientHeight,
        top: section.getBoundingClientRect().top + window.scrollY,
      });
      for (const { element } of layers) {
        let x = 0;
        let y = 0;
        let node: HTMLElement | null = element;
        while (node && node !== section) {
          x += node.offsetLeft;
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        element.style.transformOrigin = `${section.clientWidth / 2 - x}px ${section.clientHeight / 2 - y}px`;
      }
    };

    const apply = (state: Readonly<StageState>) => {
      for (const layer of layers) {
        const pose = layerPose(layer.config, state, config.scroll.dolly);
        write(layer, `scale(${pose.scale.toFixed(4)})`, pose.opacity.toFixed(3));
      }
    };

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      apply(stage.advance(now));
    };

    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const clear = () => {
      for (const layer of layers) release(layer);
    };

    const sync = () => {
      const reduced = motionQuery.matches;
      stage.setEnabled(!reduced);
      if (reduced) {
        stop();
        clear();
      } else if (visible) {
        if (!frameId) frameId = requestAnimationFrame(tick);
      } else {
        stop();
      }
    };

    // Keep the hero camera steady: pointer movement must not change the viewing angle.
    const handleScroll = () => stage.setScroll(window.scrollY);

    measure();
    handleScroll();
    sync();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(section);
    for (const { element } of layers) resizeObserver.observe(element);
    // Web fonts can reflow the layers without resizing the section
    void document.fonts?.ready.then(measure);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    visibilityObserver.observe(section);

    window.addEventListener('scroll', handleScroll, { passive: true });
    motionQuery.addEventListener('change', sync);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      motionQuery.removeEventListener('change', sync);
      clear();
      for (const { element } of layers) element.style.transformOrigin = '';
      stageRef.current = null;
    };
  }, [sectionRef, stageRef]);
}
