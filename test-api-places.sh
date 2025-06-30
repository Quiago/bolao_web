#!/bin/bash

echo "Testing the place API endpoints..."

# Test 1: Search for Ama to get the ID
echo "1. Searching for 'Ama' place..."
curl -s "http://localhost:3001/api/places/search?query=Ama" | jq '.places[0] | {id, name, phone, email, instagram, facebook}'

echo -e "\n2. Getting complete place details for Ama (ID: 26)..."
curl -s "http://localhost:3001/api/places/26" | jq '{id, name, phone, email, instagram, facebook, web, address, lat, lng}'

echo -e "\n3. Getting products for Ama..."
curl -s "http://localhost:3001/api/places/products?place=Ama" | jq '.products | length'

echo -e "\nAPI test complete!"
