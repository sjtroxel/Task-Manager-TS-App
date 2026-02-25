# Security Rules

## Credential Handling
- NEVER hardcode credentials, API keys, or secrets in source code
- NEVER read from `.env` files directly — use `process.env` at runtime
- NEVER log credentials, tokens, or connection strings
- NEVER commit `.env` files — only `.env.example` with placeholder values
- NOTE: Claude Code may auto-load `.env` — keep actual secrets outside the project directory when possible

## Sensitive Environment Variables
- `MONGO_URI` — MongoDB Atlas connection string (in `task-manager-ts/.env`)
- `JWT_SECRET` — token signing key (in `task-manager-ts/.env`)
- `PORT` — server port (in `task-manager-ts/.env`)

## Authentication
- JWT tokens stored in localStorage (known XSS risk — do not make it worse)
- Password hashing: bcryptjs with salt rounds = 10 — never reduce salt rounds
- Token expiry: 30 days — do not increase without explicit approval
- All task routes require the `protect` middleware — never expose task endpoints without auth

## Sensitive Operations (require human approval)
- Changing JWT_SECRET or token expiry duration
- Modifying the `protect` middleware or auth flow
- Adding new unprotected API routes that access user data
- Changing password hashing algorithm or salt rounds
- Modifying CORS configuration

## Defense in Depth
- Layer 3: Keep actual `.env` outside project directory; commit only `.env.example`
- Layer 4: Consider secret manager references (e.g., 1Password `op://`) instead of literal values
- Layer 5: Add CI/CD secret scanning (gitleaks, dependabot) — run `/ai-ci-onboard` to set up
