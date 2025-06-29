import axios from 'axios';

const BOLAO_API_URL = process.env.NEXT_PUBLIC_API_URL;
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Place ID is required' });
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        if (HF_TOKEN) {
            headers['Authorization'] = `Bearer ${HF_TOKEN}`;
        }

        console.log('Getting place details for ID:', id);

        const response = await axios.get(`${BOLAO_API_URL}/places/${id}`, {
            headers,
            timeout: 10000
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error('Place details API error:', error.message);
        console.error('Error details:', {
            code: error.code,
            status: error.response?.status,
            url: `${BOLAO_API_URL}/places/${req.query.id}`,
            hasToken: !!HF_TOKEN
        });

        // Fallback to mock data for development
        if (error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT' ||
            error.response?.status >= 500) {

            console.log('API unavailable, using mock place data');
            return res.status(200).json({
                id: req.query.id,
                name: 'Restaurante El Floridita',
                type: 'restaurantes',
                location: 'Habana Vieja, La Habana',
                address: 'Calle Obispo 557, Habana Vieja',
                phone: '+53 7 867 1300',
                website: 'www.elfloridita-cuba.com',
                email: 'info@elfloridita-cuba.com',
                description: 'Famoso bar-restaurante conocido por sus daiquiris y ambiente histórico. Un lugar icónico de La Habana.',
                average_rating: 4.5,
                total_reviews: 245,
                lat: 23.1379,
                lng: -82.3529,
                image_url: null,
                created_at: '2023-01-01T00:00:00Z',
                recent_reviews: [
                    {
                        id: 1,
                        rating: 5,
                        comment: 'Excelente ambiente y los mejores daiquiris de La Habana',
                        created_at: '2024-01-15T10:30:00Z',
                        profiles: {
                            username: 'maria_h',
                            full_name: 'María Hernández'
                        }
                    },
                    {
                        id: 2,
                        rating: 4,
                        comment: 'Lugar histórico con buena comida, aunque un poco caro',
                        created_at: '2024-01-10T14:20:00Z',
                        profiles: {
                            username: 'carlos_m',
                            full_name: 'Carlos Martínez'
                        }
                    }
                ],
                fallback: true
            });
        }

        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Place not found' });
        }

        res.status(500).json({
            error: 'Error getting place details',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}
