#!/bin/bash

echo "==================================="
echo "Testing Location Filter Issue"
echo "==================================="

echo "🔍 Testing the current location filter behavior..."

# Test the filters API for lugares mode
echo ""
echo "1. Testing filters API for 'lugares' mode:"
curl -s "http://localhost:3000/api/filters?mode=lugares" | jq -r '.locations[:5][]' 2>/dev/null || echo "Could not parse JSON or app not running"

echo ""
echo "2. Testing search with location filter:"
echo "   Searching for places with location 'Habana'"
curl -s "http://localhost:3000/api/places/search?query=restaurant&location=Habana" | jq -r '.places | length' 2>/dev/null || echo "Could not parse JSON or app not running"

echo ""
echo "3. Testing what columns are available in places:"
echo "   This will help us understand the data structure"

# Create a simple test to see actual data
cat > test-location-columns.js << 'EOF'
const { getSupabaseClient } = require('./utils/supabaseClient');

async function testLocationColumns() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.log('❌ Supabase client not configured');
        return;
    }

    try {
        // Get a few sample records to see the structure
        const { data: places, error } = await supabase
            .from('places')
            .select('id, name, address, location, type')
            .limit(3);

        if (error) {
            console.log('❌ Error:', error.message);
            return;
        }

        console.log('Sample places data:');
        places.forEach((place, index) => {
            console.log(`${index + 1}. ${place.name}`);
            console.log(`   address: ${place.address}`);
            console.log(`   location: ${place.location}`);
            console.log(`   type: ${place.type}`);
            console.log('');
        });

        // Test location filtering
        console.log('Testing location filter with "Habana":');
        const { data: filtered, error: filterError } = await supabase
            .from('places')
            .select('name, address, location')
            .ilike('location', '%Habana%')
            .limit(3);

        if (filterError) {
            console.log('❌ Filter Error:', filterError.message);
        } else {
            console.log(`Found ${filtered.length} places with location containing "Habana"`);
            filtered.forEach(place => {
                console.log(`- ${place.name}: location="${place.location}"`);
            });
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testLocationColumns();
EOF

echo ""
echo "4. Running location column test:"
node test-location-columns.js

# Clean up
rm -f test-location-columns.js

echo ""
echo "==================================="
echo "Location Filter Test Complete"
echo "==================================="
