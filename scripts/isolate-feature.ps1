# Feature Isolation Script
# Purpose: Isolate a feature into standalone package for external development
# Usage: .\scripts\isolate-feature.ps1 -FeatureName cms-lite

param(
    [string]$FeatureName = "cms-lite",
    [string]$OutputDir = "progress"
)

# Colors for output
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }

# Header
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Feature Isolation Tool" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

Write-Info "Feature: $FeatureName"
Write-Info "Output: $OutputDir/$FeatureName-isolated"
Write-Host ""

# Get script root directory
$ScriptRoot = Split-Path -Parent $PSScriptRoot
$ProjectRoot = $ScriptRoot

# Define paths
$FeatureSlug = $FeatureName
$FeatureSlugUnderscore = $FeatureName -replace '-', '_'
$OutputPath = Join-Path $ProjectRoot "$OutputDir\$FeatureName-isolated"

# Source paths
$FrontendFeaturePath = Join-Path $ProjectRoot "frontend\features\$FeatureSlug"
$ConvexFeaturePath = Join-Path $ProjectRoot "convex\features\$FeatureSlugUnderscore"
$ConvexFeaturePathDash = Join-Path $ProjectRoot "convex\features\$FeatureSlug"

# Check if feature exists
if (-not (Test-Path $FrontendFeaturePath)) {
    Write-Error "ERROR: Frontend feature not found at: $FrontendFeaturePath"
    exit 1
}

$ConvexPath = $ConvexFeaturePath
if (-not (Test-Path $ConvexFeaturePath)) {
    if (Test-Path $ConvexFeaturePathDash) {
        $ConvexPath = $ConvexFeaturePathDash
        Write-Warning "Using dash naming for Convex: $ConvexPath"
    } else {
        Write-Warning "WARNING: Convex feature not found at: $ConvexFeaturePath"
        Write-Warning "Will continue without backend files."
    }
}

# Create output directory
Write-Info "`n[1/8] Creating output directory structure..."
if (Test-Path $OutputPath) {
    Write-Warning "Output directory exists. Removing..."
    Remove-Item -Path $OutputPath -Recurse -Force
}

$Directories = @(
    "$OutputPath\frontend\features",
    "$OutputPath\frontend\shared\ui\layout\sidebar",
    "$OutputPath\frontend\lib\features",
    "$OutputPath\convex\features",
    "$OutputPath\convex\shared\permissions",
    "$OutputPath\convex\shared\audit",
    "$OutputPath\convex\_generated",
    "$OutputPath\components\ui",
    "$OutputPath\tests\features",
    "$OutputPath\docs\features\$FeatureSlug",
    "$OutputPath\hooks"
)

foreach ($dir in $Directories) {
    New-Item -Path $dir -ItemType Directory -Force | Out-Null
}
Write-Success "âœ“ Directory structure created"

# Copy frontend feature
Write-Info "`n[2/8] Copying frontend feature files..."
$FrontendDest = Join-Path $OutputPath "frontend\features\$FeatureSlug"
Copy-Item -Path $FrontendFeaturePath -Destination $FrontendDest -Recurse -Force
$FrontendCount = (Get-ChildItem -Path $FrontendDest -Recurse -File).Count
Write-Success "âœ“ Copied $FrontendCount frontend files"

# Copy convex feature
Write-Info "`n[3/8] Copying backend (Convex) feature files..."
if (Test-Path $ConvexPath) {
    $ConvexDest = Join-Path $OutputPath "convex\features\$FeatureSlugUnderscore"
    Copy-Item -Path $ConvexPath -Destination $ConvexDest -Recurse -Force
    $ConvexCount = (Get-ChildItem -Path $ConvexDest -Recurse -File).Count
    Write-Success "âœ“ Copied $ConvexCount backend files"
} else {
    Write-Warning "âš  No backend files to copy"
}

# Copy shared dependencies
Write-Info "`n[4/8] Copying shared dependencies..."

# Copy frontend shared UI (if used)
$SharedUISource = Join-Path $ProjectRoot "frontend\shared\ui\layout\sidebar\secondary.tsx"
if (Test-Path $SharedUISource) {
    $SharedUIDest = Join-Path $OutputPath "frontend\shared\ui\layout\sidebar\secondary.tsx"
    Copy-Item -Path $SharedUISource -Destination $SharedUIDest -Force
    Write-Success "Copied shared UI layout"
}

