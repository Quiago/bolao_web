import axios from 'axios';

const BOLAO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quiago-bolao-search.hf.space';
const HF_TOKEN = process.env.HUGGING_FACE_TOKEN;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id || id.trim().length === 0) {
            return res.status(400).json({ error: 'Product ID is required and cannot be empty' });
        }

        // Sanitize ID to prevent potential issues
        const sanitizedId = id.trim().substring(0, 100);

        // Como la API principal no tiene endpoint específico para un producto,
        // hacemos una búsqueda por ID o name
        const headers = {
            'Content-Type': 'application/json'
        };

        if (HF_TOKEN) {
            headers['Authorization'] = `Bearer ${HF_TOKEN}`;
        }

        const response = await axios.post(`${BOLAO_API_URL}/search`, {
            query: sanitizedId,
            num_results: 50,
            min_score: 0.1
        }, {
            headers,
            timeout: 10000 // 10 second timeout
        });

        const products = response.data.products || [];

        // Buscar el producto exacto por ID o name
        let product = products.find(p =>
            p.id === sanitizedId ||
            p.name === sanitizedId ||
            p.product_name === sanitizedId ||
            p.slug === sanitizedId
        );

        // Si no se encuentra por ID exacto, buscar por similitud
        if (!product && products.length > 0) {
            product = products[0]; // Tomar el primer resultado más relevante
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Procesar el producto
        const processedProduct = {
            id: product.id || `${product.name}-${Date.now()}`,
            ...product,
            delivery: product.delivery === 'True' || product.delivery === true,
            pickup: product.pickup === 'True' || product.pickup === true,
            product_price: parseFloat(product.product_price) || product.product_price
        };

        res.status(200).json(processedProduct);

    } catch (error) {
        console.error('Product API error:', error);

        // Enhanced error handling
        if (error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT' ||
            error.response?.status === 503 ||
            error.response?.status === 504) {

            // Datos de fallback si la API no está disponible
            const mockProduct = getMockProduct(req.query.id);
            if (mockProduct) {
                return res.status(200).json({
                    ...mockProduct,
                    fallback: true
                });
            }
        }

        res.status(500).json({
            error: 'Error fetching product details',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}

function getMockProduct(id) {
    const mockProducts = {
        '1': {
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
            website: 'www.marketrey.com',
            instagram: '@marketrey',
            facebook: 'marketrey',
            type: 'restaurantes',
            logo: 'https://img2.elyerromenu.com/images/market-rey/logo-y/img.webp',
            delivery: true,
            pickup: true,
            geo: '[-82.33339919218133, 23.154970416175193]'
        },
        'market-rey': {
            id: 'market-rey',
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
            logo: 'https://img2.elyerromenu.com/images/market-rey/logo-y/img.webp',
            delivery: true,
            pickup: true,
            geo: '[-82.33339919218133, 23.154970416175193]'
        },
        '2': {
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
            website: 'www.cafecentral.com',
            instagram: '@cafecentral',
            facebook: 'cafecentral',
            type: 'cafeterias',
            logo: 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Café+Central',
            delivery: true,
            pickup: true,
            geo: '[-82.3830, 23.1330]'
        },
        '3': {
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
            website: 'www.tropical.com',
            instagram: '@tropical',
            facebook: 'tropical',
            type: 'heladerias',
            logo: 'https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=Heladería+Tropical',
            delivery: false,
            pickup: true,
            geo: '[-82.4500, 23.1200]'
        }
    };

    return mockProducts[id] || null;
}
