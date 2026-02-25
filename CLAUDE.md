# CLAUDE.md — Task Manager TS

## Project Overview
Full-stack task management application with a "Strawberry" aesthetic theme. Users register, log in, and manage personal to-do tasks with completion tracking. Two-package monorepo: Express REST API backend + Angular SPA frontend.

## Tech Stack
- **Backend**: Node.js, Express 5.2.1, Mongoose 9.1.5, TypeScript 5.9.x
- **Frontend**: Angular 21.1.0 (standalone components, Signals), RxJS 7.8.0, SCSS
- **Auth**: jsonwebtoken 9.0.3, bcryptjs 3.0.3 (JWT Bearer tokens, 30-day expiry)
- **Database**: MongoDB Atlas (cloud)
- **Icons**: lucide-angular (tree-shakeable SVG)
- **Deploy**: Vercel (frontend), Railway (backend)
- **Package manager**: npm

## Architecture
```
task-manager-ts/           # Backend (Express API)
  src/
    server.ts              # Entry point, CORS, JSON parsing, route registration
    config/db.ts           # MongoDB Atlas connection
    models/                # Mongoose schemas: userModel.ts, taskModel.ts
    controllers/           # userController.ts, taskController.ts
    routes/                # userRoutes.ts, taskRoutes.ts
    middleware/             # authMiddleware.ts (JWT verify)
    utils/                 # generateToken.ts
task-manager-client/       # Frontend (Angular SPA)
  src/app/
    app.ts                 # Root component, sidebar/theme signals
    app.routes.ts          # Route definitions with guards
    app.config.ts          # Providers: router, HTTP client, interceptors
    components/            # home/, login/, signup/, task-list/, task-form/, profile/
    services/              # auth.service.ts, task.service.ts
    guards/                # auth-guard.ts, no-auth-guard.ts
    interceptors/          # auth-interceptor.ts
    environments/          # environment.ts, environment.prod.ts
```

## Development Commands

### Backend (`task-manager-ts/`)
- Dev server: `npm run dev` (tsx watch, port 5000)
- Build: `npm run build` (tsc -> dist/)
- Start prod: `npm start` (node dist/server.js)

### Frontend (`task-manager-client/`)
- Dev server: `npm start` (ng serve, port 4200)
- Build: `npm run build` (ng build -> dist/)
- Test: `npm test` (Vitest via ng test)
- Format: Prettier (singleQuote: true, printWidth: 100)

### Full Local Stack
1. Terminal 1: `cd task-manager-ts && npm run dev`
2. Terminal 2: `cd task-manager-client && npm start`
3. Frontend: http://localhost:4200 | API: http://localhost:5000

## Code Style & Conventions

### Naming
- Variables/functions: camelCase (`currentUser`, `getTasks`, `isCompleted`)
- Booleans: `is`/`has` prefix (`isDarkMode`, `isSidebarOpen`)
- Classes: PascalCase (`AuthService`, `TaskController`)
- Backend interfaces: `I` prefix (`IUser`, `ITask`)
- Backend files: camelCase (`taskController.ts`, `authMiddleware.ts`)
- Frontend files: kebab-case (`task-list/`, `auth-guard.ts`)
- Angular selectors: `app-` prefix (`app-home`, `app-task-list`)

### Patterns
- Angular: standalone components, `inject()` for DI, Signals for state, functional guards/interceptors
- Backend: async/await with try/catch, ES modules (`import`/`export`)
- Controller annotations: `@desc` and `@route` JSDoc stubs
- Error handling: backend returns `{ message: '...' }` with proper HTTP status codes

## Testing

### Backend (`task-manager-ts/`) — 100% coverage
- Framework: Vitest 4.x + Supertest + mongodb-memory-server
- Run: `npm test` | Watch: `npm run test:watch` | Coverage: `npm run test:coverage`
- Test files: `tests/auth.test.ts`, `tests/tasks.test.ts`, `tests/users.test.ts`
- Setup: `tests/setup.ts` (spins up in-memory MongoDB, clears collections between tests)
- `src/app.ts` exports the Express app for testing; `src/server.ts` handles DB connect + listen

### Frontend (`task-manager-client/`) — coverage gap
- Framework: Vitest 4.x + Angular TestBed
- Run: `npm test` in `task-manager-client/`
- Test files: `*.spec.ts` co-located with source — **still unmodified scaffolds, high-priority gap**

**Claude: run tests after every non-trivial change. Treat failing tests as the highest priority signal. When adding new features, write meaningful tests that encode business rules.**

## Git Conventions
- Single branch: `main`
- Commit style: lowercase imperative, descriptive, no conventional commit prefixes
- Examples: "fix sidebar mobile visibility and add project documentation"
- Deploys trigger automatically on push to `main` (Vercel + Railway)
- **All commits must be made by the user only** — Claude must never commit, and must never be listed as a co-author

## Guardrails
- NEVER hardcode credentials, API keys, or secrets in source files
- NEVER read or log `.env` file contents
- NEVER use `any` type — the frontend has heavy `any` usage that should be replaced with proper types
- NEVER use constructor injection in Angular — use `inject()` function
- NEVER create NgModules — all components are standalone
- NEVER add manual Authorization headers in services — the `authInterceptor` handles this globally (TaskService has redundant headers that should be removed, not replicated)
- Both `environment.ts` and `environment.prod.ts` point to the Railway production URL — for local backend dev, override `apiUrl` to `http://localhost:5000/api`
- No ESLint configured — rely on Prettier and TypeScript strict mode

## Maintenance
When Claude makes a mistake in this codebase, add a rule to `.claude/rules/` to prevent it.
Quarterly: audit this file and all rules for accuracy against current codebase state.
