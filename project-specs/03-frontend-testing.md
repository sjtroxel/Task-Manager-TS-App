# Project Spec 03 — Frontend Lite Testing + Tailwind V4 Analysis

## Context

The backend sits at 100% test coverage. The Angular frontend has zero meaningful tests — all 10 spec files are unmodified CLI scaffolds with only `toBeTruthy()` assertions. Before migrating to Tailwind V4, we need a safety net that validates user-facing flows through UI interaction, not internal implementation details.

The user asked for "React Testing Library + ARIA roles/text queries." This is Angular, not React. The Angular-equivalent library is `@testing-library/angular`, which provides the identical ARIA-first querying API (`screen.getByRole()`, `getByLabelText()`, `getByText()`, etc.) and the same philosophy: test behavior users observe, not implementation details or CSS classes. Installing it is the correct call.

**Constraint**: No CSS class assertions — all tests must survive the upcoming Tailwind V4 migration that will rename or remove SCSS class names.

---

## Phase 1 — Install Testing Library

**File:** `task-manager-client/package.json`

Add to `devDependencies`:
```json
"@testing-library/angular": "^17.x",
"@testing-library/user-event": "^14.x"
```

`@testing-library/angular` v17+ supports Angular 21 standalone components and integrates with Vitest out of the box. `@testing-library/user-event` provides realistic event simulation (real keystrokes, focus/blur) over `fireEvent`.

---

## Phase 2 — Minor ARIA Improvements to Templates

The login and signup forms have `<label>` elements without `for` attributes and `<input>` elements without `id` attributes. `getByLabelText('Email')` won't work without explicit association. These are **accessibility fixes** first, test infrastructure second.

**Files to modify:**

### `task-manager-client/src/app/components/login/login.html`
- `<label>Email</label>` → `<label for="email">Email</label>`
- `<input type="email" ...>` → add `id="email"`
- `<label>Password</label>` → `<label for="password">Password</label>`
- `<input type="password" ...>` → add `id="password"`

### `task-manager-client/src/app/components/signup/signup.html`
- Add `for`/`id` pairs: `name` → `id="signup-name"`, `email` → `id="signup-email"`, `password` → `id="signup-password"`, `confirmPassword` → `id="signup-confirm"`
- (Use prefixed IDs to avoid DOM collisions when signup is rendered inside login)

---

## Phase 3 — Service Tests

### `task-manager-client/src/app/services/auth.spec.ts`

Test `AuthService` using `TestBed` + `provideHttpClientTesting()` + `HttpTestingController`:

| Test | Assertion |
|------|-----------|
| `login()` success | POSTs to `/api/users/login`, `currentUser()` signal is set, `localStorage` has token |
| `login()` failure | Signal stays null, no localStorage write |
| `register()` success | POSTs to `/api/users/register`, signal is set |
| `logout()` | Clears `currentUser()` to null, removes `token`/`user` from localStorage |
| `updateProfile()` | PUTs to `/api/users/profile`, signal reflects updated name |

Mock the real HTTP calls with `HttpTestingController.expectOne()`.

### `task-manager-client/src/app/services/task.spec.ts`

| Test | Assertion |
|------|-----------|
| `getTasks()` | GETs `/api/tasks`, `tasks()` signal is populated |
| `addTask()` | POSTs `/api/tasks`, new task appended to signal |
| `deleteTask(id)` | DELETEs `/api/tasks/:id`, task removed from signal |
| `toggleDone(task)` | PATCHes `/api/tasks/:id` with `{ completed: !task.completed }` |
| `updateTask(id, data)` | PATCHes `/api/tasks/:id`, returns observable |

---

## Phase 4 — Component Integration Tests

All component tests use `render()` from `@testing-library/angular`, mock services via `TestBed` providers, and query exclusively via ARIA roles and text.

### `login.spec.ts` — LoginComponent

Providers needed: `provideRouter([])`, `provideHttpClient()`, `provideHttpClientTesting()`, `AuthService` mock (spy on `login()`).

| Test | Action → Assertion |
|------|-------------------|
| Renders tab buttons | `getByRole('button', { name: 'Login' })` and `'Sign Up'` exist |
| Tab switch | Click "Sign Up" → `app-signup` appears; switch back → login form reappears |
| Successful login | Fill `getByLabelText('Email')` + `getByLabelText('Password')` → submit → router navigates to `/tasks` |
| Failed login | Mock service throws 401 → error message appears |
| Password visibility toggle | Click eye button → input type changes `password` → `text` |

### `task-list.spec.ts` — TaskListComponent

Mock `TaskService` (control `tasks` signal) and `AuthService`. `TaskForm` is embedded — include it in the render.

