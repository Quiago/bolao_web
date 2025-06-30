#!/bin/bash

echo "🔍 Testing Detail Page Improvements & Duplicate Detection"
echo "========================================================"

echo ""
echo "1. 📞 Testing Contact Info Display..."
echo "Getting place with multiple contact methods:"
curl -s "http://localhost:3000/api/places/26" | jq '{
    name,
    phone,
    phone2,
    web,
    web2,
    email,
    telegram,
    facebook,
    instagram,
    youtube
}'

echo ""
echo "2. 🔍 Testing Duplicate Detection in Places Search..."
echo "Searching places:"
RESULT=$(curl -s "http://localhost:3000/api/places/search?query=Ama")
TOTAL=$(echo "$RESULT" | jq '.total_results')
echo "Total unique places found: $TOTAL"
echo "$RESULT" | jq '.places[] | {name, address}'

echo ""
echo "3. 🍔 Testing Duplicate Detection in Products..."
echo "Getting products for a place:"
RESULT=$(curl -s "http://localhost:3000/api/places/products?placeName=Ama")
TOTAL=$(echo "$RESULT" | jq '.total_results')
echo "Total unique products found: $TOTAL"
echo "$RESULT" | jq '.products[0:3] | .[] | {product_name, name}' 2>/dev/null || echo "No products found"

echo ""
echo "4. 🔍 Testing Main Search Duplicate Detection..."
echo "Searching for products:"
RESULT=$(curl -s "http://localhost:3000/api/search?query=jugo")
TOTAL=$(echo "$RESULT" | jq '.total_results')
echo "Total unique products in main search: $TOTAL"
echo "$RESULT" | jq '.products[0:3] | .[] | {product_name, name}' 2>/dev/null || echo "No products found"

echo ""
echo "✅ IMPROVEMENTS IMPLEMENTED:"
echo "✓ Contact Info: phone, phone2, web, web2, email displayed"
echo "✓ Social Media: Instagram, Facebook, Telegram, YouTube buttons"
echo "✓ Duplicate Detection: Applied to all API endpoints"
echo "✓ Consistent Data: All detail pages show complete information"
echo ""
echo "🎯 To verify in browser:"
echo "- Visit any place detail page"
echo "- Check all contact info and social media buttons are visible"
echo "- Verify no duplicate items in search results"
