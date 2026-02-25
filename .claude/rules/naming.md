# Naming Conventions

## Variables & Functions
- camelCase: `currentUser`, `getTasks`, `createTask`, `isCompleted`
- Boolean prefix with `is`/`has`: `isDarkMode`, `isSidebarOpen`, `isCompleted`
- Signals: name reflects the value, not the signal: `tasks`, `currentUser`, `errorSignal`

## Classes & Interfaces
- PascalCase classes: `AuthService`, `TaskController`, `UserController`
- Backend interfaces: `I` prefix (`IUser`, `ITask`)
- Angular services: `XxxService` suffix (`AuthService`, `TaskService`)
- Angular components: `XxxComponent` suffix (`TaskListComponent`, `ProfileComponent`)

## Files & Directories
- Backend (task-manager-ts/src/): camelCase with role suffix — `taskController.ts`, `authMiddleware.ts`, `userRoutes.ts`, `generateToken.ts`
- Frontend (task-manager-client/src/app/): kebab-case — `task-list/`, `auth-guard.ts`, `auth-interceptor.ts`, `auth.service.ts`
- Test files: `*.spec.ts` co-located with source file

## Angular Selectors
- All component selectors use `app-` prefix: `app-home`, `app-login`, `app-task-list`, `app-task-form`, `app-profile`
