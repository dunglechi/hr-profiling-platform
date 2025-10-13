#!/usr/bin/env powershell
# SDLC 4.7 Pre-commit Compliance Hook
# Automatically checks compliance before git commits

Write-Host "🔍 Running SDLC 4.7 pre-commit compliance check..." -ForegroundColor Yellow

# Get staged files
$stagedFiles = git diff --cached --name-only --diff-filter=ACM

$violations = @()

foreach ($file in $stagedFiles) {
    if ($file -match '\.md$') {
        # Check for SDLC header
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -notmatch "SDLC_VERSION:") {
            $violations += "❌ Missing SDLC header: $file"
        }
    }
    
    # Check naming conventions
    $fileName = Split-Path $file -Leaf
    if ($fileName -match '(FINAL|DRAFT|TEMP|V\d+\.\d+|\d{4}-\d{2}-\d{2})') {
        $violations += "❌ Naming violation: $file"
    }
}

if ($violations.Count -gt 0) {
    Write-Host "🚨 COMMIT BLOCKED - SDLC 4.7 Violations Found:" -ForegroundColor Red
    foreach ($violation in $violations) {
        Write-Host "  $violation" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please fix violations before committing." -ForegroundColor Yellow
    Write-Host "Run: .\tools\sdlc-compliance-check.ps1 for full report" -ForegroundColor Blue
    exit 1
} else {
    Write-Host "✅ SDLC 4.7 compliance check passed!" -ForegroundColor Green
    exit 0
}