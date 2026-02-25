---
paths:
  - "task-manager-ts/src/**/*.ts"
---

# API Rules

## Route Structure
- User routes: `POST /api/users`, `POST /api/users/register`, `POST /api/users/login`, `PUT /api/users/profile`
- Task routes: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id`
- All task routes require the `protect` middleware

## Controller Pattern
- Async/await with try/catch for all controller functions
- Annotate with `@desc` and `@route` JSDoc comments
- Return JSON: `{ message: '...' }` for errors, entity data for success
- HTTP status codes: 201 (created), 200 (success), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)

## Authentication
- `protect` middleware verifies JWT from `Authorization: Bearer <token>` header
- Attaches `req.user` with user document (excluding password)
- All data-access controllers scope queries by `req.user._id`

## Middleware Order
Request -> CORS -> JSON parser -> Router -> `protect` middleware (protected routes) -> Controller -> Response

## Module System
- ES modules only (`"type": "module"` in package.json)
- Use `import`/`export`, never `require()`
- Named exports from models and utils
