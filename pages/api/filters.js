import { getSupabaseClient } from '../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const supabase = getSupabaseClient();
        if (supabase) {
            // Get unique types and locations from places table
            const { data: places, error } = await supabase
                .from('places')
                .select('type, location')
                .not('type', 'is', null)
                .not('location', 'is', null);
            if (!error && places && places.length > 0) {
                // Extract unique types
                const uniqueTypes = [...new Set(
                    places
                        .map(p => p.type)
                        .filter(type => type && type.trim().length > 0)
                        .map(type => type.toLowerCase().trim())
                )].sort();
                // Extract unique locations - prioritize location field over address
                const locationValues = places
                    .map(p => p.location)
                    .filter(location => location && location.trim().length > 0)
                    .map(location => location.trim());
                const uniqueLocations = [...new Set(locationValues)].sort();
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

    // Return fixed filters for products or as fallback
    res.status(200).json(fixedFilters);
}