# Backend Test Suite Spec

## Overview
Full integration test suite for the `task-manager-ts` Express API. Tests run against an in-memory MongoDB instance (no external database required) using Vitest + Supertest + mongodb-memory-server.

## Stack
| Tool | Purpose |
|------|---------|
| Vitest | Test runner (consistent with frontend) |
| Supertest | HTTP integration testing |
| mongodb-memory-server | In-memory MongoDB for test isolation |
| @vitest/coverage-v8 | Code coverage reporting |

## Test Files
```
task-manager-ts/
  tests/
    setup.ts          ← Global beforeAll/afterEach/afterAll (DB lifecycle)
    auth.test.ts      ← authMiddleware edge cases
    users.test.ts     ← /api/users/* routes
    tasks.test.ts     ← /api/tasks/* routes
  vitest.config.ts
```

## Commands
```bash
cd task-manager-ts
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

---

## Test Cases

### auth.test.ts — Auth Middleware

| # | Description | Expected |
|---|-------------|----------|
| 1 | No Authorization header | 401 "Not authorized, no token!" |
| 2 | Malformed header (no "Bearer " prefix) | 401 |
| 3 | Invalid token signature | 401 "Not authorized, token failed!" |
| 4 | Expired token | 401 "Not authorized, token failed!" |
| 5 | Valid token | Request passes through to handler |

---

### users.test.ts — User Routes

#### POST /api/users/register

| # | Description | Expected |
|---|-------------|----------|
| 1 | Valid registration | 201, body: { _id, name, email, token, message } |
| 2 | Token is present in response | 201, token is a non-empty string |
| 3 | Password not returned in response | 201, no `password` field in body |
| 4 | Duplicate email | 400 "User already exists!" |
| 5 | Missing name | 500 (Mongoose validation error) |
| 6 | Missing email | 500 (Mongoose validation error) |
| 7 | Missing password | 500 (Mongoose validation error) |

#### POST /api/users/login

| # | Description | Expected |
|---|-------------|----------|
| 8 | Valid credentials | 200, body: { _id, name, email, token } |
| 9 | Email not found | 401 "Invalid email or password!" |
| 10 | Wrong password | 401 "Invalid email or password!" |

#### PUT /api/users/profile (protected)

| # | Description | Expected |
|---|-------------|----------|
| 11 | Update name | 200, response name matches new value |
| 12 | Update password — new password works for login | 200, subsequent login with new password → 200 |
| 13 | Email is not updatable | 200, email in response unchanged |
| 14 | No token | 401 "Not authorized, no token!" |
| 15 | Invalid token | 401 "Not authorized, token failed!" |

---

### tasks.test.ts — Task Routes

#### GET /api/tasks

| # | Description | Expected |
|---|-------------|----------|
| 16 | No tasks exist | 200, empty array |
| 17 | Returns only authenticated user's tasks | 200, array excludes other users' tasks |
| 18 | No token | 401 |

#### POST /api/tasks

| # | Description | Expected |
|---|-------------|----------|
| 19 | Valid task | 201, body: { _id, user, title, description, isCompleted: false } |
| 20 | isCompleted defaults to false | 201, isCompleted === false |
| 21 | Task user field matches authenticated user | 201, task.user === logged-in user's _id |
| 22 | Missing title | 400 "Invalid task data" |
| 23 | Missing description | 400 "Invalid task data" |
| 24 | No token | 401 |

#### PUT /api/tasks/:id

| # | Description | Expected |
|---|-------------|----------|
| 25 | Update task fields | 200, updated values in response |
| 26 | Toggle isCompleted to true | 200, isCompleted === true |
| 27 | Task not found | 404 "Task not found!" |
| 28 | Another user's task | 401 "User not authorized to update this task!" |
| 29 | No token | 401 |

#### PATCH /api/tasks/:id

| # | Description | Expected |
|---|-------------|----------|
| 30 | Partial update (toggle isCompleted) | 200, isCompleted toggled |
| 31 | Another user's task | 401 "User not authorized to update this task!" |

#### DELETE /api/tasks/:id

| # | Description | Expected |
|---|-------------|----------|
| 32 | Delete own task | 200, { id, message: "Task removed!" } |
| 33 | Task gone from subsequent GET | 200, GET returns empty array |
| 34 | Task not found | 404 "Task not found!" |
| 35 | Another user's task | 401 "User not authorized to delete this task!" |
| 36 | No token | 401 |

---

## Coverage Target
80%+ across controllers, middleware, and routes.

## Design Notes
- **Integration tests over unit tests**: Tests send real HTTP requests through the full middleware stack, giving higher confidence than mocked unit tests.
- **Isolated DB**: mongodb-memory-server provides a fresh MongoDB instance per test run; collections are cleared between each test to prevent state leakage.
- **app.ts extraction**: `server.ts` was split into `app.ts` (Express setup, exported for testing) and `server.ts` (DB connect + listen, not imported in tests).
- **No external dependencies at test time**: Tests never touch MongoDB Atlas or Railway.
