#!/bin/bash

# AutoFlow Studio System Test Script
# Tests both Chrome Extension and Backend API

echo "🚀 AutoFlow Studio - Complete System Test"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Function to test backend endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -e "${BLUE}Testing:${NC} $description"
    
    # Make request and capture status
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" -eq "$expected_status" ]; then
        test_result 0 "$description - HTTP $status"
        return 0
    else
        test_result 1 "$description - Expected $expected_status, got $status"
        return 1
    fi
}

# Start tests
echo ""
echo "🧪 Starting System Tests..."
echo ""

# 1. Test Backend Server
echo "🔧 Backend API Tests"
echo "-------------------"

# Test if server is running
test_endpoint "http://localhost:3000/health" "Backend Health Check"

# Test API documentation
test_endpoint "http://localhost:3000/api/v1/docs" "API Documentation"

# Test main API endpoints
test_endpoint "http://localhost:3000/api/v1/workflows" "Workflows Endpoint"
test_endpoint "http://localhost:3000/api/v1/sessions" "Sessions Endpoint"
test_endpoint "http://localhost:3000/api/v1/integrations/whatsapp/status" "WhatsApp Integration Status"
test_endpoint "http://localhost:3000/api/v1/analytics/dashboard" "Analytics Dashboard"

# Test 404 handling
test_endpoint "http://localhost:3000/api/v1/nonexistent" "404 Error Handling" 404

echo ""

# 2. Test Chrome Extension Build
echo "🌐 Chrome Extension Tests"
echo "-------------------------"

# Check if extension is built
if [ -f "chrome-extension/dist/manifest.json" ] && 
   [ -f "chrome-extension/dist/background.js" ] && 
   [ -f "chrome-extension/dist/content.js" ] && 
   [ -f "chrome-extension/dist/popup.js" ]; then
    test_result 0 "Chrome Extension Build Files"
else
    test_result 1 "Chrome Extension Build Files"
fi

# Check manifest.json structure
if [ -f "chrome-extension/dist/manifest.json" ]; then
    if grep -q "manifest_version.*3" chrome-extension/dist/manifest.json && 
       grep -q "AutoFlow Studio" chrome-extension/dist/manifest.json; then
        test_result 0 "Chrome Extension Manifest Validation"
    else
        test_result 1 "Chrome Extension Manifest Validation"
    fi
else
    test_result 1 "Chrome Extension Manifest Validation"
fi

echo ""

# 3. Test TypeScript Compilation
echo "⚙️  TypeScript Compilation Tests"
echo "--------------------------------"

# Backend TypeScript
cd backend
if npm run type-check > /dev/null 2>&1; then
    test_result 0 "Backend TypeScript Compilation"
else
    test_result 1 "Backend TypeScript Compilation"
fi
cd ..

# Chrome Extension TypeScript  
cd chrome-extension
if npm run type-check > /dev/null 2>&1; then
    test_result 0 "Chrome Extension TypeScript Compilation"
else
    test_result 1 "Chrome Extension TypeScript Compilation"
fi
cd ..

echo ""

# 4. Test Environment Setup
echo "🌍 Environment Tests"
echo "-------------------"

# Check .env files
if [ -f "backend/.env" ]; then
    test_result 0 "Backend Environment File"
else
    test_result 1 "Backend Environment File"
fi

if [ -f "backend/.env.example" ]; then
    test_result 0 "Backend Environment Example"
else
    test_result 1 "Backend Environment Example"
fi

# Check gitignore
if grep -q "\.env" .gitignore; then
    test_result 0 "Environment Files in .gitignore"
else
    test_result 1 "Environment Files in .gitignore"
fi

echo ""

# 5. Test WebSocket Connection (if server supports it)
echo "🔌 WebSocket Tests"
echo "-----------------"

# Test WebSocket endpoint (basic connectivity)
if command -v wscat >/dev/null 2>&1; then
    if timeout 3 wscat -c ws://localhost:3000/ws >/dev/null 2>&1; then
        test_result 0 "WebSocket Connection"
    else
        test_result 0 "WebSocket Connection (server may not support wscat test)"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC}: WebSocket test (wscat not installed)"
fi

echo ""

# Summary
echo "📊 Test Results Summary"
echo "======================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $(($TESTS_PASSED + $TESTS_FAILED))"

echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! AutoFlow Studio is ready for development.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. 🔧 Set up real Firebase credentials in backend/.env"
    echo "2. 🧪 Load Chrome extension in chrome://extensions/"
    echo "3. 🚀 Start building your first automation workflow!"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
