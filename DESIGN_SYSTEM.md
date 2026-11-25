# Design System

Source of truth for the design tokens and reusable UI primitives used across this project. Components are styled with CSS Modules and native CSS Custom Properties. Tailwind 4 is installed as well (`@import 'tailwindcss'` in `globals.css`): its utility classes handle layout in the shared components, the UI primitives and the admin panel. Either way every visual (color, spacing, radius, shadow, type scale) should come from a token below; a new hardcoded value in a component is a bug, not a shortcut.

## Token files

All tokens live in `src/styles/` and are imported once in `src/app/layout.tsx`:

```
typography.css   →  type scale (.h1–.h6, .body1/2, .caption, .overline, .button)
colors.css        →  color tokens + gradients + border/shadow composites
shadows.css        →  elevation
shapes.css          →  border radius
spacing.css          →  fluid spacing scale
motion.css        →  durations, easing curves, composed transitions
depth.css         →  scroll-linked 3D (see "Depth" below)
lenis.css         →  the rules Lenis needs (see "Scrolling" below)
```

## Color tokens

| Token                                                                                                                                 | Value                        | Use for                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `--color-text-primary`                                                                                                                | `hsl(0 0% 100%)`             | primary text, headings                                                         |
| `--color-text-secondary`                                                                                                              | `hsla(0 0% 100% / 0.6)`      | secondary/supporting text                                                      |
| `--color-text-muted`                                                                                                                  | `hsla(0 0% 100% / 0.4)`      | disabled/tertiary text                                                         |
| `--color-icon-primary`                                                                                                                | `hsl(0 0% 100%)`             | default icon fill                                                              |
| `--color-icon-progress` / `-bg`                                                                                                       | cyan @ 100%/30%              | podcast progress ring                                                          |
| `--color-brand-primary-hsl`                                                                                                           | `hsl(195 100% 50%)`          | brand accent (deep sky blue)                                                   |
| `--color-brand-secondary-hsl`                                                                                                         | `hsl(196 100% 23%)`          | brand accent, darker                                                           |
| `--color-neon-primary`                                                                                                                | `hsl(184 100% 50%)`          | the neon-cyan accent used for focus states, form field borders, CTA highlights |
| `--color-neon-secondary`                                                                                                              | `hsl(265 100% 50%)`          | secondary neon accent (violet)                                                 |
| `--color-bg-canvas`                                                                                                                   | `hsl(233 100% 5%)`           | page background                                                                |
| `--color-bg-canvas-alt`                                                                                                               | `hsl(235 33% 7%)`            | secondary background (glow gradients)                                          |
| `--color-bg-elevated`                                                                                                                 | `hsl(0 0% 12%)`              | raised surface (near-black)                                                    |
| `--color-bg-card-dark`                                                                                                                | `hsl(240 39% 12%)`           | dark navy card surface                                                         |
| `--image-border-color`                                                                                                                | `rgba(0 217 255 / .877)`     | hover border on cards/buttons                                                  |
| `--card-border-color`                                                                                                                 | `rgba(0 110 255 / .322)`     | default card border color                                                      |
| `--card-border-md` / `-xl`                                                                                                            | composite `border` shorthand | apply directly as `border: var(--card-border-md);`                             |
| `--drop-shadow`                                                                                                                       | `hsla(212 100% 50% / .6)`    | glow color used in `box-shadow`                                                |
| `--hero-bg-gradient`, `--card-bg-gradiant`, `--tag-bg-gradiant`, `--card-bg-circle-gradiant`, `--grid-pattern`, `--grid-pattern-card` | composite gradients          | large decorative backgrounds                                                   |

**Rule:** never write `#hex` or a raw `rgb()/rgba()` solid color in a `.module.css` file. If the exact value already has a token, use it. If it's a genuinely new, reused color, add it to `colors.css` first — HSL format, with a comment — then consume it via `var()`. One-off alpha variants of an existing hue (e.g. a border at a different opacity) can stay as a literal `hsla()`/`rgba()` using that hue's known HSL values, but must not be written as `#hex`.

## Spacing scale (`spacing.css`)

Fluid, `clamp()`-based — scales automatically between mobile and desktop, no manual breakpoint overrides needed for edge gutters.

