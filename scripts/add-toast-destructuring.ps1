# Script to add toast destructuring in CMS Lite admin pages

$files = @(
    "AdminPortfolio.tsx",
    "AdminPosts.tsx",
    "AdminProducts.tsx",
    "AdminNavigation.tsx",
    "AdminQuicklinks.tsx",
    "AdminServices.tsx",
    "AdminMediaLibrary.tsx",
    "AdminUsers.tsx",
    "AdminSettings.tsx",
    "AdminLanding.tsx"
)

$basePath = "frontend\features\cms-lite\features\admin\pages"

foreach ($file in $files) {
    $filePath = Join-Path $basePath $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Find pattern: export default function FunctionName() {
        # Then add const { toast } = useToast(); after useBackend line
        if ($content -match '(export default function \w+\(\) \{[^\n]*\n\s*const backend = useBackend\(\);)') {
            $oldPattern = $matches[1]
            $newPattern = $oldPattern + "`n  const { toast } = useToast();"
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
            
            # Save the file
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "Fixed: $file" -ForegroundColor Green
        } else {
            Write-Host "Pattern not found in: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
