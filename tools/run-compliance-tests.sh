#!/bin/bash

# HR Profiling Compliance - Newman Test Runner
# Executes contract, negative, and security tests

echo "🧪 HR PROFILING COMPLIANCE - API CONTRACT TESTS"
echo "=============================================="

# Check Newman is installed
if ! command -v newman &> /dev/null; then
    echo "❌ Newman not found. Installing..."
    npm install -g newman
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
COLLECTION_FILE="./tests/compliance-api-test-suite.json"
BASE_URL="http://localhost:5001/api/compliance"
REPORT_DIR="./test-reports"

# Ensure directories exist
mkdir -p $REPORT_DIR
mkdir -p ./logs

echo ""
echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "Collection: $COLLECTION_FILE"
echo "Base URL: $BASE_URL"
echo "Report Dir: $REPORT_DIR"
echo ""

# Check if backend is running
echo -e "${YELLOW}🔍 Checking backend availability...${NC}"
if curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend not running at $BASE_URL${NC}"
    echo "Please start the backend first: npm run dev"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Running Compliance API Test Suite...${NC}"
echo ""

# Run the complete test suite
newman run "$COLLECTION_FILE" \
    --environment-var "base_url=$BASE_URL" \
    --environment-var "admin_token=admin_test_token" \
    --environment-var "user_token=user_test_token" \
    --environment-var "dpo_token=dpo_test_token" \
    --timeout-request 10000 \
    --delay-request 100 \
    --reporters cli,html,json \
    --reporter-html-export "$REPORT_DIR/compliance-test-report.html" \
    --reporter-json-export "$REPORT_DIR/compliance-test-results.json" \
    --verbose

TEST_RESULT=$?

echo ""
echo -e "${BLUE}📊 Test Results Summary:${NC}"

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    echo ""
    echo -e "${GREEN}🔒 COMPLIANCE VALIDATION SUCCESSFUL:${NC}"
    echo "  ✅ Kill-switch functionality verified"
    echo "  ✅ Consent management tested"
    echo "  ✅ Data rights endpoints validated"
    echo "  ✅ Export controls enforced"
    echo "  ✅ Regional compliance configured"
    echo "  ✅ Zero-leakage protection confirmed"
    echo "  ✅ Security tests passed"
    
    echo ""
    echo -e "${BLUE}📁 Reports Generated:${NC}"
    echo "  HTML Report: $REPORT_DIR/compliance-test-report.html"
    echo "  JSON Results: $REPORT_DIR/compliance-test-results.json"
    
    echo ""
    echo -e "${GREEN}🎯 READY FOR CPO REVIEW${NC}"
    
else
    echo -e "${RED}❌ TESTS FAILED${NC}"
    echo ""
    echo -e "${RED}🚨 COMPLIANCE ISSUES DETECTED:${NC}"
    echo "  Check the detailed report for failures"
    echo "  Review logs for error details"
    echo "  Fix issues before CPO submission"
    
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "  1. Review HTML report for specific failures"
    echo "  2. Check backend logs for errors"
    echo "  3. Fix compliance issues"
    echo "  4. Re-run tests"
    
    exit 1
fi

echo ""
echo -e "${BLUE}⚡ Quick Commands:${NC}"
echo "  View HTML Report: open $REPORT_DIR/compliance-test-report.html"
echo "  Check JSON Results: cat $REPORT_DIR/compliance-test-results.json | jq"
echo "  Re-run Tests: ./run-compliance-tests.sh"

echo ""
echo -e "${GREEN}🎉 Contract testing completed successfully!${NC}"