| Token         | Range   | Use for                                                                                                                               |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--space-xs`  | 4–8px   | tight inline gaps                                                                                                                     |
| `--space-s`   | 8–16px  | icon-to-label gaps                                                                                                                    |
| `--space-m`   | 16–32px | card internal padding                                                                                                                 |
| `--space-l`   | 24–48px | **standard horizontal section gutter** (`padding-inline` on every top-level section)                                                  |
| `--space-xl`  | 32–64px | **standard vertical section padding** (`padding-block` on every top-level section — this is what gives every section the same rhythm) |
| `--space-xxl` | 48–96px | large hero-scale spacing (rarely needed once xl is used for sections)                                                                 |

**Rule:** every top-level page section (`HeroSection`, `AboutMe.section`, `QuantumCarousel`, `MediaSection`, `ContactSection`) uses `padding: var(--space-xl) var(--space-l);` and `min-height: 100vh`. Don't invent a new vertical/horizontal padding value for a new section — reuse this pair.

## Radius scale (`shapes.css`)

| Token                               | Value                     |
| ----------------------------------- | ------------------------- |
| `--radius-full` / `--radius-slider` | `9999px` (pills, avatars) |

Individual components also define their own local radius (`--card-radius`, `--button-radius`, `--icon-radius`) scoped to their own root class — see "CSS custom property scoping" below.

## Elevation (`shadows.css`)

| Token               | Value                                             |
| ------------------- | ------------------------------------------------- |
| `--card-box-shadow` | `0 0 25px` cyan glow `, inset 0 0 20px` cyan glow | the one shared card elevation token |

Most components instead build their glow directly from `--drop-shadow` (`box-shadow: 0 0 <size>px var(--drop-shadow)`), which is the more common pattern in this codebase — prefer it for new glow/hover effects over inventing a new color.

## Typography (`typography.css` + `Typography.component.tsx`)

Don't write raw `font-size`/`font-weight` in a component. Use the `TypographyComponent`:

```tsx
<TypographyComponent variant="h2" color="text-primary">Section title</TypographyComponent>
<TypographyComponent variant="body2" color="text-secondary" ellipsis>Supporting copy…</TypographyComponent>
```

Variants: `h1`–`h6`, `subtitle1`, `subtitle2`, `body1`, `body2`, `caption`, `overline`, `button`.
Colors: `text-primary`, `text-secondary`, `text-disabled` (also accepts the shared `ColorType` union).
Props: `ellipsis` (truncate with `…`), `id` (forwarded to the underlying `div`), `className` (merged in).

## CSS custom property scoping

A component-local design token (e.g. a card's own `--card-radius`) must be declared **on that component's actual rendered root class**, never on a bare `:root` inside a `.module.css` file — CSS Modules only namespaces class _selectors_, not `:root`, so a `:root { --x: … }` block leaks the variable globally and can silently collide with an identically-named variable in an unrelated component. Pattern:

```css
/* ✅ correct — scoped to this component's own root */
.cardContainer {
  --card-radius: 1.5rem;
  border-radius: var(--card-radius);
}

