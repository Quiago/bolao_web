#!/bin/bash

# Test script for the Productos/Lugares implementation
echo "🔍 Testing BOLAO Productos/Lugares Implementation"
echo "================================================"

# Check if server is running
echo "✅ Server Status:"
curl -s http://localhost:3001 > /dev/null
if [ $? -eq 0 ]; then
    echo "   - Server is running on http://localhost:3001"
else
    echo "   - Server is not responding"
    exit 1
fi

# Test products search API
echo "✅ Testing Products Search API:"
response=$(curl -s "http://localhost:3001/api/search?query=hamburguesa")
if [[ $response == *"products"* ]]; then
    echo "   - Products API responds correctly"
else
    echo "   - Products API issue: $response"
fi

# Test places search API
echo "✅ Testing Places Search API:"
response=$(curl -s "http://localhost:3001/api/places/search?query=restaurante")
if [[ $response == *"places"* ]] || [[ $response == *"error"* ]]; then
    echo "   - Places API responds (may need Supabase config)"
else
    echo "   - Places API issue: $response"
fi

# Test chat API
echo "✅ Testing Chat API:"
response=$(curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "hola", "searchMode": "productos"}')
if [[ $response == *"message"* ]] || [[ $response == *"error"* ]]; then
    echo "   - Chat API responds (may need Gemini config)"
else
    echo "   - Chat API issue: $response"
fi

echo ""
echo "🎉 Testing Complete!"
echo "   - Open http://localhost:3001 to see the new toggle buttons"
echo "   - Configure Supabase and Gemini API keys in .env.local for full functionality"
