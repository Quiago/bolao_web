import { getSupabaseClient } from '../../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Place ID is required' });
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return res.status(500).json({ error: 'Supabase client not configured' });
        }

        console.log('Getting place details for ID:', id);

        // Query Supabase for the place
        const { data: place, error } = await supabase
            .from('places')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error:', error);

            if (error.code === 'PGRST116') { // No rows returned
                return res.status(404).json({ error: 'Place not found' });
            }

            return res.status(500).json({
                error: 'Database query failed',
                details: error.message
            });
        }

        if (!place) {
            return res.status(404).json({ error: 'Place not found' });
        }

        // Format the place data for the frontend
        const formattedPlace = {
            id: place.id?.toString(),
            name: place.name || 'Sin nombre',
            type: place.type || 'Sin categoría',
            address: place.address || 'Dirección no disponible',
            location: place.location || place.address,
            phone: place.phone ? String(place.phone).replace(/\.0$/, '') : null,
            phone2: place.phone2 ? String(place.phone2).replace(/\.0$/, '') : null,
            web: place.web || null,
            web2: place.web2 || null,
            email: place.email || null,
            telegram: place.telegram || null,
            facebook: place.facebook || null,
            instagram: place.instagram || null,
            youtube: place.youtube || null,
            logo: place.logo || null,
            geo: place.geo || null,
            score: place.score || 0.5,
            // Remove description auto-generation as requested
            description: null,
            average_rating: place.average_rating || null,
            total_reviews: place.total_reviews || 0,
            created_at: place.created_at || new Date().toISOString(),
            // Parse geo coordinates if available
            lat: null,
            lng: null
        };

        // Try to parse geo coordinates from JSONB format
        if (place.geo) {
            try {
                let geoData = place.geo;

                // If it's a string, parse it as JSON
                if (typeof geoData === 'string') {
                    geoData = JSON.parse(geoData);
                }

                // Handle different geo formats
                if (Array.isArray(geoData) && geoData.length >= 2) {
                    // Array format: [lng, lat] or [lat, lng]
                    const [first, second] = geoData.map(coord => parseFloat(coord));

                    // Determine order by checking typical lat/lng ranges
                    // Latitude: -90 to 90, Longitude: -180 to 180
                    // For Cuba: lat ~22-24, lng ~-85 to -74
                    if (Math.abs(first) <= 90 && Math.abs(second) > 90) {
                        // first is lat, second is lng
                        formattedPlace.lat = first;
                        formattedPlace.lng = second;
                    } else if (Math.abs(second) <= 90 && Math.abs(first) > 90) {
                        // second is lat, first is lng
                        formattedPlace.lat = second;
                        formattedPlace.lng = first;
                    } else {
                        // Default assumption: [lng, lat] (GeoJSON format)
                        formattedPlace.lat = second;
                        formattedPlace.lng = first;
                    }
                } else if (typeof geoData === 'object' && geoData.lat && geoData.lng) {
                    // Object format: {lat: ..., lng: ...}
                    formattedPlace.lat = parseFloat(geoData.lat);
                    formattedPlace.lng = parseFloat(geoData.lng);
                } else if (typeof geoData === 'object' && geoData.latitude && geoData.longitude) {
                    // Object format: {latitude: ..., longitude: ...}
                    formattedPlace.lat = parseFloat(geoData.latitude);
                    formattedPlace.lng = parseFloat(geoData.longitude);
                }

                console.log('Parsed geo coordinates:', { lat: formattedPlace.lat, lng: formattedPlace.lng });
            } catch (e) {
                console.warn('Could not parse geo coordinates:', place.geo, e.message);
            }
        }

        console.log('Found place:', formattedPlace.name);
        res.status(200).json(formattedPlace);

    } catch (error) {
        console.error('Places detail API error:', error);

        // Fallback to mock data for development if Supabase is not configured
        if (error.message.includes('Supabase client not configured')) {
            console.log('Supabase not configured, using mock place data');
            return res.status(200).json({
                id: req.query.id,
                name: 'Restaurante El Floridita',
                type: 'restaurantes',
                location: 'Habana Vieja, La Habana',
                address: 'Calle Obispo 557, Habana Vieja',
                phone: '+53 7 867 1300',
                web: 'www.elfloridita-cuba.com',
                email: 'info@elfloridita-cuba.com',
                description: 'Famoso bar-restaurante conocido por sus daiquiris y ambiente histórico. Un lugar icónico de La Habana.',
                average_rating: 4.5,
                total_reviews: 245,
                lat: 23.1379,
                lng: -82.3529,
                logo: null,
                created_at: '2023-01-01T00:00:00Z',
                fallback: true
            });
        }

        res.status(500).json({
            error: 'Error getting place details',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}
