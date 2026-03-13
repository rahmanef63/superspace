---
description: Create or update a feature agent and skill for a specific feature
---

# Feature Agent & Skill Creator

Create a proper agent registration and skill file for the feature: **$ARGUMENTS**

## Steps

1. **Read the feature config** at `frontend/features/$ARGUMENTS/config.ts`
2. **Check existing agent** at `frontend/features/$ARGUMENTS/agents/index.ts`
3. **Check init.ts** at `frontend/features/$ARGUMENTS/init.ts`

### If agent is missing or minimal (scaffolded/stub):
Update `frontend/features/$ARGUMENTS/agents/index.ts` to:
- Use correct `featureId: "$ARGUMENTS"`
- Name function `register${PascalCase}Agent()`
- Add meaningful `canHandle()` with feature-relevant keywords
- Add at least one real tool (or meaningful stub)

### If init.ts doesn't call the agent:
Add `registerXxxAgent()` call at module level in `init.ts`.

### Create the skill file:
Write `.claude/commands/$ARGUMENTS.md` with:
```markdown
---
description: {Feature name} skill — {one line description}
---
# {Feature Name} Skill
{2-3 sentences about the feature}
## Key Files
{list key files with paths}
## Common Tasks
{3-5 common operations with steps}
## Task
$ARGUMENTS
```

### Validate:
- Run `pnpm exec tsc --noEmit 2>&1 | grep "$ARGUMENTS"` — ensure no TS errors
- Run `pnpm run list:features` — ensure feature is still listed

If no feature name provided, show available features:
```bash
pnpm run list:features
```
