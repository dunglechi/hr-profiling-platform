# HR Profiling Compliance - PowerShell Test Runner
# Executes contract, negative, and security tests on Windows

Write-Host "🧪 HR PROFILING COMPLIANCE - API CONTRACT TESTS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check Newman is installed
try {
    newman --version | Out-Null
    Write-Host "✅ Newman found" -ForegroundColor Green
} catch {
    Write-Host "❌ Newman not found. Installing..." -ForegroundColor Red
    npm install -g newman
}

# Test configuration
$COLLECTION_FILE = ".\tests\compliance-api-test-suite.json"
$BASE_URL = "http://localhost:5000/api/compliance"
$REPORT_DIR = ".\test-reports"

# Ensure directories exist
if (!(Test-Path $REPORT_DIR)) {
    New-Item -ItemType Directory -Path $REPORT_DIR | Out-Null
}
if (!(Test-Path ".\logs")) {
    New-Item -ItemType Directory -Path ".\logs" | Out-Null
}

Write-Host ""
Write-Host "📋 Test Configuration:" -ForegroundColor Blue
Write-Host "Collection: $COLLECTION_FILE"
Write-Host "Base URL: $BASE_URL" 
Write-Host "Report Dir: $REPORT_DIR"
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not running at $BASE_URL" -ForegroundColor Red
    Write-Host "Please start the backend first: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Running Compliance API Test Suite..." -ForegroundColor Blue
Write-Host ""

# Run the complete test suite
$newman_cmd = "newman"
$newman_args = @(
    "run", $COLLECTION_FILE,
    "--environment-var", "base_url=$BASE_URL",
    "--environment-var", "admin_token=admin_test_token",
    "--environment-var", "user_token=user_test_token", 
    "--environment-var", "dpo_token=dpo_test_token",
    "--timeout-request", "10000",
    "--delay-request", "100",
    "--reporters", "cli,html,json",
    "--reporter-html-export", "$REPORT_DIR\compliance-test-report.html",
    "--reporter-json-export", "$REPORT_DIR\compliance-test-results.json",
    "--verbose"
)

$process = Start-Process -FilePath $newman_cmd -ArgumentList $newman_args -Wait -PassThru -NoNewWindow

$TEST_RESULT = $process.ExitCode

Write-Host ""
Write-Host "📊 Test Results Summary:" -ForegroundColor Blue

if ($TEST_RESULT -eq 0) {
    Write-Host "✅ ALL TESTS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔒 COMPLIANCE VALIDATION SUCCESSFUL:" -ForegroundColor Green
    Write-Host "  ✅ Kill-switch functionality verified"
    Write-Host "  ✅ Consent management tested"
    Write-Host "  ✅ Data rights endpoints validated"
    Write-Host "  ✅ Export controls enforced"
    Write-Host "  ✅ Regional compliance configured"
    Write-Host "  ✅ Zero-leakage protection confirmed"
    Write-Host "  ✅ Security tests passed"
    
    Write-Host ""
    Write-Host "📁 Reports Generated:" -ForegroundColor Blue
    Write-Host "  HTML Report: $REPORT_DIR\compliance-test-report.html"
    Write-Host "  JSON Results: $REPORT_DIR\compliance-test-results.json"
    
    Write-Host ""
    Write-Host "🎯 READY FOR CPO REVIEW" -ForegroundColor Green
    
} else {
    Write-Host "❌ TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "🚨 COMPLIANCE ISSUES DETECTED:" -ForegroundColor Red
    Write-Host "  Check the detailed report for failures"
    Write-Host "  Review logs for error details"
    Write-Host "  Fix issues before CPO submission"
    
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Review HTML report for specific failures"
    Write-Host "  2. Check backend logs for errors"
    Write-Host "  3. Fix compliance issues"
    Write-Host "  4. Re-run tests"
    
    exit 1
}

Write-Host ""
Write-Host "⚡ Quick Commands:" -ForegroundColor Blue
Write-Host "  View HTML Report: Start-Process $REPORT_DIR\compliance-test-report.html"
Write-Host "  Check JSON Results: Get-Content $REPORT_DIR\compliance-test-results.json | ConvertFrom-Json"
Write-Host "  Re-run Tests: .\run-compliance-tests.ps1"

Write-Host ""
Write-Host "🎉 Contract testing completed successfully!" -ForegroundColor Green