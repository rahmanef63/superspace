# Task Tracker – Q4 2025

This list reflects the next actions after the 2025-10-02 refactor. Use it as a living checklist; update status inline.

## Platform hygiene
- [ ] `pnpm install` so the newly declared `eslint` dependency is available locally.
- [ ] `pnpm lint` and `pnpm test` before every PR (lint requires the install above).
- [ ] Add CI job gates for lint + build (GitHub Actions template lives in `scripts/ci` – TODO).

## Front-end follow-ups
- [ ] Replace `frontend/features/wa/components/calls/mockData.ts` with real Convex queries once the call log API ships. Ensure the data loader keeps the `CallSummary` / `CallDetail` shape so the views remain stable.
- [ ] Audit other WhatsApp surfaces for hard-coded fixtures (`status`, `archived`, etc.) and migrate them to shared data modules.
- [ ] Extend `RowActions` usage across remaining list-style screens (search, canvas, etc.) to remove duplicated button markup.
- [ ] Add e2e smoke test (Playwright or Cypress) covering mobile/desktop split views in `CallsView`.

## Documentation upkeep
- [ ] Keep `doc/files-structure.txt` up to date when moving modules.
- [ ] Record future migrations in `doc/migration.md` (append chronologically, newest first).
- [ ] Expand ERD commentary with any new backend tables introduced during Q4.

## Stretch goals
- [ ] Surface contact metadata from Convex in `TopBar` (avatar, username, phone) once the backend exposes it.
- [ ] Promote `RowActions` into a reusable package (`frontend/shared/layout/actions`) if additional configuration (tooltips, destructive buttons) becomes necessary.
- [ ] Build a generator script that scaffolds feature modules (`frontend/features/<domain>`) with consistent `components/`, `views/`, and `shared/` directories.

