# Tailwind V4 Migration Analysis

## Current State

The frontend uses hand-written SCSS with CSS custom properties for theming. There are 8 SCSS files total: one global (`styles.scss`), one root layout (`app.scss`), and six component-scoped files. The "Strawberry" aesthetic has a light mode ("Ice/Ocean") and a dark mode ("Neon Angular"), toggled via `[data-theme="dark"]` on the `<html>` element.

No Tailwind config exists. **This document is a preparation guide — do not begin migration until tests pass and this doc is reviewed.**

---

## 1. Angular + Tailwind V4 Integration

Angular 21 uses `@angular/build` which is backed by Vite + esbuild. The `@angular/build:application` builder does NOT support a `"plugins"` key in `angular.json` — use `@tailwindcss/postcss` instead, which Angular auto-discovers via `postcss.config.mjs`:

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

Create `postcss.config.mjs` at the project root:

```js
export default {
  plugins: { '@tailwindcss/postcss': {} },
};
```

> **Critical**: Do NOT add both `@tailwindcss/postcss` AND `@tailwindcss/vite` — they conflict. For Angular 21, use PostCSS only.

Create `src/styles.css` (new file, added to `angular.json` styles array):

```css
@import "tailwindcss";
```

---

## 2. Theme Tokens — CSS Variable to `@theme` Mapping

Tailwind V4 uses `@theme` in CSS for all design tokens. Map the existing CSS variables like this in `src/styles.css`:

```css
@import "tailwindcss";

@theme {
  /* Colors — light mode defaults */
  --color-bg: #f0f8ff;
  --color-card: #ffffff;
  --color-text: #001f3f;
  --color-muted: #4682b4;
  --color-accent: #00d4ff;
  --color-accent-2: #0077be;
  --color-danger: #ff4757;
  --color-nav: #e1eef6;

  /* Typography */
  --font-sans: 'Nunito', sans-serif;

  /* Shadows */
  --shadow-card: 0 4px 20px rgba(0, 119, 190, 0.1);

  /* Custom keyframes */
  --animate-float: float 6s ease-in-out infinite;
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
}
```

These `@theme` tokens become Tailwind utility classes automatically:
- `bg-bg` → `background-color: var(--color-bg)`
- `text-text` → `color: var(--color-text)`
- `text-accent` → `color: var(--color-accent)`
- `shadow-card` → `box-shadow: var(--shadow-card)`
- `animate-float` → `animation: var(--animate-float)`

---

## 3. Dark Mode Strategy

