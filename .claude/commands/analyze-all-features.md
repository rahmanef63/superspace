---
description: Analyze and document all features in the project
---

Analyze all features and generate documentation for each one.

This will:
1. Get list of all features from registry
2. For each feature, run: `pnpm run analyze:feature {feature-id} --save`
3. Generate documentation in docs/features/ for all features
4. Provide summary report of:
   - Total features analyzed
   - Average number of components per feature
   - Total Convex operations (queries + mutations)
   - Features with most complexity
   - Features missing tests or documentation

Warning: This may take several minutes depending on number of features.
