#!/usr/bin/env powershell
# SDLC 4.7 Governance Enforcement Tool
# Automatically fixes common compliance violations

param(
    [switch]$AutoFix,
    [switch]$DryRun
)

Write-Host "🛠️  SDLC 4.7 Governance Enforcement Tool" -ForegroundColor Green
Write-Host "Mode: $(if ($AutoFix) { 'AUTO-FIX' } elseif ($DryRun) { 'DRY-RUN' } else { 'ANALYSIS' })" -ForegroundColor Yellow

$projectRoot = "c:\Users\Admin\Projects"
$fixes = @()

# Find files with naming violations
$allFiles = Get-ChildItem -Path $projectRoot -Recurse -File | Where-Object { 
    $_.FullName -notmatch 'node_modules|\.git|SDLC-Enterprise-Framework' 
}

foreach ($file in $allFiles) {
    $violations = @()
    $suggestedName = $file.Name
    
    # Check for violations
    if ($file.Name -match 'FINAL') {
        $suggestedName = $suggestedName -replace 'FINAL-', ''
        $violations += "FINAL status marker"
    }
    if ($file.Name -match 'DRAFT') {
        $suggestedName = $suggestedName -replace 'DRAFT-', ''
        $violations += "DRAFT status marker"
    }
    if ($file.Name -match 'TEMP') {
        $suggestedName = $suggestedName -replace 'TEMP-', ''
        $violations += "TEMP status marker"
    }
    if ($file.Name -match 'V\d+\.\d+') {
        $suggestedName = $suggestedName -replace '-V\d+\.\d+', ''
        $violations += "Version number in filename"
    }
    if ($file.Name -match '_' -and $file.Extension -eq '.md') {
        $suggestedName = $suggestedName -replace '_', '-'
        $violations += "Underscore instead of kebab-case"
    }
    
    if ($violations.Count -gt 0) {
        $fix = @{
            File = $file.FullName
            OriginalName = $file.Name
            SuggestedName = $suggestedName
            Violations = $violations
        }
        $fixes += $fix
        
        if ($AutoFix -and !$DryRun) {
            $newPath = Join-Path $file.Directory $suggestedName
            if (!(Test-Path $newPath)) {
                Rename-Item -Path $file.FullName -NewName $suggestedName
                Write-Host "✅ Fixed: $($file.Name) → $suggestedName" -ForegroundColor Green
            }
        } else {
            Write-Host "📝 Found: $($file.Name)" -ForegroundColor Yellow
            Write-Host "   Violations: $($violations -join ', ')" -ForegroundColor Red
            Write-Host "   Suggested: $suggestedName" -ForegroundColor Green
        }
    }
}

# Summary
Write-Host ""
Write-Host "📊 GOVERNANCE ENFORCEMENT SUMMARY" -ForegroundColor Cyan
Write-Host "Files with violations: $($fixes.Count)"
if ($AutoFix -and !$DryRun) {
    Write-Host "Files fixed: $($fixes.Count)" -ForegroundColor Green
} else {
    Write-Host "Use -AutoFix to apply fixes automatically" -ForegroundColor Blue
    Write-Host "Use -DryRun with -AutoFix to preview changes" -ForegroundColor Blue
}

# Save enforcement report
$reportPath = "$projectRoot\.sdlc\compliance\governance-enforcement-report.json"
$report = @{
    date = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    mode = if ($AutoFix) { 'AUTO-FIX' } elseif ($DryRun) { 'DRY-RUN' } else { 'ANALYSIS' }
    violationsFound = $fixes.Count
    fixes = $fixes
} | ConvertTo-Json -Depth 4

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Blue