#!/bin/bash

echo "==================================="
echo "Testing Fixed Location Filter"
echo "==================================="

# Build the app first
echo "📦 Building the application..."
cd /home/quiala/Datos/Proyectos/bolao_web
npm run build > build.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Check build.log for details"
    tail -10 build.log
    exit 1
fi

# Start the application
echo "🚀 Starting the application..."
npm start > server.log 2>&1 &
APP_PID=$!

# Wait for the app to start
echo "⏳ Waiting for application to start..."
sleep 8

# Test if the app is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Application failed to start"
    echo "Server logs:"
    tail -20 server.log
    kill $APP_PID 2>/dev/null
    exit 1
fi

echo "✅ Application is running"

echo ""
echo "🔍 Testing Location Filter Functionality..."

# Test 1: Get filters for lugares mode
echo ""
echo "1. Testing filters API for 'lugares' mode:"
FILTERS_RESPONSE=$(curl -s "http://localhost:3000/api/filters?mode=lugares")
echo "   Number of location options: $(echo "$FILTERS_RESPONSE" | jq -r '.locations | length' 2>/dev/null || echo "N/A")"
echo "   First 5 locations:"
echo "$FILTERS_RESPONSE" | jq -r '.locations[:5][]' 2>/dev/null | sed 's/^/      /' || echo "      Could not parse response"

# Test 2: Search without location filter
echo ""
echo "2. Testing search without location filter:"
NO_FILTER_RESPONSE=$(curl -s "http://localhost:3000/api/places/search?query=restaurant")
NO_FILTER_COUNT=$(echo "$NO_FILTER_RESPONSE" | jq -r '.total_results' 2>/dev/null || echo "0")
echo "   Results without location filter: $NO_FILTER_COUNT"

# Test 3: Search with location filter - common location
echo ""
echo "3. Testing search with location filter 'Habana':"
HABANA_RESPONSE=$(curl -s "http://localhost:3000/api/places/search?query=restaurant&location=Habana")
HABANA_COUNT=$(echo "$HABANA_RESPONSE" | jq -r '.total_results' 2>/dev/null || echo "0")
echo "   Results with 'Habana' location filter: $HABANA_COUNT"

if [ "$HABANA_COUNT" -gt 0 ]; then
    echo "   Sample results:"
    echo "$HABANA_RESPONSE" | jq -r '.places[:3][] | "      - " + .name + " (" + (.location // .address // "No location") + ")"' 2>/dev/null
fi

# Test 4: Search with location filter - specific location
echo ""
echo "4. Testing search with specific location filter 'Centro Habana':"
CENTRO_RESPONSE=$(curl -s "http://localhost:3000/api/places/search?query=restaurant&location=Centro Habana")
CENTRO_COUNT=$(echo "$CENTRO_RESPONSE" | jq -r '.total_results' 2>/dev/null || echo "0")
echo "   Results with 'Centro Habana' location filter: $CENTRO_COUNT"

# Test 5: Test "Ver todos" with location filter
echo ""
echo "5. Testing 'Ver todos' with location filter:"
ALL_RESPONSE=$(curl -s "http://localhost:3000/api/places/search?showAll=true&location=Habana")
ALL_COUNT=$(echo "$ALL_RESPONSE" | jq -r '.total_results' 2>/dev/null || echo "0")
echo "   'Ver todos' results with 'Habana' filter: $ALL_COUNT"

# Test 6: Test type filter
echo ""
echo "6. Testing type filter with 'restaurantes':"
TYPE_RESPONSE=$(curl -s "http://localhost:3000/api/places/search?query=food&type=restaurantes")
TYPE_COUNT=$(echo "$TYPE_RESPONSE" | jq -r '.total_results' 2>/dev/null || echo "0")
echo "   Results with 'restaurantes' type filter: $TYPE_COUNT"

# Test 7: Test combined filters
echo ""
echo "7. Testing combined location and type filters:"
COMBINED_RESPONSE=$(curl -s "http://localhost:3000/api/places/search?query=food&location=Habana&type=restaurantes")
COMBINED_COUNT=$(echo "$COMBINED_RESPONSE" | jq -r '.total_results' 2>/dev/null || echo "0")
echo "   Results with both filters: $COMBINED_COUNT"

echo ""
echo "📊 Test Summary:"
echo "   - No filter: $NO_FILTER_COUNT results"
echo "   - With 'Habana' location: $HABANA_COUNT results"
echo "   - With 'Centro Habana' location: $CENTRO_COUNT results"
echo "   - Ver todos with 'Habana': $ALL_COUNT results"
echo "   - With 'restaurantes' type: $TYPE_COUNT results"
echo "   - Combined filters: $COMBINED_COUNT results"

echo ""
if [ "$HABANA_COUNT" -gt 0 ] && [ "$CENTRO_COUNT" -ge 0 ]; then
    echo "✅ Location filtering appears to be working!"
else
    echo "❌ Location filtering may have issues"
    echo "Debug info:"
    echo "Sample search response:"
    echo "$HABANA_RESPONSE" | jq '.' 2>/dev/null || echo "$HABANA_RESPONSE"
fi

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $APP_PID 2>/dev/null
rm -f build.log server.log

echo ""
echo "==================================="
echo "Location Filter Test Complete"
echo "==================================="
