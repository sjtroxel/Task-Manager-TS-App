# Anti-Patterns to Avoid

## TypeScript
- DO NOT use `any` type — the frontend has heavy `any` usage in services (`auth.service.ts`, `task.service.ts`). Always use proper interfaces/types. This is an existing problem to fix, not replicate.
- DO NOT disable TypeScript strict mode or add `@ts-ignore` comments

## Angular (Frontend)
- DO NOT use constructor injection — use `inject()` function (e.g., `private authService = inject(AuthService)`)
- DO NOT create NgModules — all components are standalone with `imports: []` array
- DO NOT use class-based guards or interceptors — use functional patterns (`authGuard`, `authInterceptor`)
- DO NOT manually set Authorization headers in services — the global `authInterceptor` in `interceptors/auth-interceptor.ts` handles this. TaskService currently has redundant manual headers; do not copy this pattern.

## Backend
- DO NOT skip the `protect` middleware on routes that access user data
- DO NOT return raw Mongoose errors to the client — wrap in `{ message: '...' }` with appropriate status codes
- DO NOT use `require()` — the backend uses ES modules (`"type": "module"`)

## State Management
- DO NOT introduce NgRx, Akita, or external state libraries — use Angular Signals (`signal()`, `.set()`, `.update()`)
- DO NOT store component state in services unless it needs to be shared across components

## General
- DO NOT push directly to `main` without testing — pushes auto-deploy to production
- DO NOT add dependencies without checking if Angular/Express already provides the functionality
- DO NOT create duplicate environment config — use existing `environments/` directory for frontend, `.env` for backend
