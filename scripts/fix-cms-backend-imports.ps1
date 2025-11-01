# Script to replace ~backend imports with local cms-types

$replacements = @{
    'import type { PortfolioItem } from "~backend/portfolio/list";' = 'import type { PortfolioItem } from "../../../types/cms-types";'
    'import type { ServiceItem } from "~backend/services/list";' = 'import type { ServiceItem } from "../../../types/cms-types";'
    'import type { Settings } from "~backend/settings/get";' = 'import type { Settings } from "../../../types/cms-types";'
    'import type { Quicklink } from "~backend/quicklinks/list";' = 'import type { Quicklink } from "../../../types/cms-types";'
    'import type { Post } from "~backend/posts/list";' = 'import type { Post } from "../../../types/cms-types";'
    'import type { Product } from "~backend/products/list";' = 'import type { Product } from "../../../types/cms-types";'
    'import type { NavigationItem } from "~backend/navigation/list";' = 'import type { NavigationItem } from "../../../types/cms-types";'
    'import backend from "~backend/client";' = '// Backend client removed - needs integration'
}

$files = Get-ChildItem "frontend\features\cms-lite\features\admin\pages\*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
            Write-Host "Replaced in: $($file.Name)" -ForegroundColor Green
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan
