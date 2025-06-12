#!/bin/bash

echo "🧪 Testing BOLAO API connection..."
echo "=================================="

# Read the API URL from .env.local
API_URL=$(grep "NEXT_PUBLIC_API_URL" .env.local | cut -d '=' -f2)
HF_TOKEN=$(grep "HUGGING_FACE_TOKEN" .env.local | cut -d '=' -f2)

echo "API URL: $API_URL"
echo "Has Token: $([ -n "$HF_TOKEN" ] && echo "Yes" || echo "No")"
echo ""

# Test basic connectivity
echo "Testing basic connectivity..."
curl -s -o /dev/null -w "%{http_code}" "$API_URL" || echo "Connection failed"
echo ""

# Test search endpoint
echo "Testing search endpoint..."
if [ -n "$HF_TOKEN" ]; then
    curl -X POST "$API_URL/search" \
         -H "Content-Type: application/json" \
         -H "Authorization: Bearer $HF_TOKEN" \
         -d '{"query":"test","num_results":1,"min_score":0.1}' \
         --connect-timeout 10 \
         --max-time 15 \
         -v 2>&1 | head -20
else
    curl -X POST "$API_URL/search" \
         -H "Content-Type: application/json" \
         -d '{"query":"test","num_results":1,"min_score":0.1}' \
         --connect-timeout 10 \
         --max-time 15 \
         -v 2>&1 | head -20
fi

echo ""
echo "Test completed!"
