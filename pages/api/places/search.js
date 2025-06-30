import { getSupabaseClient } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, location, type, showAll } = req.query;

        // Special case: "Ver todos" - show all places with optional filters
        if (showAll === 'true') {
            const supabase = getSupabaseClient();
            if (!supabase) {
                return res.status(500).json({ error: 'Supabase client not configured' });
            }

            let allQuery = supabase
                .from('places')
                .select('*');

            // Add location filter if provided
            if (location && location !== '') {
                allQuery = allQuery.ilike('location', `%${location}%`);
            }

            // Add type filter if provided
            if (type && type !== '') {
                allQuery = allQuery.ilike('type', `%${type}%`);
            }

            // Order by name and limit
            allQuery = allQuery.order('name', { ascending: true }).limit(100);

            const { data: places, error } = await allQuery;

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ error: 'Database query failed', details: error.message });
            }

            const processedPlaces = (places || []).map((place) => {
                return {
                    id: place.id?.toString() || `place-${place.name}-${Math.random().toString(36).substr(2, 9)}`,
                    name: place.name || 'Sin nombre',
                    address: place.address || 'Dirección no disponible',
                    phone: place.phone ? String(place.phone).replace(/\.0$/, '') : null,
                    phone2: place.phone2 ? String(place.phone2).replace(/\.0$/, '') : null,
                    web: place.web || null,
                    web2: place.web2 || null,
                    email: place.email || null,
                    telegram: place.telegram || null,
                    location: place.location || place.address,
                    geo: place.geo || null,
                    logo: place.logo || null,
                    facebook: place.facebook || null,
                    instagram: place.instagram || null,
                    youtube: place.youtube || null,
                    type: place.type || 'Sin categoría'
                };
            });

            console.log(`Showing all places: ${processedPlaces.length} results`);

            return res.status(200).json({
                places: processedPlaces,
                total_results: processedPlaces.length,
                search_time: 0,
                showAll: true
            });
        }

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return res.status(500).json({ error: 'Supabase client not configured' });
        }

        const sanitizedQuery = query.trim().substring(0, 200);
        console.log('Searching places with query:', sanitizedQuery);

        // Build direct Supabase search query
        let searchQuery = supabase
            .from('places')
            .select('*');

        // Primary search: Search by name first (most important)
        // Secondary search: If searching by type or general terms
        const searchPattern = `%${sanitizedQuery}%`;
        searchQuery = searchQuery.or(`name.ilike.${searchPattern},type.ilike.${searchPattern}`);

        // Add location filter if provided
        if (location && location !== '') {
            searchQuery = searchQuery.ilike('location', `%${location}%`);
        }

        // Add type filter if provided
        if (type && type !== '') {
            searchQuery = searchQuery.ilike('type', `%${type}%`);
        }

        // Order by name for consistent results (names first, then types)
        searchQuery = searchQuery.order('name', { ascending: true }).limit(50);

        const { data: places, error } = await searchQuery;

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Database query failed', details: error.message });
        }

        if (!places || places.length === 0) {
            console.log('No places found for query:', sanitizedQuery);
            return res.status(200).json({
                places: [],
                total_results: 0,
                search_time: 0
            });
        }

        // Normalize the places data and return all results
        const processedPlaces = places.map((place) => {
            return {
                id: place.id?.toString() || `place-${place.name}-${Math.random().toString(36).substr(2, 9)}`,
                name: place.name || 'Sin nombre',
                address: place.address || 'Dirección no disponible',
                phone: place.phone ? String(place.phone).replace(/\.0$/, '') : null,
                phone2: place.phone2 ? String(place.phone2).replace(/\.0$/, '') : null,
                web: place.web || null,
                web2: place.web2 || null,
                email: place.email || null,
                telegram: place.telegram || null,
                location: place.location || place.address,
                geo: place.geo || null,
                logo: place.logo || null,
                facebook: place.facebook || null,
                instagram: place.instagram || null,
                youtube: place.youtube || null,
                type: place.type || 'Sin categoría'
            };
        });

        console.log(`Found ${processedPlaces.length} places for query: "${sanitizedQuery}"`);

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
