#!/bin/bash
# SynSync Pro - Post-Patch Verification Script
# Run this after applying patches to verify implementation

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════"
echo "  SYNSYNC PRO - POST-PATCH VERIFICATION"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -n "Testing: $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL++))
        return 1
    fi
}

echo "📋 DAY 1 PRIVACY TESTS"
echo "────────────────────────────────────────────────────────────────"

# Test 1: Check for external CDN references
run_test "No Google Fonts CDN in index.html" \
    "! grep -q 'fonts.googleapis.com' index.html"

# Test 2: Check for fontsource packages
run_test "@fontsource/inter installed" \
    "npm list @fontsource/inter 2>&1 | grep -q '@fontsource/inter'"

run_test "@fontsource/jetbrains-mono installed" \
    "npm list @fontsource/jetbrains-mono 2>&1 | grep -q '@fontsource/jetbrains-mono'"

# Test 3: Check LocalAnalytics exists
run_test "LocalAnalytics.ts exists" \
    "test -f src/analytics/LocalAnalytics.ts"

# Test 4: Check font imports in index.css
run_test "Font imports in index.css" \
    "grep -q '@import.*@fontsource' src/index.css"

echo ""
echo "🔊 DAY 2 AUDIO QUALITY TESTS"
echo "────────────────────────────────────────────────────────────────"

# Test 5: Check audio files exist
run_test "NoiseGenerator.ts exists" \
    "test -f src/audio/NoiseGenerator.ts"

run_test "PrecisionOscillator.ts exists" \
    "test -f src/audio/PrecisionOscillator.ts"

run_test "DynamicRangeProcessor.ts exists" \
    "test -f src/audio/DynamicRangeProcessor.ts"

run_test "QAMetrics.ts exists" \
    "test -f src/audio/QAMetrics.ts"

run_test "SpectralVerification.test.ts exists" \
    "test -f src/audio/__tests__/SpectralVerification.test.ts"

echo ""
echo "🔨 BUILD TESTS"
echo "────────────────────────────────────────────────────────────────"

# Test 6: TypeScript compilation
echo -n "Testing: TypeScript compilation... "
if npm run type-check > /tmp/ts-check.log 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Error log: /tmp/ts-check.log"
    ((FAIL++))
fi

# Test 7: Build succeeds
echo -n "Testing: Production build... "
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Error log: /tmp/build.log"
    ((FAIL++))
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  RESULTS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "Total Tests: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Ready to commit and push.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. git add -A"
    echo "  2. git commit -m 'feat: Day 1 & 2 fixes - privacy + audio quality'"
    echo "  3. git push origin fix/day1-day2-complete"
    echo "  4. Create PR on GitHub"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED. Review errors above.${NC}"
    exit 1
fi
