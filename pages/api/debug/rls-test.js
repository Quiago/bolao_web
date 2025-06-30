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

        console.log('RLS Test: Checking table permissions and structure...');

        // Test 1: Try to count rows in products table
        const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        console.log('Products count result:', { count, error: countError });

        // Test 2: Try different table names that might exist
        const tableTests = [];

        // Try 'products'
        const { data: productsTest, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(1);
        tableTests.push({ table: 'products', success: !productsError, error: productsError?.message, data: productsTest });

        // Try 'product'
        const { data: productTest, error: productError } = await supabase
            .from('product')
            .select('*')
            .limit(1);
        tableTests.push({ table: 'product', success: !productError, error: productError?.message, data: productTest });

        // Try to get all tables (if possible)
        let availableTables = [];
        try {
            const { data: schemaData, error: schemaError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
            
            if (!schemaError) {
                availableTables = schemaData?.map(t => t.table_name) || [];
            }
        } catch (e) {
            console.log('Could not query schema:', e.message);
        }

        // Test 3: Check RLS status (if we can)
        let rlsInfo = 'unknown';
        try {
            const { data: rlsData, error: rlsError } = await supabase
                .from('pg_class')
                .select('relname, relrowsecurity')
                .eq('relname', 'products')
                .single();
            
            if (!rlsError && rlsData) {
                rlsInfo = rlsData.relrowsecurity ? 'enabled' : 'disabled';
            }
        } catch (e) {
            console.log('Could not check RLS:', e.message);
        }

        res.status(200).json({
            products_count: count,
            count_error: countError?.message,
            table_tests: tableTests,
            available_tables: availableTables,
            rls_status: rlsInfo,
            recommendations: [
                count === 0 ? 'Products table is empty' : 'Products table has data but may be filtered by RLS',
                'Check if Row Level Security is enabled on products table',
                'Verify you are using the correct table name',
                'Check if the API key has proper permissions'
            ]
        });

    } catch (error) {
        console.error('RLS test error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}