# Copy lib utils
$UtilsSource = Join-Path $ProjectRoot "lib\utils.ts"
if (Test-Path $UtilsSource) {
    $UtilsDest = Join-Path $OutputPath "lib\utils.ts"
    New-Item -Path (Join-Path $OutputPath "lib") -ItemType Directory -Force | Out-Null
    Copy-Item -Path $UtilsSource -Destination $UtilsDest -Force
    Write-Success "Copied lib/utils.ts"
}

# Copy defineFeature helper
$DefineFeatureSource = Join-Path $ProjectRoot "lib\features\defineFeature.ts"
if (Test-Path $DefineFeatureSource) {
    $DefineFeatureDest = Join-Path $OutputPath "frontend\lib\features\defineFeature.ts"
    Copy-Item -Path $DefineFeatureSource -Destination $DefineFeatureDest -Force
    Write-Success "Copied defineFeature helper"
}

# Copy convex shared (permissions & audit)
$ConvexSharedSource = Join-Path $ProjectRoot "convex\shared"
if (Test-Path $ConvexSharedSource) {
    $ConvexSharedDest = Join-Path $OutputPath "convex\shared"
    Copy-Item -Path $ConvexSharedSource -Destination $ConvexSharedDest -Recurse -Force
    Write-Success "Copied Convex shared helpers"
}

# Copy shadcn/ui components (list of commonly used ones)
Write-Info "`n[5/8] Copying shadcn/ui components..."
$ShadcnComponents = @(
    "button.tsx", "input.tsx", "label.tsx", "textarea.tsx",
    "badge.tsx", "tabs.tsx", "dialog.tsx", "select.tsx",
    "checkbox.tsx", "card.tsx", "alert.tsx", "separator.tsx",
    "dropdown-menu.tsx", "toast.tsx", "toaster.tsx", "use-toast.ts"
)

$ComponentsSource = Join-Path $ProjectRoot "components\ui"
$ComponentsDest = Join-Path $OutputPath "components\ui"
$CopiedComponents = 0

foreach ($component in $ShadcnComponents) {
    $srcPath = Join-Path $ComponentsSource $component
    if (Test-Path $srcPath) {
        $destPath = Join-Path $ComponentsDest $component
        Copy-Item -Path $srcPath -Destination $destPath -Force
        $CopiedComponents++
    }
}
Write-Success "âœ“ Copied $CopiedComponents UI components"

# Copy hooks
$HooksSource = Join-Path $ProjectRoot "hooks\use-toast.ts"
if (Test-Path $HooksSource) {
    $HooksDest = Join-Path $OutputPath "hooks\use-toast.ts"
    Copy-Item -Path $HooksSource -Destination $HooksDest -Force
    Write-Success "âœ“ Copied hooks"
}

# Copy tests
Write-Info "`n[6/8] Copying test files..."
$TestsSource = Join-Path $ProjectRoot "tests\features\$FeatureSlug"
if (Test-Path $TestsSource) {
    $TestsDest = Join-Path $OutputPath "tests\features\$FeatureSlug"
    Copy-Item -Path $TestsSource -Destination $TestsDest -Recurse -Force
    $TestCount = (Get-ChildItem -Path $TestsDest -Recurse -File).Count
    Write-Success "âœ“ Copied $TestCount test files"
} else {
    Write-Warning "âš  No test files found"
}

# Copy docs
Write-Info "`n[7/8] Copying documentation..."

# Copy base knowledge
$BaseDocsSource = Join-Path $ProjectRoot "docs\00_BASE_KNOWLEDGE.md"
if (Test-Path $BaseDocsSource) {
    $BaseDocsDest = Join-Path $OutputPath "docs\00_BASE_KNOWLEDGE.md"
    Copy-Item -Path $BaseDocsSource -Destination $BaseDocsDest -Force
}

