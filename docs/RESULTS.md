# Verification Results

**Date:** 2026-10-14

## Builds

| Package | Command | Result |
|---------|---------|--------|
| Frontend | `npm run build` | **Pass** (~11s); main chunk ~300 kB / 93 kB gzip |
| Frontend | `npm run lint` | Fails with many **pre-existing** react-hooks/set-state-in-effect findings across pages; not introduced as a gate for this pass |
| Backend modules | `require('./src/config/pool')` etc. | **Pass** |
| Backend app load | `require('./app')` | Loads; DB connect may timeout offline (non-fatal) |

## Bundle (before → after)

| Metric | Before (approx) | After |
|--------|-----------------|-------|
| Main JS chunk | ~1,026 kB / ~281 kB gzip (monolith) | **~300 kB / ~93 kB gzip** (`index-*.js`) |
| Route chunks | None | Many async page chunks (e.g. Dashboard ~9.6 kB, HRManagement ~52 kB, ProjectDetails ~52 kB) |
| Format helpers | Pulled via Charts/Highcharts on many pages | Shared `format-*.js` ~0.7 kB; accounting pages avoid Highcharts |

## Checklist (post-deploy)

| Check | Status |
|-------|--------|
| Hard reload `/login` | Pending live verify after FE deploy with `vercel.json` |
| Hard reload authenticated deep route | Pending |
| Tables load without EMAXCONNSESSION | Pending after BE deploy + `DATABASE_URL` :6543 |
| UI/visual regression | Code-split + ErrorBoundary only; no intentional UI changes |
| Public register disabled | Code: 403 unless `ALLOW_PUBLIC_REGISTER=true` |
| `/api/health` | Added |
| `/db-status` | Admin auth required |

## Notes

- Full Lighthouse / concurrent load numbers require a deployed environment with the transaction pooler URL set.
- Highcharts still heavy when a chart page loads; it is deferred until those routes load.
