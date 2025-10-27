---
description: Analyze a feature and save documentation to docs/features/
---

Please analyze the feature "$ARGUMENTS" and save the documentation.

Steps:
1. Run: `pnpm run analyze:feature $ARGUMENTS --save`
2. Read the generated documentation file from `docs/features/` folder
3. Summarize the key findings:
   - Total components, hooks, and stores
   - Number of Convex queries and mutations
   - Key permissions and capabilities
   - Any notable patterns or issues
4. If no argument provided, run interactive mode: `pnpm run analyze:feature --list`

If analysis reveals any issues or inconsistencies, suggest improvements.
