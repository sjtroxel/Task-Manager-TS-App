---
paths:
  - "task-manager-client/src/**/*.{scss,css,html}"
---

# Styling Rules

## Technology
- **Tailwind V4** via `@tailwindcss/vite` (Vite plugin — no PostCSS config file)
- CSS custom properties defined in `@theme` block in `src/styles.css`
- Do NOT create new `.scss` files for new components — use Tailwind utilities in templates
- **Migration in progress**: un-migrated components still have `.scss` files; `styles.scss` coexists with `styles.css` temporarily
- See `project-specs/04-tailwind-migration-implementation.md` for migration order and token reference

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
