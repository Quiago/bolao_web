#!/bin/bash

echo "Testing database connection and sample data..."

# Test 1: Check if we can connect to Supabase and get any products
echo "1. Getting first 5 products from products table:"
node -e "
const { getSupabaseClient } = require('./utils/supabaseClient');
(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.log('❌ Supabase not configured');
        return;
    }
    
    const { data, error } = await supabase
        .from('products')
        .select('name, product_name, product_price')
        .limit(5);
    
    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Found', data.length, 'products:');
        data.forEach(p => console.log('  -', p.name, '→', p.product_name, '→', p.product_price));
    }
})();
"

echo -e "\n2. Getting unique place names from products table:"
node -e "
const { getSupabaseClient } = require('./utils/supabaseClient');
(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { data, error } = await supabase
        .from('products')
        .select('name')
        .limit(20);
    
    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        const uniqueNames = [...new Set(data.map(p => p.name))];
        console.log('✅ Unique place names in products:');
        uniqueNames.forEach(name => console.log('  -', name));
    }
})();
"
