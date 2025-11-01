# Script to fix toast imports in CMS Lite admin pages

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
        
        # Replace wrong imports
        $content = $content -replace 'import \{ toast \} from "@/components/ui/use-toast";', 'import { useToast } from "@/hooks/use-toast";'
        $content = $content -replace "import \{ toast \} from '@/components/ui/use-toast';", "import { useToast } from '@/hooks/use-toast';"
        
        # Save the file
        Set-Content -Path $filePath -Value $content -NoNewline
        
        Write-Host "Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! Now you need to manually add 'const { toast } = useToast();' in each component function." -ForegroundColor Cyan
