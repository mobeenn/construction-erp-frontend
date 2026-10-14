# Production Fix Plan

Based on [`AUDIT.md`](./AUDIT.md). UI and functionality must not change. Small, reviewable steps.

---

## Manual actions (you must do outside the code)

1. **Vercel Frontend** — Env (Production):  
   - `VITE_API_URL=https://construction-erp-backend-gilt.vercel.app/api`  
   - `VITE_SITE_URL=https://construction-erp-frontend-six.vercel.app`
2. **Vercel Backend** — Env (Production):  
   - `DATABASE_URL` = Supabase **Transaction pooler** host, port **6543** (e.g. `...pooler.supabase.com:6543/postgres`)  
   - `DIRECT_URL` = Session/direct connection (port **5432**) — migrations/CLI only  
   - `FRONTEND_URL=https://construction-erp-frontend-six.vercel.app`  
   - `JWT_SECRET` = strong random string  
   - `JWT_EXPIRE=7d`  
   - `NODE_ENV=production`  
   - `ALLOW_PUBLIC_REGISTER=false` (or omit; default off after fix)
3. **Vercel Backend region** — Prefer same region as Supabase (or move DB closer to `bom1`).
4. **Rotate** DB password and JWT if `.env` was ever pushed to GitHub.
5. **Redeploy** both projects after P0 lands.

---

## P0 — Fix live errors and critical risks

### P0-1 SPA rewrite (Problem A)

| Field | Detail |
|-------|--------|
| What | Add `frontend/vercel.json` rewrite all non-file routes → `/index.html` |
| Files | `frontend/vercel.json` |
| Why | Hard reload / deep links currently 404 |
| Risk | Low |
| UI | Unchanged |
| Verify | Open `/login`, refresh; open `/hr`, refresh — both load app |
| Rollback | Delete `vercel.json` and redeploy |

### P0-2 DB pool singleton + serverless caps (Problem B)

| Field | Detail |
|-------|--------|
| What | `globalThis` singleton; on Vercel `max: 1`, short idle timeout, `allowExitOnIdle`; support `DIRECT_URL` for scripts; document :6543 |
| Files | `backend/src/config/pool.js`, `backend/.env.example`, migration scripts that use pool |
| Why | EMAXCONNSESSION from many pools × max 10 |
| Risk | Medium (too-low max under single-instance concurrency → queue waits; prefer :6543) |
| UI | Unchanged; tables should load instead of error |
| Verify | Repeated refresh + concurrent tabs; no EMAXCONNSESSION |
| Rollback | Revert `pool.js`; restore prior env |

### P0-3 Gate cold-start seed + protect `/db-status`

| Field | Detail |
|-------|--------|
| What | Skip `seedAccounting` when `VERCEL=1` unless `RUN_SEED_ON_BOOT=true`; require auth (admin) for `/db-status` or replace with lightweight `/api/health` |
| Files | `backend/app.js` |
| Why | Extra connections + public DoS vector |
| Risk | Low |
| Verify | `GET /` and `GET /api/health` OK; `/db-status` 401 without token |

### P0-4 Lock down public register

| Field | Detail |
|-------|--------|
| What | Disable public `/register` unless `ALLOW_PUBLIC_REGISTER=true`; force role `employee` if ever enabled; keep admin `create-user` |
| Files | `backend/src/routes/auth.routes.js`, `auth.controller.js`, `auth.validation.js` |
| Why | Anyone could register as admin |
| Risk | Low if UI never used public register; if a signup form exists it will get 403 — confirm FE uses login/create-user only |
| Verify | `POST /api/auth/register` → 403; admin create-user still works |

### P0-5 Path traversal on daily-report download

| Field | Detail |
|-------|--------|
| What | Basename-only resolve under upload dir; reject `..` |
| Files | `backend/src/controllers/dailyReports/dailyReport.controller.js`, `uploadPaths.js` |
| Risk | Low |
| Verify | Normal download works; `../` filename returns 400/404 |

### P0-6 Transient DB error handling (backend)

