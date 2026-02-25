# Testing Rules

## Test Commands

### Backend (`task-manager-ts/`)
- Full suite: `cd task-manager-ts && npm test`
- Watch mode: `cd task-manager-ts && npm run test:watch`
- Coverage: `cd task-manager-ts && npm run test:coverage`
- Single file: `cd task-manager-ts && npx vitest run tests/<file>.test.ts`

### Frontend (`task-manager-client/`)
- Full suite: `cd task-manager-client && npm test`
- Single file: `cd task-manager-client && npx vitest run <file-path>`

## Backend Test Architecture
- **Stack**: Vitest 4.x + Supertest + mongodb-memory-server
- **DB isolation**: `tests/setup.ts` starts an in-memory MongoDB before all tests and clears all collections after each test — no shared state between tests
- **App export**: `src/app.ts` exports the Express app without connecting to DB or calling listen; `src/server.ts` handles startup. Always import from `src/app.ts` in tests.
- **Coverage**: 100% statements, branches, functions, lines across all files in `src/`
- **Test files**: `tests/auth.test.ts`, `tests/users.test.ts`, `tests/tasks.test.ts`

## Tests as Specifications
- Tests define "correct" behavior — write failing tests before implementation
- Test names should read as requirements: `it('rejects tasks belonging to other users')`
- Cover both happy paths AND all error paths (404, 401, 400, 500)

## Backend Testing Patterns
- Use a valid-format but non-existent ObjectID (`000000000000000000000000`) for "not found" → 404
- Use a malformed ObjectID (`not-valid-id`) to trigger Mongoose CastError → catch block → 500
- Use `vi.spyOn(Model, 'method').mockRejectedValueOnce(new Error('DB error'))` to simulate DB failures
- Always call `vi.restoreAllMocks()` after spyOn tests
- When a controller path requires middleware to succeed but controller to fail, mock with a call counter

## Frontend Testing — CRITICAL GAP
All 10 frontend spec files are unmodified Angular CLI scaffolds (`expect(component).toBeTruthy()`).
- Use `TestBed.configureTestingModule()` for Angular components
- Mock HTTP calls with `provideHttpClientTesting()`
- Test signals by calling `.set()` / `.update()` and asserting the result
- Replace scaffold tests when touching any frontend file

## After Every Non-Trivial Change
1. Run the relevant test suite
2. Treat any failure as highest priority — fix before moving on
3. Add a meaningful test for any new behavior introduced
