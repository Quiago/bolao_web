import { getSupabaseClient } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { placeName } = req.query;

        if (!placeName) {
            return res.status(400).json({ error: 'Place name is required' });
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return res.status(500).json({ error: 'Supabase client not configured' });
        }

        console.log('Getting products for place:', placeName);

        // Query products table where name (place name) matches exactly
        // The 'name' column contains the place name (e.g., "Delacrem")
        // The 'product_name' column contains the product name (e.g., "Hot Dog")
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('name', placeName)
            .order('product_name', { ascending: true });

        if (error) {
            console.error('Supabase query error:', error);
            return res.status(500).json({ error: 'Database query failed', details: error.message });
        }

        if (!products || products.length === 0) {
            console.log(`No products found for place: ${placeName}`);
            return res.status(200).json({
                products: [],
                total_results: 0,
                place_name: placeName
            });
        }

        // Format the products data for the frontend
        const formattedProducts = products.map((product) => {
            return {
                id: product.id || `product-${Math.random().toString(36).substr(2, 9)}`,
                name: product.name || 'Sin nombre de lugar',
                product_name: product.product_name || 'Sin nombre de producto',
                description: product.description || '',
                product_price: product.product_price || null,
                price: product.price || null,
                price_range_min: product.price_range_min || null,
                price_range_max: product.price_range_max || null,
                slug: product.slug || null,
                product_slug: product.product_slug || null,
                phone: product.phone || null,
                phone2: product.phone2 || null,
                web: product.web || null,
                web2: product.web2 || null,
                address: product.address || null,
                telegram: product.telegram || null,
                location: product.location || null,
                geo: product.geo || null,
                score: product.score || null,
                email: product.email || null,
                youtube: product.youtube || null,
                logo: product.logo || null,
                facebook: product.facebook || null,
                instagram: product.instagram || null,
                type: product.type || null,
                delivery: product.delivery || false,
                pickup: product.pickup || false
            };
        });

        console.log(`Found ${formattedProducts.length} products for place: ${placeName}`);

        res.status(200).json({
            products: formattedProducts,
            total_results: formattedProducts.length,
            place_name: placeName
        });

    } catch (error) {
        console.error('Products API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
