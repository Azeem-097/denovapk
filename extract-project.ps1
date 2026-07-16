#Requires -Version 5.1
<#
.SYNOPSIS
    Denova PK Project Extraction Tool

.DESCRIPTION
    Safely extracts project files into shareable text files.
    READS ONLY - never modifies source files.

    Creates a complete snapshot including:
    - User Panel (customer storefront)
    - Admin Panel (business dashboard)
    - API/Backend routes
    - Database schema and repositories
    - Shared components
    - Configuration files
    - Documentation

.PARAMETER Mode
    all      - Extract everything (user, admin, shared, api, config)
    user     - User panel only
    admin    - Admin panel only
    shared   - Shared folder only
    api      - API routes only (both panels)
    database - Database files only (schema, repos, seeds)
    config   - Config files only
    ai       - AI-optimized bundle (recommended for sharing)
    quick    - Critical files only (small share)

.PARAMETER OpenAfter
    Open the output folder after extraction completes.

.EXAMPLE
    .\extract-project.ps1
    .\extract-project.ps1 -Mode ai -OpenAfter
    .\extract-project.ps1 -Mode all -OpenAfter
    .\extract-project.ps1 -Mode quick

.NOTES
    Output goes to: /Project_Snapshot/snapshot_<mode>_<timestamp>/
    Author: Denova PK Development Team
#>

param(
    [ValidateSet("all", "user", "admin", "shared", "api", "database", "config", "ai", "quick")]
    [string]$Mode = "ai",

    [switch]$OpenAfter
)

$ErrorActionPreference = "Stop"

