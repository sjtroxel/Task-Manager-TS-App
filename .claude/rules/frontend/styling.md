---
paths:
  - "task-manager-client/src/**/*.{scss,css,html}"
---

# Styling Rules

## Technology
- SCSS with CSS custom properties (variables) for theming
- No utility-first framework (no Tailwind) — write component-scoped SCSS

## Theming
- Light/dark mode toggle via `isDarkMode` signal in root `app.ts`
- Theme applied using CSS variables defined at `:root` and `[data-theme="dark"]`
- Use `effect()` to sync theme class to the DOM (see `app.ts`)

## Design System — "Strawberry" Aesthetic
- Follow the existing warm, fruit-inspired color palette
- Use CSS variables for all colors — never hardcode hex values in component SCSS
- Maintain consistent border-radius, spacing, and typography across components

## Formatting
- Prettier: `singleQuote: true`, `printWidth: 100` (configured in `task-manager-client/package.json`)
- EditorConfig present in `task-manager-client/.editorconfig`

## Icons
- Use `lucide-angular` for all icons (tree-shakeable SVG icons)
- Import icons as Angular components in the standalone `imports` array
- Do not add other icon libraries
