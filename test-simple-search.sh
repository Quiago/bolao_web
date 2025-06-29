#!/bin/bash

echo "🔍 Testing Simple Supabase Places Search"
echo "========================================"

# Check if server is running
echo "✅ Server Status:"
if curl -s http://localhost:3001 > /dev/null; then
    echo "   - Server is running on http://localhost:3001"
else
    echo "   ❌ Server is not running on http://localhost:3001"
    exit 1
fi

echo ""
echo "🔍 Testing Places Search:"

# Test 1: Search by name (exact)
echo "1. Testing exact name 'Delacrem':"
response=$(curl -s "http://localhost:3001/api/places/search?query=Delacrem")
if echo $response | jq -e '.places[0].name == "Delacrem"' > /dev/null; then
    echo "   ✅ Found exact match"
else
    echo "   ❌ No exact match found"
fi

# Test 2: Search by partial name
echo "2. Testing partial name 'delacr':"
response=$(curl -s "http://localhost:3001/api/places/search?query=delacr")
if echo $response | jq -e '.places[0].name == "Delacrem"' > /dev/null; then
    echo "   ✅ Found partial match"
else
    echo "   ❌ No partial match found"
fi

# Test 3: Search by type
echo "3. Testing by type 'restaurantes':"
response=$(curl -s "http://localhost:3001/api/places/search?query=restaurantes")
count=$(echo $response | jq '.total_results')
echo "   Found $count restaurants"

# Test 4: Ver todos
echo "4. Testing 'Ver todos':"
response=$(curl -s "http://localhost:3001/api/places/search?showAll=true")
count=$(echo $response | jq '.total_results')
echo "   Found $count total places"

# Test 5: Ver todos with filter
echo "5. Testing 'Ver todos' with location filter 'Plaza':"
response=$(curl -s "http://localhost:3001/api/places/search?showAll=true&location=Plaza")
count=$(echo $response | jq '.total_results')
echo "   Found $count places in Plaza areas"

echo ""
echo "🔍 Testing Place Details:"

# Test place detail by ID
echo "6. Testing place detail by ID:"
response=$(curl -s "http://localhost:3001/api/places/85")
name=$(echo $response | jq -r '.name')
if [ "$name" != "null" ]; then
    echo "   ✅ Place detail found: $name"
else
    echo "   ❌ Place detail not found"
fi

echo ""
echo "✅ All tests completed!"
