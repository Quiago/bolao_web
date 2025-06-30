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

        console.log('Connection test: Checking Supabase connection...');

        // Test connection by trying to get schema information
        const { data: tablesData, error: tablesError } = await supabase
            .rpc('get_tables');

        if (tablesError) {
            console.log('Could not get tables, trying direct query...');
        }

        // Try to query the products table with more logging
        console.log('Attempting to query products table...');
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        console.log('Products query result:', { data: productsData, error: productsError });

        // Try querying the places table to verify connection
        const { data: placesData, error: placesError } = await supabase
            .from('places')
            .select('name')
            .limit(1);

        console.log('Places query result:', { data: placesData, error: placesError });

        // Return detailed debug information
        res.status(200).json({
            supabase_client_exists: !!supabase,
            supabase_url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabase_key_configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            products_query: {
                data: productsData,
                error: productsError,
                success: !productsError
            },
            places_query: {
                data: placesData,
                error: placesError,
                success: !placesError
            }
        });

    } catch (error) {
        console.error('Connection test error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: error.stack
        });
    }
}
