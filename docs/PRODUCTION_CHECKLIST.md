# Production checklist

## Environment variables

### Frontend (Vercel)

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://construction-erp-backend-gilt.vercel.app/api` |
| `VITE_SITE_URL` | `https://construction-erp-frontend-six.vercel.app` |

(Also committed in `frontend/.env.production` for builds.)

### Backend (Vercel)

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase **Transaction** pooler, port **6543** |
| `DIRECT_URL` | Direct/session URL, port **5432** (migrations/CLI only) |
| `FRONTEND_URL` | `https://construction-erp-frontend-six.vercel.app` |
| `JWT_SECRET` | Long random secret (rotate if ever leaked) |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |
| `ALLOW_PUBLIC_REGISTER` | `false` (or omit) |
| `RUN_SEED_ON_BOOT` | omit / `false` on Vercel |
| `PG_POOL_MAX` | optional; defaults to `1` on Vercel |

## Supabase pooler

1. Dashboard → Project Settings → Database → Connection string.
2. Use **Transaction** mode pooler host (`*.pooler.supabase.com`) port **6543** for `DATABASE_URL`.
3. Use direct/session **5432** for `DIRECT_URL` and local migrations (`npm run db:*`).
4. Confirm pool size limits match serverless (`max: 1` per isolate).

## Vercel region

- Frontend currently reported as **bom1**.
- Database historically **ap-southeast-2**. Prefer aligning backend function region with DB (e.g. `sin1`) **or** move Supabase closer to `bom1` to cut latency.
- Set in Vercel Project → Settings → Functions → Region (or `regions` in `vercel.json` after confirming).

## Domains

- Frontend: `https://construction-erp-frontend-six.vercel.app`
- Backend: `https://construction-erp-backend-gilt.vercel.app`
- CORS allowlists these origins (+ `FRONTEND_URL`).

## Monitoring / health

- Lightweight: `GET https://construction-erp-backend-gilt.vercel.app/api/health`
- Root ping: `GET /` → `{ success: true, message: "Construction ERP API Running" }`
- Heavy inventory: `GET /db-status` (admin JWT only)
- Recommended next step: enable Vercel Analytics + Sentry (not installed in this pass).

## Backups / RLS

- Enable Supabase automated backups / PITR per plan.
- RLS not enabled in this app layer (service uses direct Postgres). Treat API auth as the boundary; review RLS before exposing the DB beyond the API.

## Security post-deploy

- [ ] Confirm `POST /api/auth/register` returns 403
- [ ] Rotate DB password if `.env` was ever in git history
- [ ] Rotate `JWT_SECRET` and re-login users
- [ ] Confirm SPA hard-refresh works on deep routes

## Rollback

| Change | Rollback |
|--------|----------|
| FE `vercel.json` | Delete file, redeploy |
| Pool / auth / health | `git revert` backend commits; restore prior `DATABASE_URL` |
| Lazy routes | Revert `AppRoutes.jsx` |
| Register lock | Set `ALLOW_PUBLIC_REGISTER=true` temporarily (forces employee role only) |

## Deploy order

1. Set backend env (`DATABASE_URL` :6543 first).
2. Deploy backend.
3. Hit `/api/health`.
4. Deploy frontend (includes SPA rewrites).
5. Hard-refresh `/login` and an authenticated deep link.
6. Smoke tables (projects, inventory, HR).
