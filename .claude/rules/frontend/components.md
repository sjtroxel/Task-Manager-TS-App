---
paths:
  - "task-manager-client/src/app/**/*.{ts,html,scss}"
---

# Angular Component Rules

## Component Structure
- All components are standalone: `@Component({ standalone: true, imports: [...] })`
- Use `inject()` for dependency injection, not constructor parameters
- Use Signals for reactive state: `signal<T>()`, `.set()`, `.update()`
- Use `effect()` for side effects (see `app.ts` theme switcher)

## Template Patterns
- Inline templates for small components, separate `.html` files for larger ones
- Use Angular control flow (`@if`, `@for`) over `*ngIf`/`*ngFor` directives
- Bind to signals directly in templates: `{{ mySignal() }}`

## State & Data Flow
- Component-local state: use `signal()` directly in the component
- Shared state: use service signals (`AuthService.currentUser`, `TaskService.tasks`)
- HTTP data: call service methods that update signals; components read signals

## DI & Providers
- Services provided in `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor]))`
- Guards: functional `authGuard` and `noAuthGuard` in `guards/`
- Routes defined in `app.routes.ts` with `canActivate` guards

## Error Handling
- Store errors in a signal: `errorMessage = signal<string>('')`
- Subscribe to HTTP observables with `{ next, error }` callbacks
- Display errors in templates bound to the error signal
