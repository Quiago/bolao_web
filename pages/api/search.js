import axios from 'axios';
import crypto from 'crypto';

const BOLAO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quiago-bolao-search.hf.space';
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

// Función para generar un ID único y consistente
function generateProductId(product) {
    // Si el producto ya tiene un ID, usarlo
    if (product.id) {
        return product.id;
    }
    
    // Crear un ID basado en nombre y producto
    const baseString = `${product.name}-${product.product_name}`.toLowerCase();
    const cleanString = baseString.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Agregar un hash corto para evitar colisiones
    const hash = crypto.createHash('md5')
        .update(`${product.name}${product.product_name}${product.location || ''}`)
        .digest('hex')
        .substring(0, 6);
    
    return `${cleanString}-${hash}`;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query, location, type } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const sanitizedQuery = query.trim().substring(0, 200);

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

        if (HF_TOKEN) {
            headers['Authorization'] = `Bearer ${HF_TOKEN}`;
        }

        console.log('Searching with params:', params);

        const response = await axios.post(`${BOLAO_API_URL}/search`, params, {
            headers,
            timeout: 10000
        });

        // Procesar productos con IDs consistentes
        const products = response.data.products.map((product) => {
            const processedProduct = {
                // Generar ID único y consistente
                id: generateProductId(product),
                ...product,
                // Normalizar campos booleanos
                delivery: product.delivery === 'True' || product.delivery === true,
                pickup: product.pickup === 'True' || product.pickup === true,
                // Normalizar precio
                product_price: parseFloat(product.product_price) || product.product_price,
                // Si no hay logo, será undefined y se manejará en el componente
                logo: product.logo || null,
                // IMPORTANTE: Mantener geo como viene de la API (string o array)
                geo: product.geo
            };

            // Log para debugging
            console.log(`Product: ${product.name} - ${product.product_name} => ID: ${processedProduct.id}, Geo type: ${typeof product.geo}`);
            
            return processedProduct;
        });

        res.status(200).json({
            products,
            total_results: response.data.total_results || products.length,
            search_time: response.data.search_time || 0
        });

    } catch (error) {
        console.error('Search API error:', error.message);
        console.error('Error details:', {
            code: error.code,
            status: error.response?.status,
            url: `${BOLAO_API_URL}/search`,
            hasToken: !!HF_TOKEN
        });

        // Manejo de errores con datos mock mejorados
        if (error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT' ||
            error.response?.status >= 500) {

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
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}

function getMockData(query) {
    const mockProducts = [
        {
            name: 'Market Rey',
            slug: 'market-rey',
            product_name: 'Hamburguesa Clásica',
            product_price: 8.99,
            score: 0.95,
            location: 'Habana del Este, La Habana',
            address: 'Carretera del asilo #6 /Naval y los Pinos casablanca',
            phone: '+5355159617',
            email: 'yanetsanler@gmail.com',
            website: 'www.marketrey.com',
            instagram: '@marketrey',
            facebook: 'marketrey',
            type: 'restaurantes',
            logo: null, // Se generará placeholder automáticamente
            delivery: true,
            pickup: true,
            geo: '[-82.33339919218133, 23.154970416175193]'
        },
        {
            name: 'Café Central',
            slug: 'cafe-central',
            product_name: 'Café Cubano',
            product_price: 3.50,
            score: 0.87,
            location: 'Centro Habana, La Habana',
            address: 'Calle 23 y 12, Vedado',
            phone: '+5355159618',
            email: 'cafecentral@gmail.com',
            website: 'www.cafecentral.com',
            instagram: '@cafecentral',
            facebook: 'cafecentral',
            type: 'cafeterias',
            logo: null,
            delivery: true,
            pickup: true,
            geo: '[-82.3830, 23.1330]'
        },
        {
            name: 'Heladería Tropical',
            slug: 'heladeria-tropical',
            product_name: 'Helado de Coco',
            product_price: 5.25,
            score: 0.78,
            location: 'Miramar, La Habana',
            address: 'Avenida 5ta y 72',
            phone: '+5355159619',
            email: 'tropical@gmail.com',
            website: 'www.tropical.com',
            instagram: '@tropical',
            facebook: 'tropical',
            type: 'heladerias',
            logo: null,
            delivery: false,
            pickup: true,
            geo: '[-82.4500, 23.1200]'
        }
    ];

    // Agregar IDs consistentes a los datos mock
    const processedMockProducts = mockProducts.map(product => ({
        id: generateProductId(product),
        ...product
    }));

    // Filtrar por query
    const lowerQuery = query.toLowerCase();
    return processedMockProducts.filter(product =>
        product.product_name.toLowerCase().includes(lowerQuery) ||
        product.name.toLowerCase().includes(lowerQuery) ||
        product.type.toLowerCase().includes(lowerQuery)
    );
}