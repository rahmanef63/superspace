# Claude Code Custom Commands

Custom slash commands untuk SuperSpace project. Commands ini akan tersedia di Claude Code CLI.

## 📋 Available Commands

### Feature Analysis & Documentation

#### `/analyze-feature [feature-name]`
Analyze a feature and save documentation to docs/features/

**Examples:**
```bash
/analyze-feature chat
/analyze-feature cms
/analyze-feature          # Interactive mode
```

**Output:** `docs/features/{date}-{feature-id}.md`

---

#### `/feature-docs [feature-name]`
Show available feature documentation

**Examples:**
```bash
/feature-docs            # List all docs
/feature-docs cms        # Show CMS doc
```

---

#### `/list-features [options]`
List all registered features

**Examples:**
```bash
/list-features
/list-features --type optional
/list-features --category communication
/list-features --status stable
```

---

#### `/analyze-all-features`
Analyze and document ALL features in the project

**Warning:** This may take several minutes.

**Output:** Documentation for all features in `docs/features/`

---

### Validation & Testing

#### `/validate-project [scope]`
Run validation scripts and tests

**Examples:**
```bash
/validate-project              # Run all validations
/validate-project workspace    # Validate workspace only
/validate-project features     # Validate features only
/validate-project test         # Run tests only
```

**Checks against DoD:**
- ✅ Skema tervalidasi
- ✅ RBAC & permissions
- ✅ Audit events
- ✅ Tests passing
- ✅ CI ready

---

## 🎯 How to Use

In Claude Code CLI, type `/` to see available commands, then select from the list or type the command name.

### Arguments

Commands support the `$ARGUMENTS` placeholder. When you type:
```
/analyze-feature cms
```

The string "cms" becomes `$ARGUMENTS` in the command template.

---

## 📝 Creating New Commands

1. Create a new `.md` file in `.claude/commands/`
2. Add YAML frontmatter with description:
   ```markdown
   ---
   description: Your command description
   ---

   Command instructions here using $ARGUMENTS
   ```
3. Restart Claude Code to load new commands

---

## 🔗 Related Documentation

- [CLAUDE.md](./../CLAUDE.md) - Project guardrails and base knowledge
- [scripts/features/README.md](../../scripts/features/README.md) - Feature scripts documentation
- [docs/features/](../../docs/features/) - Generated feature documentation

---

**Note:** These commands are project-specific and will only work in this SuperSpace project directory.
