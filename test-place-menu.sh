#!/bin/bash

echo "🔍 Testing Place Menu Functionality"
echo "=================================="

# Check if server is running
echo "✅ Server Status:"
if curl -s http://localhost:3001 > /dev/null; then
    echo "   - Server is running on http://localhost:3001"
else
    echo "   ❌ Server is not running on http://localhost:3001"
    exit 1
fi

echo ""
echo "🔍 Testing Place Details and Menu:"

# Test 1: Get a place ID
echo "1. Getting place information:"
place_response=$(curl -s "http://localhost:3001/api/places/search?query=restaurante")
place_id=$(echo $place_response | jq -r '.places[0].id')
place_name=$(echo $place_response | jq -r '.places[0].name')

if [ "$place_id" != "null" ] && [ "$place_name" != "null" ]; then
    echo "   ✅ Found place: $place_name (ID: $place_id)"
else
    echo "   ❌ No places found"
    exit 1
fi

# Test 2: Get place details
echo "2. Testing place details API:"
place_detail_response=$(curl -s "http://localhost:3001/api/places/$place_id")
detail_name=$(echo $place_detail_response | jq -r '.name')

if [ "$detail_name" != "null" ]; then
    echo "   ✅ Place details found: $detail_name"
else
    echo "   ❌ Place details not found"
fi

# Test 3: Get place products/menu
echo "3. Testing place menu/products:"
products_response=$(curl -s "http://localhost:3001/api/places/products?placeName=$(echo $place_name | sed 's/ /%20/g')")
products_count=$(echo $products_response | jq '.total_results')

echo "   Found $products_count products for $place_name"

if [ "$products_count" -gt 0 ]; then
    echo "   ✅ Menu found with $products_count items"
    
    # Show first product details
    first_product=$(echo $products_response | jq -r '.products[0] | "\(.product_name) - \(.product_price // "No price")"')
    echo "   📋 First item: $first_product"
else
    echo "   ⚠️  No menu items found for this place"
fi

echo ""
echo "🔍 Testing specific known places:"

# Test with Betty boom (known to have products)
echo "4. Testing Betty boom menu:"
betty_response=$(curl -s "http://localhost:3001/api/places/products?placeName=Betty%20boom")
betty_count=$(echo $betty_response | jq '.total_results')
echo "   Betty boom has $betty_count menu items"

# Test with Al Campestre
echo "5. Testing Al Campestre menu:"
al_response=$(curl -s "http://localhost:3001/api/places/products?placeName=Al%20Campestre")
al_count=$(echo $al_response | jq '.total_results')
echo "   Al Campestre has $al_count menu items"

echo ""
echo "✅ Place menu functionality test completed!"
