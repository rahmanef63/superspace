# Script to replace React Router Link with Next.js Link in CMS Lite admin pages

$basePath = "frontend\features\cms-lite\features\admin\pages"
$files = Get-ChildItem "$basePath\*.tsx" -Recurse

$replacements = @(
    @{
        Old = 'import \{ Link \} from "react-router-dom";'
        New = 'import Link from "next/link";'
    },
    @{
        Old = "import \{ Link \} from 'react-router-dom';"
        New = "import Link from 'next/link';"
    }
)

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($replacement in $replacements) {
        if ($content -match $replacement.Old) {
            $content = $content -replace $replacement.Old, $replacement.New
            $modified = $true
        }
    }
    
    # Replace 'to=' with 'href='
    if ($content -match '\s+to=\{') {
        $content = $content -replace '\s+to=\{', ' href={'
        $modified = $true
    }
    
    if ($content -match '\s+to="') {
        $content = $content -replace '\s+to="', ' href="'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nDone! Replaced React Router Link with Next.js Link" -ForegroundColor Cyan
