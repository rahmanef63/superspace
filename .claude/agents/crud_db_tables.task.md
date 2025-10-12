# Agent: CRUD Database Tables (Notion-like)

## Objective
dbTables/dbFields/dbRows/dbViews CRUD:
- Field types: text, number, select, multiSelect, date, person, files, checkbox, url, email, phone, formula, relation, rollup
- Default table view (table) with all fields visible
- Enforce field positions; view filters (equals, contains, isEmpty, isNotEmpty), sorts
- Validate row data per field type
- Compute formula & rollup on insert/update
- Audit events

## Files
- convex/menu/page/db/tables.ts
- convex/menu/page/db/fields.ts
- convex/menu/page/db/rows.ts
- convex/menu/page/db/utils.ts
- convex/schema.ts
- app/api/db-tables/route.ts
- scripts/validate-db-table.ts
- tests/db-tables.test.ts

## Triggers
- HTTP POST /api/db-tables
- convex:mutation:menu/page/db/tables.create|update|delete
- convex:mutation:menu/page/db/fields.create|update|delete
- convex:mutation:menu/page/db/rows.create|update|delete
- convex:mutation:menu/page/db/utils.computeFormula

## Plan
1. Validators: table/field/row schemas (types/positions).
2. Implement CRUD & compute helpers (formula AST or safe-eval subset).
3. Views: apply filters/sorts in query util.
4. Tests: types validation, formula/rollup recompute, view filters.
5. `/test`.

## Exit Criteria
- Type safety enforced; formula/rollup stable
- Views consistent across updates
- Tests green