# ============================================
# CONFIG
# ============================================
$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) {
    $ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$OutputRoot = Join-Path $ProjectRoot "Project_Snapshot"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$OutputFolder = Join-Path $OutputRoot "snapshot_${Mode}_${Timestamp}"

# Folders to always exclude
$ExcludePatterns = @(
    "node_modules", ".next", ".git", "dist", "build",
    ".turbo", "Project_Snapshot", "_project_snapshot",
    ".vercel", "coverage", ".cache", ".parcel-cache",
    "out", ".nyc_output", ".pnpm-store"
)

# File extensions to always exclude (binaries, images, fonts)
$ExcludeFileExt = @(
    ".log", ".lock", ".tsbuildinfo",
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".avif",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".zip", ".tar", ".gz", ".7z", ".rar",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx",
    ".mp3", ".mp4", ".mov", ".avi",
    ".db", ".sqlite", ".sqlite3", ".db-journal"
)

# Secret files that should NEVER be included
$SecretFiles = @(
    ".env", ".env.local", ".env.production", ".env.development",
    ".env.test", ".env.production.local", ".env.development.local"
)

# Source file extensions to include
$SourceExt = @(
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".json", ".css", ".scss",
    ".md", ".mdx",
    ".sql", ".prisma",
    ".yml", ".yaml"
)

# ============================================
# HELPERS
# ============================================
function Write-Header {
    param([string]$Text)
    $line = "=" * 70
    Write-Host ""
    Write-Host $line -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host $line -ForegroundColor Cyan
}

function Test-ShouldExclude {
    param([string]$RelativePath, [string]$FileName, [string]$Extension)

    foreach ($pattern in $ExcludePatterns) {
        if ($RelativePath -like "*\$pattern\*" -or $RelativePath -like "$pattern\*" -or $FileName -eq $pattern) {
            return $true
        }
    }

    if ($ExcludeFileExt -contains $Extension) { return $true }
    if ($SecretFiles -contains $FileName) { return $true }
    return $false
}

function Get-FileCategory {
    param([string]$RelativePath)
    $p = $RelativePath.ToLower()

    # API + Backend
    if ($p -like "*\app\api\*") { return "API Route" }
    if ($p -like "*\app\*route.ts") { return "API Route" }
    if ($p -like "*\middleware.ts") { return "Middleware" }

    # Pages + Layouts
    if ($p -like "*\app\*layout.tsx" -or $p -like "*\app\*layout.ts") { return "Layout" }
    if ($p -like "*\app\*page.tsx" -or $p -like "*\app\*page.ts") { return "Page" }
    if ($p -like "*\app\*loading.tsx") { return "Loading Component" }
    if ($p -like "*\app\*not-found.tsx") { return "404 Component" }
    if ($p -like "*\app\*error.tsx") { return "Error Component" }

    # Components
    if ($p -like "*\components\layout\*") { return "Layout Component" }
    if ($p -like "*\components\sections\*") { return "Section Component" }
    if ($p -like "*\components\product\*") { return "Product Component" }
    if ($p -like "*\components\cart\*") { return "Cart Component" }
    if ($p -like "*\components\checkout\*") { return "Checkout Component" }
    if ($p -like "*\components\account\*") { return "Account Component" }
    if ($p -like "*\components\dashboard\*") { return "Dashboard Component" }
    if ($p -like "*\components\ui\*") { return "UI Component" }
    if ($p -like "*\components\animations\*") { return "Animation Component" }
    if ($p -like "*\components\providers\*") { return "Provider" }
    if ($p -like "*\components\*") { return "Component" }

    # State & Data
    if ($p -like "*\store\*") { return "Zustand Store" }
    if ($p -like "*\context\*") { return "React Context" }
    if ($p -like "*\hooks\*") { return "Custom Hook" }

    # Database & Backend
    if ($p -like "*\db\repositories\*") { return "DB Repository" }
    if ($p -like "*\db\migrations\*") { return "DB Migration" }
    if ($p -like "*\db\seed*") { return "DB Seed" }
    if ($p -like "*\db\schema*") { return "DB Schema" }
    if ($p -like "*\db\client*") { return "DB Client" }
    if ($p -like "*\db\types*") { return "DB Type" }
    if ($p -like "*\db\helpers*") { return "DB Helper" }
    if ($p -like "*\db\*") { return "Database" }
    if ($p -like "*\shared\db\*") { return "Shared Database" }

    # Auth
    if ($p -like "*\lib\auth*" -or $p -like "*auth.ts" -or $p -like "*auth\*") { return "Auth" }

    # Utils & Lib
    if ($p -like "*\lib\adapters*") { return "Data Adapter" }
    if ($p -like "*\lib\validations*") { return "Zod Validation" }
    if ($p -like "*\lib\utils*") { return "Utility" }
    if ($p -like "*\lib\constants*") { return "Constants" }
    if ($p -like "*\lib\fonts*") { return "Font Config" }
    if ($p -like "*\lib\data*") { return "Mock Data" }
    if ($p -like "*\lib\priceutils*") { return "Price Utility" }
    if ($p -like "*\lib\api-auth*") { return "API Auth" }
    if ($p -like "*\lib\*") { return "Library" }

    # Types
    if ($p -like "*\types\*") { return "Type Definition" }

    # Config files
    if ($p -like "*package.json") { return "Package Manifest" }
    if ($p -like "*package-lock.json") { return "Package Lock" }
    if ($p -like "*tsconfig.json") { return "TypeScript Config" }
    if ($p -like "*next.config*") { return "Next Config" }
    if ($p -like "*tailwind*") { return "Tailwind Config" }
    if ($p -like "*postcss*") { return "PostCSS Config" }
    if ($p -like "*eslint*") { return "ESLint Config" }
    if ($p -like "*.env.example") { return "Env Example" }
    if ($p -like "*vercel.json") { return "Vercel Config" }
    if ($p -like "*\.gitignore") { return "Git Config" }

    # Global styles
    if ($p -like "*globals.css") { return "Global Styles" }

    # SQL
    if ($p -like "*.sql") { return "SQL Schema" }

    # Documentation
    if ($p -like "*.md") { return "Documentation" }

    return "Other"
}

function Get-FilesToExtract {
    param([string]$BaseFolder, [string[]]$AllowedExtensions = $SourceExt)

    if (-not (Test-Path $BaseFolder)) { return @() }

    $files = Get-ChildItem -Path $BaseFolder -File -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object {
            $relativePath = $_.FullName.Substring($BaseFolder.Length).TrimStart("\")
            $ext = $_.Extension.ToLower()
            ($AllowedExtensions -contains $ext) -and
            (-not (Test-ShouldExclude -RelativePath $relativePath -FileName $_.Name -Extension $ext))
        }

    return $files
}

function Write-SafeContent {
    param([string]$Path, [string]$Content)

    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Get-FileContentSafe {
    param([string]$FilePath)
    try {
        return [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
    } catch {
        return "[Error reading file: $($_.Exception.Message)]"
    }
}

function Format-FileSize {
    param([long]$Bytes)
    if ($Bytes -gt 1MB) { return "{0:N1} MB" -f ($Bytes / 1MB) }
    if ($Bytes -gt 1KB) { return "{0:N1} KB" -f ($Bytes / 1KB) }
    return "$Bytes B"
}

# ============================================
# EXTRACTION
# ============================================
function Export-FolderToFile {
    param(
        [string]$FolderName,
        [string]$FolderPath,
        [string]$OutputFile,
        [string[]]$Extensions = $SourceExt
    )

    if (-not (Test-Path $FolderPath)) {
        Write-Host "  [SKIP] ${FolderName}: folder not found ($FolderPath)" -ForegroundColor Yellow
        return $null
    }

    $files = Get-FilesToExtract -BaseFolder $FolderPath -AllowedExtensions $Extensions
    $fileCount = $files.Count

    if ($fileCount -eq 0) {
        Write-Host "  [SKIP] ${FolderName}: no files matched" -ForegroundColor Yellow
        return $null
    }

    $sb = New-Object System.Text.StringBuilder
    $sep = "=" * 80
    $sepThin = "-" * 80

    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("DENOVA PK PROJECT EXTRACT: $FolderName")
    [void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine("Source: $FolderPath")
    [void]$sb.AppendLine("Files: $fileCount")
    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("")

    $grouped = $files | ForEach-Object {
        $relativePath = $_.FullName.Substring($FolderPath.Length).TrimStart("\")
        [PSCustomObject]@{
            File = $_
            RelPath = $relativePath
            Category = Get-FileCategory -RelativePath $relativePath
        }
    } | Sort-Object Category, RelPath

    # Table of Contents
    [void]$sb.AppendLine("TABLE OF CONTENTS")
    [void]$sb.AppendLine($sepThin)
    $tocCategories = $grouped | Group-Object Category | Sort-Object Name
    foreach ($cat in $tocCategories) {
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine("[$($cat.Name)] ($($cat.Count) files)")
        foreach ($item in $cat.Group) {
            [void]$sb.AppendLine("  - $($item.RelPath)")
        }
    }
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("")

    # File contents
    $totalSize = 0
    foreach ($item in $grouped) {
        $content = Get-FileContentSafe -FilePath $item.File.FullName
        $totalSize += $item.File.Length

        [void]$sb.AppendLine("")
        [void]$sb.AppendLine($sep)
        [void]$sb.AppendLine("FILE: $($item.RelPath)")
        [void]$sb.AppendLine("CATEGORY: $($item.Category)")
        [void]$sb.AppendLine("SIZE: $(Format-FileSize -Bytes $item.File.Length)")
        [void]$sb.AppendLine($sep)
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine($content)
        [void]$sb.AppendLine("")
    }

    Write-SafeContent -Path $OutputFile -Content $sb.ToString()
    Write-Host "  [OK] ${FolderName}: $fileCount files, $(Format-FileSize -Bytes $totalSize)" -ForegroundColor Green

    return [PSCustomObject]@{
        Name = $FolderName
        OutputFile = $OutputFile
        FileCount = $fileCount
        TotalSize = $totalSize
    }
}

function Export-ConfigFiles {
    param([string]$OutputFile)

    $configFiles = @(
        "user-panel\package.json",
        "user-panel\tsconfig.json",
        "user-panel\next.config.ts",
        "user-panel\tailwind.config.ts",
        "user-panel\postcss.config.mjs",
        "user-panel\eslint.config.mjs",
        "user-panel\.env.example",
        "user-panel\vercel.json",
        "admin-panel\package.json",
        "admin-panel\tsconfig.json",
        "admin-panel\next.config.ts",
        "admin-panel\tailwind.config.ts",
        "admin-panel\postcss.config.mjs",
        "admin-panel\eslint.config.mjs",
        "admin-panel\.env.example",
        "admin-panel\vercel.json",
        ".gitignore",
        "README.md",
        "SETUP_TURSO.md"
    )

    $sb = New-Object System.Text.StringBuilder
    $sep = "=" * 80

    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("DENOVA PK - Configuration Files")
    [void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("")

    $foundCount = 0
    $totalSize = 0

    foreach ($file in $configFiles) {
        $fullPath = Join-Path $ProjectRoot $file
        if (Test-Path $fullPath) {
            $fileInfo = Get-Item $fullPath
            $content = Get-FileContentSafe -FilePath $fullPath
            $totalSize += $fileInfo.Length
            $foundCount++

            [void]$sb.AppendLine("")
            [void]$sb.AppendLine($sep)
            [void]$sb.AppendLine("FILE: $file")
            [void]$sb.AppendLine("SIZE: $(Format-FileSize -Bytes $fileInfo.Length)")
            [void]$sb.AppendLine($sep)
            [void]$sb.AppendLine("")
            [void]$sb.AppendLine($content)
            [void]$sb.AppendLine("")
        }
    }

    Write-SafeContent -Path $OutputFile -Content $sb.ToString()
    Write-Host "  [OK] Config Files: $foundCount files, $(Format-FileSize -Bytes $totalSize)" -ForegroundColor Green

    return [PSCustomObject]@{
        Name = "Configuration Files"
        OutputFile = $OutputFile
        FileCount = $foundCount
        TotalSize = $totalSize
    }
}

function Export-ApiRoutes {
    param([string]$OutputFile)

    $userApi = Join-Path $ProjectRoot "user-panel\src\app\api"
    $adminApi = Join-Path $ProjectRoot "admin-panel\src\app\api"

    $sb = New-Object System.Text.StringBuilder
    $sep = "=" * 80

    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("DENOVA PK - API Routes (Both Panels)")
    [void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("")

    $totalFiles = 0
    $totalSize = 0

    foreach ($panel in @(
        @{ Name = "USER PANEL API"; Path = $userApi },
        @{ Name = "ADMIN PANEL API"; Path = $adminApi }
    )) {
        if (Test-Path $panel.Path) {
            [void]$sb.AppendLine("")
            [void]$sb.AppendLine($sep)
            [void]$sb.AppendLine("SECTION: $($panel.Name)")
            [void]$sb.AppendLine($sep)
            [void]$sb.AppendLine("")

            $files = Get-FilesToExtract -BaseFolder $panel.Path
            foreach ($file in $files) {
                $relativePath = $file.FullName.Substring($panel.Path.Length).TrimStart("\")
                $content = Get-FileContentSafe -FilePath $file.FullName
                $totalSize += $file.Length
                $totalFiles++

                [void]$sb.AppendLine("")
                [void]$sb.AppendLine("---- ROUTE: $relativePath ----")
                [void]$sb.AppendLine("")
                [void]$sb.AppendLine($content)
                [void]$sb.AppendLine("")
            }
        }
    }

    Write-SafeContent -Path $OutputFile -Content $sb.ToString()
    Write-Host "  [OK] API Routes: $totalFiles files, $(Format-FileSize -Bytes $totalSize)" -ForegroundColor Green

    return [PSCustomObject]@{
        Name = "API Routes"
        OutputFile = $OutputFile
        FileCount = $totalFiles
        TotalSize = $totalSize
    }
}

function Export-DatabaseFiles {
    param([string]$OutputFile)

    $sb = New-Object System.Text.StringBuilder
    $sep = "=" * 80

    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("DENOVA PK - Database Files")
    [void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine($sep)
    [void]$sb.AppendLine("")

    $totalFiles = 0
    $totalSize = 0

    # Shared DB (schema.sql)
    $sharedDb = Join-Path $ProjectRoot "shared\db"
    if (Test-Path $sharedDb) {
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine($sep)
        [void]$sb.AppendLine("SECTION: SHARED DATABASE (Schema, SQL)")
        [void]$sb.AppendLine($sep)

        $files = Get-FilesToExtract -BaseFolder $sharedDb -AllowedExtensions @(".sql", ".ts", ".md")
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($sharedDb.Length).TrimStart("\")
            $content = Get-FileContentSafe -FilePath $file.FullName
            $totalSize += $file.Length
            $totalFiles++

            [void]$sb.AppendLine("")
            [void]$sb.AppendLine("---- FILE: $relativePath ----")
            [void]$sb.AppendLine("")
            [void]$sb.AppendLine($content)
            [void]$sb.AppendLine("")
        }
    }

    # Admin Panel DB (repositories, migrate, seed)
    $adminDb = Join-Path $ProjectRoot "admin-panel\src\lib\db"
    if (Test-Path $adminDb) {
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine($sep)
        [void]$sb.AppendLine("SECTION: ADMIN PANEL DATABASE")
        [void]$sb.AppendLine($sep)

        $files = Get-FilesToExtract -BaseFolder $adminDb
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($adminDb.Length).TrimStart("\")
            $content = Get-FileContentSafe -FilePath $file.FullName
            $totalSize += $file.Length
            $totalFiles++

            [void]$sb.AppendLine("")
            [void]$sb.AppendLine("---- FILE: $relativePath ----")
            [void]$sb.AppendLine("")
            [void]$sb.AppendLine($content)
            [void]$sb.AppendLine("")
        }
    }

    # User Panel DB (repositories)
    $userDb = Join-Path $ProjectRoot "user-panel\src\lib\db"
    if (Test-Path $userDb) {
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine($sep)
        [void]$sb.AppendLine("SECTION: USER PANEL DATABASE")
        [void]$sb.AppendLine($sep)

        $files = Get-FilesToExtract -BaseFolder $userDb
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($userDb.Length).TrimStart("\")
            $content = Get-FileContentSafe -FilePath $file.FullName
            $totalSize += $file.Length
            $totalFiles++

            [void]$sb.AppendLine("")
            [void]$sb.AppendLine("---- FILE: $relativePath ----")
            [void]$sb.AppendLine("")
            [void]$sb.AppendLine($content)
            [void]$sb.AppendLine("")
        }
    }

    Write-SafeContent -Path $OutputFile -Content $sb.ToString()
    Write-Host "  [OK] Database Files: $totalFiles files, $(Format-FileSize -Bytes $totalSize)" -ForegroundColor Green

    return [PSCustomObject]@{
        Name = "Database Files"
        OutputFile = $OutputFile
        FileCount = $totalFiles
        TotalSize = $totalSize
    }
}

function New-ProjectSummary {
    param([string]$OutputFile, [array]$Results)

    $sb = New-Object System.Text.StringBuilder

    [void]$sb.AppendLine("# Denova PK - Project Snapshot")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    [void]$sb.AppendLine("**Extraction mode:** $Mode")
    [void]$sb.AppendLine("**Project:** Denova PK - Premium Denim E-Commerce Platform")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Snapshot Contents")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| Section | Files | Size | Output |")
    [void]$sb.AppendLine("|---------|-------|------|--------|")
    foreach ($r in $Results) {
        if ($r) {
            $outName = Split-Path -Leaf $r.OutputFile
            [void]$sb.AppendLine("| $($r.Name) | $($r.FileCount) | $(Format-FileSize -Bytes $r.TotalSize) | $outName |")
        }
    }
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Project Overview")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**Denova PK** is a complete Shopify-level e-commerce platform for a Pakistani")
    [void]$sb.AppendLine("premium denim clothing brand. The platform consists of two independent Next.js")
    [void]$sb.AppendLine("applications sharing a single Turso database.")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### User Panel (Port 3000) - denovapk.com")
    [void]$sb.AppendLine("Customer-facing e-commerce storefront.")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("- Homepage with hero slider, featured collections, new arrivals")
    [void]$sb.AppendLine("- Full product catalog with filtering, sorting, search")
    [void]$sb.AppendLine("- Product detail pages with size/color selectors, related products")
    [void]$sb.AppendLine("- Collections pages (Summer, Formal, Casual, Winter)")
    [void]$sb.AppendLine("- Shopping cart (syncs to server for logged-in users)")
    [void]$sb.AppendLine("- Wishlist system")
    [void]$sb.AppendLine("- Complete 4-step checkout flow (info -> shipping -> payment -> review)")
    [void]$sb.AppendLine("- Real order creation with discount validation + stock decrement")
    [void]$sb.AppendLine("- User accounts (register, login, dashboard)")
    [void]$sb.AppendLine("- Order history with real order tracking")
    [void]$sb.AppendLine("- Address book (CRUD with default address)")
    [void]$sb.AppendLine("- Search modal + full search page")
    [void]$sb.AppendLine("- 10 static pages: FAQ, Shipping, Returns, Privacy, Terms, Size Guide,")
    [void]$sb.AppendLine("  Track Order, Careers, About, Contact")
    [void]$sb.AppendLine("- Newsletter subscription + contact form")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Admin Panel (Port 3001) - admin.denovapk.com")
    [void]$sb.AppendLine("Complete business management dashboard.")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("- JWT-based authentication for admins")
    [void]$sb.AppendLine("- Live dashboard with revenue chart, top products, recent orders")
    [void]$sb.AppendLine("- Products management (list, create, edit, delete with variants)")
    [void]$sb.AppendLine("- Orders management with status updates and tracking")
    [void]$sb.AppendLine("- Customer profiles with computed stats (total spent, orders)")
    [void]$sb.AppendLine("- Collections management")
    [void]$sb.AppendLine("- Inventory management with real-time stock updates")
    [void]$sb.AppendLine("- Discount codes management")
    [void]$sb.AppendLine("- Analytics with revenue trends")
    [void]$sb.AppendLine("- Staff and role management")
    [void]$sb.AppendLine("- Settings dashboard")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Tech Stack")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("- **Framework:** Next.js 16 (App Router + Turbopack)")
    [void]$sb.AppendLine("- **Language:** TypeScript (strict mode)")
    [void]$sb.AppendLine("- **Styling:** Tailwind CSS v4 (uses @import syntax, no @tailwind)")
    [void]$sb.AppendLine("- **Database:** Turso (libSQL / SQLite) via @libsql/client (direct, no ORM)")
    [void]$sb.AppendLine("- **Auth:** Custom JWT + bcrypt (both panels)")
    [void]$sb.AppendLine("- **State Management:** Zustand (with localStorage persistence)")
    [void]$sb.AppendLine("- **Forms:** react-hook-form + Zod validation")
    [void]$sb.AppendLine("- **Icons:** lucide-react")
    [void]$sb.AppendLine("- **Fonts:** Inter, Playfair Display, Cormorant Garamond (Google Fonts)")
    [void]$sb.AppendLine("- **Images:** Next.js Image with AVIF/WebP optimization")
    [void]$sb.AppendLine("- **Animation:** Custom device-aware animations (Intersection Observer)")
    [void]$sb.AppendLine("- **Deployment:** hostonme.dev (Docker-based) or Vercel")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Brand Design System")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("- **Primary (Text):** #1a1a1a (Near Black)")
    [void]$sb.AppendLine("- **Secondary (Accent):** #c9a96e (Warm Gold)")
    [void]$sb.AppendLine("- **Accent:** #f5f0e8 (Cream)")
    [void]$sb.AppendLine("- **Background:** #ffffff (Pure White)")
    [void]$sb.AppendLine("- **Surface:** #fafaf9 (Off White)")
    [void]$sb.AppendLine("- **Muted:** #6b7280 (Warm Gray)")
    [void]$sb.AppendLine("- **Border:** #e5e7eb")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**Typography:**")
    [void]$sb.AppendLine("- Display: Playfair Display (elegant serif for headings)")
    [void]$sb.AppendLine("- Body: Inter (clean sans-serif for text)")
    [void]$sb.AppendLine("- Accent: Cormorant Garamond (luxury feel for quotes)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Database Schema (20 tables)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Users & Auth")
    [void]$sb.AppendLine("- users - customers with email/phone/password")
    [void]$sb.AppendLine("- admins - admin users with roles (SUPER_ADMIN, ADMIN, MANAGER, STAFF)")
    [void]$sb.AppendLine("- sessions - user session tokens")
    [void]$sb.AppendLine("- addresses - customer saved addresses")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Products")
    [void]$sb.AppendLine("- products - main product catalog (prices in paisa)")
    [void]$sb.AppendLine("- product_images - product image URLs (with isPrimary flag)")
    [void]$sb.AppendLine("- product_variants - size/color combinations with stock")
    [void]$sb.AppendLine("- collections - product groupings (Summer, Formal, etc.)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Cart & Wishlist")
    [void]$sb.AppendLine("- carts - one cart per user")
    [void]$sb.AppendLine("- cart_items - cart line items")
    [void]$sb.AppendLine("- wishlists - user wishlist items")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Orders")
    [void]$sb.AppendLine("- orders - orders (both registered users and guests)")
    [void]$sb.AppendLine("- order_items - order line items (snapshot data)")
    [void]$sb.AppendLine("- discounts - discount codes")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Marketing")
    [void]$sb.AppendLine("- reviews - product reviews")
    [void]$sb.AppendLine("- newsletter - email subscribers")
    [void]$sb.AppendLine("- contact_messages - contact form submissions")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Store Settings")
    [void]$sb.AppendLine("- settings - key/value config storage")
    [void]$sb.AppendLine("- shipping_zones - delivery zones")
    [void]$sb.AppendLine("- shipping_methods - shipping options per zone")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Project Structure")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("    denovapk/")
    [void]$sb.AppendLine("      user-panel/                    # Customer storefront (port 3000)")
    [void]$sb.AppendLine("        src/app/                     # Next.js app router pages")
    [void]$sb.AppendLine("          api/                       # API routes (cart, checkout, etc.)")
    [void]$sb.AppendLine("          account/                   # User account pages")
    [void]$sb.AppendLine("          shop/                      # Product catalog")
    [void]$sb.AppendLine("          products/[slug]/           # Product detail")
    [void]$sb.AppendLine("          collections/               # Collection pages")
    [void]$sb.AppendLine("          checkout/                  # 4-step checkout")
    [void]$sb.AppendLine("        src/components/              # UI components (organized by type)")
    [void]$sb.AppendLine("        src/lib/                     # DB, auth, utils, adapters")
    [void]$sb.AppendLine("          db/                        # DB client, types, repositories")
    [void]$sb.AppendLine("        src/store/                   # Zustand stores (cart, auth, etc.)")
    [void]$sb.AppendLine("        src/types/                   # TypeScript types")
    [void]$sb.AppendLine("      admin-panel/                   # Business dashboard (port 3001)")
    [void]$sb.AppendLine("        src/app/(auth)/login/        # Login page")
    [void]$sb.AppendLine("        src/app/(dashboard)/         # Protected admin pages")
    [void]$sb.AppendLine("        src/app/api/                 # Admin API routes")
    [void]$sb.AppendLine("        src/components/              # Admin UI components")
    [void]$sb.AppendLine("        src/lib/                     # DB, auth, adapters")
    [void]$sb.AppendLine("          db/                        # Client + repositories + migrate + seed")
    [void]$sb.AppendLine("      shared/                        # Shared resources")
    [void]$sb.AppendLine("        db/schema.sql                # Complete SQL schema")
    [void]$sb.AppendLine("      Project_Snapshot/              # Generated extracts (this folder)")
    [void]$sb.AppendLine("      extract-project.ps1            # This script")
    [void]$sb.AppendLine("      README.md")
    [void]$sb.AppendLine("      SETUP_TURSO.md")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Demo Credentials")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Admin Login")
    [void]$sb.AppendLine("- **URL:** http://localhost:3001/login (or admin.denovapk.com)")
    [void]$sb.AppendLine("- **Email:** admin@denovapk.com")
    [void]$sb.AppendLine("- **Password:** admin1234")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### User Login")
    [void]$sb.AppendLine("- **URL:** http://localhost:3000/account/login (or denovapk.com)")
    [void]$sb.AppendLine("- **Email:** ayesha@example.com")
    [void]$sb.AppendLine("- **Password:** demo1234")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Running the Project")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Prerequisites")
    [void]$sb.AppendLine("1. Node.js 18+ installed")
    [void]$sb.AppendLine("2. Turso account at https://turso.tech")
    [void]$sb.AppendLine("3. Create database at Turso, copy URL and auth token")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Setup")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**Terminal 1 - Install & Initialize:**")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("    cd admin-panel")
    [void]$sb.AppendLine("    npm install")
    [void]$sb.AppendLine("    # Create .env from .env.example, add TURSO_DATABASE_URL + TURSO_AUTH_TOKEN")
    [void]$sb.AppendLine("    npm run db:init      # Create all tables")
    [void]$sb.AppendLine("    npm run db:seed      # Populate demo data")
    [void]$sb.AppendLine("    npm run dev -- -p 3001")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**Terminal 2 - Start User Panel:**")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("    cd user-panel")
    [void]$sb.AppendLine("    npm install")
    [void]$sb.AppendLine("    # Create .env from .env.example, use SAME Turso credentials")
    [void]$sb.AppendLine("    npm run dev")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Database Scripts (admin-panel)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("- **npm run db:init** - Create all tables from shared/db/schema.sql")
    [void]$sb.AppendLine("- **npm run db:seed** - Populate with demo data (products, orders, users)")
    [void]$sb.AppendLine("- **npm run db:reset** - Drop all tables (destructive!)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Deployment")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("Deployed on hostonme.dev with:")
    [void]$sb.AppendLine("- User Panel: https://denovapk.com")
    [void]$sb.AppendLine("- Admin Panel: https://admin.denovapk.com (or hqdenovapk.hostonme.dev)")
    [void]$sb.AppendLine("- Both panels connect to the same Turso database")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("Required env vars in production:")
    [void]$sb.AppendLine("- TURSO_DATABASE_URL")
    [void]$sb.AppendLine("- TURSO_AUTH_TOKEN")
    [void]$sb.AppendLine("- JWT_SECRET (admin-panel)")
    [void]$sb.AppendLine("- NEXTAUTH_SECRET (user-panel)")
    [void]$sb.AppendLine("- NEXT_PUBLIC_SITE_URL")
    [void]$sb.AppendLine("- NEXT_PUBLIC_ADMIN_URL")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Development Rules")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Tailwind CSS v4")
    [void]$sb.AppendLine("- ALWAYS use ``@import ""tailwindcss""`` in globals.css")
    [void]$sb.AppendLine("- NEVER use ``@tailwind base;`` ``@tailwind components;`` ``@tailwind utilities;``")
    [void]$sb.AppendLine("- NEVER use ``@apply`` in CSS files")
    [void]$sb.AppendLine("- Write Tailwind classes directly in components")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Prices")
    [void]$sb.AppendLine("- Store prices in database as PAISA (integers, no decimals)")
    [void]$sb.AppendLine("- Convert to rupees using ``paisaToRupees()`` for display")
    [void]$sb.AppendLine("- Convert from rupees using ``rupeesToPaisa()`` for storage")
    [void]$sb.AppendLine("- Use ``formatPaisa()`` or ``formatPrice()`` for display formatting")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Icons")
    [void]$sb.AppendLine("- Use lucide-react for standard icons")
    [void]$sb.AppendLine("- Use inline SVG for social media icons (Facebook, Instagram, etc.)")
    [void]$sb.AppendLine("- These are removed from lucide-react: Facebook, Twitter, Instagram, Linkedin")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### PowerShell File Writes")
    [void]$sb.AppendLine("- ALWAYS use ``[System.IO.File]::WriteAllText()``")
    [void]$sb.AppendLine("- NEVER use ``Set-Content`` (causes duplication)")
    [void]$sb.AppendLine("- Always use ``Clear-Content`` first (with -ErrorAction SilentlyContinue)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Database Access")
    [void]$sb.AppendLine("- Use ``@libsql/client`` directly (NO Prisma - we tried it and moved on)")
    [void]$sb.AppendLine("- Query pattern: ``db.execute({ sql: '...', args: [...] })``")
    [void]$sb.AppendLine("- Types in ``src/lib/db/types.ts`` match SQL schema exactly")
    [void]$sb.AppendLine("- Repositories in ``src/lib/db/repositories/`` handle business logic")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## Status")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Completed")
    [void]$sb.AppendLine("- Complete user panel (all pages, cart, checkout, accounts)")
    [void]$sb.AppendLine("- Complete admin panel (dashboard, all CRUD modules)")
    [void]$sb.AppendLine("- Database with 20 tables + demo data")
    [void]$sb.AppendLine("- JWT authentication for admin, session cookies for users")
    [void]$sb.AppendLine("- Real order creation with stock management")
    [void]$sb.AppendLine("- Discount code validation")
    [void]$sb.AppendLine("- Address book CRUD")
    [void]$sb.AppendLine("- Cart syncs to server for logged-in users")
    [void]$sb.AppendLine("- OG images and social meta tags configured")
    [void]$sb.AppendLine("- Deployment to hostonme.dev working")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("### Optional Enhancements (Not Started)")
    [void]$sb.AppendLine("- Cloudinary integration for product image uploads")
    [void]$sb.AppendLine("- Email notifications (order confirmation)")
    [void]$sb.AppendLine("- Real payment gateway integration (JazzCash/EasyPaisa)")
    [void]$sb.AppendLine("- SEO enhancements (sitemap.xml, structured data)")
    [void]$sb.AppendLine("- Multi-variant inventory management")
    [void]$sb.AppendLine("- Analytics integration (Google Analytics)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## For AI Assistants Picking Up This Project")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("When continuing work on this project:")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("1. **Read PROJECT_SUMMARY.md first** (this file) for full context")
    [void]$sb.AppendLine("2. **Check shared/db/schema.sql** to understand database structure")
    [void]$sb.AppendLine("3. **Review repositories** in src/lib/db/repositories/ for query patterns")
    [void]$sb.AppendLine("4. **API routes** live in src/app/api/ for both panels")
    [void]$sb.AppendLine("5. **User pages** are in src/app/ (marketing) and src/app/account/ (auth-protected)")
    [void]$sb.AppendLine("6. **Admin pages** are in src/app/(dashboard)/ (auth-protected)")
    [void]$sb.AppendLine("7. **Use brand colors** consistently (see Brand Design System above)")
    [void]$sb.AppendLine("8. **Prices in paisa** (integer, x100 of rupees)")
    [void]$sb.AppendLine("9. **No Prisma** - direct SQL via @libsql/client")
    [void]$sb.AppendLine("10. **Use hardcoded URLs** for OG images (not env vars, avoids localhost fallback)")
    [void]$sb.AppendLine("")

    Write-SafeContent -Path $OutputFile -Content $sb.ToString()
}

# ============================================
# MAIN
# ============================================
Clear-Host
Write-Header "Denova PK Project Extractor"

Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Output:       $OutputFolder" -ForegroundColor Gray
Write-Host "Mode:         $Mode" -ForegroundColor Yellow
Write-Host ""

New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null

$results = @()

switch ($Mode) {
    "all" {
        Write-Header "Extracting Everything"

        $results += Export-FolderToFile -FolderName "User Panel (src/)" `
            -FolderPath (Join-Path $ProjectRoot "user-panel\src") `
            -OutputFile (Join-Path $OutputFolder "01_user-panel.txt")

        $results += Export-FolderToFile -FolderName "Admin Panel (src/)" `
            -FolderPath (Join-Path $ProjectRoot "admin-panel\src") `
            -OutputFile (Join-Path $OutputFolder "02_admin-panel.txt")

        $results += Export-FolderToFile -FolderName "Shared" `
            -FolderPath (Join-Path $ProjectRoot "shared") `
            -OutputFile (Join-Path $OutputFolder "03_shared.txt")

        $results += Export-ApiRoutes `
            -OutputFile (Join-Path $OutputFolder "04_api-routes.txt")

        $results += Export-DatabaseFiles `
            -OutputFile (Join-Path $OutputFolder "05_database.txt")

        $results += Export-ConfigFiles `
            -OutputFile (Join-Path $OutputFolder "06_configs.txt")
    }

    "user" {
        Write-Header "Extracting User Panel Only"
        $results += Export-FolderToFile -FolderName "User Panel" `
            -FolderPath (Join-Path $ProjectRoot "user-panel\src") `
            -OutputFile (Join-Path $OutputFolder "user-panel.txt")
    }

    "admin" {
        Write-Header "Extracting Admin Panel Only"
        $results += Export-FolderToFile -FolderName "Admin Panel" `
            -FolderPath (Join-Path $ProjectRoot "admin-panel\src") `
            -OutputFile (Join-Path $OutputFolder "admin-panel.txt")
    }

    "shared" {
        Write-Header "Extracting Shared Folder"
        $results += Export-FolderToFile -FolderName "Shared" `
            -FolderPath (Join-Path $ProjectRoot "shared") `
            -OutputFile (Join-Path $OutputFolder "shared.txt")
    }

    "api" {
        Write-Header "Extracting API Routes"
        $results += Export-ApiRoutes `
            -OutputFile (Join-Path $OutputFolder "api-routes.txt")
    }

    "database" {
        Write-Header "Extracting Database Files"
        $results += Export-DatabaseFiles `
            -OutputFile (Join-Path $OutputFolder "database.txt")
    }

    "config" {
        Write-Header "Extracting Configuration Files"
        $results += Export-ConfigFiles `
            -OutputFile (Join-Path $OutputFolder "configs.txt")
    }

    "ai" {
        Write-Header "Extracting AI-Optimized Bundle"

        $results += Export-FolderToFile -FolderName "User Panel (src/)" `
            -FolderPath (Join-Path $ProjectRoot "user-panel\src") `
            -OutputFile (Join-Path $OutputFolder "1_user-panel.txt")

        $results += Export-FolderToFile -FolderName "Admin Panel (src/)" `
            -FolderPath (Join-Path $ProjectRoot "admin-panel\src") `
            -OutputFile (Join-Path $OutputFolder "2_admin-panel.txt")

        $results += Export-DatabaseFiles `
            -OutputFile (Join-Path $OutputFolder "3_database.txt")

        $results += Export-ConfigFiles `
            -OutputFile (Join-Path $OutputFolder "4_configs.txt")
    }

    "quick" {
        Write-Header "Extracting Quick Share (critical files only)"

        $criticalFiles = @(
            "shared\db\schema.sql",
            "user-panel\src\app\layout.tsx",
            "user-panel\src\app\page.tsx",
            "user-panel\src\lib\db\client.ts",
            "user-panel\src\lib\db\types.ts",
            "user-panel\src\lib\auth.ts",
            "user-panel\src\store\cartStore.ts",
            "user-panel\src\store\authStore.ts",
            "user-panel\src\app\api\checkout\route.ts",
            "admin-panel\src\app\layout.tsx",
            "admin-panel\src\app\(dashboard)\layout.tsx",
            "admin-panel\src\app\(dashboard)\page.tsx",
            "admin-panel\src\lib\db\client.ts",
            "admin-panel\src\lib\auth.ts",
            "admin-panel\src\components\layout\Sidebar.tsx",
            "README.md"
        )

        $sb = New-Object System.Text.StringBuilder
        $sep = "=" * 80
        [void]$sb.AppendLine("# Denova PK - Quick Share")
        [void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
        [void]$sb.AppendLine("Only the most critical files for quick AI context.")
        [void]$sb.AppendLine("")

        $found = 0
        $totalSize = 0
        foreach ($f in $criticalFiles) {
            $full = Join-Path $ProjectRoot $f
            if (Test-Path $full) {
                $content = Get-FileContentSafe -FilePath $full
                $fileInfo = Get-Item $full
                $totalSize += $fileInfo.Length

                [void]$sb.AppendLine($sep)
                [void]$sb.AppendLine("FILE: $f")
                [void]$sb.AppendLine("SIZE: $(Format-FileSize -Bytes $fileInfo.Length)")
                [void]$sb.AppendLine($sep)
                [void]$sb.AppendLine("")
                [void]$sb.AppendLine($content)
                [void]$sb.AppendLine("")
                $found++
            }
        }

        $outFile = Join-Path $OutputFolder "quick-share.txt"
        Write-SafeContent -Path $outFile -Content $sb.ToString()
        Write-Host "  [OK] Critical Files: $found files, $(Format-FileSize -Bytes $totalSize)" -ForegroundColor Green

        $results += [PSCustomObject]@{
            Name = "Critical Files"
            OutputFile = $outFile
            FileCount = $found
            TotalSize = $totalSize
        }
    }
}

# Always generate summary
Write-Header "Creating PROJECT_SUMMARY.md"
$summaryFile = Join-Path $OutputFolder "PROJECT_SUMMARY.md"
New-ProjectSummary -OutputFile $summaryFile -Results $results
Write-Host "  [OK] PROJECT_SUMMARY.md created" -ForegroundColor Green

# Final report
Write-Header "Extraction Complete!"
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
foreach ($r in $results) {
    if ($r) {
        $sizeStr = Format-FileSize -Bytes $r.TotalSize
        Write-Host ("  [OK] {0,-30} {1,5} files  {2,10}" -f $r.Name, $r.FileCount, $sizeStr) -ForegroundColor Green
    }
}
Write-Host ""
Write-Host "Output folder:" -ForegroundColor Cyan
Write-Host "   $OutputFolder" -ForegroundColor White
Write-Host ""
Write-Host "Files generated:" -ForegroundColor Cyan
Get-ChildItem -Path $OutputFolder -File | ForEach-Object {
    $size = Format-FileSize -Bytes $_.Length
    Write-Host ("   - {0,-40} {1,10}" -f $_.Name, $size) -ForegroundColor White
}
Write-Host ""

if ($OpenAfter) {
    Write-Host "Opening output folder..." -ForegroundColor Yellow
    Invoke-Item $OutputFolder
} else {
    Write-Host "Tips:" -ForegroundColor Gray
    Write-Host "   -OpenAfter    : Auto-open the folder after extraction" -ForegroundColor Gray
    Write-Host "   -Mode all     : Extract everything (largest)" -ForegroundColor Gray
    Write-Host "   -Mode quick   : Only critical files (smallest, best for chat)" -ForegroundColor Gray
    Write-Host "   -Mode ai      : Balanced bundle (recommended)" -ForegroundColor Gray
    Write-Host "   -Mode user    : User panel only" -ForegroundColor Gray
    Write-Host "   -Mode admin   : Admin panel only" -ForegroundColor Gray
    Write-Host "   -Mode api     : API routes only" -ForegroundColor Gray
    Write-Host "   -Mode database: Database files only" -ForegroundColor Gray
    Write-Host "   -Mode config  : Config files only" -ForegroundColor Gray
}

Write-Host ""
$endLine = "=" * 70
Write-Host $endLine -ForegroundColor Cyan
Write-Host ""