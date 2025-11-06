@echo off
REM CMS-Lite Feature Isolation Script (Batch)
REM Simple Windows batch script to isolate cms-lite feature

echo ========================================
echo   CMS-Lite Feature Isolation
echo ========================================
echo.

set OUTPUT_DIR=progress\cms-lite-isolated

echo [1/4] Creating directory structure...
mkdir "%OUTPUT_DIR%\frontend\features" 2>nul
mkdir "%OUTPUT_DIR%\frontend\shared\ui\layout\sidebar" 2>nul
mkdir "%OUTPUT_DIR%\frontend\lib\features" 2>nul
mkdir "%OUTPUT_DIR%\convex\features" 2>nul
mkdir "%OUTPUT_DIR%\convex\shared" 2>nul
mkdir "%OUTPUT_DIR%\components\ui" 2>nul
mkdir "%OUTPUT_DIR%\tests\features" 2>nul
mkdir "%OUTPUT_DIR%\docs" 2>nul
mkdir "%OUTPUT_DIR%\hooks" 2>nul
mkdir "%OUTPUT_DIR%\lib" 2>nul
echo Done!

echo.
echo [2/4] Copying frontend feature...
xcopy /E /I /Y "frontend\features\cms-lite" "%OUTPUT_DIR%\frontend\features\cms-lite"
echo Done!

echo.
echo [3/4] Copying backend feature...
xcopy /E /I /Y "convex\features\cms_lite" "%OUTPUT_DIR%\convex\features\cms_lite"
echo Done!

echo.
echo [4/4] Copying shared dependencies...

REM Copy shared UI
if exist "frontend\shared\ui\layout\sidebar\secondary.tsx" (
    copy /Y "frontend\shared\ui\layout\sidebar\secondary.tsx" "%OUTPUT_DIR%\frontend\shared\ui\layout\sidebar\" >nul
)

REM Copy lib utils
if exist "lib\utils.ts" (
    copy /Y "lib\utils.ts" "%OUTPUT_DIR%\lib\" >nul
)

REM Copy defineFeature
if exist "lib\features\defineFeature.ts" (
    copy /Y "lib\features\defineFeature.ts" "%OUTPUT_DIR%\frontend\lib\features\" >nul
)

REM Copy convex shared
if exist "convex\shared" (
    xcopy /E /I /Y "convex\shared" "%OUTPUT_DIR%\convex\shared"
)

REM Copy shadcn/ui components
for %%F in (button input label textarea badge tabs dialog select checkbox card alert separator dropdown-menu toast toaster use-toast) do (
    if exist "components\ui\%%F.tsx" (
        copy /Y "components\ui\%%F.tsx" "%OUTPUT_DIR%\components\ui\" >nul
    )
    if exist "components\ui\%%F.ts" (
        copy /Y "components\ui\%%F.ts" "%OUTPUT_DIR%\components\ui\" >nul
    )
)

REM Copy hooks
if exist "hooks\use-toast.ts" (
    copy /Y "hooks\use-toast.ts" "%OUTPUT_DIR%\hooks\" >nul
)

REM Copy tests
if exist "tests\features\cms-lite" (
    xcopy /E /I /Y "tests\features\cms-lite" "%OUTPUT_DIR%\tests\features\cms-lite"
)

REM Copy docs
if exist "docs\00_BASE_KNOWLEDGE.md" (
    copy /Y "docs\00_BASE_KNOWLEDGE.md" "%OUTPUT_DIR%\docs\" >nul
)
if exist "docs\FEATURE_RULES.md" (
    copy /Y "docs\FEATURE_RULES.md" "%OUTPUT_DIR%\docs\" >nul
)
if exist "docs\MUTATION_TEMPLATE_GUIDE.md" (
    copy /Y "docs\MUTATION_TEMPLATE_GUIDE.md" "%OUTPUT_DIR%\docs\" >nul
)

echo Done!

echo.
echo ========================================
echo   Isolation Complete!
echo ========================================
echo.
echo Output: %OUTPUT_DIR%
echo.
echo Next steps:
echo 1. cd %OUTPUT_DIR%
echo 2. Create package.json (see docs/cms-lite-isolation-manifest.md)
echo 3. Create tsconfig.json
echo 4. Create .env.example
echo 5. Create README.md
echo.
echo Or use the manual copy guide in:
echo docs/cms-lite-isolation-manifest.md
echo.

pause
