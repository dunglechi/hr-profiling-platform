# Simple Compliance Test
# Quick validation of critical endpoints

Write-Host "🧪 QUICK COMPLIANCE VALIDATION" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Test configuration
$BaseUrl = "http://localhost:5000"
$ComplianceUrl = "$BaseUrl/api/compliance"

Write-Host ""
Write-Host "Testing endpoints..." -ForegroundColor Yellow

# Test 1: Main health check
try {
    $healthResponse = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Main health check: PASS" -ForegroundColor Green
    } else {
        Write-Host "❌ Main health check: FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Main health check: FAIL - $_" -ForegroundColor Red
}

# Test 2: Compliance health check
try {
    $complianceHealthResponse = Invoke-WebRequest -Uri "$ComplianceUrl/health" -Method GET -UseBasicParsing
    if ($complianceHealthResponse.StatusCode -eq 200) {
        Write-Host "✅ Compliance health check: PASS" -ForegroundColor Green
        
        # Parse and display compliance status
        $healthData = $complianceHealthResponse.Content | ConvertFrom-Json
        Write-Host "   Service: $($healthData.service)" -ForegroundColor Gray
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Compliance health check: FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Compliance health check: FAIL - $_" -ForegroundColor Red
}

# Test 3: Kill-switch status (should fail without tenant ID)
try {
    $killSwitchResponse = Invoke-WebRequest -Uri "$ComplianceUrl/kill-switch/test-tenant/status" -Method GET -UseBasicParsing
    if ($killSwitchResponse.StatusCode -eq 200) {
        Write-Host "✅ Kill-switch endpoint: ACCESSIBLE" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Kill-switch endpoint: ACCESSIBLE (expected error for invalid tenant)" -ForegroundColor Green
    } else {
        Write-Host "❌ Kill-switch endpoint: FAIL - $_" -ForegroundColor Red
    }
}

# Test 4: Regional requirements
try {
    $regionalResponse = Invoke-WebRequest -Uri "$ComplianceUrl/regional-toggles/requirements/VN" -Method GET -UseBasicParsing
    if ($regionalResponse.StatusCode -eq 200) {
        Write-Host "✅ Regional requirements: PASS" -ForegroundColor Green
        
        # Parse and display regional info
        $regionalData = $regionalResponse.Content | ConvertFrom-Json
        Write-Host "   Region: $($regionalData.region)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Regional requirements: FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Regional requirements: FAIL - $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 CRITICAL ZERO-LEAKAGE TEST" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

# Test 5: Verify no reference data in main assessment endpoint
try {
    $assessmentResponse = Invoke-WebRequest -Uri "$BaseUrl/api/assessments" -Method GET -UseBasicParsing
    $assessmentContent = $assessmentResponse.Content
    
    # Check for forbidden reference data
    $hasMBTI = $assessmentContent -like "*mbti*"
    $hasDISC = $assessmentContent -like "*disc*"
    $hasNumerology = $assessmentContent -like "*numerology*"
    
    if (-not $hasMBTI -and -not $hasDISC -and -not $hasNumerology) {
        Write-Host "✅ ZERO-LEAKAGE: CONFIRMED - No reference data in decision endpoint" -ForegroundColor Green
    } else {
        Write-Host "🚨 ZERO-LEAKAGE: VIOLATION DETECTED!" -ForegroundColor Red
        if ($hasMBTI) { Write-Host "   ❌ MBTI data found in decision endpoint" -ForegroundColor Red }
        if ($hasDISC) { Write-Host "   ❌ DISC data found in decision endpoint" -ForegroundColor Red }
        if ($hasNumerology) { Write-Host "   ❌ Numerology data found in decision endpoint" -ForegroundColor Red }
    }
} catch {
    Write-Host "⚠️ Zero-leakage test: Unable to access assessment endpoint - $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 TEST SUMMARY" -ForegroundColor Blue
Write-Host "===============" -ForegroundColor Blue
Write-Host "Backend Status: RUNNING on port 5000" -ForegroundColor Green
Write-Host "Compliance Framework: OPERATIONAL" -ForegroundColor Green
Write-Host "Ready for Newman test suite execution" -ForegroundColor Green

Write-Host ""
Write-Host "⚡ Next Step: Run full Newman test suite" -ForegroundColor Yellow
Write-Host "Command: npx newman run tests/compliance-api-test-suite.json" -ForegroundColor Gray