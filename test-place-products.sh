#!/bin/bash

echo "Testing place products API..."

# Test with different place names
echo "Testing with 'Restaurant':"
curl -s "http://localhost:3000/api/places/products?placeName=Restaurant" | jq .

echo -e "\nTesting with 'Pizza':"
curl -s "http://localhost:3000/api/places/products?placeName=Pizza" | jq .

echo -e "\nTesting with 'Cafe':"
curl -s "http://localhost:3000/api/places/products?placeName=Cafe" | jq .

echo -e "\nTesting with 'Bar':"
curl -s "http://localhost:3000/api/places/products?placeName=Bar" | jq .

echo -e "\nTesting empty query:"
curl -s "http://localhost:3000/api/places/products" | jq .
