#!/bin/bash

# Test the improved Supabase search implementation
echo "🔍 Testing Improved Supabase Places Search"
echo "========================================="

# Check if server is running
echo "✅ Server Status:"
curl -s http://localhost:3001 > /dev/null
if [ $? -eq 0 ]; then
    echo "   - Server is running on http://localhost:3001"
else
    echo "   - Server is not responding"
    exit 1
fi

echo ""
echo "🔍 Testing Places Search with different queries:"

# Test 1: Simple search
echo "1. Testing 'restaurante':"
response=$(curl -s "http://localhost:3001/api/places/search?query=restaurante")
echo "   Response length: $(echo $response | wc -c) characters"
if [[ $response == *"places"* ]]; then
    # Extract place count
    count=$(echo $response | grep -o '"total_results":[0-9]*' | cut -d':' -f2)
    echo "   Found $count places"
else
    echo "   Error: $response"
fi

# Test 2: Multi-word search
echo "2. Testing 'pizza lugar':"
response=$(curl -s "http://localhost:3001/api/places/search?query=pizza%20lugar")
if [[ $response == *"places"* ]]; then
    count=$(echo $response | grep -o '"total_results":[0-9]*' | cut -d':' -f2)
    echo "   Found $count places"
else
    echo "   Error response"
fi

# Test 3: Search with location filter
echo "3. Testing 'cafe' with location filter 'habana':"
response=$(curl -s "http://localhost:3001/api/places/search?query=cafe&location=habana")
if [[ $response == *"places"* ]]; then
    count=$(echo $response | grep -o '"total_results":[0-9]*' | cut -d':' -f2)
    echo "   Found $count places"
else
    echo "   Error response"
fi

echo ""
echo "🔍 Testing Place Details:"

# Get first place ID from search
place_id=$(curl -s "http://localhost:3001/api/places/search?query=restaurante" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$place_id" ]; then
    echo "Testing place detail for ID: $place_id"
    response=$(curl -s "http://localhost:3001/api/places/$place_id")
    if [[ $response == *"name"* ]]; then
        name=$(echo $response | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        echo "   Found place: $name"
    else
        echo "   Error getting place details"
    fi
else
    echo "   No place ID found to test"
fi

echo ""
echo "🔍 Testing Dynamic Filters:"
response=$(curl -s "http://localhost:3001/api/filters?mode=lugares")
if [[ $response == *"types"* ]]; then
    echo "   ✅ Places filters loaded successfully"
else
    echo "   ❌ Error loading places filters"
fi

echo ""
echo "🎉 Testing Complete!"
echo ""
echo "💡 Key Improvements Made:"
echo "   - Better search algorithm with term matching and relevance scoring"
echo "   - Proper score calculation (0-1 range instead of 9899%)"
echo "   - Direct Supabase integration for place details"
echo "   - Dynamic filters based on actual data"
echo "   - Enhanced error handling and fallbacks"
