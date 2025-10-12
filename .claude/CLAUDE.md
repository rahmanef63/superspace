# Project Guardrails (SuperSpace / Convex)
- Stack: Next.js (App Router), Convex (DB utama), shadcn/ui, Zustand.
- Prinsip: **RBAC ketat**, **audit logging**, **validasi Zod**, **tests hijau**.
- Dilarang: ganti arsitektur RBAC/Convex; hapus audit; bypass permission.
- Sumber kebenaran:
  - convex/workspace/*, convex/menu/*, convex/components/*, convex/user/*, convex/schema.ts
  - scripts/validate-*.ts, tests/*.test.ts
- Pipeline:
  - `/validate:workspace`, `/validate:settings`, `/validate:document`, `/validate:role`, `/validate:conversation`
  - `/test` untuk semua integration/unit tests
- Definition of Done (DoD) untuk semua agen:
  1) Skema tervalidasi (Zod script OK)
  2) RBAC & permission checks diterapkan
  3) Audit event dicatat
  4) Tests hijau (unit+integration)
  5) CI snippet siap