| Field | Detail |
|-------|--------|
| What | Detect EMAXCONNSESSION / connection errors; short retry/backoff on pool.query; return friendly JSON message (same status shape) |
| Files | `backend/src/config/pool.js`, optional thin helper |
| Risk | Low |
| UI | Existing ErrorState still shows message; copy may be slightly clearer |

---

## P1 — Performance (invisible to user)

### P1-1 Route-level code splitting

| Field | Detail |
|-------|--------|
| What | `React.lazy` + `Suspense` in `AppRoutes.jsx`; fallback = existing `PageLoader` / skeleton look |
| Files | `frontend/src/routes/AppRoutes.jsx` |
| Risk | Low |
| Verify | Navigate between modules; Network shows async chunks; UI identical |

### P1-2 Split formatters from Highcharts

| Field | Detail |
|-------|--------|
| What | Move `formatCompact` / `formatCurrency` / `SERIES_COLORS` to `frontend/src/utils/format.js`; re-export from `Charts.jsx` for compatibility; pages that only need formatters import utils |
| Files | `frontend/src/utils/format.js`, `Charts.jsx`, high-traffic accounting imports |
| Risk | Low |
| Verify | Currency display unchanged; charts still work |

### P1-3 Notification poll / HR fetch caps (no UI change)

| Field | Detail |
|-------|--------|
| What | Keep 30s poll but skip when tab hidden (`document.visibilityState`); leave HR API limits as-is for UI parity unless backend adds pagination (incremental) |
| Files | `NotificationContext.jsx` |
| Risk | Low |

### P1-4 Soft query limits in pgDb (non-breaking)

| Field | Detail |
|-------|--------|
| What | When filter is empty and no explicit limit, apply a high safety ceiling only for `countDocuments` optimization path if safe; prefer adding `.limit()` support used by controllers that already pass page size — **do not change response shape for existing unpaginated UIs** |
| Files | `pgDb.js` carefully; employee/user paths already paginate in memory |
| Risk | Medium — skip aggressive global LIMIT that truncates admin tables; instead optimize `countDocuments` with SQL `COUNT(*)` where no filter children needed |
| Ask | Full SQL filter pushdown deferred if risky |

### P1-5 Security headers (safe subset)

| Field | Detail |
|-------|--------|
| What | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` via small middleware (no strict CSP yet — CSP can break Highcharts/fonts) |
| Files | `backend/app.js` |
| Risk | Low |

---

## P2 — Hardening and polish

### P2-1 `/api/health` lightweight ping

| Field | Detail |
|-------|--------|
| What | `GET /api/health` → `{ ok: true }` + optional DB `SELECT 1` with timeout |
| Files | `backend/app.js` |

### P2-2 Env example + Node engines

| Field | Detail |
|-------|--------|
| What | Update `.env.example`; add `engines.node` in package.json |
| Files | backend/frontend `package.json`, `.env.example` |

### P2-3 Frontend error boundary

| Field | Detail |
|-------|--------|
| What | Thin ErrorBoundary wrapping app content; reuse existing ErrorState styling |
| Files | `frontend/src/components/ui/ErrorBoundary.jsx`, `main.jsx` or `App.jsx` |

### P2-4 Docs handoff

| Field | Detail |
|-------|--------|
| What | `docs/RESULTS.md`, `docs/PRODUCTION_CHECKLIST.md` |
| Verify | Lint/build both packages |

---

## Ordered implementation sequence

1. P0-1 → P0-2 → P0-3 → P0-4 → P0-5 → P0-6  
2. P1-1 → P1-2 → P1-3 → P1-4 (conservative) → P1-5  
3. P2-1 → P2-2 → P2-3 → P2-4  
4. Run lint/build; record results

---

## Rollback summary

| Item | Rollback |
|------|----------|
| FE vercel.json | Remove file, redeploy |
| pool.js | Git revert; restore Vercel `DATABASE_URL` |
| Register lock | Set `ALLOW_PUBLIC_REGISTER=true` temporarily |
| Lazy routes | Revert `AppRoutes.jsx` to static imports |
