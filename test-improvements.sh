#!/bin/bash

echo "🔧 Testing UI Improvements"
echo "=========================="

echo ""
echo "✅ Testing phone number formatting (should not have .0):"
curl -s "http://localhost:3000/api/places/search?query=dulceria" | jq '.places[0] | {name, phone, phone2}' 2>/dev/null

echo ""
echo "✅ Testing place detail page improvements:"
echo "1. Getting a place ID first..."
PLACE_ID=$(curl -s "http://localhost:3000/api/places/search?query=dulceria" | jq -r '.places[0].id' 2>/dev/null)

if [ "$PLACE_ID" != "null" ] && [ "$PLACE_ID" != "" ]; then
    echo "   - Found place ID: $PLACE_ID"
    
    echo "2. Testing place detail API..."
    curl -s "http://localhost:3000/api/places/$PLACE_ID" | jq '{name, phone, phone2, description, geo, lat, lng}' 2>/dev/null
    
    echo ""
    echo "3. Testing products for place..."
    PLACE_NAME=$(curl -s "http://localhost:3000/api/places/$PLACE_ID" | jq -r '.name' 2>/dev/null)
    if [ "$PLACE_NAME" != "null" ] && [ "$PLACE_NAME" != "" ]; then
        echo "   - Place name: $PLACE_NAME"
        curl -s "http://localhost:3000/api/places/products?placeName=$(echo $PLACE_NAME | sed 's/ /%20/g')" | jq '.total_results' 2>/dev/null
    fi
else
    echo "   - No place found for testing"
fi

echo ""
echo "✅ Improvements implemented:"
echo "1. ✓ Phone numbers: Remove .0 suffix (e.g., 54825243.0 → 54825243)"
echo "2. ✓ Geo coordinates: Better JSONB parsing for lat/lng"
echo "3. ✓ Type formatting: Capitalized and singular (dulcerias → Dulcería)"
echo "4. ✓ Description removal: No auto-generated description text"
echo ""
echo "🎯 To verify in browser:"
echo "- Visit a place detail page"
echo "- Check that type shows as 'Dulcería' not 'dulcerias'"
echo "- Check that phone shows as '5352503571' not '5352503571.0'"
echo "- Check that no description appears under business name"
