---
description: Run all validation scripts and tests for the project
---

Run comprehensive validation checks following the Project Guardrails.

Steps:
1. Run feature validation: `pnpm run validate:features`
2. Run all validation scripts: `pnpm run validate:all`
3. Run tests: `pnpm test`
4. Check results against Definition of Done (DoD):
   - ✅ Skema tervalidasi (Zod script OK)
   - ✅ RBAC & permission checks diterapkan
   - ✅ Audit event dicatat
   - ✅ Tests hijau (unit+integration)
   - ✅ CI snippet siap

Report any failures or issues found and suggest fixes.

If $ARGUMENTS is provided, run specific validation:
- `/validate-project workspace` - Only validate workspace
- `/validate-project features` - Only validate features
- `/validate-project test` - Only run tests
