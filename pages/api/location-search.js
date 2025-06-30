import { calculateDistance } from '../../utils/geolocation';
import { getSupabaseClient } from '../../utils/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { 
            searchQuery, 
            searchType = 'productos', 
            userLocation, 
            maxDistance = 10, // km
            limit = 20 
        } = req.body;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return res.status(500).json({ error: 'Supabase client not configured' });
        }

        console.log('🔍 Location-based search:', {
            query: searchQuery,
            type: searchType,
            userLocation: userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'none',
            maxDistance: `${maxDistance}km`
        });

        let results = [];

        if (searchType === 'productos') {
            // Search for products
            const { data: products, error } = await supabase
                .from('products')
                .select('*, places(id, name, address, geo, type)')
                .ilike('product_name', `%${searchQuery}%`)
                .limit(limit * 2); // Get more to filter by distance

            if (error) {
                console.error('Product search error:', error);
                return res.status(500).json({ error: 'Database query failed' });
            }

            if (products && products.length > 0) {
                // Process products and calculate distances
                results = products
                    .map(product => {
                        const place = product.places;
                        if (!place || !place.geo) return null;

                        let distance = null;
                        let lat = null, lng = null;

                        // Parse coordinates
                        try {
                            if (Array.isArray(place.geo) && place.geo.length === 2) {
                                // Auto-detect coordinate format
                                const [first, second] = place.geo;
                                if (Math.abs(first) > Math.abs(second)) {
                                    // [lng, lat] format
                                    lng = first; lat = second;
                                } else {
                                    // [lat, lng] format
                                    lat = first; lng = second;
                                }
                            }
                        } catch (error) {
                            console.warn('Failed to parse coordinates:', place.geo);
                            return null;
                        }

                        // Calculate distance if user location is available
                        if (userLocation && lat && lng) {
                            distance = calculateDistance(
                                userLocation.lat, userLocation.lng,
                                lat, lng
                            );

                            // Filter out places too far away
                            if (distance > maxDistance) {
                                return null;
                            }
                        }

                        return {
                            id: product.id,
                            product_name: product.product_name,
                            price: product.price,
                            description: product.description,
                            place: {
                                id: place.id,
                                name: place.name,
                                address: place.address,
                                type: place.type,
                                lat,
                                lng
                            },
                            distance,
                            type: 'product'
                        };
                    })
                    .filter(Boolean) // Remove null entries
                    .sort((a, b) => {
                        // Sort by distance if available, otherwise by name
                        if (a.distance !== null && b.distance !== null) {
                            return a.distance - b.distance;
                        }
                        return a.place.name.localeCompare(b.place.name);
                    })
                    .slice(0, limit);
            }
        } else {
            // Search for places
            const { data: places, error } = await supabase
                .from('places')
                .select('*')
                .or(`name.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%`)
                .limit(limit * 2); // Get more to filter by distance

            if (error) {
                console.error('Place search error:', error);
                return res.status(500).json({ error: 'Database query failed' });
            }

            if (places && places.length > 0) {
                // Process places and calculate distances
                results = places
                    .map(place => {
                        if (!place.geo) return null;

                        let distance = null;
                        let lat = null, lng = null;

                        // Parse coordinates
                        try {
                            if (Array.isArray(place.geo) && place.geo.length === 2) {
                                const [first, second] = place.geo;
                                if (Math.abs(first) > Math.abs(second)) {
                                    lng = first; lat = second;
                                } else {
                                    lat = first; lng = second;
                                }
                            }
                        } catch (error) {
                            console.warn('Failed to parse coordinates:', place.geo);
                            return null;
                        }

                        // Calculate distance if user location is available
                        if (userLocation && lat && lng) {
                            distance = calculateDistance(
                                userLocation.lat, userLocation.lng,
                                lat, lng
                            );

                            if (distance > maxDistance) {
                                return null;
                            }
                        }

                        return {
                            id: place.id,
                            name: place.name,
                            address: place.address,
                            type: place.type,
                            phone: place.phone,
                            web: place.web,
                            instagram: place.instagram,
                            facebook: place.facebook,
                            lat,
                            lng,
                            distance,
                            type: 'place'
                        };
                    })
                    .filter(Boolean)
                    .sort((a, b) => {
                        if (a.distance !== null && b.distance !== null) {
                            return a.distance - b.distance;
                        }
                        return a.name.localeCompare(b.name);
                    })
                    .slice(0, limit);
            }
        }

        console.log(`📍 Found ${results.length} results within ${maxDistance}km`);

        res.status(200).json({
            results,
            total_results: results.length,
            searchQuery,
            searchType,
            userLocation: userLocation ? {
                lat: userLocation.lat,
                lng: userLocation.lng
            } : null,
            maxDistance
        });

    } catch (error) {
        console.error('Location search API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
