# CMS-Lite Feature Isolation Guide

> **Complete guide for isolating cms-lite feature to standalone package**
> **Generated:** 2025-11-04

---

## What Has Been Created

### 1. Documentation

✅ **[docs/cms-lite-isolation-manifest.md](cms-lite-isolation-manifest.md)**
- Complete file listing (~330 files total)
- 125+ frontend files
- 150+ backend files
- Dependencies mapping
- Configuration templates

✅ **[docs/00_BASE_KNOWLEDGE.md](00_BASE_KNOWLEDGE.md)**
- Essential development knowledge
- Core concepts and patterns
- Tech stack explanation
- Quick start guide

### 2. Automation Scripts

✅ **[scripts/isolate-cms-lite.bat](../scripts/isolate-cms-lite.bat)**
- Windows batch script for copying files
- Simple, no dependencies
- Copies all feature files + dependencies

⚠️ **[scripts/isolate-feature.ps1](../scripts/isolate-feature.ps1)**
- PowerShell script (more advanced)
- Has encoding issues with special characters
- Needs cleanup before use

---

## Quick Start: Manual Isolation

### Option 1: Use Batch Script (Recommended for Windows)

```cmd
cd c:\rahman\template\V0\superspace-zian\v0-remix-of-superspace-app-aazian

REM Run the batch script
scripts\isolate-cms-lite.bat

REM Output will be in: progress\cms-lite-isolated\
```

### Option 2: Manual Copy Commands

```cmd
REM Create output directory
mkdir progress\cms-lite-isolated
cd progress\cms-lite-isolated

REM Create directory structure
mkdir frontend\features
mkdir frontend\shared\ui\layout\sidebar
mkdir frontend\lib\features
mkdir convex\features
mkdir convex\shared
mkdir components\ui
mkdir tests\features
mkdir docs
mkdir hooks
mkdir lib

REM Go back to project root
cd ..\..

REM Copy frontend feature (125+ files)
xcopy /E /I /Y frontend\features\cms-lite progress\cms-lite-isolated\frontend\features\cms-lite

REM Copy backend feature (150+ files)
xcopy /E /I /Y convex\features\cms_lite progress\cms-lite-isolated\convex\features\cms_lite

REM Copy shared dependencies
copy frontend\shared\ui\layout\sidebar\secondary.tsx progress\cms-lite-isolated\frontend\shared\ui\layout\sidebar\
copy lib\utils.ts progress\cms-lite-isolated\lib\
copy lib\features\defineFeature.ts progress\cms-lite-isolated\frontend\lib\features\
xcopy /E /I /Y convex\shared progress\cms-lite-isolated\convex\shared

REM Copy shadcn/ui components
copy components\ui\button.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\input.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\label.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\textarea.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\badge.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\tabs.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\dialog.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\select.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\checkbox.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\card.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\alert.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\separator.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\dropdown-menu.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\toast.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\toaster.tsx progress\cms-lite-isolated\components\ui\
copy components\ui\use-toast.ts progress\cms-lite-isolated\components\ui\

REM Copy hooks
copy hooks\use-toast.ts progress\cms-lite-isolated\hooks\

REM Copy tests (if exists)
xcopy /E /I /Y tests\features\cms-lite progress\cms-lite-isolated\tests\features\cms-lite

REM Copy documentation
copy docs\00_BASE_KNOWLEDGE.md progress\cms-lite-isolated\docs\
copy docs\FEATURE_RULES.md progress\cms-lite-isolated\docs\
copy docs\MUTATION_TEMPLATE_GUIDE.md progress\cms-lite-isolated\docs\
copy docs\cms-lite-isolation-manifest.md progress\cms-lite-isolated\docs\

echo Done! Check progress\cms-lite-isolated\
```

---

## After Copying Files

### Step 1: Create package.json

Create `progress/cms-lite-isolated/package.json`:

