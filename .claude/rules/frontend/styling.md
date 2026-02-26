---
paths:
  - "task-manager-client/src/**/*.{scss,css,html}"
---

# Styling Rules

## Technology
- **Tailwind V4** via `@tailwindcss/postcss` (PostCSS plugin)
- CSS custom properties defined in `@theme` block in `src/styles.css`
- Do NOT create new `.scss` files — use Tailwind utilities in templates. Migration complete.
- See `project-specs/04-tailwind-migration-implementation.md` for migration history and token reference

## PostCSS Configuration — CRITICAL
- **`postcss.config.json`** (JSON format) is required in `task-manager-client/` — Angular's `@angular/build:application` ONLY reads JSON PostCSS config (`postcss.config.json` or `.postcssrc.json`)
- **`postcss.config.mjs`** is also kept for the Vitest/Vite test runner (uses postcss-load-config, reads .mjs)
- Do NOT delete `postcss.config.json` — without it, Tailwind generates zero utility classes and the app is completely unstyled
- `@source "."` in `src/styles.css` helps with source scanning in the Angular build context

## Theming
- Light/dark mode toggle via `isDarkMode` signal in root `app.ts`
- Dark mode applied via `[data-theme="dark"]` on `<html>` using Angular `effect()`
- `@custom-variant dark` in `styles.css` enables `dark:` prefix for one-off overrides
- Token variables (e.g. `--color-bg`) change between modes — `bg-bg` automatically reflects the correct mode; `dark:` prefix only needed for overrides not covered by tokens

## Design System — "Strawberry" Aesthetic
- Follow the existing warm, fruit-inspired color palette
- Use Tailwind token utilities (`bg-accent`, `text-muted`, `shadow-card`) — never hardcode hex values
- Token reference: `task-manager-client/src/styles.css` `@theme` block

## Formatting
- Prettier: `singleQuote: true`, `printWidth: 100` (configured in `task-manager-client/package.json`)
- EditorConfig present in `task-manager-client/.editorconfig`

## Icons
- Use `lucide-angular` for all icons (tree-shakeable SVG icons)
- Import icons as Angular components in the standalone `imports` array
- Do not add other icon libraries
