#!/bin/bash

# AutoFlow Studio Server Status Checker
# Validates that both backend and extension build are working correctly

echo "🚀 AutoFlow Studio - Server Status Check"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if port 3000 is in use
check_port() {
    if lsof -i:3000 > /dev/null; then
        echo -e "${GREEN}✅ PORT 3000: Server is listening${NC}"
        
        # Get the process using port 3000
        PROCESS=$(lsof -i:3000 | grep LISTEN | head -1 | awk '{print $1, $2}')
        echo -e "   Process: $PROCESS"
        return 0
    else
        echo -e "${RED}❌ PORT 3000: No server listening${NC}"
        return 1
    fi
}

# Test server endpoints
test_server() {
    local BASE_URL="http://localhost:3000"
    
    echo -e "\n${BLUE}🔍 Testing Server Endpoints:${NC}"
    
    # Health check
    if curl -s "$BASE_URL/health" > /dev/null; then
        echo -e "${GREEN}✅ HEALTH: $BASE_URL/health responding${NC}"
        
        # Get health data
        HEALTH=$(curl -s "$BASE_URL/health" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
        echo -e "   Status: $HEALTH"
    else
        echo -e "${RED}❌ HEALTH: $BASE_URL/health not responding${NC}"
        return 1
    fi
    
    # API endpoint
    if curl -s "$BASE_URL/api/v1/workflows" > /dev/null; then
        echo -e "${GREEN}✅ API: $BASE_URL/api/v1/workflows responding${NC}"
    else
        echo -e "${RED}❌ API: $BASE_URL/api/v1/workflows not responding${NC}"
        return 1
    fi
    
    return 0
}

# Check Chrome Extension build
check_extension() {
    echo -e "\n${BLUE}🔍 Chrome Extension Build Check:${NC}"
    
    if [ -f "chrome-extension/dist/manifest.json" ]; then
        echo -e "${GREEN}✅ MANIFEST: chrome-extension/dist/manifest.json exists${NC}"
    else
        echo -e "${RED}❌ MANIFEST: chrome-extension/dist/manifest.json missing${NC}"
        return 1
    fi
    
    if [ -f "chrome-extension/dist/background.js" ]; then
        echo -e "${GREEN}✅ BACKGROUND: chrome-extension/dist/background.js exists${NC}"
    else
        echo -e "${RED}❌ BACKGROUND: chrome-extension/dist/background.js missing${NC}"
        return 1
    fi
    
    if [ -f "chrome-extension/dist/content.js" ]; then
        echo -e "${GREEN}✅ CONTENT: chrome-extension/dist/content.js exists${NC}"
    else
        echo -e "${RED}❌ CONTENT: chrome-extension/dist/content.js missing${NC}"
        return 1
    fi
    
    return 0
}

# Check backend build
check_backend() {
    echo -e "\n${BLUE}🔍 Backend Build Check:${NC}"
    
    if [ -f "backend/dist/backend/src/index.js" ]; then
        echo -e "${GREEN}✅ BACKEND BUILD: backend/dist/backend/src/index.js exists${NC}"
    else
        echo -e "${YELLOW}⚠️ BACKEND BUILD: Compiled JS not found (running from TypeScript)${NC}"
    fi
    
    return 0
}

# Main execution
main() {
    local errors=0
    
    # Check port
    if ! check_port; then
        ((errors++))
    fi
    
    # Test server if port is open  
    if lsof -i:3000 > /dev/null; then
        if ! test_server; then
            ((errors++))
        fi
    else
        ((errors++))
    fi
    
    # Check builds
    if ! check_extension; then
        ((errors++))
    fi
    
    check_backend
    
    # Summary
    echo -e "\n${BLUE}📊 SUMMARY:${NC}"
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL CHECKS PASSED! Server is fully operational.${NC}"
        echo -e "${GREEN}   Ready for development and testing!${NC}"
        return 0
    else
        echo -e "${RED}❌ $errors issues found. Please fix before continuing.${NC}"
        
        if ! lsof -i:3000 > /dev/null; then
            echo -e "${YELLOW}   💡 Tip: Run 'npm run dev' to start the server${NC}"
        fi
        
        return 1
    fi
}

# Run the checks
main "$@"
