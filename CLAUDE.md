# Portfolio — Architecture & Coding Rules

## Stack

- **Framework:** Next.js 16 (App Router)
- **React:** 19 with React Compiler
- **Styling:** Tailwind CSS 4 + CSS Modules + CSS Custom Properties (design tokens)
- **Animation:** Framer Motion 12
- **Utilities:** clsx, react-icons, sonner
- **Path alias:** `@/*` → `./src/*`

## FSD Light Architecture

```
src/
  app/                  # Thin route shells only (layout, page, not-found)
  features/             # Business features — each portfolio section
    hero/components/
    about-me/components/
    case-studies/components/ + lib/
    media/components/ + hooks/
    contact/components/
  components/
    ui/                 # Atoms (Typography, GlassButton, CTA, AnimatedGradientText, FormFields)
    shared/             # Product composition (GlassMenu, CursorGlow, Footer, Section)
  hooks/                # Global shared hooks
  lib/                  # Shared config, providers, contexts
  types/                # Shared TypeScript types
  data/                 # Static data (case studies, media cards)
  styles/               # Design tokens (colors, typography, spacing, shadows, shapes)
```

## Architecture Rules

1. **Thin Route Shells:** `app/` pages ONLY import a feature module and render it. No business logic, no direct UI in page files.
2. **Feature Isolation:** Features MUST NOT import from other features. `features/hero/` cannot import from `features/about-me/`.
3. **Import Direction:**
   ```
   app/ → features/ → components/shared/ | components/ui/ | hooks/ | lib/ | types/ | data/
   ```
4. **Shared UI Reuse:** Reusable components live in `components/ui/` (atoms) or `components/shared/` (composition). Features use them — never duplicate.
5. **No Hardcoded Paths:** Internal navigation uses Next.js `<Link>` or `useRouter()`. External links use `<a target="_blank" rel="noopener noreferrer">`.

## Coding Standards

1. **TSX Soft Max:** ~250–300 LOC. Extract child components or hooks when exceeding.
2. **No `any` / `as any`:** Use typed props and interfaces. Escape hatches need a comment.
3. **`'use client'` Boundary:** RSC is default. Only add `'use client'` on interactive leaves (forms, animations, client hooks).
4. **Naming Convention:** PascalCase `.tsx` for components. No `.component.tsx` or `.section.tsx` suffixes — just `ComponentName.tsx`.
5. **CSS Modules:** One `.module.css` per component. Design tokens via CSS custom properties in `src/styles/`.
6. **No Inline Data:** Static data lives in `src/data/`. No hardcoded arrays inside components.
7. **No Comments Unless Non-obvious:** Code should be self-documenting. Only comment WHY, never WHAT.
8. **Consistent Exports:** Named exports for components. Default exports only in `page.tsx` files.

## Design Tokens

All design tokens are CSS custom properties defined in `src/styles/`:
- `colors.css` — color palette
- `typography.css` — font sizes, weights, line-heights (fluid with `clamp()`)
- `spacing.css` — 8px-based fluid spacing scale
- `shadows.css` — box shadows
- `shapes.css` — border radii

## File Organization Within Features

```
features/{name}/
  components/           # React components
    {Name}Module.tsx     # Entry point (imported by page.tsx)
    {Name}Client.tsx     # Client logic (if needed)
    SubComponent.tsx     # Child components
    SubComponent.module.css
  hooks/                # Feature-local hooks (optional)
  lib/                  # Feature-local helpers (optional)
```
