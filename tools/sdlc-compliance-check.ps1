#!/usr/bin/env powershell
# SDLC 4.7 Automated Compliance Checker
# Version: 4.7.0
# Authority: CTO Approved

Write-Host "SDLC 4.7 Automated Compliance Check Starting..." -ForegroundColor Green

$projectRoot = "c:\Users\Admin\Projects"
$violations = @()

# Check 1: Folder Structure (8-folder limit)
Write-Host "Checking folder structure..." -ForegroundColor Yellow
$rootFolders = Get-ChildItem -Path $projectRoot -Directory | Where-Object { $_.Name -notmatch '^\.' -and $_.Name -ne 'node_modules' }
if ($rootFolders.Count -gt 8) {
    $violations += "❌ Root folder limit exceeded: $($rootFolders.Count)/8"
}

# Check 2: Required SDLC Headers
Write-Host "Checking SDLC headers..." -ForegroundColor Yellow
$mdFiles = Get-ChildItem -Path $projectRoot -Recurse -Filter "*.md" | Where-Object { $_.FullName -notmatch 'node_modules|\.git' }
$missingHeaders = 0
foreach ($file in $mdFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -notmatch "SDLC_VERSION:") {
        $missingHeaders++
    }
}

# Check 3: Naming Convention Violations
Write-Host "Checking naming conventions..." -ForegroundColor Yellow
$namingViolations = 0
$allFiles = Get-ChildItem -Path $projectRoot -Recurse -File | Where-Object { $_.FullName -notmatch 'node_modules|\.git' }
foreach ($file in $allFiles) {
    if ($file.Name -match '(FINAL|DRAFT|TEMP|V\d+\.\d+|\d{4}-\d{2}-\d{2})') {
        $namingViolations++
    }
}

# Generate Report
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SDLC 4.7 COMPLIANCE REPORT" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Project: HR Profiling & Assessment Platform"
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd')"
Write-Host ""

if ($violations.Count -eq 0 -and $missingHeaders -eq 0 -and $namingViolations -eq 0) {
    Write-Host "✅ FULL COMPLIANCE ACHIEVED!" -ForegroundColor Green
    $complianceScore = 100
} else {
    Write-Host "⚠️  Compliance Issues Found:" -ForegroundColor Yellow
    foreach ($violation in $violations) {
        Write-Host "  $violation"
    }
    Write-Host "  Missing Headers: $missingHeaders files"
    Write-Host "  Naming Violations: $namingViolations files"
    
    $totalIssues = $violations.Count + $missingHeaders + $namingViolations
    $complianceScore = [Math]::Max(0, 100 - ($totalIssues * 0.1))
}

Write-Host ""
Write-Host "Compliance Score: $($complianceScore.ToString('0.0'))%" -ForegroundColor $(if ($complianceScore -ge 95) { 'Green' } elseif ($complianceScore -ge 80) { 'Yellow' } else { 'Red' })
Write-Host "================================================" -ForegroundColor Cyan

# Save report
$reportPath = "$projectRoot\.sdlc\compliance\automated-compliance-report.json"
$report = @{
    project = "HR Profiling & Assessment Platform"
    date = Get-Date -Format 'yyyy-MM-dd'
    complianceScore = $complianceScore
    folderStructure = if ($rootFolders.Count -le 8) { "COMPLIANT" } else { "NON-COMPLIANT" }
    missingHeaders = $missingHeaders
    namingViolations = $namingViolations
    violations = $violations
} | ConvertTo-Json -Depth 3

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "Report saved to: $reportPath" -ForegroundColor Blue