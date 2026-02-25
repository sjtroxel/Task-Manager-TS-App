# Coverage Completion Spec

## Goal
Bring all files in `task-manager-ts/src/` to 100% statement, branch, function, and line coverage.

## Starting Point
92.63% overall after initial test suite. Remaining gaps:

| File | Uncovered Lines | Root Cause |
|------|----------------|------------|
| `src/app.ts` | 15 | `GET /` health check never tested |
| `src/controllers/taskController.ts` | 12, 55, 77 | Catch blocks — require Mongoose to throw |
| `src/controllers/userController.ts` | 65, 96–99 | Catch block + user-not-found branch |
| `src/middleware/authMiddleware.ts` | branch at 32 | Structurally unreachable `if (!token)` false branch |

---

## Changes

### authMiddleware.ts — refactor (not just tests)
The original `if (!token)` check after the try/catch block has an unreachable false branch:
the try/catch always returns before line 32 is reached. Replaced with `else` clause — identical
behavior, all branches now reachable.

### Tests Added

#### tests/auth.test.ts
| # | Test | Covers |
|---|------|--------|
| + | `GET /` returns 200 health check | app.ts:15 |
| + | `Authorization: "Bearer "` (no token after space) returns 401 | authMiddleware else branch |

#### tests/tasks.test.ts
| # | Test | Covers |
|---|------|--------|
| + | `PUT /api/tasks/not-valid-id` → 500 | taskController.ts:55 (updateTask catch) |
| + | `DELETE /api/tasks/not-valid-id` → 500 | taskController.ts:77 (deleteTask catch) |
| + | Mock `Task.find` to throw → `GET /api/tasks` → 500 | taskController.ts:12 (getTasks catch) |

#### tests/users.test.ts
| # | Test | Covers |
|---|------|--------|
| + | Mock `User.findOne` to throw → `POST /api/users/login` → 500 | userController.ts:65 (loginUser catch) |
| + | Delete user after getting token → `PUT /api/users/profile` → 404 | userController.ts:96–97 (user not found) |
| + | Mock `UserModel.prototype.save` to throw → `PUT /api/users/profile` → 500 | userController.ts:98–99 (profile catch) |

## Technique Notes
- **Malformed ObjectID** (`not-valid-id`): Mongoose throws a `CastError` on `findById`, caught by try/catch → 500.
- **vi.spyOn**: Used to simulate DB failures on `Task.find`, `User.findOne`, and `User.prototype.save` without disconnecting the test database.
- **Delete-then-call**: Register user, capture token, delete user via `User.deleteOne()`, call profile update → `findById` returns null → 404.
