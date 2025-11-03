# Layout System Reorganization - Migration Helper
# 
# This script helps migrate old imports to new organized structure.
# Run this ONLY if you want to update imports (optional - backward compatible).

$workspaceRoot = "c:\rahman\template\V0\superspace-zian\v0-remix-of-superspace-app-aazian"

Write-Host "🔍 Scanning for old layout imports..." -ForegroundColor Cyan

# Find all .tsx and .ts files (excluding node_modules, .next)
$files = Get-ChildItem -Path $workspaceRoot -Recurse -Include *.tsx,*.ts | 
    Where-Object { 
        $_.FullName -notmatch "node_modules" -and 
        $_.FullName -notmatch "\.next" -and
        $_.FullName -notmatch "convex\\_generated" 
    }

$totalFiles = 0
$updatedFiles = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $fileUpdated = $false

    # Pattern 1: Old sidebar secondary imports
    if ($content -match 'from\s+[''"]@/frontend/shared/ui/layout/sidebar/secondary[''"]') {
        Write-Host "  📝 Found old import in: $($file.Name)" -ForegroundColor Yellow
        # Don't auto-replace - just report (compound components pattern requires manual migration)
        Write-Host "     ⚠️  Manual migration needed for compound components" -ForegroundColor DarkYellow
        $fileUpdated = $true
    }

    # Pattern 2: Direct component imports that could use new structure
    # Report only - don't auto-replace
    if ($content -match 'from\s+[''"]@/components/header[''"]') {
        Write-Host "  📝 Could use HeaderBar from chrome: $($file.Name)" -ForegroundColor Yellow
    }

    if ($content -match 'from\s+[''"]@/components/sidebar[''"]') {
        Write-Host "  📝 Could use PrimarySidebar from sidebars: $($file.Name)" -ForegroundColor Yellow
    }

    $totalFiles++
    if ($fileUpdated) {
        $updatedFiles++
    }
}

Write-Host ""
Write-Host "✅ Scan complete!" -ForegroundColor Green
Write-Host "   Total files scanned: $totalFiles" -ForegroundColor Cyan
Write-Host "   Files with old patterns: $updatedFiles" -ForegroundColor Cyan
Write-Host ""
Write-Host "ℹ️  NOTE: No automatic replacements made." -ForegroundColor Blue
Write-Host "   Old imports still work (backward compatible)." -ForegroundColor Blue
Write-Host "   Migrate to new compound components pattern manually when ready." -ForegroundColor Blue
Write-Host ""
Write-Host "📚 See docs/archive/LAYOUT_SYSTEM_REORGANIZATION.md for migration guide." -ForegroundColor Magenta
