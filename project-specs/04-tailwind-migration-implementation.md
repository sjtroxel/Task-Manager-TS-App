# 04 — Tailwind V4 Migration Implementation

## Status: ✅ Complete — all 8 steps done

## Context

The frontend uses hand-written SCSS with CSS custom properties for theming (10 variables per mode: light "Ice/Ocean" + dark "Neon Angular"). There are 8 SCSS files total. This spec documents the full migration to Tailwind V4 with `@tailwindcss/vite`.

**Pre-conditions met before migration began:**
- 50 frontend tests passing, all ARIA-first (no CSS class assertions) — safe for migration
- `@testing-library/angular` infrastructure in place
- `.claude/context/TAILWIND-MIGRATION.md` — original analysis document

---

## Technology Stack (Post-Migration Target)

- **Tailwind V4** — CSS-first config via `@theme` in `src/styles.css`
- **`@tailwindcss/vite`** — Vite plugin; no PostCSS config file needed
- **`@custom-variant dark`** — data-attribute dark mode matching Angular's `effect()` toggle
- **No SCSS component files** — all styling via Tailwind utilities in templates

---

## CSS Token Map

### Old CSS vars → New `@theme` tokens

| Old (`styles.scss`) | New (`@theme`) | Tailwind Utilities |
|---------------------|---------------|-------------------|
| `--bg-color` | `--color-bg` | `bg-bg`, `text-bg`, `border-bg` |
| `--card-bg` | `--color-card` | `bg-card` |
| `--text-main` | `--color-text` | `text-text` |
| `--text-muted` | `--color-muted` | `text-muted` |
| `--accent-primary` | `--color-accent` | `bg-accent`, `text-accent`, `border-accent` |
| `--accent-secondary` | `--color-accent-2` | `bg-accent-2`, `border-accent-2`, `text-accent-2` |
| `--danger` | `--color-danger` | `text-danger`, `border-danger`, `bg-danger` |
| `--nav-bg` | `--color-nav` | `bg-nav` |
| `--glass` | `--color-glass` | `bg-glass` |
| `--shadow` | `--shadow-card` | `shadow-card` |
| *(new)* | `--color-success` | `bg-success`, `text-success` |

### Dark mode overrides

Defined in `[data-theme='dark']` CSS block (after `@theme`). The CSS variables themselves change, so `bg-bg` automatically reflects the correct mode — `dark:` prefix only needed for one-off overrides not covered by the variable system.

---

## Environment Setup (One-Time)

Already completed as part of this session:

