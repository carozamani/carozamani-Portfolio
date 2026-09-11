# Design System

Source of truth for the design tokens and reusable UI primitives used across this project. Written CSS Modules + native CSS Custom Properties — no Tailwind, no external UI library. Every visual (color, spacing, radius, shadow, type scale) should come from a token below; a new hardcoded value in a component is a bug, not a shortcut.

## Token files

All tokens live in `src/app/styles/` and are imported once in `src/app/layout.tsx`:

```
typography.css   →  type scale (.h1–.h6, .body1/2, .caption, .overline, .button)
colors.css        →  color tokens + gradients + border/shadow composites
shadows.css        →  elevation
shapes.css          →  border radius
spacing.css          →  fluid spacing scale
```

## Color tokens

| Token | Value | Use for |
|---|---|---|
| `--color-text-primary` | `hsl(0 0% 100%)` | primary text, headings |
| `--color-text-secondary` | `hsla(0 0% 100% / 0.6)` | secondary/supporting text |
| `--color-text-muted` | `hsla(0 0% 100% / 0.4)` | disabled/tertiary text |
| `--color-icon-primary` | `hsl(0 0% 100%)` | default icon fill |
| `--color-icon-progress` / `-bg` | cyan @ 100%/30% | podcast progress ring |
| `--color-brand-primary-hsl` | `hsl(195 100% 50%)` | brand accent (deep sky blue) |
| `--color-brand-secondary-hsl` | `hsl(196 100% 23%)` | brand accent, darker |
| `--color-neon-primary` | `hsl(184 100% 50%)` | the neon-cyan accent used for focus states, form field borders, CTA highlights |
| `--color-neon-secondary` | `hsl(265 100% 50%)` | secondary neon accent (violet) |
| `--color-bg-canvas` | `hsl(233 100% 5%)` | page background |
| `--color-bg-canvas-alt` | `hsl(235 33% 7%)` | secondary background (glow gradients) |
| `--color-bg-elevated` | `hsl(0 0% 12%)` | raised surface (near-black) |
| `--color-bg-card-dark` | `hsl(240 39% 12%)` | dark navy card surface |
| `--image-border-color` | `rgba(0 217 255 / .877)` | hover border on cards/buttons |
| `--card-border-color` | `rgba(0 110 255 / .322)` | default card border color |
| `--card-border-md` / `-xl` | composite `border` shorthand | apply directly as `border: var(--card-border-md);` |
| `--drop-shadow` | `hsla(212 100% 50% / .6)` | glow color used in `box-shadow` |
| `--hero-bg-gradient`, `--card-bg-gradiant`, `--tag-bg-gradiant`, `--card-bg-circle-gradiant`, `--grid-pattern`, `--grid-pattern-card` | composite gradients | large decorative backgrounds |

**Rule:** never write `#hex` or a raw `rgb()/rgba()` solid color in a `.module.css` file. If the exact value already has a token, use it. If it's a genuinely new, reused color, add it to `colors.css` first — HSL format, with a comment — then consume it via `var()`. One-off alpha variants of an existing hue (e.g. a border at a different opacity) can stay as a literal `hsla()`/`rgba()` using that hue's known HSL values, but must not be written as `#hex`.

## Spacing scale (`spacing.css`)

Fluid, `clamp()`-based — scales automatically between mobile and desktop, no manual breakpoint overrides needed for edge gutters.

| Token | Range | Use for |
|---|---|---|
| `--space-xs` | 4–8px | tight inline gaps |
| `--space-s` | 8–16px | icon-to-label gaps |
| `--space-m` | 16–32px | card internal padding |
| `--space-l` | 24–48px | **standard horizontal section gutter** (`padding-inline` on every top-level section) |
| `--space-xl` | 32–64px | **standard vertical section padding** (`padding-block` on every top-level section — this is what gives every section the same rhythm) |
| `--space-xxl` | 48–96px | large hero-scale spacing (rarely needed once xl is used for sections) |

**Rule:** every top-level page section (`HeroSection`, `AboutMe.section`, `QuantumCarousel`, `MediaSection`, `ContactSection`) uses `padding: var(--space-xl) var(--space-l);` and `min-height: 100vh`. Don't invent a new vertical/horizontal padding value for a new section — reuse this pair.

## Radius scale (`shapes.css`)

| Token | Value |
|---|---|
| `--radius-full` / `--radius-slider` | `9999px` (pills, avatars) |

Individual components also define their own local radius (`--card-radius`, `--button-radius`, `--icon-radius`) scoped to their own root class — see "CSS custom property scoping" below.

## Elevation (`shadows.css`)

| Token | Value |
|---|---|
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

A component-local design token (e.g. a card's own `--card-radius`) must be declared **on that component's actual rendered root class**, never on a bare `:root` inside a `.module.css` file — CSS Modules only namespaces class *selectors*, not `:root`, so a `:root { --x: … }` block leaks the variable globally and can silently collide with an identically-named variable in an unrelated component. Pattern:

```css
/* ✅ correct — scoped to this component's own root */
.cardContainer {
  --card-radius: 1.5rem;
  border-radius: var(--card-radius);
}

/* ❌ wrong — leaks globally, can collide with another file's --card-radius */
:root { --card-radius: 1.5rem; }
.cardContainer { border-radius: var(--card-radius); }
```

## Standard components

| Component | Path | Variants / key props |
|---|---|---|
| `TypographyComponent` | `components/ui/typography` | see above |
| `CtaComponent` | `components/ui/Cta` | the canonical button/link. `as`, `href`, `download`, `Icon`, `iconPosition` (`left`\|`right`), `iconHasBg`, `iconGradientFrom`/`-To`, `fullWidth`, `fullWidthMobile`, `loading`, `disabled`. **Every button-shaped element in the app should render through this component** — don't hand-roll a new `<button>`/`<a>` with its own padding/border/glow. If you need a decorative wrapper around it (e.g. a floating glow blob), wrap `CtaComponent` — don't reimplement it (see `about-me/blocks/cta-block` for the pattern: a thin wrapper that renders `<CtaComponent>` inside a glow div). |
| `FormFields` | `components/ui/form-fields` | `variant`: `text` \| `email` \| `textarea`, `label`, `required`, `rows` |
| `SocialIcons` | `components/ui/button/social-media` | `items: {type, href, color}[]`, `bordered` |
| `Card` (media) | `components/ui/Media/card` | podcast/article card with inline audio player; not a generic card — purpose-built for `MediaSection`/`MediaListPage` |

## Known debt (not yet unified)

- `QuantumCarousel`'s feature cards (`.featureItem`) and the media `Card` component both implement their own "glass panel" look (border + blur + glow) independently rather than sharing a `.glassPanel` base class. Low priority — they serve different content shapes (audio player vs. static feature card) — but worth extracting if a third card type is added.
- `case-studies/card/card.module.css` (`FeatureCard`) is currently unused dead code, kept token-consistent but not wired into any page.
