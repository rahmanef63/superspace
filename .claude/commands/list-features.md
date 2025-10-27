---
description: List all registered features in the project
---

Show all features registered in the feature registry system.

Steps:
1. Run: `pnpm run list:features`
2. Summarize the output showing:
   - Total number of features
   - Features by category
   - Features by status (stable, beta, development)
   - Features that are production-ready vs in development

If $ARGUMENTS is provided, filter by that criteria:
- `/list-features --type optional` - Show optional features
- `/list-features --category communication` - Show communication features
- `/list-features --status stable` - Show stable features
