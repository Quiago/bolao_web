import axios from 'axios';

const BOLAO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quiago-bolao-search.hf.space';
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, location, type } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query parameter is required and cannot be empty' });
        }

        // Sanitize query to prevent potential issues
        const sanitizedQuery = query.trim().substring(0, 200); // Limit query length

        const params = {
            query: sanitizedQuery,
            num_results: 20,
            min_score: 0.3
        };

        if (location && location !== '') {
            params.filter_location = location;
        }

        if (type && type !== '') {
            params.filter_type = type;
        }

        const headers = {
            'Content-Type': 'application/json'
        };

        // Add Hugging Face authorization if token is available
        if (HF_TOKEN) {
            headers['Authorization'] = `Bearer ${HF_TOKEN}`;
        }

        const response = await axios.post(`${BOLAO_API_URL}/search`, params, {
            headers,
            timeout: 10000 // 10 second timeout
        });

        const products = response.data.products.map((product, index) => ({
            id: product.id || `${product.name}-${index}`,
            ...product,
            delivery: product.delivery === 'True' || product.delivery === true,
            pickup: product.pickup === 'True' || product.pickup === true,
            product_price: parseFloat(product.product_price) || product.product_price
        }));

        res.status(200).json({
            products,
            total_results: response.data.total_results,
            search_time: response.data.search_time
        });
    } catch (error) {
        console.error('Search API error:', error.message);
        console.error('Error details:', {
            code: error.code,
            status: error.response?.status,
            url: `${BOLAO_API_URL}/search`,
            hasToken: !!HF_TOKEN
        });

        // Enhanced error handling for different scenarios
        if (error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT' ||
            error.response?.status === 404 ||
            error.response?.status === 503 ||
            error.response?.status === 504) {

            console.log('API unavailable, using mock data');
            return res.status(200).json({
                products: getMockData(req.query.query),
                total_results: 3,
                search_time: 0.1,
                fallback: true,
                fallback_reason: 'API unavailable'
            });
        }

        res.status(500).json({
            error: 'Error searching products',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            api_url: process.env.NODE_ENV === 'development' ? BOLAO_API_URL : undefined
        });
    }
}

function getMockData(query) {
    const mockProducts = [
        {
            id: '1',
            name: 'Market Rey',
            slug: 'market-rey',
            product_name: 'Hamburguesa Clásica',
            product_price: 8.99,
            score: 0.95,
            location: 'Habana del Este, La Habana',
            address: 'Carretera del asilo #6 /Naval y los Pinos casablanca',
            phone: '+5355159617',
            email: 'yanetsanler@gmail.com',
            web: 'www.marketrey.com',
            website: 'www.marketrey.com',
            instagram: '@marketrey',
            facebook: 'marketrey',
            type: 'restaurantes',
            logo: 'https://img2.elyerromenu.com/images/market-rey/logo-y/img.webp',
            delivery: true,
            pickup: true,
            geo: '[-82.33339919218133, 23.154970416175193]'
        },
        {
            id: '2',
            name: 'Café Central',
            slug: 'cafe-central',
            product_name: 'Café Cubano',
            product_price: 3.50,
            score: 0.87,
            location: 'Centro Habana, La Habana',
            address: 'Calle 23 y 12, Vedado',
            phone: '+5355159618',
            email: 'cafecentral@gmail.com',
            web: 'www.cafecentral.com',
            website: 'www.cafecentral.com',
            instagram: '@cafecentral',
            facebook: 'cafecentral',
            type: 'cafeterias',
            logo: 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Café+Central',
            delivery: true,
            pickup: true,
            geo: '[-82.3830, 23.1330]'
        },
        {
            id: '3',
            name: 'Heladería Tropical',
            slug: 'heladeria-tropical',
            product_name: 'Helado de Coco',
            product_price: 5.25,
            score: 0.78,
            location: 'Miramar, La Habana',
            address: 'Avenida 5ta y 72',
            phone: '+5355159619',
            email: 'tropical@gmail.com',
            web: 'www.tropical.com',
            website: 'www.tropical.com',
            instagram: '@tropical',
            facebook: 'tropical',
            type: 'heladerias',
            logo: 'https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=Heladería+Tropical',
            delivery: false,
            pickup: true,
            geo: '[-82.4500, 23.1200]'
        }
    ];

    return mockProducts.filter(product =>
        product.product_name.toLowerCase().includes(query.toLowerCase()) ||
        product.name.toLowerCase().includes(query.toLowerCase())
    );
}
