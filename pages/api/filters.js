import { getSupabaseClient } from '../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { mode } = req.query; // 'productos' or 'lugares'

    // Fixed filters for products (existing behavior)
    const fixedFilters = {
        types: [
            'heladerias',
            'panaderias',
            'restaurantes',
            'dulcerias',
            'cafes',
            'cafeterias',
            'pizzerias',
            'bares'
        ],
        locations: [
            'Habana del Este, La Habana',
            'Habana Vieja, La Habana',
            'Playa, La Habana',
            'Plaza, La Habana',
            'Arroyo Naranjo, La Habana',
            'Boyeros, La Habana',
            'Diez de Octubre, La Habana',
            'Artemisa, Artemisa',
            'Centro Habana, La Habana',
            'La Habana, Cuba',
            'Cotorro, La Habana',
            'La Lisa, La Habana',
            'Cerro, La Habana'
        ]
    };

    // If mode is 'lugares' and Supabase is configured, try to get dynamic filters
    if (mode === 'lugares') {
        try {
            const supabase = getSupabaseClient();
            if (supabase) {
                // Get unique types and locations from places table
                const { data: places, error } = await supabase
                    .from('places')
                    .select('type, address, location')
                    .not('type', 'is', null)
                    .not('address', 'is', null);

                if (!error && places && places.length > 0) {
                    // Extract unique types
                    const uniqueTypes = [...new Set(
                        places
                            .map(p => p.type)
                            .filter(type => type && type.trim().length > 0)
                            .map(type => type.toLowerCase().trim())
                    )].sort();

                    // Extract unique locations from address and location fields
                    const uniqueLocations = [...new Set([
                        ...places.map(p => p.address).filter(addr => addr && addr.trim().length > 0),
                        ...places.map(p => p.location).filter(loc => loc && loc.trim().length > 0)
                    ])].sort();

                    console.log(`Found ${uniqueTypes.length} types and ${uniqueLocations.length} locations from places`);

                    return res.status(200).json({
                        types: uniqueTypes.length > 0 ? uniqueTypes : fixedFilters.types,
                        locations: uniqueLocations.length > 0 ? uniqueLocations.slice(0, 20) : fixedFilters.locations // Limit to avoid too many options
                    });
                }
            }
        } catch (error) {
            console.warn('Error getting dynamic filters from Supabase:', error.message);
            // Fall through to return fixed filters
        }
    }

    // Return fixed filters for products or as fallback
    res.status(200).json(fixedFilters);
}