1. `npm install -D tailwindcss @tailwindcss/postcss` (`@tailwindcss/vite` is NOT used — Angular's `@angular/build:application` does not accept a `"plugins"` key; PostCSS is auto-discovered instead)
2. `postcss.config.mjs` created at project root: `{ plugins: { '@tailwindcss/postcss': {} } }`
3. `angular.json` — added `"src/styles.css"` to styles array (after `styles.scss`)
4. `src/index.html` — moved Google Fonts from `@import url()` in SCSS to `<link>` tags
5. `src/styles.css` — created with `@import "tailwindcss"`, `@theme`, `@custom-variant dark`, dark mode overrides
6. `src/styles.scss` — removed `@import url(...)` line only (rest stays for un-migrated components)

**Key design decision:** During migration, `styles.scss` and `styles.css` coexist:
- `styles.scss` — existing CSS variables (`--bg-color` etc.) + global form/input styles
- `styles.css` — Tailwind infrastructure + new `@theme` tokens (`--color-bg` etc.)

Tailwind V4 uses CSS layers, so layered utilities cannot override unlayered selectors in `styles.scss`. No conflicts occur.

---

## Migration Order

Simpler/smaller components first to build confidence:

| Step | Component | SCSS File | Lines | Status |
|------|-----------|-----------|-------|--------|
| 1 | TaskForm | `task-form.scss` | 47 | ✅ **Done** |
| 2 | Signup | `signup.scss` | 46 | ✅ **Done** |
| 3 | Login | `login.scss` | 91 | ✅ **Done** |
| 4 | Profile | `profile.scss` | 71 | ✅ **Done** |
| 5 | TaskList | `task-list.scss` | 87 | ✅ **Done** |
| 6 | Home | `home.scss` | 124 | ✅ **Done** |
| 7 | Root layout | `app.scss` | 130 | ✅ **Done** |
| 8 | Global | `styles.scss` | 109 | ✅ **Done** |

**Protocol for each step:**
1. Run `npm test` (baseline — confirm all 50 tests pass)
2. Replace template classes with Tailwind utilities
3. Remove `styleUrl` from component `.ts` file
4. Delete the `.scss` file
5. Run `npm test` again — confirm no regressions

---

## Step-by-Step Reference

### Step 1: TaskForm ✅

**`task-form.html`** — full Tailwind replacement:

```html
<section class="bg-glass backdrop-blur-[10px] p-6 rounded-xl border border-dashed border-accent-2 mb-8">
  <h3 class="mt-0 text-text text-[1.1rem] mb-4">Add New Task</h3>
  <form (submit)="onSubmit(); $event.preventDefault()">
    <div class="flex flex-col gap-4 md:flex-row">
      <input class="flex-1" [(ngModel)]="title" name="title" placeholder="What needs doing?" required>
      <input class="flex-1" [(ngModel)]="description" name="description" placeholder="Add a description...">
      <button
        type="submit"
        class="bg-accent text-white border-none px-6 py-3 rounded-lg font-bold cursor-pointer shadow-card font-sans transition-transform duration-200 enabled:hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        [disabled]="!title">
        Add Task!
      </button>
    </div>
  </form>
</section>
```

SCSS class → Tailwind mapping:
- `.form-container` → `bg-glass backdrop-blur-[10px] p-6 rounded-xl border border-dashed border-accent-2 mb-8`
- `.input-group` → `flex flex-col gap-4 md:flex-row`
- `input` (flex:1) → `flex-1`
- `button` → `bg-accent text-white border-none px-6 py-3 rounded-lg font-bold cursor-pointer shadow-card font-sans transition-transform duration-200 enabled:hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`

---

### Step 2: Signup (Next Session)

**`signup.scss`** to convert — key classes: `.auth-form`, `.btn-primary`, `.error-text`

Key translations:
- `.btn-primary` → `bg-accent text-white rounded-lg px-6 py-2 font-semibold transition hover:brightness-110 enabled:hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale-[0.5]`
- `.error-text` → `bg-danger/10 text-danger px-3 py-2 rounded-md text-sm`
- `:host { display: block; width: 100% }` → add `class="block w-full"` to root element

---

### Step 3: Login ✅

**`login.scss`** (91 lines) — key classes: `.auth-wrapper`, `.auth-card`, `.auth-tabs`, `.foldout-container`

Key translations:
- `.auth-wrapper` → `min-h-[80vh] flex items-center justify-center p-4`
- `.auth-card` → `bg-card border border-accent-2 rounded-2xl shadow-card w-full max-w-md p-8`
- `.auth-tabs` → `flex mb-8 border-b-2 border-accent-2`
- `.auth-tabs button` → `.auth-tab-btn` in `@layer components` in `styles.css` (avoids Tailwind utilities layer ordering conflict with `border-none`)
- `.auth-tabs button.active` → `.auth-tab-btn.active` in same `@layer components` block; `[class.active]` binding preserved
- `h2` → `text-accent text-center mb-6`
- `.btn-primary` → `w-full bg-accent text-white p-3.5 border-0 rounded-lg font-bold cursor-pointer mt-4 shadow-card transition-transform duration-200 hover:-translate-y-0.5`
- `.error-text` (was unstyled class + inline style) → `text-danger mb-4`
- `.foldout-container` → `mb-4`; `.foldout-content` → removed (no CSS existed)
- `.form-group`, `.input-with-eye`, `.eye-btn` — kept as-is (provided by global `styles.scss`)

---

### Step 4: Profile ✅

**`profile.scss`** (71 lines) — key classes: `.profile-container`, `.profile-card`, `.logout-btn`, `.status-message`

Key translations:
- `.profile-container` → lifted to `host: { class: 'flex justify-center pt-8' }` in decorator; outer div removed from template
- `.profile-card` → `bg-card border border-accent-2 rounded-[20px] shadow-card w-full max-w-125 p-10`
  - Note: Tailwind V4 canonical `max-w-125` = `500px` (avoid `max-w-[500px]` arbitrary value)
- `.card-header` → `flex justify-between items-center mb-2`
- `h2` → `m-0 text-accent text-[1.8rem]`
- `.logout-btn` → ghost style: `bg-transparent border border-danger text-danger px-3 py-1.5 rounded-lg cursor-pointer font-bold transition duration-200 hover:bg-danger hover:text-white`
- `.subtitle` → `text-muted mb-8`
- `.divider` (hr) → `border-0 border-t border-accent-2/30 my-8` (opacity via color modifier, not element opacity)
- `.status-message` (error default) → `p-2.5 rounded-lg mb-4 font-semibold text-center bg-danger/10 text-danger`
- `.status-message.success` → `[ngClass]` ternary: `message().includes('successfully') ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'`
- `.btn-primary` → `w-full bg-accent text-white p-3.5 border-0 rounded-xl font-bold cursor-pointer font-sans transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_5px_15px_var(--color-accent)]`
  - Note: use `var(--color-accent)` (Tailwind token), NOT `var(--accent-primary)` (old SCSS var, removed in Step 8)
- `.form-group`, `.input-with-eye`, `.eye-btn` — kept as-is (global `styles.scss`)

---

### Step 5: TaskList ✅

**`task-list.scss`** (87 lines) — key classes: `.dashboard`, `.task-grid`, `.task-card`, `.task-card.completed`

Key translations:
- `.dashboard` → lifted to `host: { class: 'block max-w-[1100px] mx-auto' }` in decorator; outer div removed
- `.header` → `flex justify-between items-center mb-8`
- `h2` → `m-0 text-accent text-[1.8rem]`
- `.logout-btn` → `bg-transparent border border-danger text-danger px-4 py-2 rounded-lg cursor-pointer font-bold transition duration-200 hover:bg-danger hover:text-white`
- `<hr>` → `my-4 border-accent-2/30`
- `.task-grid` → `grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6`
- `.task-card` base → `group p-6 rounded-2xl shadow-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.25`
- `.task-card` border+bg → `[ngClass]` ternary on `task.completed`:
  - completed: `'bg-success/5 border border-success'`
  - default: `'bg-card border border-accent-2 hover:border-accent'`
- Hardcoded `#2ecc71` → `border-success bg-success/5` (uses `--color-success` from `@theme`)
- `h3` → `m-0 mb-2 text-accent text-xl group-[.completed]:line-through group-[.completed]:text-muted`
  - `group-[.completed]:` works because the card div has both `group` and `[class.completed]="task.completed"`
- `p` → `text-text leading-[1.4] m-0 grow`
- `.actions` → `flex gap-2 mt-6`
- Action buttons (base) → `flex-1 p-2 rounded-md border border-accent-2 bg-bg text-text cursor-pointer font-sans font-semibold transition duration-200 hover:bg-glass hover:border-accent`
- `.delete` button → same base but `border-danger text-danger hover:bg-danger hover:text-white` (no `hover:border-accent`)
- `.edit-input` → `mb-2` on each input/textarea

---

### Step 6: Home ✅

**`home.scss`** (124 lines) — most complex: animations, gradient text, `clamp()`, floating card

Key translations:
- `.hero-wrapper` → lifted to `host: { class: '...' }` in decorator; outer div removed
  - `flex flex-col items-center justify-center text-center min-h-[80vh] p-8 gap-16 lg:flex-row lg:text-left lg:justify-between lg:max-w-[1200px] lg:mx-auto`
- `.hero-content` → `flex-1 max-w-150` (canonical `max-w-150` = 600px)
- `.badge` → `inline-block px-3 py-1.5 bg-nav border border-accent-2 rounded-full text-[0.8rem] font-bold text-accent mb-6`
- `.main-title` → `text-[clamp(2.5rem,8vw,4rem)] leading-[1.1] mb-6 text-text`
- `.gradient-text` → `bg-linear-to-r from-accent to-accent-2 bg-clip-text text-transparent`
  - **V4 IMPORTANT**: Tailwind V4 canonical is `bg-linear-to-r`, NOT `bg-gradient-to-r` (v3 name)
- `.lead-text` → `text-[1.2rem] text-muted mb-10`
- `.cta-group` → `flex flex-col gap-4 sm:flex-row`
- `.btn-primary-lg` → `bg-accent text-white px-8 py-4 rounded-xl font-bold text-base cursor-pointer font-sans border-0 shadow-card transition-all duration-300 hover:-translate-y-1 hover:brightness-110`
- `.btn-secondary-lg` → `bg-transparent text-text border-2 border-solid border-accent-2 px-8 py-4 rounded-xl font-bold text-base cursor-pointer font-sans transition-all duration-300 hover:bg-glass`
  - Note: `border-solid` added explicitly since `border-2` alone doesn't set border-style
- `.hero-visual` → `flex-1 flex justify-center perspective-[1000px]`
- `.floating-card` → `w-70 h-45 bg-glass backdrop-blur-[15px] border border-white/20 rounded-3xl p-5 shadow-card animate-float`
  - `rounded-[24px]` → canonical `rounded-3xl` (= 1.5rem = 24px)
- `.card-header` dots → `w-3 h-3 rounded-full bg-accent-2 opacity-50`
- `.skeleton-line` → `h-2.5 bg-muted opacity-20 rounded-[5px] mb-3`; `.long` → `w-[80%]`; `.short` → `w-[40%]`
- `@keyframes float` → already in `@theme`; added explicit `@layer utilities { .animate-float { animation: var(--animate-float); } }` to `styles.css`

---

### Step 7: Root Layout / App ✅

**`app.scss`** (130 lines) — sidebar toggle animation, `:host`, theme toggle button

Key translations:
- `:host` → `host: { class: 'flex w-screen h-screen overflow-hidden bg-bg' }` in decorator; wrapper `.app-container` div removed (host is the flex container)
- `.sidebar` (condensed) → `[ngClass]` ternary: `'w-17.5 items-center'` vs `'w-65 items-start px-3'`
- `.sidebar` base → `flex flex-col z-100 py-4 transition-all duration-350 ease-in-out border-r border-accent-2 shadow-card bg-nav`
  - Canonicals: `w-17.5` (70px), `w-65` (260px), `z-100`, `duration-350`, `ease-in-out` (= cubic-bezier(0.4,0,0.2,1))
- `.sidebar-header` → `[ngClass]` ternary: `'justify-start'` vs `'justify-center'`; base: `w-full flex items-center gap-4 mb-8`
- `.logo-text` → `font-bold text-[1.2rem] whitespace-nowrap text-accent-2 dark:text-accent dark:shadow-[0_0_15px_var(--color-accent)]`
- `.logo-link` → `no-underline text-inherit cursor-pointer transition-opacity duration-200 hover:opacity-80`
- `.nav-links` → `flex flex-col gap-2 w-full`
- `.nav-item` (links) → `[ngClass]` ternary for justify; base: `flex items-center gap-4 p-3 text-text no-underline rounded-xl transition-all duration-200 whitespace-nowrap hover:bg-accent hover:text-white [&.active]:bg-accent [&.active]:text-white`
- `.theme-toggle-item` → `[ngClass]` ternary for justify; base: `flex items-center gap-4 px-3 pb-3 pt-6 text-text bg-transparent border-0 border-solid border-t border-accent-2 cursor-pointer w-full mt-4 rounded-xl transition-all duration-200 whitespace-nowrap hover:bg-accent hover:text-white`
  - Note: `border-0 border-solid border-t` pattern — `border-0` zeros all widths, `border-solid` sets style, `border-t` restores top to 1px; this reliably renders only a top border on a `<button>` element
- `.icon-btn` → `bg-transparent border-none text-text cursor-pointer p-2 rounded-full flex items-center justify-center hover:bg-glass`
- `.content` → `flex-1 overflow-y-auto p-8 bg-bg transition-colors duration-400`

---

### Step 8: Global Styles ✅

**`styles.scss`** — merged into `styles.css`, then deleted:

**Variable harmonization** — all old `:root` vars replaced with `@theme` tokens:
- `var(--bg-color)` → `var(--color-bg)`, `var(--text-main)` → `var(--color-text)`, etc.
- `font-family: 'Nunito', sans-serif` → `font-family: var(--font-sans)`
- The `[data-theme='dark']` block was already in `styles.css`; the `:root` block was dropped entirely.

**`@layer base` additions** (body + default inputs):
- `body` → `margin/padding: 0; background-color: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); transition: background-color 0.4s, color 0.4s`
- `input:not([type='checkbox']), textarea` → base border/bg/color/font
- `input:not([type='checkbox']):focus, textarea:focus` → `border-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent)`

**`@layer components` additions** (flattened from SCSS nesting):
- `.form-group` → `margin-bottom: 1.2rem`
- `.form-group label` → `display: block; font-weight: 600; color: var(--color-text)`
- `.input-with-eye` → `position: relative; display: flex; align-items: center`
- `.input-with-eye input` → `padding-right: 45px` (eyeball clearance) + full border/bg/color
- `.input-with-eye input:focus` → same focus ring as default inputs
- `.eye-btn` → `position: absolute; right: 8px; color: var(--color-muted); cursor: pointer`
- `.eye-btn:hover` → `color: var(--color-accent)`
- `.eye-btn lucide-icon` → `width: 20px; height: 20px`

**`angular.json` changes:**
- `styles` array: removed `"src/styles.scss"` — only `"src/styles.css"` remains
- `inlineStyleLanguage`: `"scss"` → `"css"`
- `schematics/@schematics/angular:component.style`: `"scss"` → `"css"` (new components default to CSS)

**Result:** Zero SCSS files in the project. Build output: `styles.css` 23.73kB, 50/50 tests passing.

---

## Pitfall Reference

| Pitfall | Detail |
|---------|--------|
| No `tailwind.config.js` | V4 config is entirely in `@theme`. A v3-style config file conflicts. |
| `@apply` in component SCSS | Avoid — Angular's view encapsulation adds attribute selectors. Prefer template utilities. |
| PostCSS conflict | Do NOT add `@tailwindcss/postcss` if using `@tailwindcss/vite`. |
| Angular budget: 4kB per component style | After migration, component style bytes = 0. Budget warnings disappear. |
| `inlineStyleLanguage: "scss"` | Keep until Step 7 is done. Change to `"css"` as part of Step 8 cleanup. |
| Auth tabs `.active` class | `[class.active]` binding in login.html sets a plain CSS class. Handle in `@layer components` or use conditional Tailwind classes. |
