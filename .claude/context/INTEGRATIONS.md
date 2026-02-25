# External Integrations

## MongoDB Atlas
- **Purpose**: Primary database for users and tasks
- **Config**: `MONGO_URI` environment variable in `task-manager-ts/.env`
- **Connection**: `src/config/db.ts` calls `mongoose.connect(process.env.MONGO_URI)`
- **Failure mode**: App logs connection error and exits if Atlas is unreachable
- **No retry logic** currently implemented — Mongoose default reconnection only

## Railway (Backend Hosting)
- **Purpose**: Hosts the Express API in production
- **Deploy trigger**: Auto-deploy on push to `main` via GitHub integration
- **Config**: Environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`) set in Railway dashboard
- **Start command**: `node dist/server.js` (requires `npm run build` first)
- **URL**: Production API URL referenced in frontend `environment.prod.ts`
- **TLS**: Handled at the Railway edge — no app-level HTTPS configuration

## Vercel (Frontend Hosting)
- **Purpose**: Hosts the Angular SPA in production
- **Deploy trigger**: Auto-deploy on push to `main` via GitHub integration
- **Config**: `task-manager-client/vercel.json` — SPA catch-all rewrite (`/(.*) -> /index.html`)
- **Build**: `ng build` produces static files in `dist/`
- **TLS**: Handled at the Vercel edge

## JWT Authentication
- **Library**: jsonwebtoken 9.0.3
- **Signing key**: `JWT_SECRET` environment variable (never hardcoded)
- **Expiry**: 30 days
- **Client storage**: `localStorage` keys `token` and `user`
- **Transmission**: `Authorization: Bearer <token>` header via `authInterceptor`
- **Failure mode**: Expired/invalid token returns 401 from `protect` middleware

## bcryptjs (Password Hashing)
- **Library**: bcryptjs 3.0.3
- **Salt rounds**: 10
- **Usage**: User model pre-save hook hashes password before storing
- **Verification**: `bcrypt.compare()` in login controller

## Environment Configuration Summary

### Backend (`task-manager-ts/.env`)
| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Express server port | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key | (strong random string) |

### Frontend (`task-manager-client/src/environments/`)
| File | `apiUrl` | Notes |
|------|----------|-------|
| `environment.ts` | Railway production URL | Override to `http://localhost:5000/api` for local dev |
| `environment.prod.ts` | Railway production URL | Used in production builds |

**Note**: Both environment files currently point to the same Railway production URL. Local backend development requires manually changing `apiUrl` in `environment.ts` to `http://localhost:5000/api`.