$FeatureRulesSource = Join-Path $ProjectRoot "docs\FEATURE_RULES.md"
if (Test-Path $FeatureRulesSource) {
    $FeatureRulesDest = Join-Path $OutputPath "docs\FEATURE_RULES.md"
    Copy-Item -Path $FeatureRulesSource -Destination $FeatureRulesDest -Force
}

$MutationGuideSource = Join-Path $ProjectRoot "docs\MUTATION_TEMPLATE_GUIDE.md"
if (Test-Path $MutationGuideSource) {
    $MutationGuideDest = Join-Path $OutputPath "docs\MUTATION_TEMPLATE_GUIDE.md"
    Copy-Item -Path $MutationGuideSource -Destination $MutationGuideDest -Force
}

Write-Success "âœ“ Copied essential documentation"

# Create package.json
Write-Info "`n[8/8] Creating configuration files..."

$PackageJson = @'
{
  "name": "FEATURE_NAME_PLACEHOLDER-isolated",
  "version": "1.0.0",
  "description": "Isolated FEATURE_NAME_PLACEHOLDER feature package",
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
'@

$PackageJson = $PackageJson -replace 'FEATURE_NAME_PLACEHOLDER', $FeatureName
$PackageJsonPath = Join-Path $OutputPath "package.json"
Set-Content -Path $PackageJsonPath -Value $PackageJson -Encoding UTF8
Write-Success "âœ“ Created package.json"

# Create tsconfig.json
$TsConfig = @'
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
'@

$TsConfigPath = Join-Path $OutputPath "tsconfig.json"
Set-Content -Path $TsConfigPath -Value $TsConfig -Encoding UTF8
Write-Success "âœ“ Created tsconfig.json"

# Create .env.example
$EnvExample = @'
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
'@

$EnvExamplePath = Join-Path $OutputPath ".env.example"
Set-Content -Path $EnvExamplePath -Value $EnvExample -Encoding UTF8
Write-Success "Created .env.example"

# Create README.md using simple string building
$CurrentDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$ReadmeContent = "# $FeatureName Feature - Isolated Package`n`n"
$ReadmeContent += "> **Standalone package for $FeatureName feature**`n"
$ReadmeContent += "> **Generated:** $CurrentDate`n"
$ReadmeContent += "> **Source:** SuperSpace Modular Architecture`n`n"
$ReadmeContent += "---`n`n"
$ReadmeContent += "## Package Contents`n`n"
$ReadmeContent += "- Frontend: frontend/features/$FeatureSlug/`n"
$ReadmeContent += "- Backend: convex/features/$FeatureSlugUnderscore/`n"
$ReadmeContent += "- Shared dependencies and utilities`n"
$ReadmeContent += "- Tests and documentation`n`n"
$ReadmeContent += "## Quick Start`n`n"
$ReadmeContent += "1. Install dependencies: pnpm install`n"
$ReadmeContent += "2. Copy .env.example to .env.local and configure`n"
$ReadmeContent += "3. Initialize Convex: npx convex dev --configure`n"
$ReadmeContent += "4. Start dev servers:`n"
$ReadmeContent += "   - pnpm dev (Next.js)`n"
$ReadmeContent += "   - npx convex dev (Convex)`n`n"
$ReadmeContent += "## Documentation`n`n"
$ReadmeContent += "Essential reading:`n"
$ReadmeContent += "- docs/00_BASE_KNOWLEDGE.md - Core concepts and patterns`n"
$ReadmeContent += "- docs/FEATURE_RULES.md - Development rules`n"
$ReadmeContent += "- docs/MUTATION_TEMPLATE_GUIDE.md - Backend patterns`n`n"
$ReadmeContent += "## Project Structure`n`n"
$ReadmeContent += "$FeatureName-isolated/`n"
$ReadmeContent += "- frontend/features/$FeatureSlug/ - Feature UI`n"
$ReadmeContent += "- convex/features/$FeatureSlugUnderscore/ - Backend logic`n"
$ReadmeContent += "- frontend/shared/ - Shared UI components`n"
$ReadmeContent += "- convex/shared/ - RBAC and audit helpers`n"
$ReadmeContent += "- components/ui/ - shadcn/ui components`n"
$ReadmeContent += "- tests/ - Unit and integration tests`n"
$ReadmeContent += "- docs/ - Documentation`n`n"
$ReadmeContent += "## Configuration`n`n"
$ReadmeContent += "Required environment variables in .env.local:`n"
$ReadmeContent += "- CONVEX_DEPLOYMENT`n"
$ReadmeContent += "- NEXT_PUBLIC_CONVEX_URL`n"
$ReadmeContent += "- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`n"
$ReadmeContent += "- CLERK_SECRET_KEY`n"
$ReadmeContent += "- NEXT_PUBLIC_CLERK_FRONTEND_API_URL`n`n"
$ReadmeContent += "## Integration to Existing Project`n`n"
$ReadmeContent += "Copy files to your Next.js + Convex project:`n"
$ReadmeContent += "- cp -r frontend/features/$FeatureSlug /your-project/frontend/features/`n"
$ReadmeContent += "- cp -r convex/features/$FeatureSlugUnderscore /your-project/convex/features/`n"
$ReadmeContent += "- cp -r frontend/shared/* /your-project/frontend/shared/`n"
$ReadmeContent += "- cp -r convex/shared/* /your-project/convex/shared/`n`n"
$ReadmeContent += "Ensure your project has: Next.js 15+, Convex, Clerk, shadcn/ui, TypeScript`n`n"
$ReadmeContent += "## Testing`n`n"
$ReadmeContent += "- pnpm test - Run all tests`n"
$ReadmeContent += "- pnpm test:coverage - Run with coverage`n`n"
$ReadmeContent += '## Security and RBAC' + "`n`n"
$ReadmeContent += "Every backend operation MUST:`n"
$ReadmeContent += '1. Check permissions with requirePermission()' + "`n"
$ReadmeContent += '2. Log mutations with logAuditEvent()' + "`n`n"
$ReadmeContent += "See MUTATION_TEMPLATE_GUIDE.md for complete patterns.`n`n"
$ReadmeContent += "## Key Concepts`n`n"
$ReadmeContent += "- Modular: Self-contained features with own UI, backend, tests`n"
$ReadmeContent += "- Auto-discovered: No manual registration`n"
$ReadmeContent += "- RBAC enforced: Permission checks on all operations`n"
$ReadmeContent += "- Audit logged: All changes tracked`n`n"
$ReadmeContent += "## License`n`n"
$ReadmeContent += "MIT License - Use freely in your projects`n`n"
$ReadmeContent += "---`n`n"
$ReadmeContent += "**Generated by:** Feature Isolation Tool`n"
$ReadmeContent += "**Date:** $CurrentDate`n"
$ReadmeContent += "**Source:** SuperSpace Modular Architecture`n"

$Readme = $ReadmeContent

$Readme = $Readme -replace 'FEATURE_NAME', $FeatureName
$Readme = $Readme -replace 'FEATURE_SLUG', $FeatureSlug
$Readme = $Readme -replace 'FEATURE_SLUG_UNDERSCORE', $FeatureSlugUnderscore
$Readme = $Readme -replace 'CURRENT_DATE', $CurrentDate

$ReadmePath = Join-Path $OutputPath "README.md"
Set-Content -Path $ReadmePath -Value $Readme -Encoding UTF8
Write-Success "Created README.md"

# Summary
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Isolation Complete!" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

Write-Success "âœ“ Feature '$FeatureName' has been isolated successfully!"
Write-Host ""
Write-Info "Output Location:"
Write-Host "  $OutputPath" -ForegroundColor Yellow
Write-Host ""
Write-Info "Next Steps:"
Write-Host "  1. cd $OutputDir\$FeatureName-isolated"
Write-Host "  2. pnpm install"
Write-Host "  3. Copy .env.example to .env.local and configure"
Write-Host "  4. npx convex dev --configure"
Write-Host "  5. pnpm dev"
Write-Host ""
Write-Info "Documentation:"
Write-Host "  - README.md (Setup guide)"
Write-Host "  - docs/00_BASE_KNOWLEDGE.md (Core concepts)"
Write-Host "  - docs/FEATURE_RULES.md (Development rules)"
Write-Host ""

# File count summary
$TotalFiles = (Get-ChildItem -Path $OutputPath -Recurse -File).Count
Write-Success "Total files copied: $TotalFiles"
Write-Host "`n"
