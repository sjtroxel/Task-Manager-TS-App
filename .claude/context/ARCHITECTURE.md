# Architecture

## System Overview

```
                         +-----------+
                         |  MongoDB  |
                         |   Atlas   |
                         +-----^-----+
                               |
+------------------+     +-----+------+
|   Angular SPA    | --> |  Express   |
|  (Vercel CDN)    |     |   API      |
|  port 4200 (dev) |     | (Railway)  |
+------------------+     | port 5000  |
                         +------------+
```

Two independent packages, no shared root `package.json`:
- `task-manager-ts/` — Express 5.x REST API
- `task-manager-client/` — Angular 21 SPA

## Backend Module Responsibilities

| Module | Path | Responsibility |
|--------|------|----------------|
| Entry | `src/server.ts` | Express setup, CORS, JSON parsing, route mounting |
| DB Config | `src/config/db.ts` | MongoDB Atlas connection via Mongoose |
| User Model | `src/models/userModel.ts` | User schema with bcrypt password hashing |
| Task Model | `src/models/taskModel.ts` | Task schema with user ownership reference |
| User Controller | `src/controllers/userController.ts` | Register, login, update profile |
| Task Controller | `src/controllers/taskController.ts` | CRUD operations scoped to authenticated user |
| User Routes | `src/routes/userRoutes.ts` | Public + protected user endpoints |
| Task Routes | `src/routes/taskRoutes.ts` | All protected task endpoints |
| Auth Middleware | `src/middleware/authMiddleware.ts` | JWT verification, attaches `req.user` |
| Token Util | `src/utils/generateToken.ts` | JWT signing (30-day expiry) |

## Backend Data Flow
```
Request -> CORS/JSON middleware -> Router -> authMiddleware (protected) -> Controller -> Model -> MongoDB Atlas
```

## Backend Dependency Rules
- `server.ts` -> routes only
- routes -> controllers + middleware
- controllers -> models + utils
- models -> (none, leaf nodes)
- **No circular imports** — strict DAG

## Frontend Module Responsibilities

| Module | Path | Responsibility |
|--------|------|----------------|
| Root Component | `app.ts` | Sidebar toggle, dark mode signal, theme effect |
| Router Config | `app.routes.ts` | Route definitions with auth guards |
| App Config | `app.config.ts` | Providers: router, HTTP client, interceptors |
| Auth Service | `services/auth.service.ts` | Login/register/logout, currentUser signal, localStorage |
| Task Service | `services/task.service.ts` | Task CRUD, tasks signal |
| Auth Interceptor | `interceptors/auth-interceptor.ts` | Attaches Bearer token to all HTTP requests |
| Auth Guard | `guards/auth-guard.ts` | Redirects unauthenticated users to /login |
| No-Auth Guard | `guards/no-auth-guard.ts` | Redirects authenticated users away from /login |

## Frontend Data Flow
```
Component -> Service (read signal) -> HTTP call (interceptor adds token) -> Backend API -> Signal update -> Component re-render
```

## Authentication Flow
1. User registers/logs in -> backend returns JWT (30-day expiry)
2. Frontend stores token in `localStorage` (key: `token`), user object (key: `user`)
3. `authInterceptor` attaches token to all subsequent HTTP requests
4. Backend `protect` middleware verifies JWT -> attaches user to `req.user`
5. Controllers use `req.user._id` to scope database queries

## External Integrations
- **MongoDB Atlas** — cloud database via `MONGO_URI` env var
- **Railway** — backend hosting, env vars in dashboard
- **Vercel** — frontend hosting, SPA rewrite via `vercel.json`

## Known Redundancy
`TaskService` manually builds `Authorization` headers AND the global `authInterceptor` also injects them. The interceptor overwrites the manual header. The manual headers are dead code and should be removed.