| Test | Action → Assertion |
|------|-------------------|
| Empty state | `tasks` signal = `[]` → `getByText('No tasks found')` |
| Renders tasks | Signal has tasks → `getByText('My Task Title')` visible |
| Toggle done | Click `getByRole('button', { name: 'Done' })` → `toggleDone()` called |
| Undo completed | Completed task shows "Undo" button → click → `toggleDone()` called |
| Delete task | Spy `window.confirm` → `true` → click "Delete" → `deleteTask()` called |
| Inline edit | Click "Edit" → edit inputs appear; fill and click "Save" → `updateTask()` called |
| Cancel edit | Click "Edit" → click "Cancel" → task title reappears |
| Logout | Click "Logout" → `authService.logout()` called, router navigates to `/` |

### `task-form.spec.ts` — TaskFormComponent

| Test | Action → Assertion |
|------|-------------------|
| Submit disabled on empty | "Add Task!" button is disabled when title is empty |
| Submits with title | Type in title placeholder input → submit → `addTask()` called |
| Submits with description | Fill both inputs → `addTask()` called with both fields |
| Clears after submit | After successful add, title and description inputs are empty |

### `profile.spec.ts` — ProfileComponent

| Test | Action → Assertion |
|------|-------------------|
| Updates name | Fill name field, submit → `updateProfile({ name })` called |
| Shows success | Mock success → success message visible |
| Shows error | Mock error → error message visible |
| Logout | Click Logout → `logout()` called, router navigates to `/` |

### `auth-interceptor.spec.ts` — authInterceptor

Use `TestBed` directly. Use `provideHttpClient(withInterceptors([authInterceptor]))` + `provideHttpClientTesting()`.

| Test | Assertion |
|------|-----------|
| Token present in localStorage | Intercepted request has `Authorization: Bearer <token>` header |
| No token in localStorage | Request passes through without Authorization header |

---

## Phase 5 — Guard Tests (Lightweight)

### `auth-guard.spec.ts` (new file alongside guard)

| Test | Setup → Result |
|------|----------------|
| Logged in | `currentUser()` returns user → guard returns `true` |
| Logged out | `currentUser()` returns null → guard returns `UrlTree` to `/login` |

### `no-auth-guard.spec.ts` (new file)

| Test | Setup → Result |
|------|----------------|
| Logged in | `currentUser()` returns user → guard returns `UrlTree` to `/tasks` |
| Logged out | `currentUser()` returns null → guard returns `true` |

---

## Phase 6 — Tailwind V4 Migration Analysis Document

Produce `.claude/context/TAILWIND-MIGRATION.md` with:

1. **CSS variable → `@theme` token mapping** (all 12 vars per mode)
2. **Dark mode strategy** — Tailwind V4 uses `@variant dark` with `[data-theme="dark"]` selector
3. **Animations** — Move `@keyframes float` from `home.scss` into `@theme`
4. **Glassmorphism** — `backdrop-filter: blur()` is a built-in Tailwind utility in V4
5. **Angular integration** — Use `@tailwindcss/vite` (Angular 21 Vite builder = first-class support)
6. **Migration order** — `task-form` → `signup` → `login` → `profile` → `task-list` → `home` → `app`
7. **Pitfall list** — config conflicts, `@apply` deprecation, PostCSS plugin change, SCSS nesting vs Tailwind nesting
8. **Rule update** — `styling.md` currently says "No Tailwind" and must be updated when migration begins

---

## Critical Files

| File | Change |
|------|--------|
| `task-manager-client/package.json` | Add `@testing-library/angular`, `@testing-library/user-event` to devDeps |
| `task-manager-client/src/app/components/login/login.html` | Add `for`/`id` ARIA pairs |
| `task-manager-client/src/app/components/signup/signup.html` | Add `for`/`id` ARIA pairs |
| `task-manager-client/src/app/services/auth.spec.ts` | Replace scaffold |
| `task-manager-client/src/app/services/task.spec.ts` | Replace scaffold |
| `task-manager-client/src/app/components/login/login.spec.ts` | Replace scaffold |
| `task-manager-client/src/app/components/task-list/task-list.spec.ts` | Replace scaffold |
| `task-manager-client/src/app/components/task-form/task-form.spec.ts` | Replace scaffold |
| `task-manager-client/src/app/components/profile/profile.spec.ts` | Replace scaffold |
| `task-manager-client/src/app/interceptors/auth-interceptor.spec.ts` | Replace scaffold |
| `task-manager-client/src/app/guards/auth-guard.spec.ts` | New file |
| `task-manager-client/src/app/guards/no-auth-guard.spec.ts` | New file |
| `.claude/context/TAILWIND-MIGRATION.md` | New analysis document |

Skipped this session (remain as scaffolds): `app.spec.ts`, `home.spec.ts` (static/cosmetic, lower value).

---

## Verification

```bash
cd task-manager-client && npm install
npm test
# All new tests pass, no CSS class assertions
cd ../task-manager-ts && npm test
# Backend remains at 100% coverage
```
