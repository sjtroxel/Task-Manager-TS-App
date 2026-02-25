# Testing Rules

## Test Commands
- Frontend full suite: `cd task-manager-client && npm test`
- Frontend single file: `cd task-manager-client && npx vitest run <file-path>`
- Backend: no test framework configured yet (high-priority gap)

## Tests as Specifications
- Tests define "correct" behavior — write failing tests before implementation
- Test names should read as requirements: `it('rejects tasks belonging to other users')`
- Replace scaffold tests (`expect(component).toBeTruthy()`) with real behavior tests when touching a file

## Current State: CRITICAL GAP
Coverage is effectively 0%. All 10 frontend spec files are unmodified Angular CLI scaffolds. Backend has zero tests. This severely limits AI effectiveness.

**When modifying any file, add or improve at least one meaningful test.**

## Test Structure
- Framework: Vitest 4.x + Angular TestBed (frontend)
- Location: `*.spec.ts` co-located with source files in `task-manager-client/src/app/`
- Use `TestBed.configureTestingModule()` for Angular components
- Mock HTTP calls with `provideHttpClientTesting()`
- Test signals by calling `.set()` / `.update()` and asserting the result

## After Every Non-Trivial Change
1. Run the test suite
2. Treat any failure as highest priority
3. Fix failing tests before moving on