/* ❌ wrong — leaks globally, can collide with another file's --card-radius */
:root {
  --card-radius: 1.5rem;
}
.cardContainer {
  border-radius: var(--card-radius);
}
```

## Standard components

| Component             | Path                                | Variants / key props                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TypographyComponent` | `components/ui/typography`          | see above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `CtaComponent`        | `components/ui/Cta`                 | the canonical button/link. `as`, `href`, `download`, `Icon`, `iconPosition` (`left`\|`right`), `iconHasBg`, `iconGradientFrom`/`-To`, `fullWidth`, `fullWidthMobile`, `loading`, `disabled`. **Every button-shaped element in the app should render through this component** — don't hand-roll a new `<button>`/`<a>` with its own padding/border/glow. If you need a decorative wrapper around it (e.g. a floating glow blob), wrap `CtaComponent` — don't reimplement it (see `about-me/blocks/cta-block` for the pattern: a thin wrapper that renders `<CtaComponent>` inside a glow div). |
| `FormFields`          | `components/ui/form-fields`         | `variant`: `text` \| `email` \| `textarea`, `label`, `required`, `rows`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `SocialIcons`         | `components/ui/button/social-media` | `items: {type, href, color}[]`, `bordered`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Card` (media)        | `components/ui/Media/card`          | podcast/article card with inline audio player; not a generic card — purpose-built for `MediaSection`/`MediaListPage`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Depth (scroll-linked 3D, `styles/depth.css`)

Landing sections and their blocks lean in from depth as they scroll into view. Pure CSS (scroll-driven animations on the individual `rotate` / `translate` / `scale` properties), so it composes with `Reveal`'s `transform` and ships no JavaScript. Where scroll-driven animations aren't supported, or the visitor prefers reduced motion, the flat `Reveal` is all they get.

| Token                 | Default  | Use for                                                               |
| --------------------- | -------- | --------------------------------------------------------------------- |
| `--depth-perspective` | `1200px` | the `perspective` set on the **parent** of anything with `data-depth` |
| `--depth-tilt`        | `12deg`  | how far a plane leans back while it enters (`8deg` on phones)         |
| `--depth-recede`      | `120px`  | how far back it sinks (`72px` on phones)                              |
| `--depth-swing`       | `18deg`  | door-swing angle for blocks in a two-column layout                    |
| `--depth-dir`         | `1`      | flips to `-1` under `dir="rtl"` so swings open from the correct side  |

| `data-depth`                | Where                            | Effect                                                                               |
| --------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| `stage`                     | `AnimatedSection` (default)      | whole section leans in, sits flat while it fills the screen, sinks back as it leaves |
| `unfold`                    | `AnimatedSection depth="unfold"` | last section only: opens from its bottom edge and stays open                         |
| `rise`                      | `Reveal depth="rise"`            | a block tips forward out of the distance                                             |
| `swing-start` / `swing-end` | `Reveal depth="swing-*"`         | a block swings open on its inner edge (stacks to `rise` below 64rem)                 |

Below 64rem (stacked layouts, sections several screens tall) `stage` and `unfold` switch off and only the individual blocks lean in.

Rules: put `perspective: var(--depth-perspective)` on the direct parent (a feature's own `.module.css`); no ancestor of a `data-depth` element may use `overflow: hidden` (use `overflow: clip`), because the scroll timeline binds to the nearest scroll container; don't put `data-depth` on a `display: contents` element. The hero's scroll-out (layers flying past the camera, the grid laying back into a floor) is feature-local in `HeroModule.module.css` and reads the same tokens.

## Scrolling (`SmoothScroll`, `lib/scroll/`)

Inertial page scrolling comes from Lenis. `components/shared/SmoothScroll.tsx` is mounted once in `layout.tsx` and renders nothing; `styles/lenis.css` holds the rules the library needs (copied from lenis@1.3.27, so re-copy them when upgrading).

**Where it runs.** Only on `/`, `/articles` and `/case-studies`, decided by `isSmoothScrollRoute` in `lib/scroll/smoothScrollRoutes.ts` (exact matches, tested). Everything else keeps native scrolling:

- `/case-studies/[slug]`: `HtmlEmbed` stretches iframes over the full page height, a wheel event over an iframe never reaches Lenis, and `lenis.css` switches iframe pointer events off while it smooths. Scrolling there would flip between smooth and native mid-page.
- `/articles/[slug]` and the admin panel.

**Reduced motion and touch.** Visitors who prefer reduced motion never get a Lenis instance, and it is created or torn down immediately if they change the setting while the page is open. Touch devices keep native momentum.

**Programmatic scrolling goes through `scrollToTarget`** (`lib/scroll/scrollEngine.ts`), never `window.scrollTo` or `scrollIntoView` directly. It takes a pixel offset, a selector or an element, plus `{ offset, immediate }`, and uses Lenis when it is running, the browser's smooth scroll when it is not, and an instant jump for reduced motion. It returns a Promise that resolves when the scroll lands **or at a deadline**, because Lenis never calls `onComplete` when a wheel or touch gesture interrupts the animation; anything that locks UI while a scroll runs (the `GlassMenu` observer) must wait on that promise, not on a fixed timeout. `GlassMenu`, `HeroModule` and `PageScrollbar` use it. `BackToTop` and `CaseImageNav` use the browser's smooth scroll on purpose: they only exist on the case-study detail pages, where Lenis is off.

## Page sky (`PageStarfield`, `lib/gl/`)

The stars are one fixed WebGL canvas behind the whole landing page (`/` only), mounted once in `layout.tsx`. `<main>` stacks above it, so every section and box sits in front of the same sky; sections must stay transparent (no `--color-page-bg` fill on a section wrapper) or they hide it. The hero's planet canvas is transparent around the planet for the same reason.

- The stars drift on their own and trail the page while it scrolls (`scrollParallax` in `data/starfieldBackdrop.ts`).
- The sky dims evenly with scroll progress down the document, from full at the top to `dim.floor` at the bottom (`skyBrightness`, applied in the shader as `uDim`).
- Reduced motion keeps the sky still but still dims it. `createQualityGovernor` lowers the resolution on slow GPUs.

## Known debt (not yet unified)

- `QuantumCarousel`'s feature cards (`.featureItem`) and the media `Card` component both implement their own "glass panel" look (border + blur + glow) independently rather than sharing a `.glassPanel` base class. Low priority — they serve different content shapes (audio player vs. static feature card) — but worth extracting if a third card type is added.
- `case-studies/card/card.module.css` (`FeatureCard`) is currently unused dead code, kept token-consistent but not wired into any page.
