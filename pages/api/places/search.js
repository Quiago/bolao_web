import { getSupabaseClient } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, location, type } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return res.status(500).json({ error: 'Supabase client not configured' });
        }

        const sanitizedQuery = query.trim().substring(0, 200).toLowerCase();

        // Build the search query
        let searchQuery = supabase
            .from('places')
            .select('*');

        // Add text search using ilike for name, address, and type
        searchQuery = searchQuery.or(`name.ilike.%${sanitizedQuery}%,address.ilike.%${sanitizedQuery}%,type.ilike.%${sanitizedQuery}%`);

        // Add location filter if provided
        if (location && location !== '') {
            searchQuery = searchQuery.ilike('address', `%${location}%`);
        }

        // Add type filter if provided
        if (type && type !== '') {
            searchQuery = searchQuery.ilike('type', `%${type}%`);
        }

        // Limit results
        searchQuery = searchQuery.limit(20);

        console.log('Searching places with query:', sanitizedQuery);

        const { data: places, error } = await searchQuery;

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Process and normalize the places data
        const processedPlaces = places.map((place) => {
            return {
                id: place.id || `place-${place.name}-${Math.random().toString(36).substr(2, 9)}`,
                name: place.name,
                address: place.address,
                phone: place.phone,
                phone2: place.phone2,
                web: place.web,
                web2: place.web2,
                email: place.email,
                telegram: place.telegram,
                location: place.location,
                geo: place.geo,
                score: place.score || 0.5,
                logo: place.logo,
                facebook: place.facebook,
                instagram: place.instagram,
                youtube: place.youtube,
                type: place.type,
            };
        });

        console.log(`Found ${processedPlaces.length} places`);

        res.status(200).json({
            places: processedPlaces,
            total_results: processedPlaces.length,
            search_time: 0
        });

    } catch (error) {
        console.error('Places search API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