```json
{
  "name": "cms-lite-isolated",
  "version": "1.0.0",
  "description": "Isolated cms-lite feature package",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "convex:dev": "convex dev",
    "convex:deploy": "convex deploy",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "convex": "^1.16.0",
    "@clerk/nextjs": "^5.0.0",
    "lucide-react": "^0.400.0",
    "zod": "^3.22.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^1.0.0",
    "@radix-ui/react-checkbox": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^1.0.0",
    "@radix-ui/react-label": "^1.0.0",
    "@radix-ui/react-separator": "^1.0.0",
    "@radix-ui/react-toast": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0",
    "convex-test": "^0.0.15",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

### Step 2: Create tsconfig.json

Create `progress/cms-lite-isolated/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/frontend/*": ["./frontend/*"],
      "@/convex/*": ["./convex/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### Step 3: Create .env.example

Create `progress/cms-lite-isolated/.env.example`:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk JWT Template
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=

# Clerk Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

### Step 4: Create README.md

Create `progress/cms-lite-isolated/README.md`:

```markdown
# CMS-Lite Feature - Isolated Package

> Standalone package for cms-lite feature
> Generated from SuperSpace Modular Architecture

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Convex and Clerk credentials
   ```

3. Initialize Convex:
   ```bash
   npx convex dev --configure
   ```

4. Start development servers:
   ```bash
   pnpm dev              # Next.js (http://localhost:3000)
   npx convex dev        # Convex real-time sync
   ```

## Documentation

Essential reading:
- `docs/00_BASE_KNOWLEDGE.md` - Core concepts and patterns
- `docs/FEATURE_RULES.md` - Development rules
- `docs/MUTATION_TEMPLATE_GUIDE.md` - Backend patterns

## Project Structure

- `frontend/features/cms-lite/` - Feature UI (125+ files)
- `convex/features/cms_lite/` - Backend logic (150+ files)
- `frontend/shared/` - Shared UI components
- `convex/shared/` - RBAC and audit helpers
- `components/ui/` - shadcn/ui components

## Integration to Existing Project

Copy to your Next.js + Convex project:

```bash
cp -r frontend/features/cms-lite /your-project/frontend/features/
cp -r convex/features/cms_lite /your-project/convex/features/
cp -r frontend/shared/* /your-project/frontend/shared/
cp -r convex/shared/* /your-project/convex/shared/
```

Ensure your project has: Next.js 15+, Convex, Clerk, shadcn/ui, TypeScript

## Key Concepts

- **Modular**: Self-contained with own UI, backend, tests
- **Auto-discovered**: No manual registration
- **RBAC enforced**: Permission checks on all operations
- **Audit logged**: All changes tracked

## License

MIT License - Use freely in your projects
```

---

## File Structure After Isolation

```
progress/cms-lite-isolated/
├── frontend/
│   ├── features/
│   │   └── cms-lite/                 # 125+ files
│   │       ├── config.ts
│   │       ├── views/
│   │       ├── pages/
│   │       ├── components/
│   │       ├── features/admin/
│   │       ├── shared/
│   │       ├── contexts/
│   │       ├── hooks/
│   │       ├── types/
│   │       ├── lib/
│   │       └── settings/
│   ├── shared/
│   │   └── ui/layout/sidebar/
│   │       └── secondary.tsx
│   └── lib/
│       └── features/
│           └── defineFeature.ts
├── convex/
│   ├── features/
│   │   └── cms_lite/                 # 150+ files
│   │       ├── schema.ts
│   │       ├── queries.ts
│   │       ├── mutations.ts
│   │       ├── products/
│   │       ├── posts/
│   │       ├── portfolio/
│   │       ├── services/
│   │       ├── navigation/
│   │       ├── landing/
│   │       ├── features/
│   │       ├── quicklinks/
│   │       ├── settings/
│   │       ├── cart/
│   │       ├── wishlist/
│   │       ├── currency/
│   │       ├── comments/
│   │       ├── storage/
│   │       ├── pages/
│   │       ├── users/
│   │       ├── copies/
│   │       ├── activityEvents/
│   │       ├── website_settings/
│   │       ├── permissions/
│   │       └── shared/
│   └── shared/
│       ├── permissions/
│       └── audit/
├── components/
│   └── ui/                            # 16 components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── ...
├── hooks/
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── tests/
│   └── features/
│       └── cms-lite/
├── docs/
│   ├── 00_BASE_KNOWLEDGE.md
│   ├── FEATURE_RULES.md
│   ├── MUTATION_TEMPLATE_GUIDE.md
│   └── cms-lite-isolation-manifest.md
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

**Total Files**: ~330 files

---

## Next Steps

### For Development

1. **Copy files** using one of the methods above
2. **Create config files** (package.json, tsconfig.json, .env.example, README.md)
3. **Install dependencies**: `pnpm install`
4. **Set up Convex**: `npx convex dev --configure`
5. **Set up Clerk**: Create account, get API keys
6. **Start dev servers**: `pnpm dev` + `npx convex dev`

### For Integration to New Project

1. **Copy feature files** to your existing Next.js + Convex project
2. **Ensure dependencies** are installed (see package.json)
3. **Copy shared code** (frontend/shared, convex/shared)
4. **Update imports** if needed
5. **Test feature** in your project

---

## Troubleshooting

### PowerShell Script Issues

If `isolate-feature.ps1` has encoding errors:
- Use the batch script instead (`isolate-cms-lite.bat`)
- Or copy files manually using commands above

### Missing Files

If some files are missing after copy:
- Check [cms-lite-isolation-manifest.md](cms-lite-isolation-manifest.md) for complete file list
- Ensure source files exist in original project
- Check file paths (cms-lite vs cms_lite)

### Permission Errors

If you get "Access Denied" errors:
- Run terminal as Administrator
- Check file/folder permissions
- Ensure no files are open/locked

---

## Summary

### What You Have

1. ✅ **Complete file manifest** - 330+ files documented
2. ✅ **Batch script** - Simple copy automation
3. ✅ **Manual commands** - Step-by-step copy guide
4. ✅ **Configuration templates** - Ready to use
5. ✅ **Documentation** - Base knowledge + rules

### What To Do

1. Run `scripts\isolate-cms-lite.bat` OR
2. Follow manual copy commands above
3. Create config files (package.json, tsconfig.json, .env.example, README.md)
4. Install dependencies and start development

---

**Last Updated:** 2025-11-04
**Maintained By:** Development Team