The existing theme uses `[data-theme="dark"]` on the `<html>` element (toggled via Angular's `effect()` in `app.ts`). Tailwind V4 supports this with a custom dark mode variant:

```css
/* In styles.css, after @import "tailwindcss" */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Then override tokens for dark mode:

```css
[data-theme="dark"] {
  --color-bg: #050101;
  --color-card: #120101;
  --color-text: #ffffff;
  --color-muted: #ffb7c5;
  --color-accent: #ff007f;
  --color-accent-2: #bc13fe;
  --color-danger: #ff3131;
  --color-nav: #1a0101;
  --shadow-card: 0 4px 30px rgba(255, 0, 127, 0.3);
}
```

In templates, use `dark:` prefix normally:

```html
<div class="bg-bg dark:bg-bg text-text dark:text-text">
```

> Since the CSS variables themselves change between light and dark, `bg-bg` automatically reflects the correct value. The `dark:` prefix is only needed for one-off overrides NOT covered by the variable system.

---

## 4. Glassmorphism

`backdrop-filter: blur()` is a built-in Tailwind utility in V4. No plugin needed:

```html
<!-- Replaces: backdrop-filter: blur(10px); background: var(--glass) -->
<div class="backdrop-blur-md bg-white/70 dark:bg-card/80">
```

---

## 5. `@apply` — Use Sparingly

Tailwind V4 deprecates `@apply` for complex patterns but it still works. Prefer converting component SCSS to utilities in the template. Only use `@apply` for truly shared multi-class patterns like button variants:

```css
/* OK — reusable component pattern */
.btn-primary {
  @apply px-6 py-2 rounded-lg bg-accent text-white font-semibold transition hover:brightness-110;
}
```

---

## 6. SCSS → Tailwind Migration Order

Migrate simpler/smaller components first to build confidence:

| Step | Component | SCSS File | Complexity |
|------|-----------|-----------|------------|
| 1 | TaskForm ✅ | `task-form.scss` (47 lines) | Low — simple form with glassmorphism |
| 2 | Signup ✅ | `signup.scss` (46 lines) | Low — form layout |
| 3 | Login ✅ | `login.scss` (91 lines) | Medium — tabs, form, foldout |
| 4 | Profile | `profile.scss` (71 lines) | Medium — card layout, dividers |
| 5 | TaskList | `task-list.scss` (87 lines) | Medium — CSS Grid, task cards |
| 6 | Home | `home.scss` (124 lines) | High — animations, gradient text, floating cards |
| 7 | Root layout | `app.scss` (130 lines) | High — sidebar layout, nav, responsive |
| 8 | Global | `styles.scss` | Final — replace with `@import "tailwindcss"` + theme tokens |

For each step:
1. Run the test suite first (baseline)
2. Migrate the SCSS file to Tailwind utilities in the template
3. Delete the `.scss` file (update the component `styleUrl` or remove it)
4. Run tests again — confirm no regressions (tests are CSS-class-free by design)

---

## 7. Pitfall List

| Pitfall | Detail |
|---------|--------|
| **No `tailwind.config.js`** | V4 config is entirely in CSS via `@theme`. Generating a v3-style config file will conflict. |
| **`@apply` in component SCSS** | Works, but Angular's view encapsulation adds `[_nghost]` attribute selectors. Test `@apply` patterns in component styles carefully. |
| **SCSS nesting vs CSS nesting** | SCSS nesting (`.parent { .child {} }`) is different from CSS nesting. When removing SCSS, use CSS nesting syntax or Tailwind utilities instead. |
| **PostCSS plugin conflict** | Do not add `@tailwindcss/postcss` if using `@tailwindcss/vite`. They conflict. |
| **`inlineStyleLanguage: "scss"`** | Currently set in `angular.json`. When fully migrated, change to `"css"` or keep SCSS support for remaining global styles. |
| **Hard-coded `#2ecc71`** | `task-list.scss:52` has one hard-coded green for completed task state. Add `--color-success: #2ecc71` to `@theme`. |
| **Google Fonts import** | `styles.scss` uses `@import url(...)` for Nunito. Move to `<link>` tag in `index.html` (better performance) before migrating. |
| **Angular view encapsulation** | Component-scoped Tailwind classes are processed globally but Angular adds attribute selectors. Use `:host` targeting or `ViewEncapsulation.None` if needed. |

---

## 8. Rule Update Required

Before migration begins, update `.claude/rules/frontend/styling.md`:

```markdown
## Technology
- Tailwind V4 with `@tailwindcss/vite` plugin
- CSS custom properties defined via `@theme` in `src/styles.css`
- No SCSS (remove `inlineStyleLanguage: "scss"` from angular.json after migration)
```

The current rule says "No utility-first framework (no Tailwind)" which was accurate pre-migration and must be updated.

---

## 9. Next Steps for `tailwind-onboard` Skill

The planned `tailwind-onboard` skill should automate:
1. `npm install -D tailwindcss @tailwindcss/vite`
2. Add the Vite plugin to `angular.json`
3. Create `src/styles.css` with `@import "tailwindcss"` + the full `@theme` block (tokens extracted from existing CSS variables)
4. Add `@custom-variant dark` for data-attribute dark mode
5. Update `angular.json` `styles` from `["src/styles.scss"]` to `["src/styles.css"]`
6. Remind the developer to update `styling.md` and to migrate components one-by-one using the order above
