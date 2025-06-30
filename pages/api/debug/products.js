import { getSupabaseClient } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            return res.status(500).json({ error: 'Supabase client not configured' });
        }

        // Get first 10 products to see what data is available
        const { data: products, error } = await supabase
            .from('products')
            .select('name, product_name, product_price')
            .limit(10);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Get unique place names
        const { data: allProducts, error: error2 } = await supabase
            .from('products')
            .select('name')
            .limit(50);

        if (error2) {
            return res.status(500).json({ error: error2.message });
        }

        const uniqueNames = [...new Set(allProducts.map(p => p.name))].filter(name => name);

        // Check specifically for Delacrem variations
        const { data: delacremProducts, error: error3 } = await supabase
            .from('products')
            .select('name, product_name, product_price')
            .ilike('name', '%delacrem%');

        if (error3) {
            return res.status(500).json({ error: error3.message });
        }

        res.status(200).json({
            sample_products: products,
            unique_place_names: uniqueNames,
            total_sample_products: products.length,
            total_unique_places: uniqueNames.length,
            delacrem_search_results: delacremProducts || [],
            total_products_in_table: allProducts?.length || 0
        });

    } catch (error) {
        console.error('Debug API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
